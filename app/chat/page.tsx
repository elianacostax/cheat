'use client';

import { createBrowserClient } from '@/lib/supabase/browser';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Message, Profile } from '@/types/database';
import Avatar from '@/components/Avatar';
import LogoutButton from '@/components/LogoutButton';
import { Plus, Trash2 } from 'lucide-react';

export default function ChatList() {
  const supabase = createBrowserClient();
  const [conversations, setConversations] = useState<any[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    load();
    const channelName = `conversations:${crypto.randomUUID()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'conversation_participants' },
        load
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  async function load() {
    const { data: me } = await supabase.auth.getUser();
    if (!me.user) return;

    const { data: prof } = await supabase.from('profiles').select('*').eq('id', me.user.id).single();
    setProfile((prof ?? null) as unknown as Profile | null);

    const { data: parts } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', me.user.id);

    if (!parts?.length) {
      setConversations([]);
      return;
    }

    const { data: convs } = await supabase
      .from('conversations')
      .select('*')
      .in('id', parts.map((p) => p.conversation_id))
      .order('created_at', { ascending: false });

    const enriched = await Promise.all(
      (convs ?? []).map(async (c) => {
        const { data: last } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', c.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const { data: ps } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', c.id);

        const otherId = ps?.find((p) => p.user_id !== me.user.id)?.user_id ?? null;
        let other: Profile | null = null;
        if (otherId) {
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherId)
            .maybeSingle();
          other = (prof ?? null) as unknown as Profile | null;
        }

        return {
          ...c,
          lastMessage: last,
          other,
        };
      })
    );

    setConversations(enriched);
  }

  async function removeConversation(conversationId: string) {
    if (!profile) return;
    if (!confirm('¿Eliminar esta conversación de tu lista?')) return;

    const { data, error } = await supabase
      .from('conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', profile.id)
      .select();

    if (error) {
      alert('No se pudo eliminar: ' + error.message);
      return;
    }
    if (!data?.length) {
      alert('No se pudo eliminar: falta el permiso DELETE en la base de datos.');
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
  }

  return (
    <div className="flex-1 flex flex-col bg-ink bg-ambient">
      <header className="px-8 pt-10 pb-6 border-b border-line">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium text-paper tracking-tight">
              Conversaciones
            </h1>
            <Link
              href="/users"
              className="inline-flex items-center gap-2 mt-4 text-sm text-muted hover:text-brass transition-colors"
            >
              <Plus size={16} />
              Buscar usuarios
            </Link>
          </div>
          <LogoutButton compact />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brass/10 border border-brass/20 flex items-center justify-center mb-5">
              <span className="font-display text-brass text-2xl">C</span>
            </div>
            <h2 className="font-display text-xl text-paper mb-2">Sin conversaciones aún</h2>
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              Busca a alguien en la sección de usuarios y comienza una conversación.
            </p>
            <Link
              href="/users"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-brass text-ink text-sm font-semibold hover:bg-brass-bright transition-colors"
            >
              <Plus size={16} />
              Nuevo chat
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {conversations.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-2 px-8 py-4 hover:bg-raised transition-colors"
              >
                <Link
                  href={`/chat/${c.id}`}
                  className="flex items-center gap-4 flex-1 min-w-0"
                >
                  <Avatar name={c.other?.username ?? 'U'} src={c.other?.avatar_url} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="font-medium text-paper truncate">
                        {c.is_group ? c.name : c.other?.username || 'Usuario'}
                      </span>
                      {c.lastMessage && (
                        <span className="text-xs text-faint shrink-0">
                          {new Date(c.lastMessage.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted truncate mt-0.5">
                      {c.lastMessage
                        ? c.lastMessage.media_type === 'text'
                          ? c.lastMessage.content
                          : `[${c.lastMessage.media_type === 'image' ? 'Foto' : c.lastMessage.media_type === 'audio' ? 'Audio' : 'GIF'}]`
                        : 'Comienza la conversación'}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => removeConversation(c.id)}
                  title="Eliminar conversación"
                  aria-label="Eliminar conversación"
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-faint hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
