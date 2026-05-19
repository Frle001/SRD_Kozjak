'use server';

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// ─── Login ────────────────────────────────────────────────────────────────────

export type LoginState = { error: string } | null;

/**
 * Sign in with email + password. Designed for useActionState:
 *   const [state, formAction, isPending] = useActionState(loginAction, null)
 *
 * Returns { error } on failure. On success, redirects to /admin (never returns).
 */
export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email    = (formData.get('email')    as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null)         ?? '';

  if (!email || !password) {
    return { error: 'Email i lozinka su obavezni.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('[loginAction]', error.message);
    // Map Supabase English errors to Croatian user-facing messages.
    if (
      error.message.includes('Invalid login') ||
      error.message.includes('invalid_credentials') ||
      error.message.includes('Invalid credentials')
    ) {
      return { error: 'Pogrešan email ili lozinka.' };
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Email adresa nije potvrđena. Provjerite inbox.' };
    }
    return { error: 'Prijava nije uspjela. Pokušajte ponovo.' };
  }

  redirect('/admin');
}

// ─── Logout ───────────────────────────────────────────────────────────────────

/**
 * Sign out the current user and redirect to the login page.
 * Use as a <form action={logoutAction}> in a Server Component.
 */
export async function logoutAction(): Promise<never> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/admin/login');
}
