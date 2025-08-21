"use client"; // This component uses hooks, so it must be a client component

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from "@/context/userContext";

// --- MOCK USER DATA ---
// In a real app, you'd get this from an authentication context or API

// --- NAVIGATION LINKS ---
const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/activities', label: 'Activities' },
    { href: '/profile', label: 'Profile' },
];

const Navbar = () => {
    const pathname = usePathname();
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

    return (
        <nav className="bg-[#0D1321] border-b border-slate-800 px-4 sm:px-6 lg:px-8 sticky top-0 z-50 rounded-xl">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center h-20">

                    {/* Left Side: Navigation Links */}
                    <div className="flex items-center space-x-6">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`relative text-lg font-medium transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {link.label}
                                    {isActive && (
                                        <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-orange-500 rounded-full"></span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Right Side: Greeting and Profile Avatar */}
                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <p className="text-slate-300 text-md">{greeting},</p>
                            <p className="font-bold text-white text-lg">{user?.data.full_name}</p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br from-orange-500 to-red-600">
                            <span className="text-white font-bold text-xl">
                                {getInitials(user?.data.full_name)}
                            </span>
                        </div>
                    </div>

                </div>
            </div>
        </nav>
    );
};

export default Navbar;
