"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Loader2, AlertTriangle, Calendar, BarChart2,
    TrendingUp, TrendingDown, Minus, Clock, Ruler, Trophy, Brain
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '@/context/userContext';
import { WeeklyReportData } from '@/types/types';

// --- HELPER FUNCTIONS ---
const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${startDate} - ${endDate}`;
};

// --- MAIN COMPONENT ---
const WeeklyReportPage = () => {
    const [report, setReport] = useState<WeeklyReportData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useUser();

    useEffect(() => {
        if (!user?.id) return;
        const fetchReport = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`/api/getReport/${user?.id}`);
                if (!response.ok) throw new Error('Could not fetch weekly report.');
                const data = await response.json();
                setReport(data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [user]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen bg-black"><Loader2 size={48} className="animate-spin text-orange-500" /></div>;
    }

    if (error || !report) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-black text-red-400">
                <AlertTriangle size={48} className="mb-4" />
                <h3 className="text-2xl font-semibold">Error Loading Report</h3>
                <p>{error || 'The report could not be found.'}</p>
                <Link href="/activities" className="mt-6 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                    Back to Activities
                </Link>
            </div>
        );
    }

    const { summaryMetrics, goalProgress, weeklyActivities, insights, comparisonToLastWeek, dateRange } = report;
    const goalPercentage = Math.min((goalProgress.current / goalProgress.goal) * 100, 100);

    // --- Prepare data for the chart: ensure all days of week are present, sum distances, and show zero if no activity ---
    // Get the start date of the week (assume dateRange.start is the first day of the week)
    const weekStart = new Date(dateRange.start);
    // Build an array of all 7 days in the week
    const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return d;
    });

    // Aggregate activities by day
    type DayAgg = {
        name: string; // e.g. 'Mon'
        distance: number;
        type: 'run' | 'ride' | null; // null if no activity, or 'run'/'ride' if only one type, or 'mixed' if both
        runDistance: number;
        rideDistance: number;
    };

    // For each day, sum distances for run and ride
    const dayAggs: DayAgg[] = daysOfWeek.map((date) => {
        const dayShort = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dayISO = date.toISOString().slice(0, 10); // 'YYYY-MM-DD'
        // Find all activities for this day
        const acts = weeklyActivities.filter(act => {
            // Compare only date part
            return act.date.slice(0, 10) === dayISO;
        });
        const runDistance = acts.filter(a => a.type === 'run').reduce((sum, a) => sum + a.distance, 0);
        const rideDistance = acts.filter(a => a.type === 'ride').reduce((sum, a) => sum + a.distance, 0);
        let type: 'run' | 'ride' | null = null;
        if (runDistance > 0 && rideDistance === 0) type = 'run';
        else if (rideDistance > 0 && runDistance === 0) type = 'ride';
        else if (runDistance > 0 && rideDistance > 0) type = null; // mixed
        return {
            name: dayShort,
            distance: runDistance + rideDistance,
            type,
            runDistance,
            rideDistance,
        };
    });

    // For chart, show stacked bars for run and ride, or single bar if only one type
    // We'll use two bars: runDistance and rideDistance, with different colors

    return (
        <div className="bg-black text-white min-h-screen px-2 sm:px-4 lg:px-6">
            <div className="max-w-9xl mx-auto">
                <header className="bg-gradient-to-br from-[#0D1321] to-[#0A0F24] p-8 rounded-xl mb-8 border border-slate-800">
                    <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-sm font-medium bg-emerald-900/50 text-emerald-300">
                        <Calendar size={16} />
                        <span>{formatDateRange(dateRange.start, dateRange.end)}</span>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-2">Weekly Report</h1>
                    <p className="text-slate-300 text-lg">Your fitness summary for the week.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <SummaryCard icon={<Ruler />} title="Total Distance" value={`${summaryMetrics.totalDistance} km`} subtitle={`${summaryMetrics.totalActivities} activities`} progress={goalPercentage} />
                    <SummaryCard icon={<Trophy />} title="Longest Distance" value={`${summaryMetrics.longestDistance} km`} subtitle="Best this week" />
                    <SummaryCard icon={<Clock />} title="Longest Duration" value={`${summaryMetrics.longestDuration} min`} subtitle="Single activity" />
                </div>

                {/* --- ACTIVITY BREAKDOWN CHART --- */}
                <div className="bg-[#0D1321] p-6 rounded-xl border border-slate-800 mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-4"><BarChart2 /> Activity Breakdown</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <BarChart data={dayAggs} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#ffffff" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}km`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
                                    contentStyle={{
                                        background: '#1e293b',
                                        border: '1px solid #fbbf24',
                                        borderRadius: '0.5rem',
                                        color: '#fff',
                                        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.15)',
                                    }}
                                    itemStyle={{
                                        color: '#fff',
                                        fontWeight: 500,
                                        fontSize: 16,
                                    }}
                                    labelStyle={{
                                        color: '#fbbf24',
                                        fontWeight: 700,
                                        fontSize: 18,
                                    }}
                                    formatter={(value: number, name: string) => {
                                        // Fix: Use correct label for each bar
                                        let label = '';
                                        if (name === 'runDistance') label = 'Run';
                                        else if (name === 'rideDistance') label = 'Ride';
                                        else label = name;
                                        return [`${value} km`, label];
                                    }}
                                />
                                <Bar dataKey="runDistance" stackId="a" radius={[4, 4, 0, 0]} fill="#34D399" name="Run" />
                                <Bar dataKey="rideDistance" stackId="a" radius={[4, 4, 0, 0]} fill="#60A5FA" name="Ride" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* --- INSIGHTS --- */}
                    <div className="bg-[#111827] p-6 rounded-xl border border-slate-700">
                        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 mb-6"><Brain /> Weekly Insights</h2>
                        <div className="space-y-4">
                            <Insight title="Most Active Day" value={insights.mostActiveDay} />
                            <Insight title="Fastest Activity" value={insights.fastestActivity} />
                            <Insight title="Consistency" value={insights.consistency} />
                        </div>
                    </div>

                    {/* --- COMPARISON --- */}
                    <div className="bg-[#111827] p-6 rounded-xl border border-slate-700">
                        <h2 className="text-2xl font-bold flex items-center justify-center gap-3 mb-6"><TrendingUp /> vs. Last Week</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <Comparison value={comparisonToLastWeek.distanceChangePercent} label="Total Distance" unit="%" />
                            <Comparison value={comparisonToLastWeek.activitiesChangeCount} label="Activities" />
                            <Comparison value={comparisonToLastWeek.avgSpeedChange} label="Avg Speed" unit="km/h" />
                            <Comparison value={comparisonToLastWeek.avgDurationChange} label="Avg Duration" unit="min" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SUB-COMPONENTS ---
const SummaryCard = ({ icon, title, value, subtitle, progress }: { icon: React.ReactNode, title: string, value: string, subtitle: string, progress?: number }) => (
    <div className="bg-[#0D1321] p-6 rounded-xl border border-slate-800">
        <div className="flex items-center gap-4 text-slate-400 mb-3">
            {icon} <span className="font-semibold">{title}</span>
        </div>
        <p className="text-4xl font-bold text-white">{value}</p>
        <p className="text-slate-400">{subtitle}</p>
        {progress !== undefined && (
            <div className="mt-4">
                <div className="bg-slate-700 rounded-full h-2"><div className="bg-orange-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div></div>
            </div>
        )}
    </div>
);

const Insight = ({ title, value }: { title: string, value: string }) => (
    <div className="bg-[#0D1321] p-4 rounded-lg text-center">
        <p className="text-sm text-slate-400">{title}</p>
        <p className="font-semibold text-white text-lg">{value}</p>
    </div>
);

const Comparison = ({ value, label, unit }: { value: number, label: string, unit?: string }) => {
    const isPositive = value > 0;
    const isNegative = value < 0;
    const color = isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-400';
    const icon = isPositive ? <TrendingUp /> : isNegative ? <TrendingDown /> : <Minus />;

    return (
        <div className="bg-[#0D1321] p-4 rounded-lg text-center">
            <div className={`flex items-center justify-center gap-2 text-3xl font-bold ${color}`}>
                {icon}
                <span>{isPositive ? '+' : ''}{value}{unit}</span>
            </div>
            <p className="text-sm text-slate-400 mt-1">{label}</p>
        </div>
    );
};

export default WeeklyReportPage;
