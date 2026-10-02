"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserCircle2, Settings, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, type UserSession } from "@/lib/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const displayName = user?.name || "Eco Member";
  const displayEmail = user?.email || "member@smartrecycle.ai";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-900">
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <Settings className="h-3.5 w-3.5" /> Account Settings
          </Link>
        </div>

        <Card className="border-0 shadow-lg shadow-emerald-100/60 overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold text-slate-900">
              <UserCircle2 className="h-6 w-6 text-emerald-600" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-4 rounded-2xl bg-white border border-slate-200 p-5 shadow-sm">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-2xl font-extrabold text-white shadow-md shadow-emerald-500/20">
                {initial}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{displayName}</h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                    <Sparkles className="h-3 w-3 text-emerald-600" /> Active Member
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-slate-500">{displayEmail}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Account Status</p>
                <p className="mt-2 text-sm font-semibold text-emerald-700">Verified Member</p>
                <p className="mt-1 text-xs text-slate-500">Access to real-time YOLOv11 inference and recyclability guidance</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Security & Credentials</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">Scrypt Encrypted Password</p>
                <p className="mt-1 text-xs text-slate-500">You can change your password anytime in Settings</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Primary Usage</p>
                <p className="mt-2 text-sm font-semibold text-slate-800">Visual Waste Classifier</p>
                <p className="mt-1 text-xs text-slate-500">Multi-object bounding boxes, material verification, and contamination scoring</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Continuous Learning Feedback</p>
                <p className="mt-2 text-sm font-semibold text-teal-700">Human-In-The-Loop Contributor</p>
                <p className="mt-1 text-xs text-slate-500">Your classification reviews improve the model retraining dataset</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
