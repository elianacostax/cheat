'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import { Paperclip } from 'lucide-react';

interface Props {
  conversationId: string;
  me: string | null;
}

export function MediaUploader({ conversationId, me }: Props) {
  const [uploading, setUploading] = useState(false);
  const supabase = createBrowserClient();

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file, { cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('chat-media').getPublicUrl(fileName);
      const mediaUrl = data.publicUrl;

      let mediaType: 'image' | 'audio' | 'gif' = 'image';
      if (file.type.startsWith('audio/')) mediaType = 'audio';
      else if (fileExt === 'gif' || file.type === 'image/gif') mediaType = 'gif';

      const { error: insertError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: me,
        media_url: mediaUrl,
        media_type: mediaType,
      });
      if (insertError) throw insertError;
    } catch (e: any) {
      alert('Error subiendo archivo: ' + e.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative">
      <input
        id="media-input"
        type="file"
        accept="image/*,audio/*,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <label
        htmlFor="media-input"
        title="Adjuntar foto, audio o GIF"
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
          uploading
            ? 'text-faint cursor-wait'
            : 'text-muted hover:text-brass hover:bg-overlay cursor-pointer'
        }`}
      >
        <Paperclip size={18} />
      </label>
      {uploading && (
        <span className="absolute -top-7 left-0 text-[11px] text-muted whitespace-nowrap">
          Subiendo…
        </span>
      )}
    </div>
  );
}
