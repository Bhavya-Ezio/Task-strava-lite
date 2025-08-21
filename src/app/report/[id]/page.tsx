// "use client";

// import React, { useState, useEffect } from 'react';
// import { useParams } from 'next/navigation';
// import Link from 'next/link';
// import {
//     ArrowLeft, Loader2, AlertTriangle, Calendar, BarChart2, Footprints, Bike,
//     TrendingUp, TrendingDown, Minus, Clock, Ruler, Zap, Trophy, Brain, List
// } from 'lucide-react';

// // --- TYPE DEFINITION (matches API response) ---
// type WeeklyReportData = {
//     reportId: string;
//     dateRange: { start: string; end: string; };
//     summaryMetrics: {
//         totalDistance: number; totalActivities: number; avgDistance: number;
//         avgSpeed: number; avgDuration: number; longestDistance: number; longestDuration: number;
//     };
//     goalProgress: { current: number; goal: number; };
//     weeklyActivities: {
//         id: string; title: string; type: 'run' | 'ride'; date: string;
//         distance: number; duration: number; speed: number;
//     }[];
//     insights: { mostActiveDay: string; fastestActivity: string; consistency: string; };
//     comparisonToLastWeek: {
//         distanceChangePercent: number; activitiesChangeCount: number;
//         avgSpeedChange: number; avgDurationChange: number;
//     };
// };

// // --- HELPER FUNCTIONS ---
// const formatDateRange = (start: string, end: string) => {
//     const startDate = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//     const endDate = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
//     return `${startDate} - ${endDate}`;
// };

// // --- MAIN COMPONENT ---
// const WeeklyReportPage = () => {
//     const [report, setReport] = useState<WeeklyReportData | null>(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const params = useParams();
//     const { id } = params;

//     useEffect(() => {
//         if (!id) return;
//         const fetchReport = async () => {
//             try {
//                 setIsLoading(true);
//                 setError(null);
//                 const response = await fetch(`/api/getReport/${id}`);
//                 if (!response.ok) throw new Error('Could not fetch weekly report.');
//                 const data = await response.json();
//                 setReport(data);
//             } catch (err: any) {
//                 setError(err.message);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchReport();
//     }, [id]);

//     if (isLoading) {
//         return <div className="flex justify-center items-center h-screen bg-black"><Loader2 size={48} className="animate-spin text-orange-500" /></div>;
//     }

//     if (error || !report) {
//         return (
//             <div className="flex flex-col justify-center items-center h-screen bg-black text-red-400">
//                 <AlertTriangle size={48} className="mb-4" />
//                 <h3 className="text-2xl font-semibold">Error Loading Report</h3>
//                 <p>{error || 'The report could not be found.'}</p>
//                 <Link href="/activities" className="mt-6 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
//                     Back to Activities
//                 </Link>
//             </div>
//         );
//     }

//     const { summaryMetrics, goalProgress, weeklyActivities, insights, comparisonToLastWeek, dateRange } = report;
//     const goalPercentage = Math.min((goalProgress.current / goalProgress.goal) * 100, 100);

//     return (
//         <div className="bg-black text-white min-h-screen p-4 sm:p-6 lg:p-8">
//             <div className="max-w-7xl mx-auto">
//                 <Link href="/activities" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6">
//                     <ArrowLeft size={18} /> Back to Activities
//                 </Link>

//                 {/* --- HEADER --- */}
//                 <header className="bg-gradient-to-br from-[#0D1321] to-[#0A0F24] p-8 rounded-xl mb-8 border border-slate-800">
//                     <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-sm font-medium bg-emerald-900/50 text-emerald-300">
//                         <Calendar size={16} />
//                         <span>{formatDateRange(dateRange.start, dateRange.end)}</span>
//                     </div>
//                     <h1 className="text-5xl font-bold text-white mb-2">Weekly Report</h1>
//                     <p className="text-slate-300 text-lg">Your fitness summary for the week.</p>
//                 </header>

//                 {/* --- SUMMARY GRID --- */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//                     <SummaryCard icon={<Ruler />} title="Total Distance" value={`${summaryMetrics.totalDistance} km`} subtitle={`${summaryMetrics.totalActivities} activities`} progress={goalPercentage} />
//                     <SummaryCard icon={<Trophy />} title="Longest Distance" value={`${summaryMetrics.longestDistance} km`} subtitle="Best this week" />
//                     <SummaryCard icon={<Clock />} title="Longest Duration" value={`${summaryMetrics.longestDuration} min`} subtitle="Single activity" />
//                     <SummaryCard icon={<Zap />} title="Avg Speed" value={`${summaryMetrics.avgSpeed} km/h`} subtitle="Across all activities" />
//                     <SummaryCard icon={<Footprints />} title="Avg Distance" value={`${summaryMetrics.avgDistance} km`} subtitle="Per activity" />
//                     <SummaryCard icon={<BarChart2 />} title="Avg Duration" value={`${summaryMetrics.avgDuration} min`} subtitle="Per activity" />
//                 </div>

//                 {/* --- DETAILED STATS --- */}
//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
//                     <div className="lg:col-span-2 bg-[#0D1321] p-6 rounded-xl border border-slate-800">
//                         <h2 className="text-2xl font-bold flex items-center gap-3 mb-4"><List /> Activity Breakdown</h2>
//                         <div className="space-y-3">
//                             {weeklyActivities.map(act => (
//                                 <div key={act.id} className="bg-[#0A0F24] p-4 rounded-lg flex items-center justify-between">
//                                     <div className="flex items-center gap-4">
//                                         {act.type === 'run' ? <Footprints className="text-emerald-400" /> : <Bike className="text-blue-400" />}
//                                         <div>
//                                             <p className="font-semibold">{act.title}</p>
//                                             <p className="text-sm text-slate-400">{new Date(act.date).toLocaleDateString('en-US', { weekday: 'long' })}</p>
//                                         </div>
//                                     </div>
//                                     <div className="text-right">
//                                         <p className="font-semibold">{act.distance} km</p>
//                                         <p className="text-sm text-slate-400">{act.duration} min</p>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                     <div className="bg-[#0D1321] p-6 rounded-xl border border-slate-800">
//                         <h2 className="text-2xl font-bold flex items-center gap-3 mb-4"><Brain /> Weekly Insights</h2>
//                         <div className="space-y-4">
//                             <Insight title="Most Active Day" value={insights.mostActiveDay} />
//                             <Insight title="Fastest Activity" value={insights.fastestActivity} />
//                             <Insight title="Consistency" value={insights.consistency} />
//                         </div>
//                     </div>
//                 </div>

//                 {/* --- COMPARISON --- */}
//                 <div className="bg-[#0D1321] p-6 rounded-xl border border-slate-800">
//                     <h2 className="text-2xl font-bold flex items-center gap-3 mb-4"><TrendingUp /> vs. Last Week</h2>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                         <Comparison value={comparisonToLastWeek.distanceChangePercent} label="Total Distance" unit="%" />
//                         <Comparison value={comparisonToLastWeek.activitiesChangeCount} label="Activities" />
//                         <Comparison value={comparisonToLastWeek.avgSpeedChange} label="Avg Speed" unit="km/h" />
//                         <Comparison value={comparisonToLastWeek.avgDurationChange} label="Avg Duration" unit="min" />
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // --- SUB-COMPONENTS ---
// const SummaryCard = ({ icon, title, value, subtitle, progress }: { icon: React.ReactNode, title: string, value: string, subtitle: string, progress?: number }) => (
//     <div className="bg-[#0D1321] p-6 rounded-xl border border-slate-800">
//         <div className="flex items-center gap-4 text-slate-400 mb-3">
//             {icon} <span className="font-semibold">{title}</span>
//         </div>
//         <p className="text-4xl font-bold text-white">{value}</p>
//         <p className="text-slate-400">{subtitle}</p>
//         {progress !== undefined && (
//             <div className="mt-4">
//                 <div className="bg-slate-700 rounded-full h-2">
//                     <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
//                 </div>
//             </div>
//         )}
//     </div>
// );

// const Insight = ({ title, value }: { title: string, value: string }) => (
//     <div className="bg-[#0A0F24] p-4 rounded-lg">
//         <p className="text-sm text-slate-400">{title}</p>
//         <p className="font-semibold text-white">{value}</p>
//     </div>
// );

// const Comparison = ({ value, label, unit }: { value: number, label: string, unit?: string }) => {
//     const isPositive = value > 0;
//     const isNegative = value < 0;
//     const color = isPositive ? 'text-emerald-400' : isNegative ? 'text-red-400' : 'text-slate-400';
//     const icon = isPositive ? <TrendingUp /> : isNegative ? <TrendingDown /> : <Minus />;

//     return (
//         <div className="bg-[#0A0F24] p-4 rounded-lg text-center">
//             <div className={`flex items-center justify-center gap-2 text-2xl font-bold ${color}`}>
//                 {icon}
//                 <span>{isPositive ? '+' : ''}{value}{unit}</span>
//             </div>
//             <p className="text-sm text-slate-400 mt-1">{label}</p>
//         </div>
//     );
// };

// export default WeeklyReportPage;

"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Loader2, AlertTriangle, Calendar, BarChart2,
    TrendingUp, TrendingDown, Minus, Clock, Ruler, Zap, Trophy, Brain
} from 'lucide-react';
// Import components from the charting library
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// --- TYPE DEFINITION (matches API response) ---
type WeeklyReportData = {
    reportId: string;
    dateRange: { start: string; end: string; };
    summaryMetrics: {
        totalDistance: number; totalActivities: number; avgDistance: number;
        avgSpeed: number; avgDuration: number; longestDistance: number; longestDuration: number;
    };
    goalProgress: { current: number; goal: number; };
    weeklyActivities: {
        id: string; title: string; type: 'run' | 'ride'; date: string;
        distance: number; duration: number; speed: number;
    }[];
    insights: { mostActiveDay: string; fastestActivity: string; consistency: string; };
    comparisonToLastWeek: {
        distanceChangePercent: number; activitiesChangeCount: number;
        avgSpeedChange: number; avgDurationChange: number;
    };
};

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
    const params = useParams();
    const { id } = params;

    useEffect(() => {
        if (!id) return;
        const fetchReport = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`/api/getReport/${id}`);
                if (!response.ok) throw new Error('Could not fetch weekly report.');
                const data = await response.json();
                setReport(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReport();
    }, [id]);

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

    // Prepare data for the chart
    const chartData = weeklyActivities.map(act => ({
        name: new Date(act.date).toLocaleDateString('en-US', { weekday: 'short' }),
        distance: act.distance,
        type: act.type,
    }));

    return (
        <div className="bg-black text-white min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/activities" className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6">
                    <ArrowLeft size={18} /> Back to Activities
                </Link>

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
                            <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}km`} />
                                <Tooltip cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} contentStyle={{ background: '#0A0F24', border: '1px solid #334155', borderRadius: '0.5rem' }} />
                                <Bar dataKey="distance" radius={[4, 4, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.type === 'run' ? '#34D399' : '#60A5FA'} />
                                    ))}
                                </Bar>
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
