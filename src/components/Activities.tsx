"use client";

import React from "react";
import { Footprints, Bike, Pencil, Trash2, Search, BarChart2, Loader2, AlertTriangle } from 'lucide-react';
import Pagination from '@/components/Pagination'; // Assuming Pagination component exists
import Navbar from "@/components/Navbar";

// --- DATA TYPE ---
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
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
    // --- STATE MANAGEMENT ---
    const [allActivities, setAllActivities] = React.useState<Activity[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [sportFilter, setSportFilter] = React.useState('All');
    const [searchQuery, setSearchQuery] = React.useState('');
    const [startDate, setStartDate] = React.useState('');
    const [endDate, setEndDate] = React.useState('');
    const [currentPage, setCurrentPage] = React.useState(1);

    // --- DATA FETCHING ---
    React.useEffect(() => {
        const fetchActivities = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch('/api/activities', { credentials: "include" });
                const data = await response.json();
                if (!response.ok) throw new Error('Failed to fetch activities.');
                setAllActivities(data.data);
            } catch (err: any) {
                setError(err.message || 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchActivities();
    }, []);

    // --- FILTERING & PAGINATION LOGIC ---
    const filteredActivities = React.useMemo(() => {
        if (!Array.isArray(allActivities)) return [];
        return allActivities.filter(activity => {
            const activityDate = new Date(activity.created_at);
            const sportMatch = sportFilter === 'All' || activity.type.toLowerCase() === sportFilter.toLowerCase();
            const searchMatch = !searchQuery || activity.title?.toLowerCase().includes(searchQuery.toLowerCase());
            const startMatch = !startDate || activityDate >= new Date(startDate);
            const endMatch = !endDate || activityDate <= new Date(endDate);
            return sportMatch && searchMatch && startMatch && endMatch;
        });
    }, [allActivities, sportFilter, searchQuery, startDate, endDate]);

    const paginatedActivities = React.useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredActivities.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [currentPage, filteredActivities]);

    React.useEffect(() => { setCurrentPage(1); }, [sportFilter, searchQuery, startDate, endDate]);

    // --- EVENT HANDLERS ---
    const handleDelete = (idToDelete: string) => {
        const originalActivities = [...allActivities];
        setAllActivities(current => current.filter(a => a.id !== idToDelete));
        // Simulate API call and revert on failure
        setTimeout(() => { if (Math.random() > 0.8) setAllActivities(originalActivities); }, 1500);
    };

    const handleEdit = (id: string) => alert(`Edit functionality for activity ${id}`);

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
        if (paginatedActivities.length === 0) {
            return (
                <div className="text-center py-16 bg-[#0D1321] rounded-xl">
                    <h3 className="text-2xl font-semibold text-white">No Activities Found</h3>
                    <p className="text-slate-400 mt-2">Try adjusting your search or filters.</p>
                </div>
            );
        }
        return (
            <div className="space-y-4">
                {paginatedActivities.map((activity) => (
                    <div
                        key={activity.id}
                        className="bg-[#0D1321] p-4 rounded-xl transition-all duration-300 hover:bg-[#12182d] hover:shadow-lg hover:shadow-orange-500/10 flex items-center space-x-4"
                        onClick={() => { window.location.href = `${activity.id}/activity` }}
                    >
                        <div className={`p-3 rounded-lg ${activity.type === 'run' ? 'bg-emerald-900/50' : 'bg-blue-900/50'}`}>
                            {activity.type === 'run' ? <Footprints size={24} className="text-emerald-400" /> : <Bike size={24} className="text-blue-400" />}
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
                                        {activity.type === 'run' ? calculatePace(activity.distance_km!, activity.duration_min!) : calculateSpeed(activity.distance_km!, activity.duration_min!)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-end space-x-2">
                                <button onClick={() => handleEdit(activity.id)} className="p-2 rounded-md hover:bg-slate-700 transition-colors"><Pencil size={18} className="text-slate-400" /></button>
                                <button onClick={() => handleDelete(activity.id)} className="p-2 rounded-md hover:bg-red-900/50 transition-colors"><Trash2 size={18} className="text-red-500" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-black text-white min-h-screen px-2 sm:px-4 lg:px-6">
            <div className="max-w-8xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* --- LEFT COLUMN: STATS & FILTERS --- */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-[#0D1321] p-5 rounded-xl">
                        <div className="flex items-center space-x-3 mb-3">
                            <BarChart2 className="text-orange-500" />
                            <h2 className="text-xl font-bold">Stats</h2>
                        </div>
                        <div className="text-4xl font-bold text-white">{filteredActivities.length}</div>
                        <p className="text-slate-400">Matching Activities</p>
                    </div>
                    <div className="bg-[#0D1321] p-5 rounded-xl">
                        <div className="flex items-center space-x-3 mb-4">
                            <Search className="text-orange-500" />
                            <h2 className="text-xl font-bold">Filters</h2>
                        </div>
                        <div className="space-y-4">
                            <input type="text" placeholder="Search by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#0A0F24] text-slate-300 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            <select value={sportFilter} onChange={(e) => setSportFilter(e.target.value)} className="w-full bg-[#0A0F24] text-slate-300 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500">
                                <option>All</option><option>Run</option><option>Ride</option>
                            </select>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-[#0A0F24] text-slate-400 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-[#0A0F24] text-slate-400 border border-slate-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- RIGHT COLUMN: ACTIVITIES LIST --- */}
                <div className="lg:col-span-9">
                    {/* <h1 className="text-4xl font-bold mb-6">Activity History</h1> */}
                    {renderContent()}
                    <Pagination totalItems={filteredActivities.length} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={setCurrentPage} />
                </div>
            </div>
        </div>
    );
};

export default ActivitiesPage;
