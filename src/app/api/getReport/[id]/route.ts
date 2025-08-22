/* @next-codemod-ignore */
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: "Missing activity id." }, { status: 400 });
        }

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
        return NextResponse.json(data);
    } catch (err) {
        console.error("Unexpected error in GET /api/activities/[id]:", err);
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
