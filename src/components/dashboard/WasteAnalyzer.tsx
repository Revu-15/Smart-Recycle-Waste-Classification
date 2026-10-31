/* eslint-disable @next/next/no-img-element */
"use client";

import { useRef, useState } from "react";

type Detection = {
  component?: string;
  label?: string;
  type?: string;
  category?: string;
  recyclable: boolean;
  confidence: number;
  material?: string;
};

export default function WasteAnalyzer() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Detection[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleChoose() {
    fileInputRef.current?.click();
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setResults(null);
    setError(null);
    if (f) setPreview(URL.createObjectURL(f));
  }

  async function analyze() {
    if (!file) return setError("Please choose or take a photo first.");
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/analyze", {
        method: "POST",
        body: fd,
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setResults(data.detections ?? []);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : String(caughtError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h3 className="mb-2 text-lg font-semibold">Waste Analyzer</h3>
      <p className="mb-4 text-sm text-slate-500">Upload or take a photo of waste to identify recyclable components.</p>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleChoose}
          className="rounded bg-green-600 px-3 py-2 text-sm text-white hover:bg-green-700"
        >
          Choose / Take Photo
        </button>
        <button
          type="button"
          onClick={analyze}
          disabled={!file || loading}
          className="rounded bg-blue-600 px-3 py-2 text-sm text-white disabled:opacity-50 hover:bg-blue-700"
        >
          {loading ? "Analyzing…" : "Analyze"}
        </button>
        <input
          ref={fileInputRef}
          onChange={onFileChange}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
        />
      </div>

      {preview && (
        <div className="mt-4">
          <img src={preview} alt="preview" className="max-h-52 w-auto rounded border" />
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {results && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-medium">Detected components</h4>
          {results.length === 0 && <p className="text-sm text-slate-500">No components detected.</p>}
          <ul className="space-y-2">
            {results.map((r, idx) => (
              <li key={idx} className="flex items-center justify-between rounded border p-3">
                <div>
                  <div className="text-sm font-medium">{r.component ?? r.label ?? r.type ?? "Detected object"}</div>
                  <div className="text-xs text-slate-500">Category: {r.category ?? r.material ?? "Unspecified"} • Confidence: {(r.confidence * 100).toFixed(0)}%</div>
                </div>
                <div className="text-sm font-semibold text-slate-700">{r.recyclable ? "Recyclable" : "Not recyclable"}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
