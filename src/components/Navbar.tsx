"use client"; // This component uses hooks, so it must be a client component

import React, { useState, useEffect } from 'react';
import { useUser } from "@/context/userContext";
import { useActiveTab } from '@/context/activeTabContext';

// --- MOCK USER DATA ---
// In a real app, you'd get this from an authentication context or API

// --- NAVIGATION LINKS ---
const navLinks = [
    { label: 'Dashboard' },
    { label: 'Activities' },
    { label: 'Report' },
];

const Navbar = () => {
    const [greeting, setGreeting] = useState('');
    const { user } = useUser();

    // Effect to set the greeting based on the time of day
    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) {
            setGreeting('Good Morning');
        } else if (hour < 18) {
            setGreeting('Good Afternoon');
        } else {
            setGreeting('Good Evening');
        }
    }, []);

    // Helper to get user initials for the avatar
    const getInitials = (name: string | null | undefined) => {
        if (name) { return name.charAt(0).toUpperCase(); }
    };
    const { activeTab, setActiveTab } = useActiveTab();

    return (
        <nav className="mt-5 mx-5 bg-[#0D1321] border-b border-slate-800 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 rounded-xl">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center h-20">

                    {/* Left Side: Navigation Links */}
                    <div className="flex items-center space-x-6">
                        {navLinks.map((link) => {
                            return (
                                <button
                                    type="button"
                                    key={link.label}
                                    onClick={() => setActiveTab(link.label.toLowerCase())}
                                    className={`relative text-lg font-medium transition-colors duration-300 px-0 bg-transparent border-none outline-none ${activeTab === link.label.toLowerCase()
                                        ? 'text-white'
                                        : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {link.label}
                                    {activeTab === link.label.toLowerCase() && (
                                        <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-orange-500 rounded-full"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Right Side: Greeting and Profile Avatar */}
                    <div className="flex items-center space-x-4 group">
                        <div className="text-right">
                        <p className="text-slate-300 text-md">{greeting},</p>
                            <p
                                className="font-bold text-white text-lg cursor-pointer transition-all duration-200 relative
                                    after:content-[''] after:block after:h-0.5 after:bg-orange-500 after:scale-x-0 after:transition-transform after:duration-200 after:origin-left
                                    hover:after:scale-x-100"
                                onClick={() => setActiveTab('profile')}
                            >
                                {user?.full_name}
                            </p>
                        </div>
                        <div
                            onClick={() => setActiveTab('profile')}
                            className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600 cursor-pointer border-2 border-transparent transition-colors duration-200 group-hover:border-white hover:border-white"
                        >
                            <span className="text-white font-bold text-xl">
                                {getInitials(user?.full_name)}
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;
