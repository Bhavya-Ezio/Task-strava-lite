// import { createClient } from "@/lib/supabase/server";
// import { NextResponse } from "next/server";

// export async function GET() {
//     try {
//         const supabase = await createClient();
//         const { data, error } = await supabase
//             .from("activities")
//             .select("*")
//             .order("created_at", { ascending: false });

//         if (error) {
//             console.error("Supabase error fetching activities:", error.message);
//             return NextResponse.json({ error: error.message }, { status: 500 });
//         }

//         return NextResponse.json({ data });
//     } catch (err: any) {
//         console.error("Unexpected error in GET /api/activities:", err);
//         return NextResponse.json(
//             { error: "An unexpected error occurred." },
//             { status: 500 }
//         );
//     }
// }

import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";

type Activity = {
    id: string;
    title: string | null;
    type: 'run' | 'ride';
    distance_km: number | null;
    duration_min: number | null;
    created_at: string;
    notes?: string;
};

// Expanded mock data to simulate a larger dataset
// const allActivitiesData: Activity[] = Array.from({ length: 100 }, (_, i) => ({
//     id: `id_${i + 1}`,
//     title: `${i % 3 === 0 ? 'City Loop' : i % 3 === 1 ? 'Park Run' : 'Trail Ride'} #${i + 1}`,
//     type: i % 2 === 0 ? 'run' : 'ride',
//     distance_km: parseFloat((Math.random() * 20 + 3).toFixed(2)),
//     duration_min: Math.floor(Math.random() * 80 + 20),
//     created_at: new Date(2025, 7, 21 - i).toISOString(),
// }));

// This function handles GET requests with filtering and pagination
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Get query parameters
    const search = searchParams.get('search') || '';
    const sport = searchParams.get('sport') || 'all';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const supabase = await createClient();
    const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("deleted", false)        
        .order("created_at", { ascending: false });

    const allActivitiesData = data as Activity[];
    // --- Filtering Logic ---
    const filteredActivities = allActivitiesData.filter(activity => {
        const activityDate = new Date(activity.created_at);
        const searchMatch = !search || activity.title?.toLowerCase().includes(search.toLowerCase());
        const sportMatch = sport === 'all' || activity.type === sport;
        const fromMatch = !from || activityDate >= new Date(from);
        const toMatch = !to || activityDate <= new Date(to);
        return searchMatch && sportMatch && fromMatch && toMatch;
    });

    const total = filteredActivities.length;

    // --- Pagination Logic ---
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = filteredActivities.slice(startIndex, startIndex + pageSize);

    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
        items: paginatedItems,
        total,
        page,
        pageSize,
    });
}

