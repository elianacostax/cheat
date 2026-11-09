import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { conversationId } = await req.json();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'no auth' }, { status: 401 });

  const { data: exists } = await supabase
    .from('conversation_participants')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (!exists) {
    await supabase.from('conversation_participants').insert({
      conversation_id: conversationId,
      user_id: user.id,
    });
  }

  return NextResponse.json({ ok: true });
}
