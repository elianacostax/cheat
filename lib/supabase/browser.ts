import { createBrowserClient as createSupabaseBrowser } from '@supabase/ssr';

export function createBrowserClient() {
  return createSupabaseBrowser(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
