import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { otherUserId } = await req.json();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'no auth' }, { status: 401 });

  const { data: conversationId, error } = await supabase.rpc(
    'create_direct_conversation',
    { other_user_id: otherUserId }
  );

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ conversationId });
}
