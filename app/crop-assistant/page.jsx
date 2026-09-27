"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  CircleAlert,
  FileImage,
  ImagePlus,
  Loader2,
  RefreshCw,
  ScanSearch,
  Send,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
  Leaf,
  Search,
} from "lucide-react";

const MAX_FILE_SIZE = 8 * 1024 * 1024;

export default function CropAssistantPage() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [crop, setCrop] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  /* ---------------------------------------------------------
     IMAGE COMPRESSION
     Prevents large images from causing request failures.
  --------------------------------------------------------- */

  const compressImage = (selectedFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => {
        const img = new Image();

        img.onload = () => {
          const MAX_WIDTH = 1600;
          const MAX_HEIGHT = 1600;

          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(
              MAX_WIDTH / width,
              MAX_HEIGHT / height
            );

            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement("canvas");

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");

          if (!ctx) {
            reject(new Error("Unable to process the image."));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          const compressed = canvas.toDataURL(
            "image/jpeg",
            0.82
          );

          resolve(compressed);
        };

        img.onerror = () => {
          reject(
            new Error("The selected image could not be read.")
          );
        };

        img.src = reader.result;
      };

      reader.onerror = () => {
        reject(new Error("Unable to read the image."));
      };

      reader.readAsDataURL(selectedFile);
    });
  };

  /* ---------------------------------------------------------
     FILE SELECTION
  --------------------------------------------------------- */

  const handleFile = (selectedFile) => {
    setError("");
    setResult(null);

    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      setError(
        "Please select a JPG, PNG, or WebP image."
      );
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(
        "Image is too large. Please choose an image below 8 MB."
      );
      return;
    }

    setFile(selectedFile);

    const reader = new FileReader();

    reader.onload = (event) => {
      setPreview(event.target.result);
    };

    reader.onerror = () => {
      setError("Unable to preview this image.");
    };

    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (event) => {
    handleFile(event.target.files?.[0]);
  };

  /* ---------------------------------------------------------
     REMOVE IMAGE
  --------------------------------------------------------- */

  const removeImage = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ---------------------------------------------------------
     NORMALIZE N8N RESPONSE
  --------------------------------------------------------- */

  const normalizeResult = (responseData) => {
    let data = responseData;

    // n8n can return an array
    if (Array.isArray(data)) {
      data = data[0] || {};
    }

    // Common n8n response formats
    if (data?.json) {
      data = data.json;
    }

    if (data?.data) {
      data = data.data;
    }

    if (data?.output !== undefined) {
      data = data.output;
    }

    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        return {
          crop: crop || "Unknown crop",
          condition: data,
          confidence: 0,
          severity: "Unknown",
          observations: [],
          recommendations: [],
          note:
            "This is an AI-assisted visual assessment and is not a confirmed diagnosis.",
        };
      }
    }

    if (Array.isArray(data)) {
      data = data[0] || {};
    }

    return {
      crop:
        data?.crop ||
        data?.cropName ||
        data?.plant ||
        crop ||
        "Unknown crop",

      condition:
        data?.condition ||
        data?.diagnosis ||
        data?.disease ||
        data?.result ||
        data?.answer ||
        "No specific condition identified",

      confidence:
        Number(
          data?.confidence ??
            data?.confidenceScore ??
            data?.score ??
            0
        ) || 0,

      severity:
        data?.severity ||
        data?.risk ||
        data?.level ||
        "Unknown",

      observations:
        Array.isArray(data?.observations)
          ? data.observations
          : data?.observations
          ? [data.observations]
          : [],

      recommendations:
        Array.isArray(data?.recommendations)
          ? data.recommendations
          : data?.recommendations
          ? [data.recommendations]
          : data?.treatment
          ? Array.isArray(data.treatment)
            ? data.treatment
            : [data.treatment]
          : [],

      note:
        data?.note ||
        data?.disclaimer ||
        "This is an AI-assisted visual assessment and is not a confirmed diagnosis.",
    };
  };

  /* ---------------------------------------------------------
     ANALYZE CROP
  --------------------------------------------------------- */

  const analyzeCrop = async () => {
    setError("");
    setResult(null);

    if (!file) {
      setError("Please upload a crop image first.");
      return;
    }

    if (!question.trim()) {
      setError(
        "Please enter a question about your crop."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * Compress image before sending.
       * This prevents large Base64 requests.
       */
      const base64Image = await compressImage(file);

      const response = await fetch(
        "/api/crop-assistant",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            action: "crop_analysis",

            crop: crop.trim(),

            question: question.trim(),

            image: base64Image,

            fileName: file.name,

            fileType: "image/jpeg",
          }),
        }
      );

      const responseText = await response.text();

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        data = {
          output: responseText,
        };
      }

      console.log(
        "Crop Assistant response:",
        data
      );

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to process the image."
        );
      }

      const finalResult =
        normalizeResult(data);

      setResult(finalResult);
    } catch (err) {
      console.error(
        "Crop Assistant Error:",
        err
      );

      setError(
        err?.message ||
          "Unable to process the image. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------
     RESET
  --------------------------------------------------------- */

  const resetAssistant = () => {
    setFile(null);
    setPreview("");
    setCrop("");
    setQuestion("");
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  /* ---------------------------------------------------------
     SEVERITY STYLE
  --------------------------------------------------------- */

  const getSeverityClass = (severity) => {
    const value = String(
      severity || ""
    ).toLowerCase();

    if (
      value.includes("severe") ||
      value.includes("high")
    ) {
      return "bg-red-100 text-red-700 border-red-200";
    }

    if (
      value.includes("moderate") ||
      value.includes("medium")
    ) {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }

    if (
      value.includes("mild") ||
      value.includes("low")
    ) {
      return "bg-green-100 text-green-700 border-green-200";
    }

    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f5eb] text-[#173b2b]">

      {/* Background decoration */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#d8f0df] opacity-60 blur-3xl" />

        <div className="absolute right-[-150px] top-[25%] h-[450px] w-[450px] rounded-full bg-[#e7f3d8] opacity-60 blur-3xl" />

        <div className="absolute bottom-[-200px] left-[35%] h-[400px] w-[400px] rounded-full bg-[#dcefe2] opacity-40 blur-3xl" />
      </div>

      <div className="relative z-10">

        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b border-[#dce7dc] bg-[#f8f5eb]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">

            <Link
              href="/"
              className="group flex items-center gap-3"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#173b2b] text-white transition group-hover:scale-105">
                <Leaf size={20} />
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-bold">
                  AgriConnect
                </p>

                <p className="text-xs text-gray-500">
                  Smart farming platform
                </p>
              </div>
            </Link>

            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl border border-[#d7e3d9] bg-white px-4 py-2.5 text-sm font-semibold text-[#31563e] shadow-sm transition hover:bg-[#f1f7f2]"
            >
              <ArrowLeft size={17} />
              <span>Back</span>
            </Link>

          </div>
        </header>

        {/* HERO */}
        <section className="mx-auto max-w-7xl px-5 pb-8 pt-12 lg:px-8">

          <div className="mx-auto max-w-3xl text-center">

            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#cde3d2] bg-[#e6f4e9] px-4 py-2 text-sm font-semibold text-[#327049]">
              <Sparkles size={16} />
              AI Powered Crop Assistant
            </div>

            <h1 className="text-4xl font-black tracking-tight text-[#173b2b] sm:text-5xl">
              Understand Your Crop
              <span className="block text-[#4d8b5c]">
                with AI
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#66766c]">
              Upload a clear photo of your crop leaf,
              ask your question, and get an
              AI-assisted analysis in seconds.
            </p>

          </div>
        </section>

        {/* MAIN */}
        <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-8">

          <div className="grid gap-7 lg:grid-cols-[0.95fr_1.05fr]">

            {/* LEFT CARD */}
            <div className="rounded-[28px] border border-[#dce7dc] bg-white p-5 shadow-[0_15px_50px_rgba(33,70,43,0.07)] sm:p-7">

              <div className="mb-6 flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e3f3e7] text-[#39764c]">
                  <ImagePlus size={22} />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Crop Information
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Add a photo and tell us what you want to know.
                  </p>
                </div>

              </div>

              {/* IMAGE AREA */}
              {!preview ? (
                <button
                  type="button"
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="group relative flex min-h-[330px] w-full flex-col items-center justify-center overflow-hidden rounded-[22px] border-2 border-dashed border-[#bcd8c3] bg-[#f7fbf7] px-6 text-center transition hover:border-[#6a9d75] hover:bg-[#f1f9f3]"
                >

                  <div className="absolute inset-0 opacity-40">
                    <div className="absolute left-10 top-10 h-20 w-20 rounded-full bg-[#dcefe1] blur-2xl" />
                    <div className="absolute bottom-10 right-10 h-24 w-24 rounded-full bg-[#e9f4d9] blur-2xl" />
                  </div>

                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#dcefe2] text-[#37754a] shadow-sm transition group-hover:scale-110">
                    <Upload size={27} />
                  </div>

                  <h3 className="relative mt-5 text-lg font-bold">
                    Upload a crop photo
                  </h3>

                  <p className="relative mt-2 max-w-sm text-sm leading-6 text-gray-500">
                    Choose an image from your device
                    or use your phone camera.
                  </p>

                  <div className="relative mt-6 flex flex-wrap justify-center gap-2">

                    <span className="flex items-center gap-2 rounded-xl bg-[#173b2b] px-4 py-2.5 text-sm font-semibold text-white">
                      <ImagePlus size={16} />
                      Choose Image
                    </span>

                    <span className="flex items-center gap-2 rounded-xl border border-[#d3e1d6] bg-white px-4 py-2.5 text-sm font-semibold text-[#31563e]">
                      <Camera size={16} />
                      Camera
                    </span>

                  </div>

                  <span className="relative mt-5 text-xs text-gray-400">
                    JPG · PNG · WebP · Max 8 MB
                  </span>

                </button>
              ) : (
                <div className="relative overflow-hidden rounded-[22px] border border-[#dce7dc] bg-[#f6faf6]">

                  <img
                    src={preview}
                    alt="Selected crop"
                    className="h-[330px] w-full object-cover"
                  />

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/65 to-transparent p-5 pt-16">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      <CheckCircle2 size={17} />
                      Image selected
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur transition hover:bg-black/80"
                  >
                    <X size={18} />
                  </button>

                  {loading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#173b2b]/75 backdrop-blur-sm">

                      <div className="text-center text-white">

                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-white/10">
                          <Loader2
                            size={30}
                            className="animate-spin"
                          />
                        </div>

                        <p className="mt-4 font-bold">
                          Analyzing your crop...
                        </p>

                        <p className="mt-1 text-sm text-white/70">
                          AI is examining the image
                        </p>

                      </div>

                    </div>
                  )}

                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* FILE */}
              {file && (
                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#dce8df] bg-[#f5faf6] p-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dcefe1] text-[#39764c]">
                    <FileImage size={18} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {file.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>

                  <CheckCircle2
                    size={19}
                    className="text-[#4c8b5d]"
                  />

                </div>
              )}

              {/* CROP */}
              <div className="mt-6">

                <label className="mb-2 block text-sm font-bold">
                  Crop name
                  <span className="ml-1 font-normal text-gray-400">
                    (optional)
                  </span>
                </label>

                <div className="relative">

                  <Leaf
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    type="text"
                    value={crop}
                    onChange={(e) =>
                      setCrop(e.target.value)
                    }
                    placeholder="Example: Tomato, Rice, Pepper"
                    className="w-full rounded-xl border border-[#d4e1d7] bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-[#5b9368] focus:ring-4 focus:ring-[#e1f2e5]"
                  />

                </div>

              </div>

              {/* QUESTION */}
              <div className="mt-5">

                <label className="mb-2 block text-sm font-bold">
                  What would you like to know?
                </label>

                <textarea
                  value={question}
                  onChange={(e) =>
                    setQuestion(e.target.value)
                  }
                  rows={4}
                  placeholder="Example: What could be causing these spots on my leaf?"
                  className="w-full resize-none rounded-xl border border-[#d4e1d7] bg-white px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-[#5b9368] focus:ring-4 focus:ring-[#e1f2e5]"
                />

                <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
                  <Search size={13} />
                  Ask about symptoms, spots, discoloration or crop health.
                </div>

              </div>

              {/* ERROR */}
              {error && (
                <div className="mt-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                  <CircleAlert
                    size={19}
                    className="mt-0.5 shrink-0"
                  />

                  <div>
                    <p className="font-semibold">
                      Unable to process request
                    </p>

                    <p className="mt-1 leading-5">
                      {error}
                    </p>
                  </div>

                </div>
              )}

              {/* BUTTON */}
              <button
                type="button"
                onClick={analyzeCrop}
                disabled={loading}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#173b2b] px-5 py-4 font-bold text-white shadow-lg shadow-[#173b2b]/10 transition hover:bg-[#24553c] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading ? (
                  <>
                    <Loader2
                      size={19}
                      className="animate-spin"
                    />
                    Analyzing Crop...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Analyze My Crop
                    <Send size={17} />
                  </>
                )}

              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShieldCheck size={14} />
                AI-assisted information · Not a confirmed diagnosis
              </div>

            </div>

            {/* RIGHT RESULT */}
            <div className="rounded-[28px] border border-[#dce7dc] bg-white p-5 shadow-[0_15px_50px_rgba(33,70,43,0.07)] sm:p-7">

              <div className="mb-6 flex items-start justify-between gap-4">

                <div className="flex items-start gap-4">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e3f3e7] text-[#39764c]">
                    <ScanSearch size={22} />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold">
                      AI Analysis
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Results from your crop image
                    </p>
                  </div>

                </div>

                {result && (
                  <button
                    type="button"
                    onClick={resetAssistant}
                    className="flex items-center gap-2 rounded-xl border border-[#d5e2d8] px-3 py-2 text-xs font-semibold text-[#31563e] transition hover:bg-[#f2f8f3]"
                  >
                    <RefreshCw size={14} />
                    Reset
                  </button>
                )}

              </div>

              {!result ? (
                <div className="flex min-h-[590px] flex-col items-center justify-center rounded-[22px] bg-[#f6faf6] px-8 text-center">

                  <div className="relative">

                    <div className="flex h-24 w-24 items-center justify-center rounded-[30px] bg-[#dcefe1] text-[#39764c]">
                      <Sparkles size={40} />
                    </div>

                    <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
                      <Leaf
                        size={16}
                        className="text-[#4d8b5c]"
                      />
                    </div>

                  </div>

                  <h3 className="mt-7 text-xl font-bold">
                    Ready to analyze
                  </h3>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-gray-500">
                    Upload a crop image and ask a question.
                    Your AI-assisted analysis will appear
                    here.
                  </p>

                  <div className="mt-7 grid grid-cols-3 gap-2">

                    <div className="rounded-xl bg-white px-3 py-3 shadow-sm">
                      <p className="text-xs font-bold text-[#31563e]">
                        01
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Upload
                      </p>
                    </div>

                    <div className="rounded-xl bg-white px-3 py-3 shadow-sm">
                      <p className="text-xs font-bold text-[#31563e]">
                        02
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Ask
                      </p>
                    </div>

                    <div className="rounded-xl bg-white px-3 py-3 shadow-sm">
                      <p className="text-xs font-bold text-[#31563e]">
                        03
                      </p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Analyze
                      </p>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="space-y-5">

                  {/* MAIN RESULT */}
                  <div className="rounded-[22px] bg-[#edf7ef] p-5 sm:p-6">

                    <div className="flex flex-wrap items-start justify-between gap-4">

                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-[#66806e]">
                          Crop
                        </p>

                        <h3 className="mt-1 text-2xl font-black text-[#173b2b]">
                          {result.crop}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold ${getSeverityClass(
                          result.severity
                        )}`}
                      >
                        {result.severity}
                      </span>

                    </div>

                    <div className="mt-6">

                      <p className="text-xs font-bold uppercase tracking-widest text-[#66806e]">
                        Possible condition
                      </p>

                      <p className="mt-2 text-xl font-bold text-[#244c34]">
                        {result.condition}
                      </p>

                    </div>

                    {result.confidence > 0 && (
                      <div className="mt-6">

                        <div className="mb-2 flex justify-between text-xs font-semibold text-[#52705c]">
                          <span>AI confidence</span>
                          <span>
                            {Math.min(
                              100,
                              Math.max(
                                0,
                                result.confidence
                              )
                            )}
                            %
                          </span>
                        </div>

                        <div className="h-2.5 overflow-hidden rounded-full bg-white">
                          <div
                            className="h-full rounded-full bg-[#4d8b5c] transition-all duration-700"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  result.confidence
                                )
                              )}%`,
                            }}
                          />
                        </div>

                      </div>
                    )}

                  </div>

                  {/* OBSERVATIONS */}
                  {result.observations.length > 0 && (
                    <div className="rounded-[20px] border border-[#e0e9e2] p-5">

                      <h3 className="font-bold">
                        Observations
                      </h3>

                      <div className="mt-4 space-y-3">

                        {result.observations.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="flex gap-3 text-sm leading-6 text-gray-600"
                            >
                              <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#4d8b5c]" />

                              <span>{item}</span>
                            </div>
                          )
                        )}

                      </div>

                    </div>
                  )}

                  {/* RECOMMENDATIONS */}
                  {result.recommendations.length > 0 && (
                    <div className="rounded-[20px] border border-[#e0e9e2] p-5">

                      <h3 className="font-bold">
                        Recommended actions
                      </h3>

                      <div className="mt-4 space-y-3">

                        {result.recommendations.map(
                          (item, index) => (
                            <div
                              key={index}
                              className="flex gap-3 text-sm leading-6 text-gray-600"
                            >
                              <CheckCircle2
                                size={18}
                                className="mt-1 shrink-0 text-[#4d8b5c]"
                              />

                              <span>{item}</span>
                            </div>
                          )
                        )}

                      </div>

                    </div>
                  )}

                  {/* NOTE */}
                  <div className="rounded-[20px] border border-[#eadfae] bg-[#fff9df] p-4 text-xs leading-5 text-[#75652f]">
                    <strong>Important:</strong>{" "}
                    {result.note}
                  </div>

                  {/* AGAIN */}
                  <button
                    type="button"
                    onClick={resetAssistant}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#d5e2d8] bg-white px-5 py-3.5 text-sm font-bold text-[#31563e] transition hover:bg-[#f2f8f3]"
                  >
                    <RefreshCw size={17} />
                    Analyze Another Crop
                  </button>

                </div>
              )}

            </div>

          </div>
        </section>

        {/* FOOTER */}
        <footer className="border-t border-[#dce7dc] bg-[#f3f0e6]">

          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-7 text-sm text-gray-500 sm:flex-row lg:px-8">

            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#173b2b] text-white">
                <Leaf size={15} />
              </div>

              <span className="font-semibold text-[#31563e]">
                AgriConnect
              </span>

              <span>·</span>

              <span>AI Crop Assistant</span>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck size={14} />
              AI-assisted farming information
            </div>

          </div>

        </footer>

      </div>
    </main>
  );
}