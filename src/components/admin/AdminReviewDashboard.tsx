"use client";

import { useEffect, useMemo, useState } from "react";
import { BarChart3, CircleAlert, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeedbackStats } from "@/lib/types";

export function AdminReviewDashboard() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [feedback, setFeedback] = useState<Array<{ predictedLabel: string; correctLabel: string; confidence: number; userFeedback: string }>>([]);

  useEffect(() => {
    async function loadData() {
      const [statsResponse, feedbackResponse] = await Promise.all([
        fetch("/api/statistics"),
        fetch("/api/feedback"),
      ]);

      const nextStats = await statsResponse.json();
      const nextFeedback = await feedbackResponse.json();

      setStats(nextStats);
      setFeedback(nextFeedback);
    }

    loadData();
  }, []);

  const topMistakes = useMemo(() => {
    const grouped = feedback.reduce<Record<string, number>>((accumulator, item) => {
      if (item.userFeedback === "incorrect") {
        accumulator[item.predictedLabel] = (accumulator[item.predictedLabel] ?? 0) + 1;
      }
      return accumulator;
    }, {});

    return Object.entries(grouped).sort((left, right) => right[1] - left[1]).slice(0, 4);
  }, [feedback]);

  const confusionLabels = useMemo(() => {
    return feedback
      .filter((item) => item.userFeedback === "incorrect")
      .map((item) => `${item.predictedLabel} → ${item.correctLabel}`)
      .slice(0, 5);
  }, [feedback]);

  return (
    <div className="space-y-6 p-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Most common mistakes</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            {topMistakes.length ? topMistakes.map(([label, count]) => (
              <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span>{label}</span>
                <span className="font-semibold">{count}</span>
              </div>
            )) : <p className="text-slate-500">No review data yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Feedback statistics</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between"><span>Accuracy</span><span className="font-semibold">{stats?.feedbackAccuracy?.toFixed(1) ?? 0}%</span></div>
            <div className="flex items-center justify-between"><span>Prediction accuracy</span><span className="font-semibold">{stats?.predictionAccuracy?.toFixed(1) ?? 0}%</span></div>
            <div className="flex items-center justify-between"><span>Total predictions</span><span className="font-semibold">{stats?.totalPredictions ?? 0}</span></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Confusing categories</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            {confusionLabels.length ? confusionLabels.map((label) => (
              <div key={label} className="rounded-xl bg-slate-50 px-3 py-2">{label}</div>
            )) : <p className="text-slate-500">No confusing category pairs yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Model reliability</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <div className="flex items-center justify-between"><span>Average confidence</span><span className="font-semibold">{stats?.averageConfidence?.toFixed(1) ?? 0}%</span></div>
            <div className="flex items-center justify-between"><span>Recyclable</span><span className="font-semibold">{stats?.recyclableItems ?? 0}</span></div>
            <div className="flex items-center justify-between"><span>Non-recyclable</span><span className="font-semibold">{stats?.nonRecyclableItems ?? 0}</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart3 className="h-4 w-4 text-emerald-600" />Insight summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              <Sparkles className="h-4 w-4" />
              {stats?.mostCommonWaste ?? "Plastic Bottle"} is the most frequently detected waste type.
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <CircleAlert className="h-4 w-4" />
              User feedback is now being captured to continuously improve classification trust.
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-800">
              <ShieldCheck className="h-4 w-4" />
              Explanations remain human-readable so operators can verify sorting decisions quickly.
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Latest feedback entries</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            {feedback.slice(0, 4).map((entry, index) => (
              <div key={`${entry.predictedLabel}-${index}`} className="rounded-2xl border border-slate-200 p-3">
                <p className="font-semibold">{entry.predictedLabel}</p>
                <p className="text-xs text-slate-500">Correct label: {entry.correctLabel} • Confidence: {entry.confidence.toFixed(1)}%</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
