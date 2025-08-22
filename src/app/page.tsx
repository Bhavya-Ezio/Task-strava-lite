"use client";

import { useActiveTab } from "@/context/activeTabContext";
import Dashboard from "@/components/Dashboard";
import Activities from "@/components/Activities";
import Report from "@/components/Report";
import ProfilePage from "@/components/Profile";

function DashboardTab() {
  return (
    <Dashboard />
  );
}

function WeeklyAnalyticsTab() {
  return (
    <Report />
  );
}

function ActivitiesTab() {
  return (
    <Activities />
  );
}

function ProfileTab() {
  return (
    <ProfilePage />
  );
}

const tabComponents: Record<string, React.ReactNode> = {
  dashboard: <DashboardTab />,
  "report": <WeeklyAnalyticsTab />,
  activities: <ActivitiesTab />,
  profile: <ProfileTab />,
};

export default function Home() {
  const { activeTab } = useActiveTab();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      {/* <Navbar /> */}
      <div className="flex flex-col items-center mt-8">
        <div className="flex space-x-4 px-5">

        </div>
        <div className="w-full">
          {tabComponents[activeTab] || <DashboardTab />}
        </div>
      </div>
    </div>
  );
}
