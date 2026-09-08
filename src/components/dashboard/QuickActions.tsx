import Link from "next/link";
import { BarChart3, ClipboardList, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-3">
        <Link
          href="/waste-analyzer"
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 transition hover:bg-emerald-100"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-emerald-600 p-2 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Analyze New Image</p>
              <p className="text-xs text-slate-600">Upload waste for AI classification</p>
            </div>
          </div>
        </Link>

        <Link
          href="/history"
          className="rounded-2xl border border-sky-200 bg-sky-50 p-4 transition hover:bg-sky-100"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-sky-600 p-2 text-white">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Classification History</p>
              <p className="text-xs text-slate-600">View previous predictions</p>
            </div>
          </div>
        </Link>

        <Link
          href="/analytics"
          className="rounded-2xl border border-violet-200 bg-violet-50 p-4 transition hover:bg-violet-100"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-violet-600 p-2 text-white">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Waste Analytics</p>
              <p className="text-xs text-slate-600">Detailed statistics and charts</p>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}
