"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Footprints, Bike, Pencil, Search, BarChart2, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import Pagination from '@/components/Pagination';
import { useToast } from '@/toast/ToastProvider';

// --- TYPE DEFINITIONS ---
type Activity = {
    id: string;
    title: string | null;
    type: 'run' | 'ride';
    distance_km: number | null;
    duration_min: number | null;
    created_at: string;
};

const ITEMS_PER_PAGE = 10;

// --- HELPER FUNCTIONS ---
const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const calculatePace = (distance: number, duration: number) => {
    if (distance <= 0 || duration <= 0) return 'N/A';
    const pace = duration / distance;
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')} /km`;
};

const calculateSpeed = (distance: number, duration: number) => {
    if (distance <= 0 || duration <= 0) return 'N/A';
    const speed = distance / (duration / 60);
    return `${speed.toFixed(1)} km/h`;
};

// --- MAIN COMPONENT ---
const ActivitiesPage = () => {
    const router = useRouter();
    const { showToast } = useToast();

    // --- STATE MANAGEMENT ---
    const [activities, setActivities] = useState<Activity[]>([]);
    const [totalActivities, setTotalActivities] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for filter controls
    const [sportFilter, setSportFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // --- DATA FETCHING ---
    const fetchActivities = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({
                page: String(currentPage),
                pageSize: String(ITEMS_PER_PAGE),
            });
            if (searchQuery) params.set('search', searchQuery);
            if (sportFilter !== 'all') params.set('sport', sportFilter);
            if (startDate) params.set('from', startDate);
            if (endDate) params.set('to', endDate);

            const response = await fetch(`/api/activities?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch activities.');

            const data = await response.json();
            setActivities(data.items);
            setTotalActivities(data.total);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || 'An unknown error occurred.');
                setActivities([]);
                setTotalActivities(0);
            }
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, searchQuery, sportFilter, startDate, endDate]);

    useEffect(() => {
        fetchActivities();
    }, [fetchActivities]);

    // --- RENDER LOGIC ---
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex justify-center items-center h-96 bg-[#0D1321] rounded-xl">
                    <Loader2 size={48} className="animate-spin text-orange-500" />
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex flex-col justify-center items-center h-96 bg-red-900/20 text-red-400 border border-red-700 rounded-xl">
                    <AlertTriangle size={48} className="mb-4" />
                    <h3 className="text-2xl font-semibold">Error Loading Activities</h3>
                    <p>{error}</p>
                </div>
            );
        }
        if (activities.length === 0) {
            return (
                <div className="text-center py-16 bg-[#0D1321] rounded-xl">
                    <h3 className="text-2xl font-semibold text-white">No Activities Found</h3>
                    <p className="text-slate-400 mt-2">Try adjusting your search or filters.</p>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div
                        key={activity.id}
                        className="bg-[#0D1321] p-4 rounded-xl transition-all duration-300 hover:bg-[#12182d] hover:shadow-lg hover:shadow-orange-500/10 flex items-center space-x-4 cursor-pointer"
                        onClick={() => router.push(`/${activity.id}/activity`)}
                    >
                        <div className={`p-3 rounded-lg ${activity.type === 'run' ? 'bg-emerald-900/50' : 'bg-blue-900/50'}`}>
                            {activity.type === 'run' ? (
                                <Footprints size={24} className="text-emerald-400" />
                            ) : (
                                <Bike size={24} className="text-blue-400" />
                            )}
                        </div>
                        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div>
                                <h3 className="font-bold text-lg text-white">{activity.title}</h3>
                                <p className="text-slate-400 text-sm">{formatDate(activity.created_at)}</p>
                            </div>
                            <div className="flex space-x-6 text-sm">
                                <div>
                                    <p className="text-slate-400">Distance</p>
                                    <p className="font-semibold text-white">{activity.distance_km} km</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">Time</p>
                                    <p className="font-semibold text-white">{activity.duration_min} min</p>
                                </div>
                                <div>
                                    <p className="text-slate-400">{activity.type === 'run' ? 'Pace' : 'Speed'}</p>
                                    <p className="font-semibold text-white">
                                        {activity.type === 'run'
                                            ? calculatePace(activity.distance_km!, activity.duration_min!)
                                            : calculateSpeed(activity.distance_km!, activity.duration_min!)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        showToast({
                                            message: 'Edit not implemented.',
                                            variant: 'info',
                                        });
                                    }}
                                    className="p-2 rounded-md hover:bg-slate-700 transition-colors"
                                >
                                    <Pencil size={18} className="text-slate-400" />
                                </button>
                                <button
                                    className="p-2 rounded-md hover:bg-orange-900/50 transition-colors"
                                    aria-label="Go to activity"
                                >
                                    <ArrowRight size={18} className="text-orange-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="relative bg-black text-white min-h-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-[#0D1321] p-5 rounded-xl">
                        <div className="flex items-center space-x-3 mb-3">
                            <BarChart2 className="text-orange-500" />
                            <h2 className="text-xl font-bold">Stats</h2>
                        </div>
                        <div className="text-4xl font-bold text-white">{totalActivities}</div>
                        <p className="text-slate-400">Total Activities Found</p>
                    </div>
                    <div className="bg-[#0D1321] p-5 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                            <Search className="text-orange-500" />
                            <h2 className="text-xl font-bold">Filters</h2>
                        </div>
                        <div className="space-y-4">
                            <input
                                type="text"
                                placeholder="Search by title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#0A0F24] text-slate-300 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                            <select
                                value={sportFilter}
                                onChange={(e) => setSportFilter(e.target.value)}
                                className="w-full bg-[#0A0F24] text-slate-300 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                                <option value="all">All</option>
                                <option value="run">Run</option>
                                <option value="ride">Ride</option>
                            </select>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="bg-[#0A0F24] text-slate-400 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="bg-[#0A0F24] text-slate-400 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-9">
                    <h1 className="text-4xl font-bold mb-6">Activity History</h1>
                    {renderContent()}
                    <Pagination
                        totalItems={totalActivities}
                        itemsPerPage={ITEMS_PER_PAGE}
                        currentPage={currentPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>
            {/* Add Activity Button - bottom right */}
            <button
                onClick={() => {
                    // You can replace this with navigation or modal open logic
                    if (typeof window !== "undefined") {
                        window.location.href = "/addActivity";
                    }
                }}
                className="fixed z-50 bottom-8 right-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg p-4 flex items-center gap-2 transition-colors"
                aria-label="Add Activity"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline font-semibold">Add Activity</span>
            </button>
        </div>
    );
};

export default ActivitiesPage;
