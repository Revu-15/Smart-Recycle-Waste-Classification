"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { RecentClassifications } from "@/components/dashboard/RecentClassifications";
import { WasteChart } from "@/components/dashboard/WasteChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { isAuthenticated, subscribeToAuth } from "@/lib/auth";

export default function DashboardPage() {
  const router = useRouter();
  const authenticated = useSyncExternalStore(
    subscribeToAuth,
    isAuthenticated,
    () => false
  );

  useEffect(() => {
    if (!authenticated) router.replace("/login");
  }, [authenticated, router]);

  if (!authenticated) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <Topbar />
        <div className="space-y-6 p-4 pt-16 lg:p-8 lg:pt-6">
          <StatsGrid />
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <RecentClassifications />
            <WasteChart />
          </div>
          <QuickActions />
        </div>
      </main>
    </div>
  );
}
