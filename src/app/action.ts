'use server';

import { createClient } from '@/lib/supabase/server';

export type ActionResult = {
  ok: boolean;
  message?: string | null;
  user?: Profile;
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

    // Cookies are handled by @supabase/ssr via server client
    // After successful sign in, fetch the user from backend API /api/user
    try {
      const res = await fetch('https://localhost:3000/api/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });
      const userRes = await res.json();

      return { ok: true, message: 'Welcome back!', user: userRes?.profile };
    } catch (err) {
      return { ok: false, message: err instanceof Error ? err.message : 'Unexpected error.' };
    }
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