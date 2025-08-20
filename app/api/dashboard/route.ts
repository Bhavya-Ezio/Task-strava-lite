import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// import { getDashboardData } from '@/app/action';
import { requireUser } from '@/lib/auth';
export async function GET() {
	requireUser();
	try {
		const supabase = await createClient();
		const { data: userData, error } = await supabase.auth.getUser();
		if (error) {
			return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
		}
		const userId = userData.user?.id ?? null;
		// const dashboard = await getDashboardData(userId);
		// return NextResponse.json(dashboard, { status: dashboard.ok ? 200 : 400 });
	} catch (err) {
		return NextResponse.json(
			{ ok: false, message: err instanceof Error ? err.message : 'Unexpected error.' },
			{ status: 500 }
		);
	}
}
