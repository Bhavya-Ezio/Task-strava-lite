import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// import { getDashboardData } from '@/app/action';
export async function GET() {
	try {
		const supabase = await createClient();
		const { data: userData, error } = await supabase.auth.getUser();
		if (error) {
			return NextResponse.json({ ok: false, message: error.message }, { status: 401 });
		}
		const userId = (userData.user?.id ?? null).toString();
		console.log(userId);
		const recentActivities = await supabase
			.from("activities")
			.select("id,type,distance_km,duration_min,notes,title,created_at")
			.eq('user_id', userId)
			.order("created_at", { ascending: false })
			.limit(3);

		const currDate = new Date(Date.now());
		// console.log(currDate.getDay());
		const diff = (currDate.getDay() === 0 ? 6 : currDate.getDay() - 1);

		// Subtract 'diff' days
		currDate.setDate(currDate.getDate() - diff);
		const weeklyActivities = await supabase
			.from("activities")
			.select("type,distance_km,duration_min")
			.eq('user_id', userId)
			.gte("created_at", currDate.toISOString())
			.lte("created_at", new Date().toISOString());

		const weeklyReport = {
			totalRun: 0,
			totalTime: 0,
			topSport: 0
		}
		// console.log(weeklyActivities)
		weeklyActivities.data?.forEach((activity) => {
			weeklyReport.totalRun += activity.distance_km;
			weeklyReport.totalTime += activity.duration_min / 60;
			weeklyReport.topSport += activity.type === "run" ? -1 : 1;
		})
		return NextResponse.json(
			{ ok: true, recent: recentActivities.data, summary: weeklyReport },
			{ status: 200 }
		);
	} catch (err) {
		return NextResponse.json(
			{ ok: false, message: err instanceof Error ? err.message : 'Unexpected error.' },
			{ status: 500 }
		);
	}
}
