/* eslint-disable @next/next/no-img-element */
"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  UploadCloud,
  HelpCircle,
  Info,
  Sparkles,
  Recycle,
  ShieldCheck,
  CheckCircle2,
  X,
  ArrowRight,
  RefreshCcw,
  BookOpen,
  Lock,
  UserPlus,
  LogIn,
  LogOut,
} from "lucide-react";
import { useWasteClassifier } from "@/hooks/useWasteClassifier";
import { isAuthenticated, getCurrentUser, logout, subscribeToAuth, type UserSession } from "@/lib/auth";
import { wasteCategories } from "@/lib/waste-data";

const PredictionResultCard = dynamic(
  () => import("@/components/waste-analyzer/PredictionResultCard").then((mod) => mod.PredictionResultCard),
  { ssr: false }
);

const supportedFormats = ["JPEG", "PNG", "WebP"];

export default function WasteAnalyzerPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState<"upload" | "results" | "help" | "how-it-works">("upload");
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("Ready to capture");
  const [dragActive, setDragActive] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const {
    preview,
    prediction,
    isAnalyzing,
    error,
    imageInfo,
    setSelectedFile,
    analyzeImage,
    submitUserFeedback,
  } = useWasteClassifier();

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    const unsubscribe = subscribeToAuth(() => {
      setCurrentUser(getCurrentUser());
    });

    return () => {
      unsubscribe();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  function requireAuth(): boolean {
    if (!isAuthenticated() || !currentUser) {
      setShowAuthModal(true);
      return false;
    }
    return true;
  }

  async function handleAnalyze() {
    if (!requireAuth()) return;
    await analyzeImage();
    setActiveTab("results");
  }

  async function startCamera() {
    if (!requireAuth()) return;
    setCameraStatus("Requesting camera access...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOpen(true);
      setCameraStatus("Camera live");
    } catch {
      setCameraStatus("Unable to access camera. Please check permissions or upload a file.");
    }
  }

  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
    setCameraStatus("Camera stopped");
  }

  function captureFromCamera() {
    if (!requireAuth()) return;
    if (!videoRef.current || !streamRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const context = canvas.getContext("2d");
    if (!context) return;

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], "camera-waste-capture.jpg", { type: "image/jpeg" });
      setSelectedFile(file);
      stopCamera();
    }, "image/jpeg", 0.92);
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!requireAuth()) {
      event.target.value = "";
      return;
    }
    const nextFile = event.target.files?.[0] ?? null;
    setSelectedFile(nextFile);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
    if (!requireAuth()) {
      return;
    }
    const nextFile = event.dataTransfer.files?.[0] ?? null;
    setSelectedFile(nextFile);
  }

  function handleChooseFileClick() {
    if (!requireAuth()) return;
    fileInputRef.current?.click();
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.18),rgba(255,255,255,0))] bg-slate-50 text-slate-900">
      {/* Top Brand Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 transition-transform hover:scale-105">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white shadow-md shadow-emerald-500/20">
              <Recycle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900">
                Smart<span className="text-emerald-600">Recycle</span>
              </span>
              <span className="hidden text-xs font-semibold text-emerald-700 sm:inline-block ml-2 rounded-full bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                YOLOv11 XAI Engine
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowHowItWorksModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:text-sm"
            >
              <Info className="h-4 w-4 text-emerald-600" />
              <span className="hidden sm:inline">How It Works</span>
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 sm:text-sm"
            >
              <HelpCircle className="h-4 w-4 text-teal-600" />
              <span className="hidden sm:inline">Need Help?</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white uppercase">
                    {currentUser.name ? currentUser.name[0] : "U"}
                  </span>
                  <span className="hidden md:inline font-medium">{currentUser.name}</span>
                </div>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-white px-3.5 py-1.5 text-xs font-bold text-emerald-800 shadow-sm transition hover:bg-emerald-50"
                >
                  Dashboard <ArrowRight className="h-3 w-3" />
                </button>
                <button
                  onClick={() => logout(router)}
                  className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login?mode=signin&returnUrl=/waste-analyzer"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition sm:text-sm"
                >
                  <LogIn className="h-4 w-4 text-slate-600" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/login?mode=signup&returnUrl=/waste-analyzer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm shadow-emerald-600/20 transition hover:from-emerald-700 hover:to-teal-700 sm:text-sm"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-8">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-teal-50/20 p-6 shadow-xl shadow-emerald-50/40 sm:p-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white/90 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-sm backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600 animate-spin" style={{ animationDuration: "6s" }} />
              Explainable AI for Modern Waste Sorting
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Turn visual waste into an <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">explainable recycling decision</span>
            </h1>

            <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
              Upload an image or take a photo to detect recyclable materials, locate items with YOLO bounding boxes, evaluate contamination risk, and receive human-readable recycling guidance.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => setShowHowItWorksModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <Info className="h-4 w-4 text-teal-600" />
                How It Works
              </button>

              <button
                onClick={() => setShowHelpModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <HelpCircle className="h-4 w-4 text-emerald-600" />
                Need Help?
              </button>
            </div>
          </div>

          {/* Waste Categories Mini Carousel / Grid in Header */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {wasteCategories.slice(0, 6).map((cat) => (
              <div
                key={`hero-cat-${cat.id}`}
                className="rounded-2xl border border-slate-100 bg-white/80 p-3 shadow-sm backdrop-blur transition hover:scale-105 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{cat.icon}</span>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                </div>
                <p className="mt-2 text-xs font-bold text-slate-900">{cat.name}</p>
                <p className="line-clamp-1 text-[11px] text-slate-500">{cat.materialInfo}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow Tabs Navigation */}
        <div className="flex items-center justify-between border-b border-slate-200">
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("upload")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
                activeTab === "upload"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <UploadCloud className="h-4 w-4" />
              1. Scan & Upload
            </button>

            <button
              onClick={() => setActiveTab("results")}
              className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all ${
                activeTab === "results"
                  ? "border-emerald-600 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              2. Analysis Results
              {prediction && (
                <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-800">
                  Ready
                </span>
              )}
            </button>

            <button
              onClick={() => setShowHelpModal(true)}
              className="hidden sm:flex items-center gap-2 border-b-2 border-transparent px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <HelpCircle className="h-4 w-4" />
              Need Help?
            </button>
          </div>

          {preview && (
            <button
              onClick={() => {
                setSelectedFile(null);
                setActiveTab("upload");
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600"
            >
              <RefreshCcw className="h-3.5 w-3.5" />
              Clear Selection
            </button>
          )}
        </div>

        {/* Dynamic Workflow Views */}
        {activeTab === "upload" && (
          <section className="grid gap-8 lg:grid-cols-[1fr_1fr] items-start">
            {/* Left Upload & Camera Controls */}
            <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <UploadCloud className="h-5 w-5 text-emerald-600" />
                  Image Upload & Camera Scan
                </div>
                <span className="text-xs font-medium text-slate-500">Formats: {supportedFormats.join(", ")}</span>
              </div>

              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!currentUser) return;
                  setDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setDragActive(false);
                }}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
                  !currentUser
                    ? "border-amber-200 bg-amber-50/40"
                    : dragActive
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-300 bg-slate-50/70 hover:border-emerald-400 hover:bg-emerald-50/30"
                }`}
              >
                {!currentUser ? (
                  <div className="flex flex-col items-center max-w-md">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm">
                      <Lock className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900">
                      Account Required to Upload
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                      You cannot upload or scan images without an account. Please create an account or sign in to start classifying waste with our YOLOv11 AI model.
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <Link
                        href="/login?mode=signup&required=1&returnUrl=/waste-analyzer"
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition hover:from-emerald-700 hover:to-teal-700"
                      >
                        <UserPlus className="h-4 w-4" />
                        Create Account
                      </Link>

                      <Link
                        href="/login?mode=signin&required=1&returnUrl=/waste-analyzer"
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                      >
                        <LogIn className="h-4 w-4 text-emerald-600" />
                        Sign In
                      </Link>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Or click below to browse/camera:</span>
                    </div>

                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={handleChooseFileClick}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        <ImageIcon className="h-3.5 w-3.5 text-slate-500" />
                        Choose File
                      </button>
                      <button
                        onClick={startCamera}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        <Camera className="h-3.5 w-3.5 text-slate-500" />
                        Live Camera
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                      <UploadCloud className="h-7 w-7" />
                    </div>
                    <h3 className="mt-4 text-base font-bold text-slate-900">
                      Drag and drop your waste photo here
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      or select an option to choose from gallery or use camera
                    </p>

                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <button
                        onClick={handleChooseFileClick}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white shadow transition hover:bg-slate-800"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Choose File
                      </button>

                      <button
                        onClick={startCamera}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                      >
                        <Camera className="h-4 w-4 text-emerald-600" />
                        Live Camera
                      </button>
                    </div>
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={onFileChange}
                />

                {imageInfo && imageInfo !== "No file selected" && (
                  <div className="mt-4 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                    Selected: {imageInfo}
                  </div>
                )}
              </div>

              {/* Camera Stream Drawer */}
              {cameraOpen && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 p-4 text-white shadow-lg">
                  <video ref={videoRef} className="max-h-72 w-full rounded-xl object-contain bg-black" autoPlay muted playsInline />
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">{cameraStatus}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={captureFromCamera}
                        className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-600"
                      >
                        Capture Photo
                      </button>
                      <button
                        onClick={stopCamera}
                        className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Analyze CTA */}
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !preview}
                className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-emerald-600 px-5 py-3.5 text-base font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Running YOLO Inference...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Classify waste & Analyze Recyclability
                  </>
                )}
              </button>

              {error && (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-800">
                  {error}
                </div>
              )}
            </div>

            {/* Right Interactive Image Preview with Bounding Boxes */}
            <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ImageIcon className="h-5 w-5 text-emerald-600" />
                  Image Preview & Bounding Box Overlay
                </div>
                {prediction && (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Detection Active
                  </span>
                )}
              </div>

              {preview ? (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/5">
                  <img
                    src={preview}
                    alt="Selected waste preview"
                    className="max-h-[420px] w-full rounded-2xl object-contain"
                    onLoad={(e) => {
                      const target = e.currentTarget;
                      setImageSize({ width: target.naturalWidth, height: target.naturalHeight });
                    }}
                  />

                  {/* Bounding box visualization over detected objects */}
                  {prediction?.objects?.map((object, index) => {
                    const left = (object.boundingBox.x / Math.max(imageSize.width, 1)) * 100;
                    const top = (object.boundingBox.y / Math.max(imageSize.height, 1)) * 100;
                    const width = (object.boundingBox.width / Math.max(imageSize.width, 1)) * 100;
                    const height = (object.boundingBox.height / Math.max(imageSize.height, 1)) * 100;

                    return (
                      <div
                        key={`overlay-box-${object.label}-${index}`}
                        className="absolute rounded border-2 border-emerald-400 bg-emerald-500/20 transition-all hover:bg-emerald-500/35"
                        style={{
                          left: `${Math.max(0, left)}%`,
                          top: `${Math.max(0, top)}%`,
                          width: `${Math.max(6, width)}%`,
                          height: `${Math.max(6, height)}%`,
                        }}
                      >
                        <span className="absolute -top-6 left-0 rounded bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                          {object.label} ({object.confidence.toFixed(0)}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-400">
                  <ImageIcon className="h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-600">No Image Selected</p>
                  <p className="mt-1 text-xs text-slate-400">Upload a photo or capture one to preview here</p>
                </div>
              )}

              {prediction && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-emerald-800">Primary Prediction</p>
                      <p className="text-base font-bold text-slate-900">{prediction.prediction}</p>
                    </div>
                    <button
                      onClick={() => setActiveTab("results")}
                      className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700"
                    >
                      View Full Analysis <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Tab 2: Full Analysis & Results View */}
        {activeTab === "results" && (
          <section className="space-y-6">
            {prediction ? (
              <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] items-start">
                {/* Left Side: Sticky Image Preview with Bounding Boxes */}
                <div className="sticky top-20 space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-sm font-bold text-slate-900">Analyzed Image</span>
                    <button
                      onClick={() => setActiveTab("upload")}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Upload Another Photo
                    </button>
                  </div>

                  {preview && (
                    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/5">
                      <img
                        src={preview}
                        alt="Analyzed preview"
                        className="max-h-[380px] w-full rounded-2xl object-contain"
                        onLoad={(e) => {
                          const target = e.currentTarget;
                          setImageSize({ width: target.naturalWidth, height: target.naturalHeight });
                        }}
                      />

                      {/* Bounding box visualization over detected objects */}
                      {prediction.objects?.map((object, index) => {
                        const left = (object.boundingBox.x / Math.max(imageSize.width, 1)) * 100;
                        const top = (object.boundingBox.y / Math.max(imageSize.height, 1)) * 100;
                        const width = (object.boundingBox.width / Math.max(imageSize.width, 1)) * 100;
                        const height = (object.boundingBox.height / Math.max(imageSize.height, 1)) * 100;

                        return (
                          <div
                            key={`results-box-${object.label}-${index}`}
                            className="absolute rounded border-2 border-emerald-400 bg-emerald-500/20"
                            style={{
                              left: `${Math.max(0, left)}%`,
                              top: `${Math.max(0, top)}%`,
                              width: `${Math.max(6, width)}%`,
                              height: `${Math.max(6, height)}%`,
                            }}
                          >
                            <span className="absolute -top-6 left-0 rounded bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold text-white shadow">
                              {object.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs text-slate-600 space-y-1">
                    <p><strong>Item Name:</strong> {imageInfo}</p>
                    <p><strong>Model:</strong> YOLOv11 Recyclable Waste Classifier</p>
                    <p><strong>Inference Time:</strong> ~180ms</p>
                  </div>
                </div>

                {/* Right Side: Rich Result Card & Review */}
                <div>
                  <PredictionResultCard prediction={prediction} onFeedback={submitUserFeedback} />
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-600 shadow-sm">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Camera className="h-6 w-6" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">No active analysis</h3>
                <p className="mt-1 text-sm text-slate-500">Please upload or capture an image in the Scan tab first.</p>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700"
                >
                  <UploadCloud className="h-4 w-4" /> Go to Scan & Upload
                </button>
              </div>
            )}
          </section>
        )}

        {/* Bottom Feature Grid */}
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900">Explainable Decision Trace</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Visual rationales and transparency indicators highlight why an item was classified into a specific material stream.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900">Contamination Prevention</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              Identifies food residue, layered composites, and grease risks before waste enters the municipal recycling chain.
            </p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <Recycle className="h-5 w-5" />
            </div>
            <h3 className="mt-3 text-base font-bold text-slate-900">Continuous Human-in-the-Loop</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
              User corrections and confirmations are logged into the training loop for ongoing YOLO model retraining and accuracy improvement.
            </p>
          </div>
        </section>
      </main>

      {/* Need Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <HelpCircle className="h-5 w-5 text-emerald-600" />
                <span>Recycling & Sorting Guide</span>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-700">
              <div className="rounded-2xl bg-emerald-50/70 p-4 border border-emerald-200/60">
                <h4 className="font-bold text-emerald-900">How to get the most accurate AI scan:</h4>
                <ul className="mt-2 space-y-1.5 text-xs text-emerald-800">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Place the waste item on a clear, well-lit surface.
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Ensure packaging logos, resin symbols, or bottle caps are visible.
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    Avoid extreme shadows or blurry camera angles.
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 mb-2">Common Waste Streams & Rules:</h4>
                <div className="grid gap-2 sm:grid-cols-2 text-xs">
                  {wasteCategories.map((category) => (
                    <div key={`modal-cat-${category.id}`} className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                      <p className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{category.icon}</span> {category.name}
                      </p>
                      <p className="mt-1 text-slate-600">{category.recyclingMethod}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Modal */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <BookOpen className="h-5 w-5 text-teal-600" />
                <span>How SmartRecycle Works</span>
              </div>
              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  1
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Image Capture & Preprocessing</h4>
                  <p className="mt-1 text-xs text-slate-600">
                    Camera captures or file uploads are normalized, compressed for low latency, and prepared for neural inference.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold text-white">
                  2
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">YOLOv11 Multi-Object Detection</h4>
                  <p className="mt-1 text-xs text-slate-600">
                    Our YOLO neural network scans the photo, identifies recyclable waste items, places bounding boxes, and assesses contamination probability.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl border border-slate-200 p-4 bg-slate-50">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                  3
                </span>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Explainable Guidance & Feedback Loop</h4>
                  <p className="mt-1 text-xs text-slate-600">
                    Every output explains why a decision was reached. User ratings and corrections feed into the feedback store for continuous model retraining.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Required Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-emerald-100 bg-white p-7 shadow-2xl">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-sm">
              <Lock className="h-7 w-7 text-amber-600" />
            </div>

            <h3 className="mt-4 text-xl font-extrabold text-slate-900">
              Account Required to Upload
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              To upload waste photos and analyze items with YOLOv11 AI, you must create a free account or sign in. This ensures your recycling analytics, contamination alerts, and retraining corrections are saved securely.
            </p>

            <div className="mt-6 space-y-3">
              <Link
                href="/login?mode=signup&required=1&returnUrl=/waste-analyzer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition hover:from-emerald-700 hover:to-teal-700"
              >
                <UserPlus className="h-4 w-4" />
                Create Free Account
              </Link>

              <Link
                href="/login?mode=signin&required=1&returnUrl=/waste-analyzer"
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <LogIn className="h-4 w-4 text-emerald-600" />
                Sign In With Existing Account
              </Link>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-4 text-center">
              <span className="text-[11px] text-slate-400">
                Free & instant setup • Explainable AI Waste Classification
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
