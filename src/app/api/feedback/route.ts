import { NextResponse } from "next/server";
import { addFeedbackRecord, getFeedbackRecords } from "@/lib/server-store";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const normalizedBody = {
      ...body,
      correctLabel: body.correctLabel ?? body.correctedLabel ?? body.predictedLabel,
      userFeedback: body.userFeedback ?? body.feedbackType ?? "incorrect",
    };

    const record = await addFeedbackRecord(normalizedBody);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save feedback." }, { status: 500 });
  }
}

export async function GET() {
  const records = await getFeedbackRecords();
  return NextResponse.json(records, { status: 200 });
}
