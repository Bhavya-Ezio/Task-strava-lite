import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("activities")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase error fetching activities:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ data });
    } catch (err: any) {
        console.error("Unexpected error in GET /api/activities:", err);
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
