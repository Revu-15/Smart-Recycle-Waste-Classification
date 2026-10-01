import { NextResponse } from "next/server";
import { addPredictionToLog } from "@/lib/server-store";
import type { PredictionResponse } from "@/lib/types";
import { inferWasteWithYolo } from "@/lib/yolo-model";
import { shouldProxyToBackend, proxyFormDataToBackend } from "@/lib/backend-proxy";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("image") as File | null;
    const imageDataUrl = form.get("imageDataUrl") as string | null;

    if (!image || !(image instanceof File)) {
      return NextResponse.json({ error: "Image upload failed." }, { status: 400 });
    }

    // If running on Vercel, try proxying to Render with a strict 4.5s max timeout
    if (shouldProxyToBackend()) {
      const proxiedForm = new FormData();
      proxiedForm.append("image", image);
      if (imageDataUrl) proxiedForm.append("imageDataUrl", imageDataUrl);

      const proxied = await proxyFormDataToBackend("/api/predict", proxiedForm, 4500);
      if (proxied) {
        return proxied;
      }
    }

    // Fast sub-second local inference (fallback ensures response is ALWAYS within 1-3 seconds)
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

    // Store in background, do not block the HTTP response
    addPredictionToLog(response, imageDataUrl ?? image.name ?? "unknown-image").catch((err) => {
      console.warn("[predict] log recording note:", err);
    });

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to classify image.";
    console.error("[predict] prediction failure", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
