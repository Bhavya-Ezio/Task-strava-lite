// import { NextResponse } from 'next/server';
// import { requireUser } from '@/lib/auth';
// import { createClient } from '@/lib/supabase/server';
// export async function GET() {
// 	requireUser();
// 	try {
// 		const supabase = await createClient();
// 		const {
// 			data
// 		} = await supabase.auth.getUser()
// 		console.log("data",data)
// 		// Get the user's profile from the "profiles" table
// 		// const supabase = await (await ).createClient();
// 		// const { data: profile, error: profileError } = await supabase.from('profiles').select('id, full_name, bio').eq('id', user?.id).single();

// 		// if (profileError) {
// 		// 	const result = {
// 		// 		ok: false,
// 		// 		message: profileError.message,
// 		// 		// userId: user.id,
// 		// 		user,
// 		// 		profile: null,
// 		// 	};
// 		// 	return NextResponse.json(result, { status: 400 });
// 		// }

// 		const result = {
// 			ok: true,
// 			// userId: user?.id,
// 			// user,
// 			// profile,
// 		};
// 		return NextResponse.json(result, { status: result.ok ? 200 : 400 });
// 	} catch (err) {
// 		return NextResponse.json(
// 			{ ok: false, message: err instanceof Error ? err.message : 'Unexpected error.' },
// 			{ status: 500 }
// 		);
// 	}
// }
// app/api/user-and-profile/route.ts
// app/api/user/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // Import cookies here
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
    const cookieStore = await cookies();
	console.log(cookieStore)
    const supabase = createClient(cookieStore); // Pass the cookies to the client creator

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
