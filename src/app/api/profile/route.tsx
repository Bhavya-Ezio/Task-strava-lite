import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Define the shape of the expected response.
type UserProfileData = {
    id: string;
    name: string;
    email: string;
    memberSince: string;
    allTimeStats: {
        totalActivities: number;
        totalDistance: number;
        totalDuration: number;
        avgSpeed: number;
    };
};


export type ProfileRes = {
    ok: boolean;
    message?: string | null;
    profile?: UserProfileData | null
};

export async function GET(): Promise<NextResponse<ProfileRes>> {
    try {
        const supabase = await createClient(); // Pass the cookies to the client creator

        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
            return NextResponse.json({ ok: false, message: userError.message }, { status: 401 });
        }

        if (!user || !user?.email) {
            return NextResponse.json({ ok: false, message: 'No active session.' }, { status: 401 });
        }

        const { data: profileRow, error: profileError } = await supabase
            .from('profiles')
            .select('id,full_name,longest_run,total_time,total_distance,total_activities,avg_speed')
            .eq('id', user.id)
            .single();
        // console.log(profileRow)
        if (profileError) {
            return NextResponse.json({ ok: false, message: profileError.message }, { status: 500 });
        }

        // memberSince:`Member Since ${user.created_at}`;
        const profile: UserProfileData = {
            id: profileRow.id,
            name: profileRow.full_name,
            email: user.email,
            memberSince: user.created_at,
            allTimeStats: {
                totalActivities: profileRow.total_activities,
                totalDistance: profileRow.total_distance,
                totalDuration: profileRow.total_time,
                avgSpeed: profileRow.avg_speed,
            },
        };
        return NextResponse.json({ ok: true, profile: profile }, { status: 200 });
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unexpected error.';
        return NextResponse.json({ ok: false, message: errorMessage }, { status: 500 });
    }
}
