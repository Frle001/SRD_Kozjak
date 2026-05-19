'use client';

import { useActionState } from 'react';
import { loginAction } from '@/app/actions/auth';

export default function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="w-full max-w-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="mb-6">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-xl mb-4">
            ⚙
          </div>
          <h2 className="text-lg font-black text-slate-900">Prijava u admin panel</h2>
          <p className="text-sm text-slate-500 mt-1">Unesite svoje podatke za pristup.</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email adresa
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              disabled={isPending}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:opacity-50 transition"
              placeholder="admin@srdkozjak.hr"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Lozinka
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isPending}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent disabled:opacity-50 transition"
              placeholder="••••••••"
            />
          </div>

          {state?.error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <span className="text-red-500 text-sm flex-shrink-0 mt-0.5">⚠</span>
              <p className="text-sm text-red-700">{state.error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-green-500 hover:bg-green-400 disabled:opacity-50 text-white font-bold text-sm px-4 py-3 rounded-xl transition-colors shadow-md min-h-[48px]"
          >
            {isPending ? 'Prijava…' : 'Prijavi se'}
          </button>
        </form>
      </div>
    </div>
  );
}
