"use client";

import React, { useState, useEffect } from 'react';
import {
    Footprints, Bike, Pencil, Trash2, Clock, Ruler, Zap,
    ArrowLeft, Loader2, AlertTriangle, FileText, Check, X
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useActiveTab } from "@/context/activeTabContext";
import { useToast } from '@/toast/ToastProvider';

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
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<Partial<Activity>>({});

    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { setActiveTab } = useActiveTab();
    const { showToast } = useToast();

    useEffect(() => {
        if (!id) return;
        const fetchActivity = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/activity/${id}`, { credentials: "include" });
                if (!response.ok) throw new Error('Activity not found.');
                const data = await response.json();
                setActivity(data);
                setEditData(data); // Initialize form data
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('An unknown error occurred.');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchActivity();
    }, [id]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditData(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirm = async () => {
        const updatePromise = fetch(`/api/activity/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...editData,
                distance_km: Number(editData.distance_km),
                duration_min: Number(editData.duration_min),
            }),
            credentials: "include"
        }).then(res => {
            if (!res.ok) throw new Error('Failed to update activity.');
            return res.json();
        });

        showToast({ message: 'Updating activity...', variant: 'info' });
        try {
            const updatedActivity = await updatePromise;
            setActivity(updatedActivity.activity);
            setIsEditing(false);
            showToast({ message: 'Activity updated successfully!', variant: 'success' });
        } catch (err) {
            if (err instanceof Error) {
                showToast({ message: err.message || 'Failed to update activity.', variant: 'error' });
            } else {
                showToast({ message: 'Failed to update activity.', variant: 'error' });
            }
        }
    };

    const handleDelete = () => {
        const deletePromise = fetch(`/api/activity/${id}`, { method: 'DELETE', credentials: "include" })
            .then(res => {
                if (!res.ok) throw new Error('Failed to delete activity.');
            });

        showToast({ message: 'Deleting activity...', variant: 'info' });
        deletePromise
            .then(() => {
                setActiveTab('activities');
                router.push('/');
                showToast({ message: 'Activity deleted successfully!', variant: 'success' });
            })
            .catch((err) => {
                if (err instanceof Error) {
                    showToast({ message: err.message || 'Failed to delete activity.', variant: 'error' });
                } else {
                    showToast({ message: 'Failed to delete activity.', variant: 'error' });
                }
            });
    };

    const handleCancel = () => {
        setEditData(activity || {});
        setIsEditing(false);
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen bg-black"><Loader2 size={48} className="animate-spin text-orange-500" /></div>;
    if (error || !activity) return <div className="flex flex-col justify-center items-center h-screen bg-black text-red-400"><AlertTriangle size={48} className="mb-4" /><h3 className="text-2xl font-semibold">Error</h3><p>{error || 'Could not load activity.'}</p><Link href="/" onClick={() => setActiveTab("activities")} className="mt-6 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">Back to Activities</Link></div>;

    const currentStats = isEditing ? editData : activity;
    const distance = Number(currentStats.distance_km) || 0;
    const duration = Number(currentStats.duration_min) || 0;

    return (
        <div className="bg-black text-white min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <Link href="/" onClick={() => setActiveTab("activities")} className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-6">
                    <ArrowLeft size={18} /> Back to all activities
                </Link>

                <header className="bg-gradient-to-br from-[#0D1321] to-[#0A0F24] p-8 rounded-xl mb-8 border border-slate-800">
                    <div className={`inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full text-sm font-medium ${activity.type === 'run' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-blue-900/50 text-blue-300'}`}>
                        {activity.type === 'run' ? <Footprints size={16} /> : <Bike size={16} />}
                        <span>{activity.type?.charAt(0).toUpperCase() + activity.type?.slice(1)}</span>
                    </div>
                    {isEditing ? (
                        <input type="text" name="title" value={editData.title || ''} onChange={handleInputChange} className="w-full bg-transparent text-4xl font-bold text-white mb-2 border-b-2 border-slate-600 focus:border-orange-500 outline-none transition-colors" />
                    ) : (
                        <h1 className="text-4xl font-bold text-white mb-2">{activity.title}</h1>
                    )}
                    <p className="text-slate-300 text-lg">{formatFullDate(activity.created_at)}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard icon={<Ruler className="text-orange-400" />} label="Distance" value={distance} unit="km" isEditing={isEditing} name="distance_km" onChange={handleInputChange} />
                    <StatCard icon={<Clock className="text-orange-400" />} label="Duration" value={duration} unit="min" isEditing={isEditing} name="duration_min" onChange={handleInputChange} />
                    {activity.type === 'run' ? (
                        <StatCard icon={<Zap className="text-orange-400" />} label="Avg Pace" value={calculatePace(distance, duration)} unit="min/km" isEditing={false} />
                    ) : (
                        <StatCard icon={<Zap className="text-orange-400" />} label="Avg Speed" value={calculateSpeed(distance, duration)} unit="km/h" isEditing={false} />
                    )}
                </div>

                <div className="bg-[#0D1321] p-8 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-4"><FileText className="text-orange-400" /><h3 className="text-xl font-bold">Activity Notes</h3></div>
                    {isEditing ? (
                        <textarea name="notes" value={editData.notes || ''} onChange={handleInputChange} rows={4} className="w-full bg-[#0A0F24] text-slate-300 border border-slate-700 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
                    ) : (
                        <p className="text-slate-300 leading-relaxed mb-6 italic">{activity.notes || "No notes were added for this activity."}</p>
                    )}
                    <div className="flex items-center gap-4 mt-6">
                        {isEditing ? (
                            <>
                                <button onClick={handleConfirm} className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"><Check size={18} /> Confirm</button>
                                <button onClick={handleCancel} className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"><X size={18} /> Cancel</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setIsEditing(true)} className="flex-1 bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"><Pencil size={18} /> Edit</button>
                                <button onClick={handleDelete} className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"><Trash2 size={18} /> Delete</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- StatCard Sub-component ---
const StatCard = ({ icon, label, value, unit, isEditing, name, onChange }: { icon: React.ReactNode, label: string, value: string | number, unit: string, isEditing: boolean, name?: string, onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="bg-[#0D1321] p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-center">
        <div className="flex items-baseline gap-2 justify-center mb-2">
            {isEditing && name ? (
                <input type="number" name={name} value={value} onChange={onChange} className="w-24 bg-transparent text-3xl font-bold text-white text-center border-b-2 border-slate-600 focus:border-orange-500 outline-none" />
            ) : (
                <p className="text-3xl font-bold text-white">{value}</p>
            )}
            <p className="text-slate-300">{unit}</p>
        </div>
        <div className="flex flex-row items-center gap-3">
            {icon}
            <p className="text-slate-400 text-lg font-medium">{label}</p>
        </div>
    </div>
);

export default IndividualActivityPage;
