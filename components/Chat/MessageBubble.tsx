import Image from 'next/image';
import type { Message } from '@/types/database';

interface Props {
  message: Message;
  me: string | null;
}

export default function MessageBubble({ message, me }: Props) {
  const isMine = message.sender_id === me;
  const senderLabel = isMine ? 'Tú' : (message.sender?.username || 'Usuario');
  const isMedia = Boolean(message.media_url);

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} animate-message-in`}>
      <div
        className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}
      >
        {!isMine && (
          <span className="text-[11px] font-medium text-brass/80 mb-1.5 ml-1 tracking-wide uppercase">
            {senderLabel}
          </span>
        )}
        <div
          className={`overflow-hidden ${
            isMine
              ? 'bg-own border-l-2 border-brass rounded-2xl rounded-tr-sm'
              : 'bg-other border border-line rounded-2xl rounded-tl-sm'
          }`}
        >
          {isMedia && message.media_url ? (
            <div>
              {message.media_type === 'image' || message.media_type === 'gif' ? (
                <Image
                  src={message.media_url}
                  alt="multimedia"
                  className="max-w-xs max-h-72 object-cover cursor-pointer"
                  width={320}
                  height={320}
                  unoptimized
                />
              ) : (
                <div className="px-4 py-3">
                  <audio controls className="max-w-xs h-10">
                    <source src={message.media_url} />
                    Tu navegador no soporta audio.
                  </audio>
                </div>
              )}
              {message.content && (
                <p className="px-4 py-2.5 text-sm text-paper/90 leading-relaxed">
                  {message.content}
                </p>
              )}
            </div>
          ) : (
            <p className="px-4 py-2.5 text-sm text-paper/90 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
          <div
            className={`px-4 pb-1.5 text-[10px] ${
              isMine ? 'text-paper/40 text-right' : 'text-paper/40 text-left'
            }`}
          >
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
