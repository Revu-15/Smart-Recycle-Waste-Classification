"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CircleAlert,
  ShieldCheck,
  Sparkles,
  Check,
  X,
  Eye,
} from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeedbackStats } from "@/lib/types";

type FeedbackEntry = {
  id: string;
  predictedLabel: string;
  correctLabel: string;
  confidence: number;
  userFeedback: string;
  timestamp: string;
  status?: string;
};

type ReviewStatus = "pending" | "confirmed" | "corrected";

export default function AdminReviewPage() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [reviewStates, setReviewStates] = useState<Record<string, ReviewStatus>>({});
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "low-confidence" | "incorrect">(
    "pending"
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const [statsResponse, feedbackResponse] = await Promise.all([
        fetch("/api/statistics"),
        fetch("/api/feedback"),
      ]);

      const nextStats = await statsResponse.json();
      const nextFeedback = await feedbackResponse.json();

      setStats(nextStats);
      setFeedback(Array.isArray(nextFeedback) ? nextFeedback : []);
    }

    loadData();
  }, []);

  const topMistakes = useMemo(() => {
    const grouped = feedback.reduce<Record<string, number>>((acc, item) => {
      if (item.userFeedback === "incorrect") {
        acc[item.predictedLabel] = (acc[item.predictedLabel] ?? 0) + 1;
      }
      return acc;
    }, {});
    return Object.entries(grouped).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [feedback]);

  const confusionPairs = useMemo(() => {
    return feedback
      .filter((item) => item.userFeedback === "incorrect")
      .map((item) => `${item.predictedLabel} → ${item.correctLabel}`)
      .slice(0, 5);
  }, [feedback]);

  const filteredFeedback = useMemo(() => {
    if (filterTab === "pending") {
      return feedback.filter((f) => !reviewStates[f.id]);
    }
    if (filterTab === "low-confidence") {
      return feedback.filter((f) => f.confidence < 70);
    }
    if (filterTab === "incorrect") {
      return feedback.filter((f) => f.userFeedback === "incorrect");
    }
    return feedback;
  }, [feedback, filterTab, reviewStates]);

  function handleConfirm(id: string) {
    setReviewStates((prev) => ({ ...prev, [id]: "confirmed" }));
  }

  function handleCorrect(id: string) {
    setReviewStates((prev) => ({ ...prev, [id]: "corrected" }));
  }

  function formatDate(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <Topbar />
        <div className="space-y-6 p-4 pt-16 lg:p-8 lg:pt-6">

          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Most Common Mistakes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                {topMistakes.length ? (
                  topMistakes.map(([label, count]) => (
                    <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="font-medium">{label}</span>
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                        {count}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs">No mistake data yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Feedback Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Feedback Accuracy</span>
                  <span className="font-bold text-slate-900">{stats?.feedbackAccuracy?.toFixed(1) ?? 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Predictions</span>
                  <span className="font-bold text-slate-900">{stats?.totalPredictions ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Feedback</span>
                  <span className="font-bold text-slate-900">{feedback.length}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Confusing Category Pairs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                {confusionPairs.length ? (
                  confusionPairs.map((label, i) => (
                    <div key={`${label}-${i}`} className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium">
                      {label}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs">No confusion patterns yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-slate-500">Model Reliability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>Avg Confidence</span>
                  <span className="font-bold text-slate-900">{stats?.averageConfidence?.toFixed(1) ?? 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Recyclable</span>
                  <span className="font-bold text-emerald-700">{stats?.recyclableItems ?? 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Non-Recyclable</span>
                  <span className="font-bold text-amber-700">{stats?.nonRecyclableItems ?? 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Insight row */}
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-emerald-600" />
                  Insight Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>
                    <strong>{stats?.mostCommonWaste ?? "Plastic Bottle"}</strong> is the most frequently
                    detected waste type.
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  <CircleAlert className="h-4 w-4 shrink-0" />
                  User feedback corrections are logged for continuous YOLO model improvement.
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Predictions with confidence &lt;70% are highlighted for manual admin review.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latest Feedback Entries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-700">
                {feedback.slice(0, 4).map((entry, index) => (
                  <div key={`${entry.predictedLabel}-${index}`} className="rounded-2xl border border-slate-200 p-3">
                    <p className="font-semibold">{entry.predictedLabel}</p>
                    <p className="text-xs text-slate-500">
                      Correct label: {entry.correctLabel} &middot; Confidence: {entry.confidence.toFixed(1)}%
                    </p>
                  </div>
                ))}
                {feedback.length === 0 && (
                  <p className="text-xs text-slate-400">No feedback entries yet.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review Table */}
          <Card>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Prediction Review Queue
              </CardTitle>

              {/* Tab filters */}
              <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                {(
                  [
                    { value: "pending", label: "Pending" },
                    { value: "all", label: "All" },
                    { value: "incorrect", label: "User-Corrected" },
                    { value: "low-confidence", label: "Low Confidence" },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setFilterTab(tab.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      filterTab === tab.value
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent>
              {filteredFeedback.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-2xl">✅</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">All caught up!</p>
                  <p className="mt-1 text-xs text-slate-500">
                    No predictions in this queue require review.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <th className="pb-3 pr-4">AI Prediction</th>
                          <th className="pb-3 pr-4">Confidence</th>
                          <th className="pb-3 pr-4">User Feedback</th>
                          <th className="pb-3 pr-4">Correct Label</th>
                          <th className="pb-3 pr-4">Date</th>
                          <th className="pb-3 pr-4">Status</th>
                          <th className="pb-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredFeedback.map((entry) => {
                          const status = reviewStates[entry.id];
                          const isLowConf = entry.confidence < 70;

                          return (
                            <>
                              <tr key={entry.id} className="hover:bg-slate-50">
                                <td className="py-3 pr-4">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-900">
                                      {entry.predictedLabel}
                                    </span>
                                    {isLowConf && (
                                      <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                                        LOW
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3 pr-4">
                                  <span
                                    className={`text-xs font-bold ${
                                      isLowConf
                                        ? "text-rose-700"
                                        : entry.confidence < 90
                                        ? "text-amber-700"
                                        : "text-emerald-700"
                                    }`}
                                  >
                                    {entry.confidence.toFixed(1)}%
                                  </span>
                                </td>
                                <td className="py-3 pr-4">
                                  <span
                                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                      entry.userFeedback === "correct"
                                        ? "bg-emerald-100 text-emerald-800"
                                        : "bg-rose-100 text-rose-800"
                                    }`}
                                  >
                                    {entry.userFeedback === "correct" ? "Correct ✓" : "Incorrect ✗"}
                                  </span>
                                </td>
                                <td className="py-3 pr-4 text-slate-600">
                                  {entry.correctLabel !== entry.predictedLabel
                                    ? entry.correctLabel
                                    : "—"}
                                </td>
                                <td className="py-3 pr-4 text-xs text-slate-400">
                                  {formatDate(entry.timestamp)}
                                </td>
                                <td className="py-3 pr-4">
                                  {!status && (
                                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
                                      Pending
                                    </span>
                                  )}
                                  {status === "confirmed" && (
                                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                                      Confirmed
                                    </span>
                                  )}
                                  {status === "corrected" && (
                                    <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-bold text-sky-800">
                                      Corrected
                                    </span>
                                  )}
                                </td>
                                <td className="py-3">
                                  {!status ? (
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleConfirm(entry.id)}
                                        title="Confirm AI prediction"
                                        className="rounded-lg bg-emerald-50 p-1.5 text-emerald-700 transition hover:bg-emerald-100"
                                      >
                                        <Check className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleCorrect(entry.id)}
                                        title="Mark as corrected"
                                        className="rounded-lg bg-rose-50 p-1.5 text-rose-700 transition hover:bg-rose-100"
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          setExpandedId(expandedId === entry.id ? null : entry.id)
                                        }
                                        title="View details"
                                        className="rounded-lg bg-slate-100 p-1.5 text-slate-600 transition hover:bg-slate-200"
                                      >
                                        <Eye className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400">Resolved</span>
                                  )}
                                </td>
                              </tr>
                              {expandedId === entry.id && (
                                <tr key={`${entry.id}-expand`} className="bg-slate-50">
                                  <td colSpan={7} className="px-4 py-3">
                                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs space-y-1 text-slate-700">
                                      <p>
                                        <strong>AI Prediction:</strong> {entry.predictedLabel} (
                                        {entry.confidence.toFixed(1)}%)
                                      </p>
                                      <p>
                                        <strong>User-Suggested Label:</strong> {entry.correctLabel}
                                      </p>
                                      <p>
                                        <strong>Feedback Type:</strong> {entry.userFeedback}
                                      </p>
                                      <p>
                                        <strong>Date:</strong> {formatDate(entry.timestamp)}
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile cards */}
                  <div className="space-y-3 md:hidden">
                    {filteredFeedback.map((entry) => {
                      const status = reviewStates[entry.id];
                      const isLowConf = entry.confidence < 70;

                      return (
                        <div key={entry.id} className="rounded-xl border border-slate-200 bg-white p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-slate-900">{entry.predictedLabel}</p>
                                {isLowConf && (
                                  <span className="rounded-full bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                                    LOW
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-slate-500">
                                Confidence: {entry.confidence.toFixed(1)}% &middot;{" "}
                                {formatDate(entry.timestamp)}
                              </p>
                              {entry.correctLabel !== entry.predictedLabel && (
                                <p className="mt-0.5 text-xs text-slate-600">
                                  User said: <strong>{entry.correctLabel}</strong>
                                </p>
                              )}
                            </div>
                            {!status ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleConfirm(entry.id)}
                                  className="rounded-lg bg-emerald-50 p-2 text-emerald-700"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleCorrect(entry.id)}
                                  className="rounded-lg bg-rose-50 p-2 text-rose-700"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                  status === "confirmed"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-sky-100 text-sky-800"
                                }`}
                              >
                                {status === "confirmed" ? "Confirmed" : "Corrected"}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
