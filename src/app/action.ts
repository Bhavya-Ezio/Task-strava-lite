'use server';

import { createClient } from '@/lib/supabase/server';
import { User } from '@supabase/supabase-js';

export type ActionResult = {
  ok: boolean;
  message?: string | null;
  user?: Profile;
};

export type UpdateProfileResult = ActionResult;
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

export type SignInResult = ActionResult;
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

export type LogoutResult = ActionResult;

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

export type Profile = {
  id: string;
  full_name: string | null;
  bio: string | null;
};

export type DashboardActivity = {
  id: string;
  type: 'run' | 'ride';
  distance_km: number;
  duration_min: number;
  notes: string;
  title: string;
  created_at: Date;
};

export type DashboardWeeklyReport = {
  totalRun: number;
  totalTime: number;
  topSport: number;
};

export type Dashboard = {
  ok: boolean;
  recent: DashboardActivity[];
  summary: DashboardWeeklyReport;
};