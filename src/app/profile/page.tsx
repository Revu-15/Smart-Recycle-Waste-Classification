"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserCircle2, ShieldCheck, Mail, Calendar, Award, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser, UserProfile } from "@/lib/auth";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <Card className="border-0 shadow-xl shadow-emerald-100/60 overflow-hidden">
          {/* Header banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold text-white border border-white/30 backdrop-blur">
                {(user?.name?.[0] ?? "U").toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{user?.name ?? "Recycle Member"}</h1>
                <p className="text-sm text-emerald-200 flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3.5 w-3.5" />
                  {user?.email ?? "user@smartrecycle.org"}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 self-start sm:self-center rounded-full bg-emerald-500/20 px-3.5 py-1.5 text-xs font-semibold text-emerald-200 border border-emerald-400/30">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              Verified Account
            </span>
          </div>

          <CardHeader className="pt-6">
            <CardTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
              <UserCircle2 className="h-5 w-5 text-emerald-600" />
              Account & Recycling Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  Member Since
                </div>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {user?.joinedDate ?? "October 2026"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Award className="h-4 w-4 text-emerald-600" />
                  Account Type & Role
                </div>
                <p className="mt-2 text-base font-semibold text-slate-900">
                  {user?.accountType ?? user?.role ?? "Individual / Household Recycler"}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Leaf className="h-4 w-4 text-emerald-600" />
                  Primary Usage
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Image-based waste classification, recycling contamination avoidance, and eco tracking.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Community Verification
                </div>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  Enabled to confirm predictions and submit corrections to enhance YOLO detection accuracy.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
