import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { type NextRequest } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const idSchema = z.string().uuid({ message: "Invalid activity id format." });
        const { id } = params;
        const idValidation = idSchema.safeParse(id);
        if (!idValidation.success) {
            return NextResponse.json({ error: idValidation.error.issues[0].message }, { status: 400 });
        }

        const supabase = await createClient();

        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        const { data, error } = await supabase
            .from("activities")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .eq("deleted", false)
            .single();

        if (error) {
            console.error("Supabase error fetching activity:", error.message);
            return NextResponse.json({ error: "here " + error.message }, { status: 500 });
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


// PATCH: Update an activity by id
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: "Missing activity id." }, { status: 400 });
        }

        // Define schema for updatable fields
        const updateSchema = z.object({
            title: z.string().min(1, "Title is required").max(100).optional(),
            type: z.enum(["run", "ride"]).optional(),
            distance_km: z.number().min(0, "Distance must be positive").optional(),
            duration_min: z.number().min(1, "Duration must be at least 1 minute").optional(),
            notes: z.string().max(500).optional(),
        });

        const body = await req.json();
        const parsed = updateSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: "Validation error", issues: parsed.error.issues },
                { status: 400 }
            );
        }

        const updateData = parsed.data;
        if (Object.keys(updateData).length === 0) {
            return NextResponse.json(
                { error: "No valid fields provided for update." },
                { status: 400 }
            );
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;

        const { data, error } = await supabase
            .from("activities")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", userId)
            .eq("deleted", false)
            .select()
            .single();

        if (error) {
            console.error("Supabase error updating activity:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, activity: data });
    } catch (err) {
        console.error("Unexpected error in PATCH /api/activity/[id]:", err);
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}

// DELETE: Soft-delete an activity by id
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: "Missing activity id." }, { status: 400 });
        }

        const supabase = await createClient();
        // Soft delete: set deleted = true
        const { data: { user } } = await supabase.auth.getUser();
        const userId = user?.id;
        const { error } = await supabase
            .from("activities")
            .update({ deleted: true })
            .eq("id", id)
            .eq("user_id", userId);

        if (error) {
            console.error("Supabase error deleting activity:", error.message);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ ok: true, message: "Activity deleted." });
    } catch (err) {
        console.error("Unexpected error in DELETE /api/activity/[id]:", err);
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}
