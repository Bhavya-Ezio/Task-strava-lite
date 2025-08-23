import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

export async function POST(request: Request) {
    const body = await request.json();

    const schema = z.object({
        horizonDays: z
            .number()
            .int()
            .min(1, { message: "horizonDays must be at least 1" })
            .max(365, { message: "horizonDays must be at most 365" })
            .optional()
    });

    const parseResult = schema.safeParse(body);
    if (!parseResult.success) {
        const firstIssue = parseResult.error.issues?.[0];
        return NextResponse.json(
            { ok: false, message: firstIssue?.message || "Invalid input" },
            { status: 400 }
        );
    }

    const horizonDays = parseResult.data.horizonDays ?? 28;

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
        return NextResponse.json({ ok: false, message: userError.message }, { status: 401 });
    }

    if (!user) {
        return NextResponse.json({ ok: false, message: 'No active session.' }, { status: 401 });
    }

    const sinceDate = new Date();
    sinceDate.setDate(sinceDate.getDate() - horizonDays);

    const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('id, type, distance_km, duration_min, created_at')
        .eq('user_id', user.id)
        .eq("deleted", false)
        .gte('created_at', sinceDate.toISOString())
        .order('created_at', { ascending: false });

    if (activitiesError) {
        return NextResponse.json({ ok: false, message: activitiesError.message }, { status: 500 });
    }

    if (!activities || activities.length === 0) {
        return NextResponse.json({
            total_activities: 0,
            total_distance: 0,
            total_time: 0,
        });
    }


    const total_duration = activities.reduce((sum, a) => sum + (a.duration_min || 0), 0);
    const total_distance = activities.reduce((sum, a) => sum + (a.distance_km || 0), 0);
    const runActivities = activities.filter((a) => a.type === "run");
    const rideActivities = activities.filter((a) => a.type === "ride");

    const total_runs = runActivities.length;
    const total_rides = rideActivities.length;
    const avg_run_pace =
        runActivities.length > 0
            ? (() => {
                const totalRunDistance = runActivities.reduce((sum, a) => sum + (a.distance_km || 0), 0);
                const totalRunDuration = runActivities.reduce((sum, a) => sum + (a.duration_min || 0), 0); // duration in minutes
                if (totalRunDistance === 0) return null;
                const pace = totalRunDuration / totalRunDistance;
                const min = Math.floor(pace);
                const sec = Math.round((pace - min) * 60)
                    .toString()
                    .padStart(2, "0");
                return `${min}:${sec} min/km`;
            })()
            : null;

    let prompt = `You are a helpful running and cycling coach. Based on the following summary of my last ${horizonDays} days of activity, please provide a workout suggestion for today.\n\nMy recent activity:\n- Total Runs: ${total_runs}\n- Total Rides: ${total_rides}\n- Total Distance: ${total_distance} km`;
    if (avg_run_pace) {
        prompt += `\n- Average Pace (running): ${avg_run_pace}`;
    }
    prompt += `Return a JSON object with a single top-level key: \"response\". The value of \"response\" should be an object containing the following three keys:\n\nA short workout phrase (e.g., \"Recovery 3 km @ easy pace\" or \"30 min tempo ride\").\n2. "rationale": A brief explanation for the suggestion.\n3. "inputs": A summary of the data you based this on.`;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        return NextResponse.json({ ok: false, message: "Gemini API key not configured." }, { status: 500 });
    }

    const geminiRes = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-goog-api-key": process.env.GEMINI_API_KEY!,
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: prompt,
                            },
                        ],
                    },
                ],
                generationConfig: {
                    responseMimeType: "application/json",
                },
            }),
        }
    );

    if (!geminiRes.ok) {
        const errorText = await geminiRes.text();
        return NextResponse.json({ ok: false, message: "Gemini API error: " + errorText }, { status: 500 });
    }

    const geminiData = await geminiRes.json();

    let suggestionJson = null;
    try {
        const text = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
        suggestionJson = text ? JSON.parse(text) : null;
    } catch (e) {
        return NextResponse.json({ ok: false, message: "Failed to parse Gemini response." }, { status: 500 });
    }

    console.log(suggestionJson);

    if (!suggestionJson) {
        return NextResponse.json({ ok: false, message: "No suggestion returned from Gemini." }, { status: 500 });
    }

    suggestionJson = {
        suggestion: suggestionJson.response.workoutPhrase,
        rationale: suggestionJson.response.rationale,
        inputs: {
            totals: {
                distance: total_distance,
                duration: total_duration,
                activities: activities.length,
            },
            averages: {
                distance: total_distance / activities.length,
                duration: total_duration / activities.length,
            }
        }
    }
    return NextResponse.json(suggestionJson)
}