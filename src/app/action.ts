'use server';

import { createClient } from '@/lib/supabase/server';
import { LogoutResult, Profile, SignInResult, UpdateProfileResult } from '@/types/types';
import { User } from '@supabase/supabase-js';

export async function updateProfile(_prev: UpdateProfileResult | undefined, formData: FormData): Promise<UpdateProfileResult> {
  try {
    const id = String(formData.get('id') ?? '').trim();
    const full_name = (formData.get('full_name') as string | null)?.trim() ?? null;
    const bio = (formData.get('bio') as string | null)?.trim() ?? null;

    if (!id) {
      return { ok: false, message: 'User id is required.' };
    }

    const supabase = await createClient();
    const { error } = await supabase.from('profiles').upsert({ id, full_name, bio }, { onConflict: 'id' });

    if (error) {
      return { ok: false, message: error.message ?? 'Unable to update profile.' };
    }

    return { ok: true, message: 'Profile updated.' };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Unexpected error.' };
  }
}

export type UserAndProfileResult = {
  ok: boolean;
  message?: string | null;
  userId?: string | null;
  user?: User | null;
  profile?: Profile | null;
};


export async function signIn(_prev: SignInResult | undefined, formData: FormData): Promise<SignInResult> {
  try {
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    if (!email || !password) {
      return { ok: false, message: 'Email and password are required.' };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      return { ok: false, message: error.message ?? 'Invalid credentials.' };
    }
    return { ok: true, message: "Signin completed" };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Unexpected error.' };
  }
}

export async function logout(): Promise<LogoutResult> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { ok: false, message: error.message ?? 'Failed to log out.' };
    }

    return { ok: true, message: 'Logged out successfully.' };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Unexpected error.' };
  }
}