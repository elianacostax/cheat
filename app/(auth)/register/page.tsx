'use client';

import { signUp } from '@/app/actions/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';

export default function Register() {
  const router = useRouter();
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push('/login');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brass/10 border border-brass/25 flex items-center justify-center shadow-glow mb-4">
            <span className="font-display text-brass text-2xl font-semibold leading-none">C</span>
          </div>
          <h1 className="font-display text-3xl text-paper tracking-tight">Crear cuenta</h1>
          <p className="text-sm text-muted mt-2">Únete y comienza a conversar</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-surface border border-line rounded-2xl p-6 space-y-4 shadow-soft"
        >
          {error && (
            <p className="text-sm text-red-400 bg-red-500/5 border border-red-500/10 rounded-xl px-3 py-2">
              {error}
            </p>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted tracking-wide">
              Usuario
            </label>
            <input
              name="username"
              required
              className="w-full px-3.5 py-2.5 bg-raised border border-line rounded-xl text-sm text-paper placeholder:text-faint focus:outline-none focus:border-brass/40 focus:shadow-glow transition-all"
              placeholder="tu_usuario"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted tracking-wide">
              Email
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full px-3.5 py-2.5 bg-raised border border-line rounded-xl text-sm text-paper placeholder:text-faint focus:outline-none focus:border-brass/40 focus:shadow-glow transition-all"
              placeholder="tu@email.com"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted tracking-wide">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="w-full px-3.5 py-2.5 bg-raised border border-line rounded-xl text-sm text-paper placeholder:text-faint focus:outline-none focus:border-brass/40 focus:shadow-glow transition-all"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brass text-ink rounded-xl text-sm font-semibold hover:bg-brass-bright transition-colors"
          >
            Crear cuenta
          </button>

          <p className="text-center text-xs text-muted pt-1">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-brass hover:text-brass-bright transition-colors">
              Inicia sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
