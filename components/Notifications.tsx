'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, BellOff } from 'lucide-react';
import { createBrowserClient } from '@/lib/supabase/browser';
import { useProfile } from '@/hooks/useProfile';

type NewMessage = {
  conversation_id: string;
  sender_id: string;
  content: string | null;
  media_type: string | null;
};

export default function Notifications() {
  const router = useRouter();
  const { profile } = useProfile();
  const supabaseRef = useRef(createBrowserClient());
  const supabase = supabaseRef.current;
  const [permission, setPermission] = useState<NotificationPermission | null>(null);

  useEffect(() => {
    if (typeof Notification !== 'undefined') setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (!profile?.id) return;

    const channel = supabase
      .channel(`notifications:${crypto.randomUUID()}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as NewMessage;
          if (msg.sender_id === profile.id) return;
          if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
          if (!document.hidden) return;

          void (async () => {
            const { data: sender } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', msg.sender_id)
              .maybeSingle();

            const body =
              msg.content ||
              (msg.media_type === 'image'
                ? '📷 Foto'
                : msg.media_type === 'audio'
                  ? '🎤 Audio'
                  : 'GIF');

            const notification = new Notification(sender?.username ?? 'Nuevo mensaje', {
              body,
              icon: '/favicon.svg',
              tag: msg.conversation_id,
            });

            notification.onclick = () => {
              window.focus();
              router.push(`/chat/${msg.conversation_id}`);
              notification.close();
            };
          })();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [profile?.id, supabase, router]);

  async function enable() {
    if (typeof Notification === 'undefined') return;
    setPermission(await Notification.requestPermission());
  }

  const active = permission === 'granted';
  const blocked = permission === 'denied';

  return (
    <button
      type="button"
      onClick={active || blocked ? undefined : enable}
      disabled={active || blocked}
      title={
        active
          ? 'Notificaciones activadas'
          : blocked
            ? 'Notificaciones bloqueadas en el navegador'
            : 'Activar notificaciones'
      }
      className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl transition-colors ${
        active
          ? 'text-presence'
          : blocked
            ? 'text-faint cursor-default'
            : 'text-muted hover:text-paper hover:bg-raised'
      }`}
    >
      {blocked ? <BellOff size={20} /> : <Bell size={20} />}
      <span className="text-[10px] font-medium tracking-wide">
        {active ? 'Activas' : blocked ? 'Bloqueadas' : 'Avisos'}
      </span>
    </button>
  );
}
