import { useCallback, useMemo, useState } from "react";
import { classifyWaste, submitFeedback } from "@/lib/api";
import type { PredictionResponse } from "@/lib/types";

const FORMAT_JPEG_QUALITY = 0.72;

function compressImageFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDimension = 1600;
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));

        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Unable to initialize image processing canvas."));
          return;
        }

        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", FORMAT_JPEG_QUALITY));
      };
      img.onerror = () => reject(new Error("Unable to read image file."));
      img.src = String(reader.result);
    };

    reader.onerror = () => reject(new Error("Unable to read the selected file."));
    reader.readAsDataURL(file);
  });
}

export function useWasteClassifier() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const imageInfo = useMemo(() => {
    if (!file) return "No file selected";
    return `${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }, [file]);

  const setSelectedFile = useCallback((nextFile: File | null) => {
    setFile(nextFile);
    setError(null);
    setPrediction(null);
    setFeedbackSubmitted(false);

    if (!nextFile) {
      setPreview(null);
      return;
    }

    const nextPreview = URL.createObjectURL(nextFile);
    setPreview((currentPreview) => {
      if (currentPreview) URL.revokeObjectURL(currentPreview);
      return nextPreview;
    });
  }, []);

  const analyzeImage = useCallback(async () => {
    if (!file) {
      setError("Choose an image first.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setFeedbackSubmitted(false);

    try {
      const compressedPreview = await compressImageFile(file);
      const result = await classifyWaste(file, compressedPreview);
      setPrediction(result);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Prediction failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }, [file]);

  const submitUserFeedback = useCallback(async (userFeedback: "correct" | "incorrect", correctLabel: string) => {
    if (!prediction || !file) {
      setError("Image upload failed.");
      return;
    }

    try {
      await submitFeedback({
        image: preview ?? file.name,
        predictedLabel: prediction.prediction,
        correctLabel,
        confidence: prediction.confidence,
        userFeedback,
        feedbackType: userFeedback,
        correctedLabel: correctLabel,
        timestamp: new Date().toISOString(),
      });
      setFeedbackSubmitted(true);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save feedback.");
    }
  }, [file, prediction, preview]);

  return {
    file,
    preview,
    prediction,
    isAnalyzing,
    error,
    feedbackSubmitted,
    imageInfo,
    setSelectedFile,
    analyzeImage,
    submitUserFeedback,
  };
}
