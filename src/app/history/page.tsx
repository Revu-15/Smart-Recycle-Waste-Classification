"use client";

import { Fragment, useCallback, useEffect, useState } from "react";
import { CheckCircle2, Search, SlidersHorizontal, XCircle, ChevronDown } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type HistoryRecord = {
  id: string;
  predictedLabel: string;
  confidence: number;
  recyclable: boolean;
  contamination: string;
  material: string;
  recommendation: string;
  createdAt: string;
};

type FilterOption = "all" | "recyclable" | "non-recyclable" | "low-confidence";
type SortOption = "newest" | "oldest" | "highest-confidence" | "lowest-confidence";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const filterOptions: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All" },
  { value: "recyclable", label: "Recyclable" },
  { value: "non-recyclable", label: "Non-Recyclable" },
  { value: "low-confidence", label: "Low Confidence (<70%)" },
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "highest-confidence", label: "Highest Confidence" },
  { value: "lowest-confidence", label: "Lowest Confidence" },
];

function ConfidenceBadge({ confidence }: { confidence: number }) {
  if (confidence >= 90)
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
        {confidence.toFixed(1)}% High
      </span>
    );
  if (confidence >= 70)
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800">
        {confidence.toFixed(1)}% Med
      </span>
    );
  return (
    <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
      {confidence.toFixed(1)}% Low
    </span>
  );
}

export default function ClassificationHistoryPage() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterOption>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter, sort });
      if (search) params.set("search", search);
      const data = await fetch(`/api/history?${params}`).then((r) => r.json());
      setRecords(Array.isArray(data) ? data : []);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [search, filter, sort]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <Topbar />
        <div className="space-y-6 p-4 pt-16 lg:p-8 lg:pt-6">
          {/* Controls */}
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3 pt-5">
              {/* Search */}
              <label className="flex flex-1 min-w-[160px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-500">
                <Search className="h-4 w-4 shrink-0" />
                <input
                  className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                  placeholder="Search by waste type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </label>

              {/* Filter */}
              <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                <SlidersHorizontal className="ml-2 h-4 w-4 text-slate-400 shrink-0" />
                {filterOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(opt.value)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      filter === opt.value
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 pr-8 text-xs font-semibold text-slate-700 outline-none"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Classification History</CardTitle>
              <span className="text-xs text-slate-500">
                {loading ? "Loading..." : `${records.length} record${records.length !== 1 ? "s" : ""}`}
              </span>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : records.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-2xl">🗑️</p>
                  <p className="mt-2 text-sm font-semibold text-slate-700">No classifications found</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {search || filter !== "all"
                      ? "Try adjusting your search or filters."
                      : "Upload an image on the Image Analyzer page to get started."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop table */}
                  <div className="hidden overflow-x-auto md:block">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                          <th className="pb-3 pr-4">Waste Type</th>
                          <th className="pb-3 pr-4">Classification</th>
                          <th className="pb-3 pr-4">Confidence</th>
                          <th className="pb-3 pr-4">Material</th>
                          <th className="pb-3 pr-4">Contamination</th>
                          <th className="pb-3">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records.map((record) => (
                          <Fragment key={record.id}>
                            <tr
                              onClick={() =>
                                setExpandedId(expandedId === record.id ? null : record.id)
                              }
                              className="cursor-pointer hover:bg-slate-50"
                            >
                              <td className="py-3 pr-4">
                                <div className="flex items-center gap-2">
                                  {record.recyclable ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                                  ) : (
                                    <XCircle className="h-4 w-4 shrink-0 text-amber-500" />
                                  )}
                                  <span className="font-semibold text-slate-900">
                                    {record.predictedLabel}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 pr-4">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                    record.recyclable
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  }`}
                                >
                                  {record.recyclable ? "Recyclable" : "Non-Recyclable"}
                                </span>
                              </td>
                              <td className="py-3 pr-4">
                                <ConfidenceBadge confidence={record.confidence} />
                              </td>
                              <td className="py-3 pr-4 text-slate-600">{record.material}</td>
                              <td className="py-3 pr-4">
                                <span
                                  className={`text-xs font-semibold ${
                                    record.contamination === "Low"
                                      ? "text-emerald-700"
                                      : record.contamination === "Medium"
                                      ? "text-amber-700"
                                      : "text-rose-700"
                                  }`}
                                >
                                  {record.contamination}
                                </span>
                              </td>
                              <td className="py-3 text-xs text-slate-400">
                                {formatDate(record.createdAt)}
                              </td>
                            </tr>
                            {expandedId === record.id && (
                              <tr key={`${record.id}-detail`} className="bg-slate-50">
                                <td colSpan={6} className="px-4 py-3">
                                  <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
                                    <p className="font-semibold text-slate-900">Recommendation</p>
                                    <p className="mt-1">{record.recommendation}</p>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile card list */}
                  <div className="space-y-3 md:hidden">
                    {records.map((record) => (
                      <div
                        key={record.id}
                        onClick={() =>
                          setExpandedId(expandedId === record.id ? null : record.id)
                        }
                        className="cursor-pointer rounded-xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {record.recyclable ? (
                              <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                            ) : (
                              <XCircle className="h-5 w-5 shrink-0 text-amber-500" />
                            )}
                            <div>
                              <p className="font-semibold text-slate-900">{record.predictedLabel}</p>
                              <p className="text-xs text-slate-500">
                                {record.recyclable ? "Recyclable" : "Non-Recyclable"} &middot;{" "}
                                {record.material}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <ConfidenceBadge confidence={record.confidence} />
                            <p className="mt-1 text-[11px] text-slate-400">
                              {formatDate(record.createdAt)}
                            </p>
                          </div>
                        </div>
                        {expandedId === record.id && (
                          <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700">
                            <p className="font-semibold">Recommendation</p>
                            <p className="mt-1">{record.recommendation}</p>
                          </div>
                        )}
                      </div>
                    ))}
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
