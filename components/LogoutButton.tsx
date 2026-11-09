'use client';

import { signOut } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await signOut();
    router.push('/login');
  }

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={loading}
        title="Cerrar sesión"
        aria-label="Cerrar sesión"
        className="inline-flex items-center gap-2 px-3 h-10 rounded-xl border border-line bg-raised text-sm text-muted hover:text-paper hover:border-brass/40 hover:bg-overlay transition-colors disabled:opacity-50 shrink-0"
      >
        <LogOut size={16} />
        <span className="hidden sm:inline">Salir</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title="Salir"
      className="flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl text-muted hover:text-paper hover:bg-raised transition-colors disabled:opacity-50"
    >
      <LogOut size={20} />
      <span className="text-[10px] font-medium tracking-wide">Salir</span>
    </button>
  );
}
