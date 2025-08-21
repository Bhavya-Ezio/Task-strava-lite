import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';

// Define the shape of the expected response.
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

export async function GET(): Promise<NextResponse<UserAndProfileResult>> {
	try {
		const supabase = await createClient(); // Pass the cookies to the client creator

		const { data: { user }, error: userError } = await supabase.auth.getUser();
		if (userError) {
			return NextResponse.json({ ok: false, message: userError.message }, { status: 401 });
		}

		if (!user) {
			return NextResponse.json({ ok: false, message: 'No active session.' }, { status: 401 });
		}

		const { data: profileRow, error: profileError } = await supabase
			.from('profiles')
			.select('id, full_name, bio')
			.eq('id', user.id)
			.single();

		if (profileError) {
			return NextResponse.json({ ok: false, message: profileError.message }, { status: 500 });
		}

		const profile = profileRow as Profile | null;

		return NextResponse.json({ ok: true, user, userId: user.id, profile }, { status: 200 });
	} catch (err) {
		const errorMessage = err instanceof Error ? err.message : 'Unexpected error.';
		return NextResponse.json({ ok: false, message: errorMessage }, { status: 500 });
	}
}
