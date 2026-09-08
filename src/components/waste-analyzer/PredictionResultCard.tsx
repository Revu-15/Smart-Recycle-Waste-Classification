"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Info,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Sparkle,
  Recycle,
  AlertTriangle,
  Layers,
  SparklesIcon,
} from "lucide-react";
import type { PredictionResponse } from "@/lib/types";
import { wasteCategories } from "@/lib/waste-data";

export function PredictionResultCard({
  prediction,
  onFeedback,
}: {
  prediction: PredictionResponse;
  onFeedback: (feedback: "correct" | "incorrect", correctLabel: string) => Promise<void>;
}) {
  const [selectedCorrectLabel, setSelectedCorrectLabel] = useState("Plastic Bottle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [helpfulStatus, setHelpfulStatus] = useState<"helpful" | "not_helpful" | null>(null);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);

  const detectedObjects = useMemo(() => {
    if (prediction.objects && prediction.objects.length > 0) {
      return prediction.objects;
    }
    return [
      {
        label: prediction.prediction,
        confidence: prediction.confidence,
        boundingBox: { x: 0, y: 0, width: 100, height: 100 },
        material: prediction.material,
        recyclable: prediction.recyclable,
        contamination: prediction.contamination,
        recommendation: prediction.recommendation,
        explanation: prediction.explanation,
      },
    ];
  }, [prediction]);

  async function handleFeedback(feedbackType: "correct" | "incorrect", customLabel?: string) {
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const correctLabel = feedbackType === "correct" ? prediction.prediction : (customLabel ?? selectedCorrectLabel);
      await onFeedback(feedbackType, correctLabel);
      setHelpfulStatus(feedbackType === "correct" ? "helpful" : "not_helpful");
      setFeedbackMessage(
        feedbackType === "correct"
          ? "Thank you! Your feedback helps train our YOLO recycling model."
          : `Correction recorded for "${correctLabel}". Thank you!`
      );
      if (feedbackType === "correct") {
        setShowCorrectionForm(false);
      }
    } catch {
      setFeedbackMessage("Unable to save feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isRecyclable = prediction.recyclable;
  const contaminationColor =
    prediction.contamination === "Low"
      ? "text-emerald-700 bg-emerald-50 border-emerald-200"
      : prediction.contamination === "Medium"
      ? "text-amber-700 bg-amber-50 border-amber-200"
      : "text-rose-700 bg-rose-50 border-rose-200";

  return (
    <div className="space-y-6">
      {/* Top Main Result Banner */}
      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-xl shadow-emerald-50/50 backdrop-blur transition-all">
        <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-800">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
                Primary YOLO Detection
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                {prediction.prediction}
              </h2>
              <p className="text-sm font-medium text-slate-500">
                Material Classification: <span className="font-semibold text-slate-800">{prediction.material}</span>
              </p>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-bold shadow-sm ${
                  isRecyclable
                    ? "border-emerald-200 bg-emerald-500 text-white"
                    : "border-amber-200 bg-amber-500 text-white"
                }`}
              >
                {isRecyclable ? (
                  <>
                    <Recycle className="h-4 w-4" /> Recyclable
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-4 w-4" /> Non-Recyclable / Special
                  </>
                )}
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Confidence: <span className="text-emerald-700 font-bold">{prediction.confidence.toFixed(1)}%</span>
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-all hover:bg-white hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Material</p>
            <p className="mt-1 text-base font-bold text-slate-900">{prediction.material}</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-all hover:bg-white hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Recyclability</p>
            <p className={`mt-1 text-base font-bold ${isRecyclable ? "text-emerald-600" : "text-amber-600"}`}>
              {isRecyclable ? "Accepted in Recycling" : "Special Handling"}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-all hover:bg-white hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Contamination Risk</p>
            <span className={`mt-1 inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold ${contaminationColor}`}>
              {prediction.contamination} Risk
            </span>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-all hover:bg-white hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Objects Found</p>
            <p className="mt-1 text-base font-bold text-slate-900">{detectedObjects.length} item(s)</p>
          </div>
        </div>

        {/* Action Recommendations */}
        <div className="border-t border-slate-100 bg-slate-50/40 p-6 space-y-4">
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/80 p-4 text-emerald-950 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-emerald-800">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              Disposal & Sorting Recommendation
            </div>
            <p className="mt-1.5 text-sm font-medium leading-relaxed text-emerald-900">
              {prediction.recommendation}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Sparkle className="h-4 w-4 text-teal-600" />
              Cleaning & Preparation Instructions
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              {prediction.cleaning}
            </p>
          </div>
        </div>
      </div>

      {/* Detected Objects Breakdown List */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <Layers className="h-5 w-5 text-emerald-600" />
            <h3 className="text-lg font-bold text-slate-900">Detected Recyclable Objects</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {detectedObjects.length} localized items
          </span>
        </div>

        <div className="mt-4 grid gap-4">
          {detectedObjects.map((object, index) => (
            <div
              key={`detected-object-${object.label}-${index}`}
              className="group relative rounded-2xl border border-slate-200 bg-slate-50/70 p-5 transition-all hover:border-emerald-300 hover:bg-white hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <h4 className="text-base font-bold text-slate-900">{object.label}</h4>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      object.recyclable ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {object.recyclable ? "Recyclable" : "Non-Recyclable"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                  <span>Confidence: <strong className="text-slate-800">{object.confidence.toFixed(1)}%</strong></span>
                  <span>Box: <strong className="text-slate-800">{Math.round(object.boundingBox.width)}×{Math.round(object.boundingBox.height)} px</strong></span>
                </div>
              </div>

              <div className="mt-3 grid gap-2 text-xs font-medium text-slate-600 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-2.5 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Material Composition</span>
                  <span className="font-semibold text-slate-800">{object.material}</span>
                </div>
                <div className="rounded-xl bg-white p-2.5 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Contamination Level</span>
                  <span className="font-semibold text-slate-800">{object.contamination} Risk</span>
                </div>
                <div className="rounded-xl bg-white p-2.5 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Sorting Action</span>
                  <span className="font-semibold text-emerald-700">{object.recommendation}</span>
                </div>
              </div>

              {object.explanation && object.explanation.length > 0 && (
                <div className="mt-3.5 border-t border-slate-100 pt-3">
                  <p className="text-xs font-semibold text-slate-500 mb-1.5">Visual Cues & Rationale:</p>
                  <div className="flex flex-wrap gap-2">
                    {object.explanation.map((item, itemIdx) => (
                      <span
                        key={`object-exp-${index}-${itemIdx}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Explainable AI Summary & Alternatives */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-3">
            <Info className="h-5 w-5 text-emerald-600" />
            Explainable AI (XAI) Cues
          </div>
          <ul className="mt-4 space-y-2.5 text-sm text-slate-700">
            {prediction.explanation.map((item, index) => (
              <li key={`pred-expl-${index}`} className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-slate-800 font-medium leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 font-bold text-slate-900 border-b border-slate-100 pb-3">
            <SparklesIcon className="h-5 w-5 text-teal-600" />
            Class Confidence Scores
          </div>
          <div className="mt-4 space-y-3.5">
            {prediction.alternatives.map((alternative, index) => (
              <div key={`alt-${alternative.label}-${index}`} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{alternative.label}</span>
                  <span className="text-emerald-700 font-bold">{alternative.confidence.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, alternative.confidence))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review / Was this Helpful Section */}
      <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/30 p-6 shadow-md shadow-emerald-100/40">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Was this analysis helpful?</h3>
            <p className="text-xs text-slate-500">Your feedback continuously trains and refines the YOLO sorting pipeline.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFeedback("correct")}
              disabled={isSubmitting || helpfulStatus === "helpful"}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-sm ${
                helpfulStatus === "helpful"
                  ? "bg-emerald-600 text-white"
                  : "border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50"
              }`}
            >
              <ThumbsUp className="h-4 w-4 text-emerald-600" />
              Helpful & Correct
            </button>
            <button
              onClick={() => {
                setShowCorrectionForm(true);
              }}
              disabled={isSubmitting}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all shadow-sm ${
                showCorrectionForm
                  ? "bg-rose-500 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-700"
              }`}
            >
              <ThumbsDown className="h-4 w-4 text-rose-500" />
              Needs Correction
            </button>
          </div>
        </div>

        {/* Correction Drawer / Form */}
        {showCorrectionForm && (
          <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/50 p-4 transition-all animate-in fade-in">
            <p className="text-xs font-bold uppercase tracking-wider text-rose-900 mb-2">
              Select the correct item class:
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={selectedCorrectLabel}
                onChange={(event) => setSelectedCorrectLabel(event.target.value)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 shadow-sm focus:border-emerald-500 focus:outline-none"
              >
                {wasteCategories.map((category) => (
                  <option key={`opt-${category.id}`} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleFeedback("incorrect", selectedCorrectLabel)}
                disabled={isSubmitting}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-slate-800 disabled:opacity-60"
              >
                Submit Correction
              </button>
              <button
                onClick={() => setShowCorrectionForm(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {feedbackMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <CircleAlert className="h-4 w-4 text-emerald-600" />
          User feedback corrections are automatically logged to create future YOLO retraining annotation datasets.
        </div>
      </div>
    </div>
  );
}
