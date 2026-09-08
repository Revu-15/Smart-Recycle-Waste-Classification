"use client";

import { useEffect, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { FeedbackStats } from "@/lib/types";

const CHART_COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6", "#f97316",
];

const MAX_SLICES = 5;

function collapseToTopN(
  distribution: Array<{ name: string; value: number }>
): Array<{ name: string; value: number }> {
  if (distribution.length <= MAX_SLICES) return distribution;

  const sorted = [...distribution].sort((a, b) => b.value - a.value);
  const top = sorted.slice(0, MAX_SLICES);
  const othersValue = sorted.slice(MAX_SLICES).reduce((sum, d) => sum + d.value, 0);

  if (othersValue > 0) {
    top.push({ name: "Others", value: othersValue });
  }

  return top;
}

export function WasteChart() {
  const [stats, setStats] = useState<FeedbackStats | null>(null);

  useEffect(() => {
    async function loadStatistics() {
      try {
        const response = await fetch("/api/statistics");
        const data = await response.json();
        setStats(data);
      } catch {
        // keep null — empty state
      }
    }

    loadStatistics();
  }, []);

  const rawData = stats?.wasteDistribution?.length
    ? stats.wasteDistribution
    : [{ name: "No data yet", value: 1 }];

  const data = collapseToTopN(rawData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Type of Waste Classified</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                formatter={(value: number, name: string) => [`${value} predictions`, name]}
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
              <Pie
                data={data}
                dataKey="value"
                outerRadius={90}
                innerRadius={55}
                paddingAngle={2}
                label={({ percent }) =>
                  percent > 0.06 ? `${(percent * 100).toFixed(0)}%` : ""
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                iconSize={8}
                formatter={(value) => (
                  <span style={{ fontSize: 11, color: "#64748b" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
