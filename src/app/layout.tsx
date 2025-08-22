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

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user && pathname !== "/login") {
      router.replace("/login");
    }
    if (user && pathname === "/login") {
      router.replace("/");
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-900">
        <span className="text-orange-500 text-lg font-semibold animate-pulse">Loading...</span>
      </div>
    );
  }

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
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
                    {pathname === "/" && <Navbar />}
                    {children}
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
