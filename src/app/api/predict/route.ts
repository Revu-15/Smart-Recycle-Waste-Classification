import { NextResponse } from "next/server";
import { addPredictionToLog } from "@/lib/server-store";
import type { PredictionResponse } from "@/lib/types";
import { inferWasteWithYolo } from "@/lib/yolo-model";
import { shouldProxyToBackend, proxyToBackend } from "@/lib/backend-proxy";

export async function POST(request: Request) {
  if (shouldProxyToBackend()) {
    const proxied = await proxyToBackend(request, "/api/predict");
    if (proxied) return proxied;
  }

  try {
    const form = await request.formData();
    const image = form.get("image") as File | null;
    const imageDataUrl = form.get("imageDataUrl") as string | null;

    if (!image || !(image instanceof File)) {
      return NextResponse.json({ error: "Image upload failed." }, { status: 400 });
    }

    const prediction = await inferWasteWithYolo(image);
    const response: PredictionResponse = {
      ...prediction,
      detections: prediction.detections ?? [
        {
          type: prediction.prediction,
          label: prediction.prediction,
          material: prediction.material,
          confidence: prediction.confidence,
          recyclable: prediction.recyclable,
          contamination: prediction.contamination,
          cleaning: prediction.cleaning,
          recommendation: prediction.recommendation,
          explanation: prediction.explanation,
          alternatives: prediction.alternatives,
          boundingBox: prediction.objects?.[0]?.boundingBox,
        },
      ],
    };

    await addPredictionToLog(response, imageDataUrl ?? image.name ?? "unknown-image");

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to classify image.";
    console.error("[predict] prediction failure", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
