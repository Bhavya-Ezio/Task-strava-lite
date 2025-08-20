import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
export async function GET() {
	requireUser();
	try {
		const supabase = await createClient();
		const {
			data
		} = await supabase.auth.getUser()
		console.log("data",data)
		// Get the user's profile from the "profiles" table
		// const supabase = await (await ).createClient();
		// const { data: profile, error: profileError } = await supabase.from('profiles').select('id, full_name, bio').eq('id', user?.id).single();

		// if (profileError) {
		// 	const result = {
		// 		ok: false,
		// 		message: profileError.message,
		// 		// userId: user.id,
		// 		user,
		// 		profile: null,
		// 	};
		// 	return NextResponse.json(result, { status: 400 });
		// }

		const result = {
			ok: true,
			// userId: user?.id,
			// user,
			// profile,
		};
		return NextResponse.json(result, { status: result.ok ? 200 : 400 });
	} catch (err) {
		return NextResponse.json(
			{ ok: false, message: err instanceof Error ? err.message : 'Unexpected error.' },
			{ status: 500 }
		);
	}
}
