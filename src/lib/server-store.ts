import { prisma } from "@/lib/prisma";
import type { FeedbackRecord, PredictionResponse } from "@/lib/types";

export async function addPredictionToLog(prediction: PredictionResponse, image: string) {
  await prisma.predictionLog.create({
    data: {
      image,
      predictedLabel: prediction.prediction,
      confidence: prediction.confidence,
      material: prediction.material,
      recyclable: prediction.recyclable,
      contamination: prediction.contamination,
      cleaning: prediction.cleaning,
      recommendation: prediction.recommendation,
      explanation: prediction.explanation,
      alternatives: prediction.alternatives,
    },
  });
}

export async function addFeedbackRecord(record: Omit<FeedbackRecord, "id" | "timestamp" | "status"> & { id?: string; correctedLabel?: string; feedbackType?: "correct" | "incorrect" }) {
  return prisma.feedback.create({
    data: {
      id: record.id ?? crypto.randomUUID(),
      image: record.image,
      predictedLabel: record.predictedLabel,
      correctLabel: record.correctLabel ?? record.correctedLabel ?? record.predictedLabel,
      confidence: record.confidence,
      userFeedback: record.userFeedback ?? record.feedbackType ?? "incorrect",
      status: "stored",
      timestamp: new Date(),
    },
  });
}

export async function getFeedbackRecords() {
  return prisma.feedback.findMany({
    orderBy: { timestamp: "desc" },
  });
}

export async function getPredictionLog() {
  return prisma.predictionLog.findMany({
    orderBy: { createdAt: "desc" },
  });
}
