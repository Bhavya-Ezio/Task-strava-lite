"use client";

import React, { useState } from "react";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useToast } from "@/toast/ToastProvider";

// --- TYPE DEFINITION for the API response ---
type SuggestionResponse = {
    suggestion: string;
    rationale: string;
    inputs: {
        totals: { distance: number; duration: number; activities: number };
        averages: { distance: number; duration: number };
    };
};

// --- MAIN COMPONENT ---
const AiSuggestion = () => {
    const [suggestion, setSuggestion] = useState<SuggestionResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleGetSuggestion = async () => {
        setIsLoading(true);
        setError(null);
        setSuggestion(null);

        try {
            const response = await fetch("/api/suggestion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ horizonDays: 28 }),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error("Could not get a suggestion. Please try again.");
            }

            const data = await response.json();
            setSuggestion(data);
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "An unexpected error occurred. Please try again.";
            setError(message);
            showToast({
                message,
                variant: "error",
                title: "Suggestion Error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-[#0D1321] p-6 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <BrainCircuit className="text-orange-500" />
                    AI Workout Suggestion
                </h2>
            </div>

            {/* Initial State & Button */}
            {!isLoading && !suggestion && !error && (
                <div className="text-center">
                    <p className="text-slate-400 mb-4">
                        Get a personalized activity suggestion based on your recent history.
                    </p>
                    <button
                        onClick={handleGetSuggestion}
                        className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
                    >
                        Get Today&apos;s Suggestion
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center text-center h-48">
                    <Loader2 size={40} className="animate-spin text-orange-500" />
                    <p className="mt-4 text-slate-300">
                        Analyzing your recent activities...
                    </p>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="text-center h-48 flex flex-col justify-center items-center">
                    <p className="text-red-400 mb-4">{error}</p>
                    <button
                        onClick={handleGetSuggestion}
                        className="bg-slate-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Suggestion Display State */}
            {suggestion && !isLoading && (
                <div className="space-y-6 animate-fade-in">
                    {/* The Suggestion */}
                    <div className="text-center bg-orange-500/10 border border-orange-500/30 p-6 rounded-lg">
                        <p className="text-slate-300 text-sm uppercase tracking-wider">
                            Today&apos;s Plan
                        </p>
                        <p className="text-3xl font-bold text-orange-400 mt-2">
                            {suggestion.suggestion}
                        </p>
                    </div>

                    {/* Rationale */}
                    <div>
                        <h3 className="font-semibold text-slate-300 mb-2">Rationale</h3>
                        <p className="text-slate-400 bg-[#0A0F24] p-4 rounded-md border border-slate-700">
                            &quot;{suggestion.rationale}&quot;
                        </p>
                    </div>

                    {/* Inputs */}
                    <div>
                        <h3 className="font-semibold text-slate-300 mb-2">
                            Based on Last 28 Days
                        </h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <InfoBox
                                label="Activities"
                                value={suggestion.inputs.totals.activities}
                            />
                            <InfoBox
                                label="Total Distance"
                                value={`${suggestion.inputs.totals.distance} km`}
                            />
                            <InfoBox
                                label="Total Time"
                                value={`${suggestion.inputs.totals.duration} min`}
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleGetSuggestion}
                        className="w-full bg-slate-700 text-white py-3 mt-4 rounded-lg font-semibold hover:bg-slate-600 transition-colors"
                    >
                        Regenerate Suggestion
                    </button>
                </div>
            )}
        </div>
    );
};

// --- SUB-COMPONENT for displaying stats ---
const InfoBox = ({
    label,
    value,
}: {
    label: string;
    value: string | number;
}) => (
    <div className="bg-[#0A0F24] p-4 rounded-md border border-slate-700">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-xl font-bold text-white mt-1">{value}</p>
    </div>
);

export default AiSuggestion;