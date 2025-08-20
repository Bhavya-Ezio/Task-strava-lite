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

export async function getUserAndProfile(): Promise<UserAndProfileResult> {
  // try {
  //   const supabase = await createClient();

  //   const { data: userData, error: userError } = await supabase.auth.getUser();
  //   if (userError) {
  //     return { ok: false, message: userError.message };
  //   }

  //   const user = userData.user ?? null;
  //   const userId = user?.id ?? null;
  //   if (!userId) {
  //     return { ok: false, message: 'No active session.', user, userId: null };
  //   }

  //   const { data: profileRow, error: profileError } = await supabase
  //     .from('profiles')
  //     .select('id, full_name, bio')
  //     .eq('id', userId)
  //     .single();

  //   if (profileError) {
  //     return { ok: false, message: profileError.message, user, userId };
  //   }

  //   const profile: Profile | null = profileRow as Profile | null;

  //   return { ok: true, user, userId, profile };
  // } catch (err) {
  //   return { ok: false, message: err instanceof Error ? err.message : 'Unexpected error.' };
  // }
  try {
    const res = await fetch('http://localhost:3000/api/user', {
      credentials: 'include',
    });
    const data = await res.json();
    console.log(data)
    return data;
  } catch (error) {
    return { ok: false, message: "error fetching data" };
  }
}

export type DashboardSummary = {
  totalKm: number;
  totalTimeLabel: string; // e.g., "4h 20m"
  topSport: string;
};

export type RecentActivity = {
  id: string;
  type: 'run' | 'ride';
  title: string;
  stats: string; // e.g., "5.2 km • 25 min • 4:48 min/km"
  notes: string;
  dateLabel: string; // e.g., "Today"
};

export type DashboardDataResult = {
  ok: boolean;
  message?: string | null;
  summary?: DashboardSummary;
  recent?: RecentActivity[];
};

export async function getDashboardData(userId: string | null): Promise<DashboardDataResult> {
  try {
    // In a real app, compute from DB. For now, return demo values inspired by the sample HTML.
    if (!userId) return { ok: false, message: 'Missing user id.' };

    const demo: DashboardDataResult = {
      ok: true,
      summary: {
        totalKm: 42.5,
        totalTimeLabel: '4h 20m',
        topSport: 'Running',
      },
      recent: [
        {
          id: 'a1',
          type: 'run',
          title: 'Morning Run',
          stats: '5.2 km • 25 min • 4:48 min/km',
          notes: 'Effort: 7/10 • "Felt great today!"',
          dateLabel: 'Today',
        },
        {
          id: 'a2',
          type: 'ride',
          title: 'Evening Ride',
          stats: '15.8 km • 45 min • 21.1 km/h',
          notes: 'Effort: 5/10 • "Easy recovery ride"',
          dateLabel: 'Yesterday',
        },
        {
          id: 'a3',
          type: 'run',
          title: 'Long Weekend Run',
          stats: '10.5 km • 55 min • 5:14 min/km',
          notes: 'Effort: 8/10 • "Challenging but rewarding"',
          dateLabel: '2 days ago',
        },
      ],
    };

    return demo;
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : 'Unexpected error.' };
  }
}