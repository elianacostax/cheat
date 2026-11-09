'use client';

import { createBrowserClient } from '@/lib/supabase/browser';
import { useEffect, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import Avatar from '@/components/Avatar';
import LogoutButton from '@/components/LogoutButton';
import { MessageCircle } from 'lucide-react';

export default function UsersPage() {
  const supabase = createBrowserClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useProfile();

  useEffect(() => {
    supabase.from('profiles').select('id, username, avatar_url').then(({ data }) => {
      setUsers((data ?? []).filter((u) => u.id !== profile?.id));
      setLoading(false);
    });
  }, [supabase, profile?.id]);

  async function chatWith(otherUserId: string) {
    const res = await fetch('/api/direct', {
      method: 'POST',
      body: JSON.stringify({ otherUserId }),
    });
    const data = await res.json();
    if (data?.conversationId) {
      window.location.href = `/chat/${data.conversationId}`;
    } else {
      alert('No se pudo crear la conversación');
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-ink bg-ambient">
      <header className="px-8 pt-10 pb-6 border-b border-line">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-medium text-paper tracking-tight">
              Usuarios
            </h1>
            <p className="text-sm text-muted mt-2">Encuentra a alguien y comienza a conversar</p>
          </div>
          <LogoutButton compact />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 rounded-full border-2 border-brass/30 border-t-brass animate-spin" />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {users.length === 0 && (
              <li className="px-8 py-16 text-center">
                <p className="text-sm text-muted">No hay otros usuarios registrados.</p>
              </li>
            )}
            {users.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-4 px-8 py-4 hover:bg-raised transition-colors"
              >
                <Avatar name={u.username ?? 'U'} src={u.avatar_url} />
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-paper truncate block">
                    {u.username}
                  </span>
                </div>
                <button
                  onClick={() => chatWith(u.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brass/30 text-brass text-sm font-medium hover:bg-brass/10 transition-colors"
                >
                  <MessageCircle size={15} />
                  Chatear
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
