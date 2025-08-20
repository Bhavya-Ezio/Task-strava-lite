'use server';

import { createClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';

export type ActionResult = {
  ok: boolean;
  message?: string | null;
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
    return { ok: true, message: 'Welcome back!' };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Unexpected error.' };
  }
}

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

export type Profile = {
  id: string;
  full_name: string | null;
  bio: string | null;
};

export type UserAndProfileResult = {
  ok: boolean;
  message?: string | null;
  userId?: string | null;
  user?: User | null;
  profile?: Profile | null;
};

export type DashboardSummary = {
  totalKm: number;
  totalTimeLabel: string; // e.g., "4h 20m"
  topSport: string;
};

export type RecentActivity = {
  id: string;
  type: 'run' | 'ride';
  title: string;
  stats: string;
  notes: string;
  dateLabel: string;
};

export type DashboardDataResult = {
  ok: boolean;
  message?: string | null;
  summary?: DashboardSummary;
  recent?: RecentActivity[];
};

export type CombinedResult = {
  ok: boolean;
  message?: string | null;
  user?: User | null;
  profile?: Profile | null;
  dashboard?: DashboardDataResult;
};

export async function getUserAndDashboard(): Promise<CombinedResult> {
  try {
    // --- 1. Get user + profile
    const userRes = await fetch('http://localhost:3000/api/user', { cache: 'no-store' });
    const userJson = (await userRes.json()) as UserAndProfileResult;
    console.log(userJson);
    if (!userJson.ok) {
      const response: CombinedResult = {
        ok: false,
        message: "unauthorized user",
      }
      return response;
    }

    const id = userJson.userId ?? null;
    const profile = userJson.profile ?? null;

    // redirect if profile not filled in
    if (id && (!profile || !profile.full_name)) {
      window.location.href = `/${id}/profile`; // 👈 must use window.location on client
      return { ok: false, message: "Redirecting to profile" };
    }

    // --- 2. Get dashboard
    const dashRes = await fetch('/api/dashboard', { cache: 'no-store' });
    const dashJson = (await dashRes.json()) as DashboardDataResult;

    if (!dashJson.ok) {
      return { ok: false, message: dashJson.message };
    }

    return {
      ok: true,
      user: userJson.user,
      profile,
      dashboard: dashJson,
    };
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : "Unexpected error." };
  }
}
