import { NextResponse } from "next/server";
import { getFeedbackRecords, getPredictionLog } from "@/lib/server-store";

export async function GET() {
  const feedbackRecords = await getFeedbackRecords();
  const predictionLog = await getPredictionLog();

  const totalPredictions = predictionLog.length || 1;
  const averageConfidence = predictionLog.reduce((sum, item) => sum + item.confidence, 0) / totalPredictions;
  const recyclableItems = predictionLog.filter((item) => item.recyclable).length;
  const nonRecyclableItems = predictionLog.length - recyclableItems;
  const feedbackAccuracy = feedbackRecords.length
    ? (feedbackRecords.filter((record) => record.correctLabel === record.predictedLabel).length / feedbackRecords.length) * 100
    : 76;

  const distribution = predictionLog.reduce<Record<string, number>>((accumulator, item) => {
    accumulator[item.predictedLabel] = (accumulator[item.predictedLabel] ?? 0) + 1;
    return accumulator;
  }, {});

  const wasteDistribution = Object.entries(distribution)
    .map(([name, value]) => ({ name, value }))
    .sort((left, right) => right.value - left.value);

  const contaminationLevels = [
    { name: "Low", value: predictionLog.filter((item) => item.contamination === "Low").length },
    { name: "Medium", value: predictionLog.filter((item) => item.contamination === "Medium").length },
    { name: "High", value: predictionLog.filter((item) => item.contamination === "High").length },
  ];

  const feedbackTrends = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const dayKey = date.toISOString().slice(0, 10);
    const dayRecords = feedbackRecords.filter((record) => record.timestamp.toISOString().startsWith(dayKey));

    return {
      date: dayKey,
      correct: dayRecords.filter((record) => record.userFeedback === "correct").length,
      incorrect: dayRecords.filter((record) => record.userFeedback === "incorrect").length,
    };
  });

  return NextResponse.json({
    totalPredictions,
    averageConfidence: Number(averageConfidence.toFixed(1)),
    recyclableItems,
    nonRecyclableItems,
    feedbackAccuracy: Number(feedbackAccuracy.toFixed(1)),
    mostCommonWaste: wasteDistribution[0]?.name ?? "Plastic Bottle",
    wasteDistribution: wasteDistribution.length ? wasteDistribution : [{ name: "Plastic Bottle", value: 1 }],
    contaminationLevels,
    feedbackTrends,
    predictionAccuracy: Number(feedbackAccuracy.toFixed(1)),
  }, { status: 200 });
}
