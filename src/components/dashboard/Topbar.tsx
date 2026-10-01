"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, Search, ChevronDown, UserCircle2, Settings, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { logout, getCurrentUser, subscribeToAuth, type UserSession } from "@/lib/auth";

const pageTitles: Record<string, { label: string; title: string }> = {
  "/dashboard": { label: "Overview", title: "Dashboard" },
  "/waste-analyzer": { label: "AI Classification", title: "Image Analyzer" },
  "/history": { label: "Predictions", title: "Classification History" },
  "/analytics": { label: "Insights", title: "Waste Analytics" },
  "/admin": { label: "Admin", title: "Admin Review" },
  "/settings": { label: "Account", title: "Settings" },
  "/profile": { label: "Account", title: "Profile" },
};

export function Topbar() {
  const pathname = usePathname();
  const meta = pageTitles[pathname] ?? { label: "SmartRecycle", title: "" };
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setUser(getCurrentUser());
    const unsub = subscribeToAuth(() => {
      setUser(getCurrentUser());
    });

    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => {
      unsub();
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const displayName = user?.name || "Eco Member";
  const displayEmail = user?.email || "member@smartrecycle.ai";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur lg:px-8">
      <div className="pt-10 lg:pt-0">
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">{meta.label}</p>
        <h1 className="text-xl font-semibold text-slate-900 lg:text-2xl">{meta.title}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search — hidden on very small screens */}
        <label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-500 sm:flex">
          <Search className="h-4 w-4 shrink-0" />
          <Input
            className="h-7 w-36 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0"
            placeholder="Search..."
          />
        </label>

        {/* Notification bell */}
        <button className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-50">
          <Bell className="h-4 w-4" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 transition hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
              {initial}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="text-xs text-slate-500">Active Member</p>
            </div>
            <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{displayName}</p>
                <p className="text-xs text-slate-500">{displayEmail}</p>
              </div>
              <Link
                href="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <UserCircle2 className="h-4 w-4 text-emerald-600" />
                View Profile
              </Link>
              <Link
                href="/settings"
                onClick={() => setDropdownOpen(false)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
              >
                <Settings className="h-4 w-4 text-slate-500" />
                Settings
              </Link>
              <div className="border-t border-slate-100 pt-1 mt-1">
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout(router);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
