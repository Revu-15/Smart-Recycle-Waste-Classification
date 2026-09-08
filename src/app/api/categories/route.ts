import { NextResponse } from "next/server";
import { wasteCategories } from "@/lib/waste-data";

export async function GET() {
  return NextResponse.json(wasteCategories, { status: 200 });
}
