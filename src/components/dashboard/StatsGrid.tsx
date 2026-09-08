"use client";

import { useEffect, useState } from "react";
import { DashboardCard } from "@/components/dashboard/DashboardCard";
import type { FeedbackStats } from "@/lib/types";

const initialStats: FeedbackStats = {
  totalPredictions: 0,
  averageConfidence: 0,
  recyclableItems: 0,
  nonRecyclableItems: 0,
  feedbackAccuracy: 0,
  mostCommonWaste: "Plastic Bottle",
  wasteDistribution: [],
  contaminationLevels: [],
  feedbackTrends: [],
  predictionAccuracy: 0,
};

export function StatsGrid() {
  const [stats, setStats] = useState<FeedbackStats>(initialStats);

  useEffect(() => {
    async function loadStatistics() {
      try {
        const data = await fetch("/api/statistics").then((r) => r.json());
        setStats(data);
      } catch {
        setStats(initialStats);
      }
    }

    loadStatistics();
  }, []);

  const cards = [
    {
      title: "Total Predictions",
      value: String(stats.totalPredictions),
      detail: "Images analyzed by AI",
      accent: "bg-emerald-50",
    },
    {
      title: "Average Confidence",
      value: `${stats.averageConfidence.toFixed(1)}%`,
      detail: "Model certainty score",
      accent: "bg-sky-50",
    },
    {
      title: "Recyclable Waste",
      value: String(stats.recyclableItems),
      detail: "Positive sorting classifications",
      accent: "bg-teal-50",
    },
    {
      title: "Non-Recyclable Waste",
      value: String(stats.nonRecyclableItems),
      detail: "Special disposal classifications",
      accent: "bg-amber-50",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((stat) => (
        <DashboardCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
