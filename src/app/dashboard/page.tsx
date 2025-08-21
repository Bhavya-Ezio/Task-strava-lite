"use client";

import { Dashboard, type Profile } from "../action";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { formatDistanceToNow, isToday, isYesterday } from "date-fns";
import Navbar from "@/components/Navbar";

export default function HomePage() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [dashboard, setDashboard] = useState<Dashboard | null>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        async function fetchUser() {
            try {
                const res = await fetch("/api/user", { credentials: "include" });
                const userRes = await res.json();
                setUser(userRes.user!);
                setProfile(userRes.profile!);

                const dashRes = await fetch("/api/dashboard", {
                    credentials: "include",
                });
                const dashboardRes = await dashRes.json();
                setDashboard(dashboardRes);
            } catch (err) {
                console.error("Error fetching /api/user:", err);
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
        <main className="container mx-auto px-4 sm:p-6 lg:p-8 ">
            {/* <h1 className="text-6xl text-center font-extrabold bg-clip-text text-white mb-12">
                Dashboard
            </h1> */}
            <Navbar />

            <div className="space-y-6 mt-5">
                {/* ---------- Profile Card ---------- */}
                {/* <div className="relative overflow-hidden p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900 flex justify-center">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-6">
                        <div className="flex items-center gap-6">
                            {loading ? (
                                <div className="w-30 h-30 rounded-full bg-slate-200 animate-pulse"></div>
                            ) : (
                                <div className="w-30 h-30 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-4xl flex items-center justify-center border-4 border-white shadow-lg">
                                    {profile?.full_name?.slice(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div>
                                {loading ? (
                                    <>
                                        <div className="h-6 bg-slate-200 rounded w-48 animate-pulse mb-2"></div>
                                        <div className="h-4 bg-slate-200 rounded w-32 animate-pulse"></div>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100">
                                            Welcome back
                                            {profile?.full_name ? `, ${profile.full_name}` : ""}!
                                        </h2>
                                        <p className="text-slate-700 dark:text-slate-300">
                                            {user?.email}
                                        </p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* ---------- Dashboard Summary ---------- */}
                <div className="py-10 px-20 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-2xl font-bold pl-5 relative text-slate-900 dark:text-slate-100 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-full before:rounded">
                            This Week&apos;s Progress
                        </h3>
                        <a href="/activities" className="text-orange-400 text-xl font-semibold relative after:content-['→'] after:ml-2 after:transition after:translate-x-0 hover:after:translate-x-1 transition before:absolute before:left-0 before:bottom-0 before:w-full before:h-0.5 before:bg-orange-400 before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-300 before:rounded pb-0.5 overflow-hidden mr-5">
                            View All
                        </a>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-24 bg-slate-200 rounded-xl animate-pulse"
                                ></div>
                            ))}
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
                <div className="py-10 px-16 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-4"> <h3 className="text-2xl font-bold pl-5 relative text-slate-900 dark:text-slate-100 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-full before:rounded">Recent Activities</h3> <a href="/activities" className="text-orange-400 text-xl font-semibold relative after:content-['→'] after:ml-2 after:transition after:translate-x-0 hover:after:translate-x-1 transition before:absolute before:left-0 before:bottom-0 before:w-full before:h-0.5 before:bg-orange-400 before:scale-x-0 hover:before:scale-x-100 before:origin-left before:transition-transform before:duration-300 before:rounded pb-0.5 overflow-hidden mr-5"> View All </a> </div>
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-20 bg-slate-200 rounded-xl animate-pulse"
                                ></div>
                            ))}
                        </div>
                    ) : dashboard?.ok && dashboard.recent ? (
                        <div className="px-5 flex flex-col gap-4">
                            {dashboard.recent.map((a) => (
                                <div
                                    key={a.id}
                                    className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 shadow hover:shadow-lg transition"
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
        </main>
    );
}
