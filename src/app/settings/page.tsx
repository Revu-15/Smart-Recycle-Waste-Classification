"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Settings2,
  User,
  Lock,
  Bell,
  Sliders,
  ShieldAlert,
  LogOut,
  CheckCircle2,
  Loader2,
  Trash2,
  Save,
  Sparkles,
} from "lucide-react";
import { getCurrentUser, isAuthenticated, setAuthenticated, logout, type UserSession } from "@/lib/auth";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);

  // Profile Form State
  const [name, setName] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // AI & App Preferences
  const [detectionMode, setDetectionMode] = useState<"fast" | "balanced" | "detailed">("fast");
  const [contaminationAlerts, setContaminationAlerts] = useState(true);
  const [autoSaveHistory, setAutoSaveHistory] = useState(true);
  const [soundFeedback, setSoundFeedback] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login?required=1&returnUrl=/settings");
      return;
    }
    const current = getCurrentUser();
    setUser(current);
    if (current?.name) setName(current.name);

    // Load saved preferences if available
    const savedMode = localStorage.getItem("smartrecycle_detection_mode");
    if (savedMode === "fast" || savedMode === "balanced" || savedMode === "detailed") {
      setDetectionMode(savedMode);
    }
    const savedAlerts = localStorage.getItem("smartrecycle_contamination_alerts");
    if (savedAlerts !== null) setContaminationAlerts(savedAlerts === "true");

    const savedAutoSave = localStorage.getItem("smartrecycle_auto_save");
    if (savedAutoSave !== null) setAutoSaveHistory(savedAutoSave === "true");

    const savedSound = localStorage.getItem("smartrecycle_sound");
    if (savedSound !== null) setSoundFeedback(savedSound === "true");
  }, [router]);

  async function handleUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setProfileMessage(null);

    if (!name.trim()) {
      setProfileMessage({ type: "error", text: "Full name cannot be empty." });
      return;
    }

    setProfileSaving(true);
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, name: name.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      if (data.user) {
        setAuthenticated(data.user);
        setUser(data.user);
      }
      setProfileMessage({ type: "success", text: "Profile name updated successfully!" });
    } catch (err: unknown) {
      setProfileMessage({ type: "error", text: err instanceof Error ? err.message : "Error updating profile." });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleUpdatePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (!currentPassword) {
      setPasswordMessage({ type: "error", text: "Please enter your current password." });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setPasswordSaving(true);
    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update password.");
      }

      setPasswordMessage({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordMessage({ type: "error", text: err instanceof Error ? err.message : "Error updating password." });
    } finally {
      setPasswordSaving(false);
    }
  }

  function handleSavePreferences() {
    localStorage.setItem("smartrecycle_detection_mode", detectionMode);
    localStorage.setItem("smartrecycle_contamination_alerts", String(contaminationAlerts));
    localStorage.setItem("smartrecycle_auto_save", String(autoSaveHistory));
    localStorage.setItem("smartrecycle_sound", String(soundFeedback));

    setPrefSaved(true);
    setTimeout(() => setPrefSaved(false), 2000);
  }

  function handleClearHistory() {
    if (confirm("Are you sure you want to clear your local scan history? This action cannot be undone.")) {
      localStorage.removeItem("smartrecycle_scan_history");
      alert("Local scan history cleared successfully.");
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
            </Link>
            <Link
              href="/waste-analyzer"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-sm transition hover:bg-emerald-100"
            >
              Waste Analyzer
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
              <Sparkles className="h-3 w-3 text-emerald-600" />
              Active Member
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-500/20">
            <Settings2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Account & AI Settings</h1>
            <p className="text-xs text-slate-500 sm:text-sm">Manage your personal profile, security credentials, and YOLOv11 preferences.</p>
          </div>
        </div>

        {/* Grid Sections */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          {/* Left Column: Profile & Security */}
          <div className="space-y-6">
            {/* Profile Settings Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 font-bold text-slate-900">
                <User className="h-5 w-5 text-emerald-600" />
                <span>Profile Information</span>
              </div>

              {profileMessage && (
                <div
                  className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
                    profileMessage.type === "success"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                >
                  {profileMessage.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                  <span>{profileMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Email Address (Registered)</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-sm font-medium text-slate-500 cursor-not-allowed"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">Email cannot be changed once an account is registered.</p>
                </div>

                <button
                  type="submit"
                  disabled={profileSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Profile Changes
                </button>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 font-bold text-slate-900">
                <Lock className="h-5 w-5 text-emerald-600" />
                <span>Security & Password</span>
              </div>

              {passwordMessage && (
                <div
                  className={`mt-4 flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
                    passwordMessage.type === "success"
                      ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border border-rose-200 bg-rose-50 text-rose-800"
                  }`}
                >
                  {passwordMessage.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                  <span>{passwordMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {passwordSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                  Update Password
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: AI Model Preferences & Account Controls */}
          <div className="space-y-6">
            {/* AI Preferences Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5 font-bold text-slate-900">
                  <Sliders className="h-5 w-5 text-emerald-600" />
                  <span>AI Classification Preferences</span>
                </div>
                {prefSaved && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Saved
                  </span>
                )}
              </div>

              <div className="mt-5 space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">Inference Engine Mode</label>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {[
                      { id: "fast", title: "Ultra Fast", desc: "Sub-5s" },
                      { id: "balanced", title: "Balanced", desc: "AI + Vision" },
                      { id: "detailed", title: "Deep Trace", desc: "Multi-object" },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => setDetectionMode(mode.id as typeof detectionMode)}
                        className={`rounded-2xl border p-3 text-left transition ${
                          detectionMode === mode.id
                            ? "border-emerald-500 bg-emerald-50/70 shadow-sm text-emerald-950"
                            : "border-slate-200 bg-white hover:border-slate-300 text-slate-700"
                        }`}
                      >
                        <p className="text-xs font-bold">{mode.title}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{mode.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Contamination Alerts</p>
                      <p className="text-[11px] text-slate-500">Flag grease, food residue, and non-recyclable composites.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={contaminationAlerts}
                      onChange={(e) => setContaminationAlerts(e.target.checked)}
                      className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Auto-Save Scans to Dashboard</p>
                      <p className="text-[11px] text-slate-500">Automatically record classified items in your waste history.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoSaveHistory}
                      onChange={(e) => setAutoSaveHistory(e.target.checked)}
                      className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Scan Complete Sound</p>
                      <p className="text-[11px] text-slate-500">Play subtle audio confirmation when YOLO inference finishes.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundFeedback}
                      onChange={(e) => setSoundFeedback(e.target.checked)}
                      className="h-4 w-4 rounded accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:from-emerald-700 hover:to-teal-700"
                  >
                    <Save className="h-4 w-4" /> Save Preferences
                  </button>
                </div>
              </div>
            </div>

            {/* Account & Session Controls */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 font-bold text-slate-900">
                <ShieldAlert className="h-5 w-5 text-slate-600" />
                <span>Account Management</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 p-3.5">
                  <div>
                    <p className="text-xs font-bold text-slate-800">Clear Local Scan Cache</p>
                    <p className="text-[11px] text-slate-500">Remove cached photos and prediction previews stored in browser.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100 transition"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-slate-500" /> Clear
                  </button>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/50 p-3.5">
                  <div>
                    <p className="text-xs font-bold text-rose-900">Sign Out of SmartRecycle</p>
                    <p className="text-[11px] text-rose-600">End your current session on this device.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => logout(router)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
