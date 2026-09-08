"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HistoryRecord = {
  id: string;
  predictedLabel: string;
  confidence: number;
  recyclable: boolean;
  createdAt: string;
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function RecentClassifications() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetch("/api/history?limit=5").then((r) => r.json());
        setRecords(Array.isArray(data) ? data : []);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Classifications</CardTitle>
        <Link
          href="/history"
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
        >
          View all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No classifications yet. Upload an image to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  {/* Recyclable indicator */}
                  {record.recyclable ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{record.predictedLabel}</p>
                    <p className="text-xs text-slate-500">
                      {record.recyclable ? "Recyclable" : "Non-Recyclable"} &middot;{" "}
                      {record.confidence.toFixed(1)}% confidence
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {formatDate(record.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
