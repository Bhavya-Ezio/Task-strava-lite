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

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        if (!id) {
            return NextResponse.json({ error: "Missing activity id." }, { status: 400 });
        }

        // Validation schema
        const updateSchema = z.object({
            title: z.string().min(1).max(100).optional(),
            type: z.enum(["run", "ride"]).optional(),
            distance_km: z.number().min(0).optional(),
            duration_min: z.number().min(1).optional(),
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
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1️⃣ Get the original activity first
        const { data: originalActivity, error: originalError } = await supabase
            .from("activities")
            .select("distance_km, duration_min")
            .eq("id", id)
            .eq("user_id", userId)
            .eq("deleted", false)
            .single();

        if (originalError || !originalActivity) {
            console.log("error: ", originalError)
            return NextResponse.json({ error: "Activity not found" }, { status: 404 });
        }

        // 2️⃣ Update the activity
        const { data: updatedActivity, error: updateError } = await supabase
            .from("activities")
            .update(updateData)
            .eq("id", id)
            .eq("user_id", userId)
            .eq("deleted", false)
            .select()
            .single();

        if (updateError) {
            console.error("Supabase error updating activity:", updateError.message);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 3️⃣ Calculate differences
        const originalDistance = originalActivity.distance_km ?? 0;
        const originalDuration = originalActivity.duration_min ?? 0;
        const updatedDistance = updatedActivity.distance_km ?? originalDistance;
        const updatedDuration = updatedActivity.duration_min ?? originalDuration;

        const distanceDiff = updatedDistance - originalDistance;
        const durationDiff = updatedDuration - originalDuration;

        console.log("dist diff: ", distanceDiff, "\n\ndur diff: ", durationDiff);

        // 4️⃣ Fetch user profile
        const { data: userProfile, error: userError } = await supabase
            .from("profiles")
            .select("total_distance, total_time, avg_speed, longest_run")
            .eq("id", userId)
            .single();

        if (userError || !userProfile) {
            console.log("error-user: ", userError)
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        let { total_distance, total_time, avg_speed, longest_run } = userProfile;

        // Update totals incrementally
        total_distance = Number(((total_distance ?? 0) + distanceDiff).toFixed(2));
        total_time = Number(((total_time ?? 0) + durationDiff).toFixed(1));

        console.log(total_distance, total_time)
        // Handle longest_run:
        if (updatedDistance > (longest_run ?? 0)) {
            longest_run = updatedDistance; // new longest
        } else if (originalDistance === longest_run && updatedDistance < originalDistance) {
            // we reduced the longest -> need to recalc from all activities
            const { data: acts, error: actsError } = await supabase
                .from("activities")
                .select("distance_km")
                .eq("user_id", userId)
                .eq("deleted", false);

            if (!actsError && acts && acts.length > 0) {
                longest_run = Math.max(...acts.map((a) => a.distance_km ?? 0));
            }
        }

        // Handle avg_speed:
        if (distanceDiff !== 0 || durationDiff !== 0) {
            const { data: acts, error: actsError } = await supabase
                .from("activities")
                .select("distance_km, duration_min")
                .eq("user_id", userId)
                .eq("deleted", false);

            if (!actsError && acts && acts.length > 0) {
                let totalSpeed = 0;
                let count = 0;
                for (const act of acts) {
                    const d = act.distance_km ?? 0;
                    const t = act.duration_min ?? 0;
                    if (t > 0) {
                        totalSpeed += d / (t / 60);
                        count++;
                    }
                }
                avg_speed = count > 0 ? Number((totalSpeed / count).toFixed(2)) : 0;
                console.log("avg_speed: ", avg_speed)
            }
        }

        // 5️⃣ Update profile stats
        await supabase
            .from("profiles")
            .update({
                total_distance,
                total_time,
                avg_speed,
                longest_run,
            })
            .eq("id", userId);

        return NextResponse.json({ ok: true, activity: updatedActivity });
    } catch (err) {
        console.error("Unexpected error in PATCH /api/activity/[id]:", err);
        return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
    }
}


// DELETE: Soft-delete an activity by id
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        if (!id) {
            return NextResponse.json({ error: "Missing activity id." }, { status: 400 });
        }

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();
        const userId = user?.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1️⃣ Fetch the activity before soft delete
        const { data: activity, error: fetchError } = await supabase
            .from("activities")
            .select("distance_km, duration_min")
            .eq("id", id)
            .eq("user_id", userId)
            .eq("deleted", false)
            .single();

        if (fetchError || !activity) {
            return NextResponse.json({ error: "Activity not found" }, { status: 404 });
        }

        const distance = activity.distance_km ?? 0;
        const duration = activity.duration_min ?? 0;

        // 2️⃣ Soft delete the activity
        const { error: deleteError } = await supabase
            .from("activities")
            .update({ deleted: true })
            .eq("id", id)
            .eq("user_id", userId);

        if (deleteError) {
            console.error("Supabase error deleting activity:", deleteError.message);
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        // 3️⃣ Fetch current user stats
        const { data: userProfile, error: userError } = await supabase
            .from("profiles")
            .select("total_distance, total_time, avg_speed, longest_run")
            .eq("id", userId)
            .single();

        if (userError || !userProfile) {
            return NextResponse.json({ error: "User profile not found" }, { status: 404 });
        }

        let { total_distance, total_time, avg_speed, longest_run } = userProfile;

        // Subtract deleted activity values
        total_distance = Number(((total_distance ?? 0) - distance).toFixed(2));
        total_time = Number(((total_time ?? 0) - duration).toFixed(1));

        const { data: acts, error: actsError } = await supabase
            .from("activities")
            .select("distance_km,duration_min")
            .eq("user_id", userId)
            .eq("deleted", false);
        // Recalculate longest_run if needed
        if (distance === longest_run) {

            if (!actsError && acts && acts.length > 0) {
                longest_run = Math.max(...acts.map((a) => a.distance_km ?? 0));
            } else {
                longest_run = 0;
            }
        }

        let count = 0;
        if (acts && acts.length > 0) {
            let totalSpeed = 0;
            for (const act of acts) {
                const d = act.distance_km ?? 0;
                const t = act.duration_min ?? 0;
                if (t > 0) {
                    totalSpeed += d / (t / 60);
                    count++;
                }
            }
            avg_speed = count > 0 ? Number((totalSpeed / count).toFixed(2)) : 0;
        } else {
            avg_speed = 0;
        }

        // Calculate total_activities (number of non-deleted activities)
        const total_activities = acts ? acts.length : 0;

        // 4️⃣ Update the profile, including total_activities
        await supabase
            .from("profiles")
            .update({
                total_distance,
                total_time,
                avg_speed,
                longest_run,
                total_activities,
            })
            .eq("id", userId);

        return new NextResponse(null, { status: 204 }); // 204: No Content
    } catch (err) {
        console.error("Unexpected error in DELETE /api/activity/[id]:", err);
        return NextResponse.json(
            { error: "An unexpected error occurred." },
            { status: 500 }
        );
    }
}

