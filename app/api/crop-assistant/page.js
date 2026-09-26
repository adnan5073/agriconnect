'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  ShieldAlert
} from 'lucide-react';

export default function CropAssistant() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);

  // Handle file selection and generate preview
  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysisResult(null);
      setError(null);
    }
  }

  // Convert image to Base64 string
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  }

  // Submit image to backend API
  async function handleAnalyze() {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      const base64Image = await fileToBase64(selectedImage);

      const response = await fetch('/api/crop-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Image }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze crop image.');
      }

      setAnalysisResult(data);
    } catch (err) {
      setError(err.message || 'Something went wrong while analyzing.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
      <header className="bg-emerald-800 text-white border-b border-emerald-700 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold hover:text-emerald-200">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-base">AI Crop Assistant</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        
        {/* Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center max-w-xl mx-auto">
          <h1 className="text-2xl font-bold text-slate-900">Instant Plant Disease Diagnostic</h1>
          <p className="text-sm text-slate-500 mt-2">
            Take or upload a clear photo of the affected leaf to detect possible diseases, pests, or nutrient issues.
          </p>
        </div>

        {/* Upload & Preview Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
          {!previewUrl ? (
            <label className="border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors">
              <Upload className="w-10 h-10 text-emerald-600 mb-2" />
              <span className="text-sm font-bold text-slate-800">Click to upload crop image</span>
              <span className="text-xs text-slate-400 mt-1">Supports PNG, JPG, or WEBP</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden max-h-64 border border-slate-200 bg-slate-900">
                <img src={previewUrl} alt="Crop leaf preview" className="w-full h-full object-contain max-h-64 mx-auto" />
              </div>

              <div className="flex gap-2">
                <label className="flex-1 border text-slate-700 font-semibold py-2.5 rounded-xl text-xs text-center cursor-pointer hover:bg-slate-50 transition-colors">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Analyzing Leaf...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Start AI Scan
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Results Display */}
        {analysisResult && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-md max-w-xl mx-auto space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Diagnosis Result
                </span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">
                  {analysisResult.possible_issue}
                </h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Confidence</span>
                <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                  {analysisResult.confidence}
                </span>
              </div>
            </div>

            {/* Symptoms */}
            {analysisResult.symptoms && analysisResult.symptoms.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Identified Symptoms</h3>
                <ul className="space-y-1.5">
                  {analysisResult.symptoms.map((symptom, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommended Steps */}
            {analysisResult.recommended_next_steps && analysisResult.recommended_next_steps.length > 0 && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recommended Action Steps
                </h3>
                <ol className="space-y-2">
                  {analysisResult.recommended_next_steps.map((step, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="font-bold text-emerald-700">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Disclaimer */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-amber-50/60 border border-amber-200/60 p-3 rounded-lg">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>AI recommendations are for guidance. Consult a local agricultural officer for severe crop outbreaks.</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}