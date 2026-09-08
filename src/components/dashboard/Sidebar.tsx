"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home,
  ScanSearch,
  ClipboardList,
  BarChart3,
  ShieldCheck,
  Settings,
  LogOut,
  Leaf,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/auth";

const menus = [
  { name: "Dashboard", icon: Home, href: "/dashboard" },
  { name: "Image Analyzer", icon: ScanSearch, href: "/waste-analyzer" },
  { name: "Classification History", icon: ClipboardList, href: "/history" },
  { name: "Waste Analytics", icon: BarChart3, href: "/analytics" },
  { name: "Admin Review", icon: ShieldCheck, href: "/admin" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-emerald-950/10 bg-emerald-950 px-5 py-7 text-emerald-50">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-emerald-500/20 p-2">
          <Leaf className="h-5 w-5" />
        </div>
        <div>
          <p className="text-lg font-semibold leading-none">SmartRecycle</p>
          <p className="mt-0.5 text-xs text-emerald-300">AI Waste Classifier</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="mt-8 space-y-1">
        {menus.map((menu) => {
          const Icon = menu.icon;
          const active = pathname === menu.href || pathname.startsWith(menu.href + "/");

          return (
            <Link
              key={menu.name}
              href={menu.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-emerald-600/80 text-white"
                  : "text-emerald-200 hover:bg-emerald-800/60 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {menu.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom promo */}
      <div className="mt-auto rounded-2xl border border-emerald-800/60 bg-emerald-900/70 p-4 text-xs">
        <p className="font-semibold text-emerald-100">Waste → Decision → Impact</p>
        <p className="mt-1 text-emerald-300">
          Classify waste, track history, and improve sorting accuracy with AI.
        </p>
      </div>

      <button
        onClick={() => logout(router)}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-800/60 bg-transparent px-4 py-2.5 text-sm font-medium text-emerald-200 transition hover:bg-emerald-800/60 hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:h-screen lg:flex-shrink-0">{sidebar}</div>

      {/* Mobile top bar toggle */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-emerald-600 p-1.5 text-white">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-semibold text-slate-900">SmartRecycle</span>
        </div>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="rounded-lg border border-slate-200 p-2 text-slate-600"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64">{sidebar}</div>
        </div>
      )}
    </>
  );
}
