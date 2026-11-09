'use client';

export const dynamic = 'force-dynamic';

import { useProfile } from '@/hooks/useProfile';
import { useChat } from '@/hooks/useChat';
import MessageList from '@/components/Chat/MessageList';
import MessageInput from '@/components/Chat/MessageInput';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import Avatar from '@/components/Avatar';
import BackButton from '@/components/BackButton';
import LogoutButton from '@/components/LogoutButton';
import { markRead } from '@/lib/read-state';
import type { Profile } from '@/types/database';

export default function ChatPage() {
  const { id } = useParams();
  const { profile, loading } = useProfile();
  const { messages, loading: msgLoading, error, sendText } = useChat(id as string);
  const [joined, setJoined] = useState(false);
  const [other, setOther] = useState<Profile | null>(null);

  useEffect(() => {
    if (!profile || joined) return;
    (async () => {
      const res = await fetch('/api/join', {
        method: 'POST',
        body: JSON.stringify({ conversationId: id }),
      });
      const data = await res.json();
      if (data?.ok) setJoined(true);
    })();
  }, [profile, id, joined]);

  useEffect(() => {
    if (!profile) return;
    const supabase = createBrowserClient();
    (async () => {
      const { data: ps } = await supabase
        .from('conversation_participants')
        .select('user_id')
        .eq('conversation_id', id);
      const otherId = ps?.find((p) => p.user_id !== profile.id)?.user_id ?? null;
      if (!otherId) {
        setOther(null);
        return;
      }
      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', otherId)
        .maybeSingle();
      setOther((p ?? null) as unknown as Profile | null);
    })();
  }, [profile, id]);

  useEffect(() => {
    if (!profile?.id || messages.length === 0) return;
    markRead(profile.id, id as string, messages[messages.length - 1].created_at);
  }, [profile?.id, id, messages]);

  if (loading || msgLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-ink">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brass/30 border-t-brass animate-spin" />
          <span className="text-sm text-muted">Cargando conversación…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full flex-col bg-ink bg-ambient">
      <header className="px-8 py-5 border-b border-line bg-surface flex items-center gap-4">
        <BackButton />
        <Avatar name={other?.username ?? 'U'} src={other?.avatar_url} size="md" />
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-xl text-paper truncate leading-tight">
            {other?.username ?? 'Conversación'}
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-presence shadow-[0_0_6px_rgba(111,207,127,0.6)]" />
            <span className="text-xs text-muted">En línea</span>
          </div>
        </div>
        <LogoutButton compact />
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        {error && (
          <div className="px-8 py-2 text-sm text-red-400 bg-red-500/5 border-b border-red-500/10">
            {error}
          </div>
        )}
        <MessageList messages={messages} me={profile?.id ?? null} />
      </main>

      <MessageInput
        conversationId={id as string}
        me={profile?.id ?? null}
        onSend={sendText}
        error={null}
      />
    </div>
  );
}
