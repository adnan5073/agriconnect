"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Leaf
} from "lucide-react";

export default function CropAssistant() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  function handleImage(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult("");
  }

  async function analyzeCrop() {
    if (!image) {
      alert("Please upload a crop image.");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const formData = new FormData();

      formData.append("image", image);

      const response = await fetch(
        "/api/crop-assistant",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Analysis failed."
        );
      }

      setResult(data.result);
    } catch (error) {
      console.error(error);
      setResult(
        "Unable to analyze the image. Please try again."
      );
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="bg-emerald-800 text-white">

        <div className="max-w-5xl mx-auto px-4 py-4">

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-100 hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AgriConnect
          </Link>

        </div>

      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">

        <div className="text-center max-w-2xl mx-auto">

          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            AI Crop Assistant
          </div>

          <h1 className="text-4xl font-bold mt-5">
            Check Your Crop
          </h1>

          <p className="text-slate-500 mt-3">
            Upload a clear image of a crop leaf to get
            assistance about possible crop problems.
          </p>

        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-10">

          {/* UPLOAD */}
          <div className="bg-white border rounded-2xl p-6">

            <h2 className="font-bold text-xl">
              Upload Image
            </h2>

            <label className="mt-5 border-2 border-dashed border-emerald-300 rounded-2xl min-h-72 flex items-center justify-center cursor-pointer hover:bg-emerald-50 overflow-hidden">

              {preview ? (

                <img
                  src={preview}
                  alt="Crop preview"
                  className="w-full h-72 object-contain"
                />

              ) : (

                <div className="text-center">

                  <Upload className="w-12 h-12 mx-auto text-emerald-500" />

                  <div className="font-semibold mt-4">
                    Click to upload
                  </div>

                  <div className="text-sm text-slate-400 mt-1">
                    JPG, PNG or WEBP
                  </div>

                </div>

              )}

              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                className="hidden"
              />

            </label>

            <button
              onClick={analyzeCrop}
              disabled={!image || loading}
              className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-semibold"
            >
              {loading
                ? "Analyzing..."
                : "Analyze Crop"}
            </button>

          </div>

          {/* RESULT */}
          <div className="bg-white border rounded-2xl p-6">

            <div className="flex items-center gap-3">

              <div className="bg-emerald-100 text-emerald-700 w-11 h-11 rounded-xl flex items-center justify-center">
                <Leaf />
              </div>

              <div>
                <h2 className="font-bold text-xl">
                  Analysis
                </h2>

                <p className="text-sm text-slate-400">
                  AI assistance result
                </p>
              </div>

            </div>

            <div className="mt-6 bg-slate-50 rounded-xl p-5 min-h-64 whitespace-pre-line text-sm leading-7">

              {result ? (
                result
              ) : (
                <div className="text-center text-slate-400 pt-16">
                  Upload a crop image to see the result.
                </div>
              )}

            </div>

            <div className="mt-4 text-xs text-slate-400">
              AI results are for assistance only. Consult
              an agricultural expert before applying
              treatment.
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}