"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  Pie,
  PieChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeedbackStats } from "@/lib/types";

const PIE_COLORS = ["#10b981", "#f59e0b"];
const BAR_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#f97316", "#14b8a6", "#ec4899",
];

function RecyclablePieChart({ recyclable, nonRecyclable }: { recyclable: number; nonRecyclable: number }) {
  const data = [
    { name: "Recyclable", value: recyclable },
    { name: "Non-Recyclable", value: nonRecyclable },
  ];
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Tooltip
          formatter={(v: number, n: string) => [`${v} items`, n]}
          contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
        />
        <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>} />
        <Pie data={data} dataKey="value" outerRadius={90} innerRadius={55} paddingAngle={3} label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ""} labelLine={false}>
          {data.map((entry, index) => (
            <Cell key={`pie-cell-${entry.name}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function WasteAnalyticsPage() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetch("/api/statistics").then((r) => r.json());
        setStats(data);
      } catch {
        // keep null
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Top 8 waste types + Others
  const wasteBarData = (() => {
    if (!stats?.wasteDistribution?.length) return [];
    const sorted = [...stats.wasteDistribution].sort((a, b) => b.value - a.value);
    if (sorted.length <= 8) return sorted;
    const top = sorted.slice(0, 8);
    const othersValue = sorted.slice(8).reduce((sum, d) => sum + d.value, 0);
    if (othersValue > 0) top.push({ name: "Others", value: othersValue });
    return top;
  })();

  // Confidence distribution
  const confidenceData = stats
    ? [
        { name: "High (≥90%)", value: 0, fill: "#10b981" },
        { name: "Medium (70–89%)", value: 0, fill: "#f59e0b" },
        { name: "Low (<70%)", value: 0, fill: "#ef4444" },
      ]
    : [];

  // Trend data (last 7 days)
  const trendData = stats?.feedbackTrends?.map((t) => ({
    date: t.date.slice(5), // MM-DD
    Correct: t.correct,
    Incorrect: t.incorrect,
    Total: t.correct + t.incorrect,
  })) ?? [];

  const statCards = [
    { title: "Total Predictions", value: String(stats?.totalPredictions ?? 0), detail: "Images analyzed", accent: "bg-emerald-50" },
    { title: "Average Confidence", value: `${(stats?.averageConfidence ?? 0).toFixed(1)}%`, detail: "Model score", accent: "bg-sky-50" },
    { title: "Recyclable Waste", value: String(stats?.recyclableItems ?? 0), detail: "Accepted in recycling", accent: "bg-teal-50" },
    { title: "Non-Recyclable", value: String(stats?.nonRecyclableItems ?? 0), detail: "Special disposal", accent: "bg-amber-50" },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <Topbar />
        <div className="space-y-6 p-4 pt-16 lg:p-8 lg:pt-6">

          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <DashboardCard key={card.title} {...card} />
            ))}
          </div>

          {/* Chart row 1: Recyclable Pie + Waste Type Bar */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recyclable vs Non-Recyclable</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
                ) : (
                  <RecyclablePieChart
                    recyclable={stats?.recyclableItems ?? 0}
                    nonRecyclable={stats?.nonRecyclableItems ?? 0}
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Waste Type Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
                ) : wasteBarData.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                    No classification data yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={wasteBarData} margin={{ top: 4, right: 4, left: 0, bottom: 24 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 10, fill: "#94a3b8" }}
                        angle={-30}
                        textAnchor="end"
                        interval={0}
                        height={60}
                      />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                        formatter={(v: number) => [`${v} predictions`]}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {wasteBarData.map((entry, index) => (
                          <Cell key={`bar-cell-${entry.name}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Chart row 2: Classification Trend + Confidence Distribution */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Classification Trend (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
                ) : trendData.length === 0 ? (
                  <div className="flex h-64 items-center justify-center text-sm text-slate-500">
                    No trend data available yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={trendData} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      />
                      <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ fontSize: 11, color: "#64748b" }}>{v}</span>} />
                      <Line type="monotone" dataKey="Total" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Correct" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="Incorrect" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confidence Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
                ) : (
                  <div className="space-y-5 pt-4">
                    {[
                      {
                        label: "High Confidence (≥ 90%)",
                        color: "bg-emerald-500",
                        value: stats?.contaminationLevels?.find((c) => c.name === "Low")?.value ?? 0,
                        max: stats?.totalPredictions ?? 1,
                        badge: "bg-emerald-100 text-emerald-800",
                      },
                      {
                        label: "Medium Confidence (70–89%)",
                        color: "bg-amber-500",
                        value: stats?.contaminationLevels?.find((c) => c.name === "Medium")?.value ?? 0,
                        max: stats?.totalPredictions ?? 1,
                        badge: "bg-amber-100 text-amber-800",
                      },
                      {
                        label: "Low Confidence (< 70%)",
                        color: "bg-rose-500",
                        value: stats?.contaminationLevels?.find((c) => c.name === "High")?.value ?? 0,
                        max: stats?.totalPredictions ?? 1,
                        badge: "bg-rose-100 text-rose-800",
                      },
                    ].map((row) => {
                      const pct = row.max > 0 ? Math.round((row.value / row.max) * 100) : 0;
                      return (
                        <div key={row.label} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                            <span>{row.label}</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${row.badge}`}>
                              {row.value} ({pct}%)
                            </span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className={`h-full rounded-full ${row.color} transition-all duration-700`}
                              style={{ width: `${Math.max(2, pct)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-xs text-slate-400 italic">
                      * Confidence bands are approximated using contamination level data as a proxy.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
