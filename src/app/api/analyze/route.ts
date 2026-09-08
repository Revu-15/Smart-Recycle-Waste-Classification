import { NextResponse } from "next/server";
import { inferWasteWithYolo } from "@/lib/yolo-model";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const image = form.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json({ error: "Image upload failed." }, { status: 400 });
    }

    const prediction = await inferWasteWithYolo(image);
    return NextResponse.json({ detections: prediction.detections ?? [] }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
