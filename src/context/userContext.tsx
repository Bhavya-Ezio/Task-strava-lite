"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Profile } from "../app/action";

// Define shape of our context
type UserContextType = {
    user: Profile | null;
    loading: boolean;
    setUser: (user: Profile | null) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;

        const fetchUserSession = async () => {
            try {
                const res = await fetch("/api/user", { credentials: "include" });

                // If the response is not OK (e.g., 401 Unauthorized), there's no user.
                if (!res.ok) {
                    if (active) setUser(null);
                    return;
                }

                const data = await res.json();

                // If the response is OK but there's no profile, there's no user.
                if (!data.profile) {
                    if (active) setUser(null);
                    return;
                }

                // If we have a profile, set the user.
                if (active) {
                    setUser(data.profile);
                }

            } catch (err) {
                console.error("Error fetching user session:", err);
                if (active) setUser(null); // Assume no user on error
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchUserSession();

        return () => {
            active = false;
        };
    }, []); // Removed router dependency

    return (
        <UserContext.Provider value={{ user, loading, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

// Hook for components to use
export function useUser() {
    const ctx = useContext(UserContext);
    if (ctx === undefined) {
        throw new Error("useUser must be used inside a UserProvider");
    }
    return ctx;
}
