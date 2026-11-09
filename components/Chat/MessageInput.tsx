'use client';

import { useState, FormEvent } from 'react';
import { MediaUploader } from '@/components/MediaUploader';
import { GifPicker } from '@/components/GifPicker';
import { ArrowUp } from 'lucide-react';

interface Props {
  conversationId: string;
  me: string | null;
  onSend: (text: string) => Promise<void>;
  error?: string | null;
}

export default function MessageInput({ conversationId, me, onSend, error }: Props) {
  const [text, setText] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    await onSend(text);
    setText('');
  }

  return (
    <div className="px-8 pb-6 pt-2 bg-ink">
      <div className="max-w-2xl mx-auto">
        {error && (
          <p className="text-xs text-red-400 mb-2 ml-1">{error}</p>
        )}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 bg-raised border border-line rounded-2xl px-3 py-2 focus-within:border-brass/40 focus-within:shadow-glow transition-all"
        >
          <MediaUploader conversationId={conversationId} me={me} />
          <GifPicker conversationId={conversationId} me={me} />
          <input
            name="message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribe un mensaje…"
            className="flex-1 bg-transparent text-sm text-paper placeholder:text-faint focus:outline-none py-1.5"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            aria-label="Enviar"
            className="w-9 h-9 rounded-xl bg-brass text-ink flex items-center justify-center hover:bg-brass-bright disabled:opacity-30 disabled:hover:bg-brass transition-colors shrink-0"
          >
            <ArrowUp size={18} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
