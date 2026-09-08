import { NextResponse } from "next/server";
import { getPredictionLog } from "@/lib/server-store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
  const filter = searchParams.get("filter") ?? "all";
  const sort = searchParams.get("sort") ?? "newest";
  const search = searchParams.get("search") ?? "";

  let records = await getPredictionLog();

  // Search
  if (search) {
    records = records.filter((r) =>
      r.predictedLabel.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Filter
  if (filter === "recyclable") {
    records = records.filter((r) => r.recyclable);
  } else if (filter === "non-recyclable") {
    records = records.filter((r) => !r.recyclable);
  } else if (filter === "low-confidence") {
    records = records.filter((r) => r.confidence < 70);
  }

  // Sort
  if (sort === "oldest") {
    records = [...records].reverse();
  } else if (sort === "highest-confidence") {
    records = [...records].sort((a, b) => b.confidence - a.confidence);
  } else if (sort === "lowest-confidence") {
    records = [...records].sort((a, b) => a.confidence - b.confidence);
  }
  // newest is default (already ordered by createdAt desc from getPredictionLog)

  if (limit) {
    records = records.slice(0, limit);
  }

  return NextResponse.json(records, { status: 200 });
}
