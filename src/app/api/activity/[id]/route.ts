import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: "Missing activity id." }, { status: 400 });
        }

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("activities")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Supabase error fetching activity:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
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
