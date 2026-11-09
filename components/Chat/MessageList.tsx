import React from 'react';
import { useEffect } from 'react';
import MessageBubble from './MessageBubble';
import type { Message } from '@/types/database';

interface Props {
  messages: Message[];
  me: string | null;
}

export default function MessageList({ messages, me }: Props) {
  const listRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto px-8 py-8">
      <div className="max-w-2xl mx-auto space-y-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-brass/10 border border-brass/20 flex items-center justify-center mb-4">
              <span className="font-display text-brass text-lg">C</span>
            </div>
            <p className="text-sm text-muted max-w-xs leading-relaxed">
              Aún no hay mensajes. Escribe el primero para comenzar.
            </p>
          </div>
        )}
        {messages.map((m) => (
          <MessageBubble key={m.id} message={m} me={me} />
        ))}
      </div>
    </div>
  );
}
