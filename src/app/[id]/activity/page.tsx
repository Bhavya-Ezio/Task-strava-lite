"use client";

import React, { useState, useEffect } from 'react';
// import { toast } from 'react-hot-toast';
import { Footprints, Bike, Pencil, Trash2, Clock, Ruler, Zap, ArrowLeft, Loader2, AlertTriangle, FileText } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// --- DATA TYPE ---
type Activity = {
    id: string;
    title: string | null;
    type: 'run' | 'ride';
    distance_km: number | null;
    duration_min: number | null;
    created_at: string;
    notes?: string;
};

// --- HELPER FUNCTIONS ---
const formatFullDate = (dateString: string) => new Date(dateString).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' });
const calculatePace = (distance: number, duration: number) => {
    if (distance <= 0 || duration <= 0) return 'N/A';
    const pace = duration / distance;
    const minutes = Math.floor(pace);
    const seconds = Math.round((pace - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
const calculateSpeed = (distance: number, duration: number) => {
    if (distance <= 0 || duration <= 0) return 'N/A';
    const speed = distance / (duration / 60);
    return `${speed.toFixed(1)}`;
};

// --- MAIN COMPONENT ---
const IndividualActivityPage = () => {
    const [activity, setActivity] = useState<Activity | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const params = useParams();
    const router = useRouter();
    const { id } = params;

    useEffect(() => {
        if (!id) return;

        const fetchActivity = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`/api/activity/${id}`);
                if (!response.ok) {
                    throw new Error('Activity not found.');
                }
                const data = await response.json();
                setActivity(data);
            } catch (err: any) {
                setError(err.message || 'An unknown error occurred.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchActivity();
    }, [id]);

    const handleDelete = () => {

        <div className="flex flex-col items-center gap-2">
            <p className="font-semibold">Are you sure you want to delete this activity?</p>
            <div className="flex gap-4">
                <button
                    onClick={() => {
                        // toast.dismiss(t.id);
                        // Simulate API call
                        // toast.success('Activity deleted.');
                        router.push('/activities');
                    }}
                    className="bg-red-600 text-white px-4 py-1 rounded-md hover:bg-red-700"
                >
                    Delete
                </button>
                <button
                    // onClick={() => toast.dismiss(t.id)}
                    className="bg-slate-600 text-white px-4 py-1 rounded-md hover:bg-slate-700"
                >
                    Cancel
                </button>
            </div>
        </div>

    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen bg-black"><Loader2 size={48} className="animate-spin text-orange-500" /></div>;
    }

    if (error || !activity) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-black text-red-400">
                <AlertTriangle size={48} className="mb-4" />
                <h3 className="text-2xl font-semibold">Error</h3>
                <p>{error || 'Could not load activity.'}</p>
                <Link href="/activities" className="mt-6 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                    Back to Activities
                </Link>
            </div>
        );
    }

    // --- RENDER ---
    return (
        <div className="bg-black text-white min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/activities" className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6">
                    <ArrowLeft size={18} /> Back to all activities
                </Link>

                {/* --- HEADER --- */}
                <header className="bg-gradient-to-br from-[#0D1321] to-[#0A0F24] p-8 rounded-xl mb-8 border border-slate-800">
                    <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-sm font-medium ${activity.type === 'run' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-blue-900/50 text-blue-300'
                        }`}>
                        {activity.type === 'run' ? <Footprints size={16} /> : <Bike size={16} />}
                        <span>{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">{activity.title}</h1>
                    <p className="text-slate-300 text-lg">{formatFullDate(activity.created_at)}</p>
                </header>

                {/* --- STATS GRID --- */}
                <div className="grid grid-cols-2 p-auto md:grid-cols-3 gap-4 mb-8">
                    <StatCard icon={<Ruler className="text-orange-400" />} label="Distance" value={`${activity.distance_km} km`} />
                    <StatCard icon={<Clock className="text-orange-400" />} label="Duration" value={`${activity.duration_min} min`} />
                    {activity.type === 'run' ? (
                        <StatCard icon={<Zap className="text-orange-400" />} label="Avg Pace" value={calculatePace(activity.distance_km!, activity.duration_min!)} unit="min/km" />
                    ) : (
                        <StatCard icon={<Zap className="text-orange-400" />} label="Avg Speed" value={calculateSpeed(activity.distance_km!, activity.duration_min!)} unit="km/h" />
                    )}
                </div>

                {/* --- NOTES & ACTIONS --- */}
                <div className="bg-[#0D1321] p-8 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-4">
                        <FileText className="text-orange-400" />
                        <h3 className="text-xl font-bold">Activity Notes</h3>
                    </div>
                    <p className="text-slate-300 leading-relaxed mb-6 italic">
                        {activity.notes || "No notes were added for this activity."}
                    </p>
                    <div className="flex items-center gap-4">
                        { /*onClick={() => toast('Edit not implemented.', { icon: '🚧' })}*/}
                        <button className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2">
                            <Pencil size={18} /> Edit
                        </button>
                        <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                            <Trash2 size={18} /> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- StatCard Sub-component ---
const StatCard = ({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string, unit?: string }) => (
    <div className="bg-[#0D1321] p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline gap-2 justify-center mb-2">
            <p className="text-3xl font-bold text-white">{value}</p>
            {unit && <p className="text-slate-300">{unit}</p>}
        </div>
        <div className="flex flex-row items-center gap-3">
            {icon}
            <p className="text-slate-400 text-xl font-medium">{label}</p>
        </div>
    </div>
);

export default IndividualActivityPage;
