"use client";

import { Suspense, useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { LockKeyhole, LogIn, UserPlus, ArrowLeft, Loader2, CheckCircle2, KeyRound, AlertCircle } from "lucide-react";
import { setAuthenticated, getCurrentUser } from "@/lib/auth";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryMode = searchParams.get("mode");
  const initialMode = queryMode === "signup" ? "signup" : queryMode === "forgot" ? "forgot" : "signin";
  const returnUrl = searchParams.get("returnUrl") || "/waste-analyzer";

  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (getCurrentUser()) {
      router.replace(returnUrl);
    }
  }, [router, returnUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsDuplicateEmail(false);
    setSuccessMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (mode === "signup") {
      if (!name.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    } else if (mode === "signin") {
      if (!password) {
        setError("Please enter your password.");
        return;
      }
    } else if (mode === "forgot") {
      if (password.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (response.status === 409 || data.error?.toLowerCase().includes("already exists")) {
            setIsDuplicateEmail(true);
            throw new Error("An account with this email already exists. You cannot create another account with the same email.");
          }
          throw new Error(data.error || "Failed to create account.");
        }

        setSuccessMessage("Account created successfully! Signing you in...");
        setAuthenticated(data.user);
        setTimeout(() => {
          router.replace(returnUrl);
        }, 800);
      } else if (mode === "signin") {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Invalid email or password.");
        }

        setAuthenticated(data.user);
        router.replace(returnUrl);
      } else if (mode === "forgot") {
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: email.trim(), newPassword: password }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to reset password.");
        }

        setSuccessMessage("Password reset successfully! Signing you in with your new password...");
        if (data.user) {
          setAuthenticated(data.user);
        }
        setTimeout(() => {
          router.replace(returnUrl);
        }, 1000);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication error.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white p-8 shadow-xl shadow-emerald-50/40">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Analyzer
          </Link>

          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            SmartRecycle
          </span>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            {mode === "signup" ? (
              <UserPlus className="h-6 w-6" />
            ) : mode === "forgot" ? (
              <KeyRound className="h-6 w-6" />
            ) : (
              <LockKeyhole className="h-6 w-6" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {mode === "signup"
                ? "Create an Account"
                : mode === "forgot"
                ? "Reset Your Password"
                : "Sign In to Your Account"}
            </h1>
            <p className="text-xs text-slate-500">
              {mode === "signup"
                ? "Create a unique account to upload and analyze waste"
                : mode === "forgot"
                ? "Enter your email and create a new password"
                : "Sign in to upload photos and save history"}
            </p>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="mb-6 flex rounded-xl bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
              setIsDuplicateEmail(false);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              mode === "signin" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
              setIsDuplicateEmail(false);
            }}
            className={`flex-1 rounded-lg py-2 text-xs font-bold transition ${
              mode === "signup" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Create Account
          </button>
        </div>

        {searchParams.get("required") && mode !== "forgot" && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <strong>Account Required:</strong> Please sign in or create a free account to upload and classify images.
          </div>
        )}

        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {isDuplicateEmail && (
          <div className="mb-4 rounded-2xl border border-amber-300 bg-amber-50/90 p-4 text-xs text-amber-900 shadow-sm">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Email Already Registered</span>
            </div>
            <p className="mt-1.5 leading-relaxed text-slate-600">
              An account with <strong>{email}</strong> already exists. You cannot register multiple accounts with the same email.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                  setIsDuplicateEmail(false);
                }}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
              >
                Sign In Now
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot");
                  setError("");
                  setIsDuplicateEmail(false);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Forgot Password?
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Johnson"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">Email Address</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (isDuplicateEmail) setIsDuplicateEmail(false);
              }}
              placeholder="alex@example.com"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                {mode === "forgot" ? "New Password" : "Password"}
              </label>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                    setIsDuplicateEmail(false);
                  }}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              required
              autoComplete={mode === "signup" || mode === "forgot" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
            />
          </div>

          {(mode === "signup" || mode === "forgot") && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                {mode === "forgot" ? "Confirm New Password" : "Confirm Password"}
              </label>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          )}

          {error && !isDuplicateEmail && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "signup"
                  ? "Creating Account..."
                  : mode === "forgot"
                  ? "Resetting Password..."
                  : "Signing In..."}
              </>
            ) : mode === "signup" ? (
              <>
                <UserPlus className="h-4 w-4" />
                Create Account
              </>
            ) : mode === "forgot" ? (
              <>
                <KeyRound className="h-4 w-4" />
                Reset Password & Sign In
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {mode === "signin" ? (
            <p>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError("");
                  setIsDuplicateEmail(false);
                }}
                className="font-bold text-emerald-600 hover:underline"
              >
                Create one now
              </button>
            </p>
          ) : mode === "forgot" ? (
            <p>
              Remember your password?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                  setIsDuplicateEmail(false);
                }}
                className="font-bold text-emerald-600 hover:underline"
              >
                Back to Sign In
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError("");
                  setIsDuplicateEmail(false);
                }}
                className="font-bold text-emerald-600 hover:underline"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </main>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
