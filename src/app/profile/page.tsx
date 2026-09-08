import Link from "next/link";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-900">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <Card className="border-0 shadow-lg shadow-emerald-100/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserCircle2 className="h-5 w-5 text-emerald-600" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">Hitendra </p>
              <p className="mt-1 text-sm text-slate-600">hitendra@example.com</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Member since</p>
                <p className="mt-2 text-sm text-slate-600">January 2025</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Role</p>
                <p className="mt-2 text-sm text-slate-600">Premium Member — AI Waste Classifier</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Primary Usage</p>
                <p className="mt-2 text-sm text-slate-600">Image-based waste classification and recycling guidance</p>
              </div>
              <div className="rounded-2xl border border-slate-200 p-4">
                <p className="text-sm font-semibold text-slate-900">Feedback Contributions</p>
                <p className="mt-2 text-sm text-slate-600">Corrections and confirmations logged to improve model accuracy</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
