/* @next-codemod-ignore */
import { NextRequest, NextResponse } from "next/server";
import { startOfWeek, endOfWeek, subWeeks, formatISO } from "date-fns";
import { createClient } from "@/lib/supabase/server";
// import { z } from "zod";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        if (!id) {
            return NextResponse.json({ error: "Missing activity id." }, { status: 400 });
        }
        const supabase = await createClient();
        const data = {
            reportId: id,
            userId: 'user-123',
            dateRange: {
                start: '2025-08-18T00:00:00Z',
                end: '2025-08-24T23:59:59Z',
            },
            summaryMetrics: {
                totalDistance: 42.5,
                totalActivities: 5,
                avgDistance: 8.5,
                avgSpeed: 14.2,
                avgDuration: 38,
                longestDistance: 15.0,
                longestDuration: 65,
            },
            goalProgress: {
                current: 42.5,
                goal: 50,
            },
            weeklyActivities: [
                { id: 'act-1', title: 'Monday Morning Run', type: 'run', date: '2025-08-18T07:30:00Z', distance: 8.2, duration: 40, speed: 12.3 },
                { id: 'act-2', title: 'Tuesday Evening Ride', type: 'ride', date: '2025-08-19T18:00:00Z', distance: 10.5, duration: 30, speed: 21.0 },
                { id: 'act-3', title: 'Thursday Interval Run', type: 'run', date: '2025-08-21T08:00:00Z', distance: 5.8, duration: 25, speed: 13.9 },
                { id: 'act-4', title: 'Saturday Hill Ride', type: 'ride', date: '2025-08-23T09:15:00Z', distance: 3.0, duration: 22, speed: 8.2 },
                { id: 'act-5', title: 'Sunday Long Run', type: 'run', date: '2025-08-24T07:00:00Z', distance: 15.0, duration: 65, speed: 13.8 },
            ],
            insights: {
                mostActiveDay: 'Sunday',
                fastestActivity: 'Tuesday Evening Ride',
                consistency: '4 out of 7 days',
            },
            comparisonToLastWeek: {
                distanceChangePercent: 15,
                activitiesChangeCount: 1,
                avgSpeedChange: 0.8,
                avgDurationChange: -5,
            },
        }
        // Calculate current and previous week ranges
        const now = new Date();
        const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
        const thisWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

        const lastWeekStart = subWeeks(thisWeekStart, 1);
        const lastWeekEnd = subWeeks(thisWeekEnd, 1);

        // Query current week activities
        const { data: currentWeek, error: currentError } = await supabase
            .from("activities")
            .select("*")
            .eq("user_id", id)
            .gte("created_at", thisWeekStart.toISOString())
            .lte("created_at", thisWeekEnd.toISOString())
            .order("created_at", { ascending: true });

        if (currentError) throw currentError;

        // Query previous week activities
        const { data: lastWeek, error: lastError } = await supabase
            .from("activities")
            .select("*")
            .eq("user_id", id)
            .gte("created_at", lastWeekStart.toISOString())
            .lte("created_at", lastWeekEnd.toISOString());

        if (lastError) throw lastError;

        // ---- Helpers ----
        const computeStats = (activities: any[]) => {
            if (activities.length === 0) {
                return {
                    totalDistance: 0,
                    totalActivities: 0,
                    avgDistance: 0,
                    avgSpeed: 0,
                    avgDuration: 0,
                    longestDistance: 0,
                    longestDuration: 0,
                };
            }

            const totalDistance = activities.reduce((sum, a) => sum + Number(a.distance_km || 0), 0);
            const totalDuration = activities.reduce((sum, a) => sum + Number(a.duration_min || 0), 0);
            const totalActivities = activities.length;
            const longestDistance = Math.max(...activities.map(a => Number(a.distance_km || 0)));
            const longestDuration = Math.max(...activities.map(a => Number(a.duration_min || 0)));

            return {
                totalDistance,
                totalActivities,
                avgDistance: totalDistance / totalActivities,
                avgSpeed: totalDuration > 0 ? (totalDistance / (totalDuration / 60)) : 0, // km/h
                avgDuration: totalDuration / totalActivities,
                longestDistance,
                longestDuration,
            };
        };

        const thisWeekStats = computeStats(currentWeek);
        const lastWeekStats = computeStats(lastWeek);

        // WeeklyActivities with speed calc
        const weeklyActivities = currentWeek.map(a => ({
            id: a.id,
            title: a.title,
            type: a.type,
            date: a.created_at,
            distance: Number(a.distance_km),
            duration: Number(a.duration_min),
            speed: a.duration_min ? Number(a.distance_km) / (Number(a.duration_min) / 60) : 0,
        }));

        // Insights
        const insights = {
            mostActiveDay: currentWeek.length
                ? new Date(currentWeek[0].created_at).toLocaleDateString("en-US", { weekday: "long" })
                : "N/A",
            fastestActivity: weeklyActivities.length
                ? weeklyActivities.reduce((prev, curr) => (curr.speed > prev.speed ? curr : prev)).title
                : "N/A",
            consistency: `${thisWeekStats.totalActivities} activities this week`,
        };

        // Comparison
        const comparisonToLastWeek = {
            distanceChangePercent: lastWeekStats.totalDistance > 0
                ? Number((((thisWeekStats.totalDistance - lastWeekStats.totalDistance) / lastWeekStats.totalDistance) * 100).toFixed(2))
                : 100.00,
            activitiesChangeCount: Number((thisWeekStats.totalActivities - lastWeekStats.totalActivities).toFixed(2)),
            avgSpeedChange: Number((thisWeekStats.avgSpeed - lastWeekStats.avgSpeed).toFixed(2)),
            avgDurationChange: Number((thisWeekStats.avgDuration - lastWeekStats.avgDuration).toFixed(2)),
        };

        // Final response
        const report = {
            reportId: crypto.randomUUID(),
            id,
            dateRange: {
                start: formatISO(thisWeekStart),
                end: formatISO(thisWeekEnd),
            },
            summaryMetrics: thisWeekStats,
            goalProgress: { current: thisWeekStats.totalDistance, goal: 50 }, // Example: static goal = 50km
            weeklyActivities,
            insights,
            comparisonToLastWeek,
        };

        return NextResponse.json(report, { status: 200 });
    } catch (err) {
        console.error("Unexpected error in GET /api/activities/[id]:", err);
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
