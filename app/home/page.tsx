'use client'

import { getUserAndProfile, getDashboardData,type Profile } from '../action';
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from 'react';
import { set } from 'zod';

export default function HomePage() {

    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);

    useEffect(() => {
        async function fetchUser() {
            try {
                // const userRes = await getUserAndProfile();
                // console.log(userRes);
                const res = await fetch('http://localhost:3000/api/user', {
                    credentials: 'include',
                });
                const userRes = await res.json();
                setUser(userRes.user!);
                setProfile(userRes.profile!);
            } catch (err) {
                console.error('Error fetching /api/user:', err);
            }
        }
        fetchUser();
    }, []);


    return (
        <main className="container mx-auto py-10 px-4">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-cyan-400 to-emerald-400 mb-6">
                Strava-Lite Dashboard
            </h1>

            <div className="space-y-6">
                <div className="relative overflow-hidden p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold text-2xl flex items-center justify-center border-4 border-white shadow-lg">
                                {profile?.full_name?.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}!</h2>
                                <p className="text-slate-700 dark:text-slate-300">{user?.email}</p>
                            </div>
                        </div>
                        <form action="#" className="self-start md:self-auto">
                            <button className="inline-flex items-center px-5 py-3 rounded-full text-white font-semibold shadow-lg bg-gradient-to-br from-red-500 to-red-700 transition-transform hover:-translate-y-0.5">
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>

                {/* <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                    <h3 className="text-xl font-bold mb-4 pl-5 relative text-slate-900 dark:text-slate-100 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-full before:bg-gradient-to-r from-orange-500 to-red-500 before:rounded">This Week&apos;s Progress</h3>
                    {dashboard.ok && dashboard.summary ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-center border-2 border-transparent hover:border-orange-300 shadow transition">
                                <div className="text-3xl font-extrabold text-orange-700 dark:text-orange-400 mb-1">{dashboard.summary.totalKm}</div>
                                <div className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Total KM</div>
                            </div>
                            <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-center border-2 border-transparent hover:border-orange-300 shadow transition">
                                <div className="text-3xl font-extrabold text-orange-700 dark:text-orange-400 mb-1">{dashboard.summary.totalTimeLabel}</div>
                                <div className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Total Time</div>
                            </div>
                            <div className="p-6 rounded-xl bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-center border-2 border-transparent hover:border-orange-300 shadow transition">
                                <div className="text-3xl font-extrabold text-orange-700 dark:text-orange-400 mb-1">{dashboard.summary.topSport}</div>
                                <div className="text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">Top Sport</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-slate-700 dark:text-slate-300">No summary available.</div>
                    )}
                </div>

                <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl bg-white dark:bg-slate-900">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold pl-5 relative text-slate-900 dark:text-slate-100 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-1 before:h-full before:bg-gradient-to-r from-orange-500 to-red-500 before:rounded">Recent Activities</h3>
                        <a href="#" className="text-orange-600 dark:text-orange-400 font-semibold relative after:content-['→'] after:ml-2 hover:after:translate-x-1 transition">View All</a>
                    </div>
                    {dashboard.ok && dashboard.recent ? (
                        <div className="flex flex-col gap-4">
                            {dashboard.recent.map((a) => (
                                <div key={a.id} className="flex items-center justify-between p-5 bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-100 dark:border-slate-700 shadow relative overflow-hidden hover:shadow-lg transition">
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl border-4 border-white dark:border-slate-900 shadow ${a.type === 'run' ? 'bg-blue-600' : 'bg-emerald-700'}`}>{a.type === 'run' ? '🏃' : '🚴'}</div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{a.title}</h4>
                                            <div className="text-slate-700 dark:text-slate-300 text-sm font-medium">{a.stats}</div>
                                            <div className="text-slate-500 dark:text-slate-400 text-sm italic">{a.notes}</div>
                                        </div>
                                    </div>
                                    <div className="text-slate-700 dark:text-slate-300 font-semibold">{a.dateLabel}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-slate-700 dark:text-slate-300">No recent activities.</div>
                    )}
                </div> */}
            </div>
        </main>
    )
}
