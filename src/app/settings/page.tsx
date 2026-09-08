import Link from "next/link";
import { ArrowLeft, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <Card className="border-0 shadow-lg shadow-emerald-100/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Settings2 className="h-5 w-5 text-emerald-600" />
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">Notification preferences</p>
              <p className="mt-2 text-sm text-slate-600">Get pickup reminders and reward updates by email.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-semibold text-slate-900">Privacy controls</p>
              <p className="mt-2 text-sm text-slate-600">Manage your saved addresses and account visibility.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
