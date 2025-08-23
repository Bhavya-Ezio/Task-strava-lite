import { NextResponse } from 'next/server';
import { createClient } from "@/lib/supabase/server";
import { Activity } from '@/types/types';

export async function GET(request: Request) {
    try {
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

        if (error) {
            return NextResponse.json(
                { ok: false, message: error.message || "Failed to fetch activities." },
                { status: 500 }
            );
        }

        if (!data) {
            return NextResponse.json(
                { ok: false, message: "No activities found." },
                { status: 404 }
            );
        }

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
    } catch (err) {
        const message =
            err instanceof Error
                ? err.message
                : "An unexpected error occurred while fetching activities.";
        return NextResponse.json(
            { ok: false, message },
            { status: 500 }
        );
    }
}

