"use client";

// import { Dashboard } from "../app/action";
import { useEffect, useState } from "react";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import { useActiveTab } from "@/context/activeTabContext";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { Dashboard } from "@/types/types";

const AiSuggestion = dynamic(() => import("./Suggestion"), { ssr: false });

export default function HomePage() {
    const [dashboard, setDashboard] = useState<Dashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const { setActiveTab } = useActiveTab();
    const [showSuggestion, setShowSuggestion] = useState(false);
    const suggestionButtonRef = useRef<HTMLButtonElement | null>(null);

    useEffect(() => {
        setMounted(true);
        async function fetchUser() {
            try {
                const dashRes = await fetch("/api/dashboard", {
                    credentials: "include",
                });
                const dashboardRes = await dashRes.json();
                setDashboard(dashboardRes);
            } catch (err) {
                console.error("Error fetching data", err);
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    function formatActivityDate(dateString: string) {
        const date = new Date(dateString);
        if (isToday(date)) return "Today";
        if (isYesterday(date)) return "Yesterday";
        return formatDistanceToNow(date, { addSuffix: true });
    }

    if (!mounted) return null; // 🚫 avoids hydration mismatch

    return (
        <main className="container bg-black mx-auto px-2 sm:px-4 lg:px-6 relative min-h-screen">
            <div className="space-y-6">
                {/* ---------- Dashboard Summary ---------- */}
                <div className="py-10 px-20 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold pl-5 relative text-slate-900 dark:text-slate-100 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-full before:rounded">
                            This Week&apos;s Progress
                        </h3>
                        <a
                            className="text-orange-400 text-xl font-semibold relative after:content-['→'] after:ml-2 after:transition after:translate-x-0 hover:after:translate-x-1 transition before:absolute before:left-0 before:bottom-0 before:w-full before:h-0.5 before:bg-orange-400 before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-300 before:rounded pb-0.5 overflow-hidden mr-5"
                            onClick={() => setActiveTab('report')}
                        >
                            View All
                        </a>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 size={48} className="animate-spin text-orange-500" />
                        </div>
                    ) : dashboard?.ok && dashboard.summary ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-center shadow">
                                <div className="text-3xl font-extrabold text-orange-700 dark:text-orange-400 mb-1">
                                    {dashboard.summary.totalRun} KM
                                </div>
                                <div className="text-s font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Total Distance
                                </div>
                            </div>
                            <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-center shadow">
                                <div className="text-3xl font-extrabold text-orange-700 dark:text-orange-400 mb-1">
                                    {dashboard.summary.totalTime.toFixed(2)} HR
                                </div>
                                <div className="text-s font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Total Time
                                </div>
                            </div>
                            <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-center shadow">
                                <div className="text-3xl font-extrabold text-orange-700 dark:text-orange-400 mb-1">
                                    {dashboard.summary.topSport > 0 ? "Riding" : "Running"}
                                </div>
                                <div className="text-s font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                                    Top Sport
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-700 dark:text-slate-300">
                            No summary available.
                        </div>
                    )}
                </div>

                {/* ---------- Recent Activities ---------- */}
                <div className="py-10 px-20 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold pl-5 relative text-slate-900 dark:text-slate-100 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-full before:rounded">Recent Activities</h3>
                        <a
                            href="/activities"
                            className="text-orange-400 text-xl font-semibold relative after:content-['→'] after:ml-2 after:transition after:translate-x-0 hover:after:translate-x-1 transition before:absolute before:left-0 before:bottom-0 before:w-full before:h-0.5 before:bg-orange-400 before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-300 before:rounded pb-0.5 overflow-hidden mr-5"
                            onClick={() => setActiveTab('activities')}
                        >
                            View All
                        </a>
                    </div>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 size={48} className="animate-spin text-orange-500" />
                        </div>
                    ) : dashboard?.ok && dashboard.recent ? (
                        <div className=" flex flex-col gap-4">
                            {dashboard.recent.map((a) => (
                                <div
                                    key={a.id}
                                    className="bg-[#0D1321] p-4 rounded-xl transition-all duration-300 hover:bg-[#12182d] hover:shadow-lg hover:shadow-orange-500/10 flex items-center space-x-4 justify-between"
                                    onClick={() => { window.location.href = `${a.id}/activity` }}
                                >
                                    <div className="flex items-center gap-5">
                                        <div
                                            className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl border-4 border-white dark:border-slate-900 shadow ${a.type === "run" ? "bg-blue-600" : "bg-emerald-700"
                                                }`}
                                        >
                                            {a.type === "run" ? "🏃" : "🚴"}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                                                {a.title}
                                            </h4>
                                            <div className="text-slate-500 dark:text-slate-400 text-sm italic">
                                                &quot;{a.notes}&quot;
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-slate-700 dark:text-slate-300 font-semibold">
                                        {formatActivityDate(a.created_at.toString())}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-slate-700 dark:text-slate-300">
                            No recent activities.
                        </div>
                    )}
                </div>
            </div>

            {/* --- AI Suggestion Floating Button & Modal --- */}
            <button
                ref={suggestionButtonRef}
                type="button"
                aria-label="Get AI Suggestion"
                className="fixed z-40 bottom-8 right-8 bg-orange-600 hover:bg-orange-700 text-white rounded-full shadow-lg shadow-orange-500/20 p-4 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
                onClick={() => setShowSuggestion(true)}
            >
                <span className="sr-only">Get AI Suggestion</span>
                {/* Lucide BrainCircuit icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            </button>

            {/* Modal for AI Suggestion */}
            {showSuggestion && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
                    <div className="relative w-full max-w-1/2 mx-auto mt-24 m-12 sm:rounded-xl sm:shadow-2xl sm:my-8">
                        <div className="bg-[#0D1321] p-0 sm:p-6 rounded-t-xl sm:rounded-xl border border-slate-800 shadow-lg">
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    aria-label="Close"
                                    className="text-slate-400 hover:text-orange-500 transition-colors text-2xl font-bold p-2"
                                    onClick={() => setShowSuggestion(false)}
                                >
                                    &times;
                                </button>
                            </div>
                            <AiSuggestion />
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
