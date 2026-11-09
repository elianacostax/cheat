'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createBrowserClient } from '@/lib/supabase/browser';
import { Film, Loader2, Search } from 'lucide-react';

type Gif = { id: string; preview: string; url: string };

export function GifPicker({
  conversationId,
  me,
}: {
  conversationId: string;
  me: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<Gif[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const supabase = createBrowserClient();

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/gifs?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) throw new Error(data.error ?? 'Error cargando GIFs');
        setGifs(data.gifs ?? []);
      } catch (e: any) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, query]);

  async function send(gif: Gif) {
    if (!me) {
      setError('Inicia sesión de nuevo');
      return;
    }
    setSending(gif.id);
    const { error: err } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: me,
      media_url: gif.url,
      media_type: 'gif',
    });
    setSending(null);
    if (err) {
      setError(err.message);
      return;
    }
    setOpen(false);
    setQuery('');
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        title="Buscar GIF"
        aria-label="Buscar GIF"
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
          open ? 'text-brass bg-overlay' : 'text-muted hover:text-brass hover:bg-overlay'
        }`}
      >
        <Film size={18} />
      </button>

      {open && (
        <div className="absolute bottom-12 left-0 z-50 w-[19rem] max-w-[calc(100vw-4rem)] rounded-2xl border border-line bg-surface p-3 shadow-soft">
          <div className="flex items-center gap-2 bg-raised border border-line rounded-xl px-2.5 py-1.5 mb-2">
            <Search size={15} className="text-faint shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar GIFs…"
              className="flex-1 bg-transparent text-xs text-paper placeholder:text-faint focus:outline-none"
            />
          </div>

          {error && <p className="text-[11px] text-red-400 px-1 pb-2">{error}</p>}

          <div className="h-52 overflow-y-auto">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 size={20} className="text-brass animate-spin" />
              </div>
            ) : gifs.length === 0 ? (
              <p className="h-full flex items-center justify-center text-xs text-muted">
                Sin resultados
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-1">
                {gifs.map((gif) => (
                  <button
                    type="button"
                    key={gif.id}
                    onClick={() => send(gif)}
                    disabled={sending === gif.id}
                    className="relative aspect-square overflow-hidden rounded-md bg-raised hover:ring-2 hover:ring-brass/60 transition disabled:opacity-50"
                  >
                    <Image
                      src={gif.preview}
                      alt="GIF"
                      fill
                      unoptimized
                      sizes="100px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
