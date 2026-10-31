"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Leaf,
  Lock,
  Mail,
  User,
  UserPlus,
  LogIn,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Recycle,
  BarChart3,
} from "lucide-react";
import { loginUser, registerUser, setAuthenticated, UserProfile } from "@/lib/auth";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register form state
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [accountType, setAccountType] = useState("Household Recycler");
  const [agreeTerms, setAgreeTerms] = useState(true);

  function handleSwitchMode(targetMode: "login" | "register") {
    setMode(targetMode);
    setError(null);
    setSuccess(null);
  }

  async function handleLoginSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const res = loginUser(loginEmail, loginPassword);
      if (!res.success) {
        setError(res.error || "Failed to sign in. Please verify your credentials.");
        setLoading(false);
        return;
      }

      setSuccess("Signed in successfully! Redirecting to dashboard...");
      setTimeout(() => {
        router.replace("/dashboard");
      }, 700);
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (registerPassword !== registerConfirmPassword) {
      setError("Passwords do not match. Please ensure both passwords match.");
      return;
    }

    if (!agreeTerms) {
      setError("Please accept the terms and community recycling guidelines to continue.");
      return;
    }

    setLoading(true);

    try {
      const res = registerUser(registerName, registerEmail, registerPassword, accountType);
      if (!res.success) {
        setError(res.error || "Failed to create account.");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully! Redirecting to dashboard...");
      setTimeout(() => {
        router.replace("/dashboard");
      }, 800);
    } catch {
      setError("An unexpected error occurred during registration. Please try again.");
      setLoading(false);
    }
  }

  function handleDemoLogin(type: "admin" | "volunteer") {
    setError(null);
    setLoading(true);

    if (type === "admin") {
      const demoAdmin: UserProfile = {
        name: "Hitendra Sharma",
        email: "hitendra@example.com",
        role: "Lead Environmental Analyst",
        accountType: "Household Recycler",
        joinedDate: "January 2025",
      };
      setAuthenticated(demoAdmin);
    } else {
      const demoVolunteer: UserProfile = {
        name: "Eco Volunteer",
        email: "volunteer@smartrecycle.org",
        role: "Community Green Ambassador",
        accountType: "Volunteer / Green Ambassador",
        joinedDate: "October 2026",
      };
      setAuthenticated(demoVolunteer);
    }

    setSuccess("Logged in with demo credentials! Redirecting...");
    setTimeout(() => {
      router.replace("/dashboard");
    }, 500);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50/40 text-slate-900 flex flex-col justify-center px-4 py-8 sm:px-6 lg:px-8">
      {/* Top navigation back */}
      <div className="mx-auto w-full max-w-5xl mb-6 flex items-center justify-between">
        <Link
          href="/waste-analyzer"
          className="inline-flex items-center gap-2 rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm backdrop-blur hover:bg-white hover:text-emerald-950 transition border border-emerald-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Waste Analyzer
        </Link>
        <span className="text-xs font-medium text-emerald-700 bg-emerald-100/70 border border-emerald-200 rounded-full px-3 py-1">
          SmartRecycle AI v1.0
        </span>
      </div>

      <div className="mx-auto w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Side: Brand & Feature Highlights */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 p-8 text-white shadow-2xl relative overflow-hidden">
          {/* Subtle eco pattern glow */}
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">SmartRecycle</h2>
                <p className="text-xs font-medium text-emerald-300">AI-Powered Waste Classification</p>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Intelligent Eco Platform
              </span>
              <h3 className="text-xl font-bold text-slate-100">
                Classify. Recycle. Make a measurable impact.
              </h3>
              <p className="text-sm text-emerald-200/80 leading-relaxed">
                Join our community in separating recyclable materials with computer-vision precision, contamination guidelines, and actionable analytics.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 p-3.5">
                <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-300 shrink-0">
                  <Recycle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">YOLO11 Object Detection</p>
                  <p className="text-xs text-emerald-200/70">Instant bounding boxes and material identification from camera or upload.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 p-3.5">
                <div className="rounded-xl bg-teal-500/20 p-2 text-teal-300 shrink-0">
                  <BarChart3 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Waste Analytics & History</p>
                  <p className="text-xs text-emerald-200/70">Inspect recyclable trends, confidence metrics, and your personal carbon savings.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/5 border border-white/10 p-3.5">
                <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-300 shrink-0">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">Admin Review & Feedback</p>
                  <p className="text-xs text-emerald-200/70">Continuously refine classification accuracy through user-verified contributions.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-emerald-800/60 pt-4">
            <p className="text-xs text-emerald-300/80 italic">
              &quot;Recycling 1 aluminium can saves enough electricity to power a TV for 3 hours.&quot;
            </p>
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <div className="rounded-3xl border border-emerald-100 bg-white p-6 sm:p-10 shadow-xl shadow-emerald-900/5">
            {/* Mode Switcher Buttons */}
            <div className="flex rounded-2xl bg-slate-100 p-1.5 mb-6">
              <button
                type="button"
                onClick={() => handleSwitchMode("login")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  mode === "login"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode("register")}
                className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  mode === "register"
                    ? "bg-white text-emerald-800 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                Create Account
              </button>
            </div>

            {/* Title / Description */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {mode === "login"
                  ? "Enter your credentials to access your waste classification dashboard."
                  : "Join SmartRecycle today to track classifications and earn eco rewards."}
              </p>
            </div>

            {/* Error / Success Notifications */}
            {error && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Authentication Error</p>
                  <p className="mt-0.5 text-xs text-rose-700">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Success</p>
                  <p className="mt-0.5 text-xs text-emerald-700">{success}</p>
                </div>
              </div>
            )}

            {/* SIGN IN FORM */}
            {mode === "login" ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. hitendra@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("For demo accounts:\n• Hitendra: hitendra@example.com / recycle123\n• Demo User: demo@smartrecycle.org / demo123\nOr create a new account via the 'Create Account' tab.")}
                      className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-10 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Remember my session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <LogIn className="h-4 w-4" />
                  {loading ? "Signing in..." : "Sign In to Dashboard"}
                </button>

                {/* Quick 1-Click Demo Login options */}
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                    Or 1-Click Demo Testing
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleDemoLogin("admin")}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 transition text-center"
                    >
                      ⚡ Demo Member (Hitendra)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDemoLogin("volunteer")}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-800 transition text-center"
                    >
                      🌱 Eco Volunteer
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* CREATE ACCOUNT FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <User className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      placeholder="e.g. sarah@example.com"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Primary Usage / Role
                  </label>
                  <select
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  >
                    <option value="Household Recycler">Individual / Household Recycler</option>
                    <option value="Volunteer / Green Ambassador">Volunteer / Green Ambassador</option>
                    <option value="Student / Researcher">Student / University Researcher</option>
                    <option value="Commercial / Facility Partner">Commercial Waste Facility Partner</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="At least 6 chars"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-1">
                  <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="h-4 w-4 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      I agree to the <span className="font-semibold text-emerald-700">Terms of Service</span> and contribute to eco-friendly waste sorting.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4" />
                  {loading ? "Creating Account..." : "Create Account & Start"}
                </button>
              </form>
            )}

            {/* Switch mode footer */}
            <div className="mt-6 text-center text-xs text-slate-500">
              {mode === "login" ? (
                <p>
                  Don&apos;t have an account yet?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("register")}
                    className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Create an account here
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("login")}
                    className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
