'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/browser';
import type { Profile } from '@/types/database';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setLoading(false); return; }
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      setProfile(prof ?? null);
      setLoading(false);
    });
  }, []);

  return { profile, loading };
}
