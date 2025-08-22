import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

// ✅ Zod schema for request validation
const activitySchema = z.object({
    type: z.enum(["run", "ride"]),
    distance_km: z.number().min(0, "Distance must be positive"),
    duration_min: z.number().min(1, "Duration must be at least 1 minute"),
    notes: z.string().max(500).optional(),
    title: z.string().min(1, "Title is required").max(100),
});

export async function POST(req) {
    try {
        const body = await req.json();

        const parsed = activitySchema.safeParse(body);
        if (!parsed.success) {
            return NextResponse.json(
                {
                    ok: false,
                    message: "Validation error",
                    errors: parsed.error.issues,
                },
                { status: 400 }
            );
        }

        const { type, distance_km, duration_min, notes, title } = parsed.data;

        const supabase = await createClient();
        // ✅ get the logged-in user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return NextResponse.json(
                { ok: false, message: "Not authenticated" },
                { status: 401 }
            );
        }

        // ✅ Insert into DB
        const { data, error } = await supabase
            .from("activities")
            .insert([
                {
                    user_id: user.id,
                    type,
                    distance_km,
                    duration_min,
                    notes,
                    title,
                },
            ])
            .select()
            .single();
        // Get the user's profile
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("id, longest_run, total_time, total_distance, total_activities, avg_speed")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { ok: false, message: "Profile not found" },
                { status: 404 }
            );
        }

        // Calculate new stats
        const newDistance = Number(distance_km) || 0;
        const newDuration = Number(duration_min) || 0;
        const newSpeed = newDuration > 0 ? newDistance / (newDuration / 60) : 0; // km/h

        // Update longest_run if this is a run and longer than previous
        let newLongestRun = profile.longest_run;
        if (profile.longest_run === null || newDistance > Number(profile.longest_run)) {
            newLongestRun = newDistance;
        }

        const oldTotalActivities = Number(profile.total_activities) || 0;
        const oldTotalTime = Number(profile.total_time) || 0;
        const oldTotalDistance = Number(profile.total_distance) || 0;
        const oldAvgSpeed = Number(profile.avg_speed) || 0;

        const updatedTotalActivities = oldTotalActivities + 1;
        const updatedTotalTime = oldTotalTime + newDuration;
        const updatedTotalDistance = oldTotalDistance + newDistance;

        // Calculate new avg_speed
        // new avg_speed = (old avg_speed * old total_activities + new_speed) / updatedTotalActivities
        const updatedAvgSpeed =
            updatedTotalActivities > 0
                ? ((oldAvgSpeed * oldTotalActivities) + newSpeed) / updatedTotalActivities
                : newSpeed;

        // Update the profile
        const { error: updateProfileError } = await supabase
            .from("profiles")
            .update({
                longest_run: newLongestRun,
                total_time: updatedTotalTime,
                total_distance: updatedTotalDistance,
                total_activities: updatedTotalActivities,
                avg_speed: updatedAvgSpeed,
            })
            .eq("id", user.id);

        if (updateProfileError) {
            return NextResponse.json(
                { ok: false, message: "Failed to update profile: " + updateProfileError.message },
                { status: 500 }
            );
        }

        if (error) {
            return NextResponse.json(
                { ok: false, message: error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ ok: true, activity: data }, { status: 201 });
    } catch (err) {
        console.error("Unexpected error:", err);
        return NextResponse.json(
            { ok: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
