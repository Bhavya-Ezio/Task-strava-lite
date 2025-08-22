"use client";

import React, { useState, useEffect } from 'react';
import {
    Loader2, AlertTriangle, Mail, Calendar, BarChart2, Ruler, Clock, Zap, Edit, LogOut
} from 'lucide-react';
import Link from 'next/link';
import { logout } from '@/app/action';
import { useRouter } from 'next/navigation'; // <-- Use next/navigation for app router
import { useToast } from "@/toast/ToastProvider";
import { useUser } from '@/context/userContext';
// --- TYPE DEFINITION (matches API response) ---
type UserProfileData = {
    id: string;
    name: string;
    email: string;
    memberSince: string;
    allTimeStats: {
        totalActivities: number;
        totalDistance: number;
        totalDuration: number;
        avgSpeed: number;
    };
};

// --- HELPER FUNCTIONS ---
const formatMemberSince = (dateString: string) =>
    `Member since ${new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
const formatTotalTime = (totalMinutes: number) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
};
const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

// --- MAIN COMPONENT ---
const ProfilePage = () => {
    const [profile, setProfile] = useState<UserProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [logoutPending, setLogoutPending] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();
    const { setUser } = useUser();

    const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setLogoutPending(true);
        try {
            const result = await logout();
            if (result.ok) {
                // Use router.push from next/navigation (app router)
                setUser(null)
                router.push('/login')
            } else {
                showToast({
                    variant: 'error',
                    title: 'Logout Failed',
                    message: result.message ?? 'Unable to log out. Please try again.',
                });
            }
        } catch (err) {
            showToast({
                variant: 'error',
                title: 'Logout Failed',
                message: 'Unable to log out. Please try again.',
            });
        } finally {
            setLogoutPending(false);
        }
    };

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`/api/profile`);
                if (!response.ok) throw new Error('Could not fetch profile data.');
                const data = await response.json();
                setProfile(data.profile);
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
        fetchProfile();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-black">
                <Loader2 size={48} className="animate-spin text-orange-500" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-black text-red-400">
                <AlertTriangle size={48} className="mb-4" />
                <h3 className="text-2xl font-semibold">Error Loading Profile</h3>
                <p>{error || 'The profile could not be found.'}</p>
                <Link href="/" className="mt-6 bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600">
                    Back to Home
                </Link>
            </div>
        );
    }

    const { name, email, memberSince, allTimeStats } = profile;

    return (
        <div className="bg-black text-white min-h-auto p-2 sm:p-4 lg:p-6">
            <div className="max-w-8xl mx-auto">
                {/* --- HEADER --- */}
                <header className="bg-gradient-to-br from-[#0D1321] to-[#0A0F24] p-8 rounded-xl mb-8 border border-slate-800 flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative flex flex-col items-center">
                        <div className="w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 text-4xl font-bold text-white">
                            {getInitials(name)}
                        </div>
                        <button className="absolute bottom-0 right-0 w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-600 transition-colors border-2 border-black">
                            <Edit size={16} />
                        </button>
                    </div>
                    <div className="sm:ml-auto sm:order-2 w-1/10">
                        <button
                            onClick={handleLogout}
                            disabled={logoutPending}
                            className="bg-slate-700 text-white text-l p-6 rounded-lg font-semibold hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <LogOut size={18} /> {logoutPending ? 'Logging out...' : 'Log Out'}
                        </button>
                    </div>

                    <div>
                        <h1 className="text-4xl font-bold text-white">{name}</h1>
                        <p className="text-slate-300 text-lg flex items-center gap-2 mt-1"><Mail size={16} /> {email}</p>
                        <p className="text-slate-400 text-sm flex items-center gap-2 mt-2 bg-slate-800/50 px-3 py-1 rounded-full w-fit">
                            <Calendar size={14} /> {formatMemberSince(memberSince)}
                        </p>
                    </div>
                </header>

                {/* --- STATS OVERVIEW --- */}
                <div className="bg-[#0D1321] p-8 rounded-xl border border-slate-800 mb-8">
                    <h2 className="text-2xl font-bold flex items-center gap-3 mb-6"><BarChart2 /> All-Time Stats</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <StatCard icon={<BarChart2 />} value={allTimeStats.totalActivities.toString()} label="Activities" />
                        <StatCard icon={<Ruler />} value={`${allTimeStats.totalDistance.toFixed(1)} km`} label="Total Distance" />
                        <StatCard icon={<Clock />} value={formatTotalTime(allTimeStats.totalDuration)} label="Total Time" />
                        <StatCard icon={<Zap />} value={`${allTimeStats.avgSpeed.toFixed(1)} km/h`} label="Avg Speed" />
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- StatCard Sub-component ---
type StatCardProps = {
    icon: React.ReactElement<{ size?: number }>,
    value: string,
    label: string
};

const StatCard = ({ icon, value, label }: StatCardProps) => (
    <div className="bg-gradient-to-br from-slate-50 to-slate-200 dark:from-slate-800 dark:to-slate-700 p-5 rounded-lg text-center">
        <div className="text-orange-400 w-fit mx-auto mb-2">
            {React.cloneElement(icon, { size: 24 })}
        </div>
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-slate-400 text-sm">{label}</p>
    </div>
);

export default ProfilePage;
