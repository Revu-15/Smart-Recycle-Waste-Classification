import type { FeedbackRecord, FeedbackStats, FeedbackSubmissionPayload, PredictionResponse, WasteCategory } from "@/lib/types";

const jsonHeaders = {
  "Content-Type": "application/json",
};

export async function classifyWaste(file: File, imageDataUrl?: string) {
  const formData = new FormData();
  formData.append("image", file);
  if (imageDataUrl) {
    formData.append("imageDataUrl", imageDataUrl);
  }

  const response = await fetch("/api/predict", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const message = await response.json().catch(() => null);
    throw new Error((message as { error?: string } | null)?.error || "Unable to classify image.");
  }

  return response.json() as Promise<PredictionResponse>;
}

export async function submitFeedback(payload: FeedbackSubmissionPayload) {
  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: jsonHeaders,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.json().catch(() => null);
    throw new Error((message as { error?: string } | null)?.error || "Unable to save feedback.");
  }

  return response.json() as Promise<FeedbackRecord>;
}

export async function getCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Unable to load categories.");
  }
  return response.json() as Promise<WasteCategory[]>;
}

export async function getStatistics() {
  const response = await fetch("/api/statistics");
  if (!response.ok) {
    throw new Error("Unable to load statistics.");
  }
  return response.json() as Promise<FeedbackStats>;
}
