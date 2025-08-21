"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/app/action";
// import type { User } from "@supabase/supabase-js";

// Define shape of our context
type UserContextType = {
    user: User | null;
    loading: boolean;
};

type User = {
    data: Profile;
    id: string;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let active = true;

        (async () => {
            try {
                const res = await fetch("/api/user", { credentials: "include" });
                const data = await res.json();

                if (!data.ok || !data.profile) {
                    router.replace("/login"); // redirect if no user
                    return;
                }

                if (active) {
                    setUser(data.profile);
                }
            } catch (err) {
                console.error("Error fetching user:", err);
                router.replace("/login");
            } finally {
                if (active) setLoading(false);
            }
        })();

        return () => {
            active = false;
        };
    }, [router]);

    return (
        <UserContext.Provider value={{ user, loading }}>
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
