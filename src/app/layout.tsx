"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import ToastProvider from "../toast/ToastProvider";
import { UserProvider, useUser } from "@/context/userContext";
import { ActiveTabProvider } from "@/context/activeTabContext";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { LogIn } from "lucide-react";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- NEW Unauthorized Component ---
function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center p-8 bg-[#0D1321] rounded-xl border border-slate-800">
        <LogIn size={48} className="mx-auto text-orange-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-400 mb-6">You need to be logged in to view this page.</p>
        <Link href="/login" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-6 rounded-md transition-colors">
          Go to Login
        </Link>
      </div>
    </div>
  );
}


function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  // Define public pages that don't require authentication
  const publicPages = ["/login", "/signup"];

  useEffect(() => {
    if (loading) return; // Don't do anything while loading

    const isPublicPage = publicPages.includes(pathname);

    // If user is not logged in and trying to access a private page
    if (!user && !isPublicPage) {
      // We don't need to router.replace here anymore because we will show the Unauthorized component
    }

    // If user is logged in and tries to access a public page (like login/signup)
    if (user && isPublicPage) {
      router.replace("/"); // Redirect them to the home page
    }
  }, [user, loading, pathname, router, publicPages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <span className="text-orange-500 text-lg font-semibold animate-pulse">Loading...</span>
      </div>
    );
  }

  // --- RENDER LOGIC ---
  // If user is not logged in and the page is private, show the Unauthorized component
  if (!user && !publicPages.includes(pathname)) {
    return <Unauthorized />;
  }

  // Otherwise, show the requested page
  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}
      >
        <ActiveTabProvider>
          <ToastProvider>
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <UserProvider>
                  <AuthGate>
                    {/* Conditionally render Navbar based on user auth and page */}
                    <UserProvider>
                      <AuthGate>
                        {pathname !== '/login' && pathname !== '/signup' && !pathname.includes("profile") && !pathname.includes("activity") && <Navbar />}
                        {children}
                      </AuthGate>
                    </UserProvider>
                  </AuthGate>
                </UserProvider>
              </motion.div>
            </AnimatePresence>
          </ToastProvider>
        </ActiveTabProvider>
      </body>
    </html>
  );
}
