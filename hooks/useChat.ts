'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { Message, Profile } from '@/types/database';
import { useProfile } from '@/hooks/useProfile';

export function useChat(conversationId: string) {
  const { profile } = useProfile();
  const supabaseRef = useRef(createBrowserClient());
  const supabase = supabaseRef.current;
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const { data, error: err } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (err) throw err;

      // Obtener perfiles de los remitentes por separado (evita el 400 de la relación embebida)
      const senderIds = [...new Set((data ?? []).map((m) => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', senderIds);

      const withSenders = (data ?? []).map((m) => ({
        ...m,
        sender: (profiles ?? []).find((p) => p.id === m.sender_id) ?? null,
      })) as Message[];

      setMessages(withSenders);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [supabase, conversationId]);

  useEffect(() => {
    loadMessages();
    const channelName = `chat:${conversationId}:${crypto.randomUUID()}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          void (async () => {
            const { data: sender } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newMsg.sender_id)
              .maybeSingle();
            setMessages((prev) => [...prev, { ...newMsg, sender } as Message]);
          })();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, supabase, loadMessages]);

  const sendText = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      const { error: err } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: profile?.id,
        content: content.trim(),
        media_type: 'text',
      });
      if (err) {
        console.error('Error enviando mensaje:', err);
        setError(`${err.message}${err.details ? ` — ${err.details}` : ''}${err.hint ? ` (hint: ${err.hint})` : ''}`);
      }
    },
    [supabase, conversationId, profile?.id]
  );

  const sendMedia = useCallback(
    async (mediaUrl: string, mediaType: 'image' | 'audio' | 'gif') => {
      const { error: err } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: profile?.id,
        media_url: mediaUrl,
        media_type: mediaType,
      });
      if (err) {
        console.error('Error enviando media:', err);
        setError(`${err.message}${err.details ? ` — ${err.details}` : ''}${err.hint ? ` (hint: ${err.hint})` : ''}`);
      }
    },
    [supabase, conversationId, profile?.id]
  );

  return { messages, loading, error, sendText, sendMedia };
}
