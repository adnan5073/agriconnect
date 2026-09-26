'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  UploadCloud, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Leaf, 
  RefreshCw,
  Droplets,
  HelpCircle
} from 'lucide-react';

// Sample pre-configured test crops for quick demo
const SAMPLE_ISSUES = [
  {
    title: 'Tomato Early Blight',
    crop: 'Tomato',
    severity: 'Moderate',
    confidence: '96%',
    symptoms: 'Concentric brown rings on lower leaves, yellowing margins.',
    cause: 'Alternaria solani fungus thrives in warm, humid conditions.',
    organicTreatment: 'Spray neem oil or copper fungicide; prune affected leaves and sanitize tools.',
    chemicalTreatment: 'Chlorothalonil or Mancozeb spray every 7–10 days.',
    color: 'amber'
  },
  {
    title: 'Corn Stem Borer',
    crop: 'Corn (Maize)',
    severity: 'High',
    confidence: '92%',
    symptoms: 'Pinholes in leaves, dead heart in seedlings, sawdust-like frass on stems.',
    cause: 'Chilo partellus larvae burrowing into the stem.',
    organicTreatment: 'Release Trichogramma parasitic wasps; spray Bacillus thuringiensis (Bt).',
    chemicalTreatment: 'Apply granular Cartap hydrochloride 4G into leaf whorls.',
    color: 'rose'
  },
  {
    title: 'Nitrogen Deficiency',
    crop: 'Paddy / Rice',
    severity: 'Low',
    confidence: '98%',
    symptoms: 'Older leaves turning pale yellow starting from the tips along the midrib.',
    cause: 'Insufficient nitrogen availability during vegetative growth stage.',
    organicTreatment: 'Top-dress with farmyard manure or vermicompost; apply liquid jeevamrutha.',
    chemicalTreatment: 'Split application of Urea (25–30 kg/acre with neem coating).',
    color: 'emerald'
  }
];

export default function CropAssistantPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState(null);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      simulateDiagnosis(SAMPLE_ISSUES[0]);
    }
  }

  function simulateDiagnosis(sample) {
    setIsAnalyzing(true);
    setDiagnosis(null);
    setTimeout(() => {
      setDiagnosis(sample);
      setIsAnalyzing(false);
    }, 1400);
  }

  function resetAnalysis() {
    setSelectedImage(null);
    setDiagnosis(null);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-emerald-800 text-white border-b border-emerald-700 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1 rounded-lg hover:bg-emerald-700 transition">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌾</span>
              <span className="font-bold text-lg tracking-tight">Agri-Connect</span>
            </div>
            <span className="text-emerald-300 text-sm hidden sm:inline">/ Crop Assistant</span>
          </div>

          <Link 
            href="/" 
            className="text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 px-3 py-1.5 rounded-lg transition"
          >
            Back to Marketplace
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-8 flex-1 w-full">
        {/* Banner */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl p-6 text-white shadow-md">
          <div className="inline-flex items-center gap-1.5 bg-emerald-800 border border-emerald-700 text-emerald-200 text-xs px-3 py-1 rounded-full font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            AI Plant Doctor
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Instant Crop Diagnosis</h1>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            Take or upload a photo of your leaf or crop stem. Our model detects pests, fungi, and nutrient deficiencies with recommended treatments.
          </p>
        </div>

        {/* Upload Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {!selectedImage ? (
            <label className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition bg-emerald-50/40 hover:bg-emerald-50">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3 shadow-inner">
                <UploadCloud className="w-7 h-7" />
              </div>
              <span className="font-bold text-slate-800 text-base">Click to upload crop photo</span>
              <span className="text-xs text-slate-500 mt-1">PNG, JPG, or WEBP up to 10MB</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-xl overflow-hidden max-h-80 bg-slate-100 flex items-center justify-center">
                <img 
                  src={selectedImage} 
                  alt="Crop preview" 
                  className="object-contain max-h-80 w-full"
                />
              </div>
              <div className="flex justify-between items-center">
                <button
                  onClick={resetAnalysis}
                  className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 border px-3 py-1.5 rounded-lg"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Upload different photo
                </button>
                {isAnalyzing && (
                  <span className="text-xs font-semibold text-emerald-700 animate-pulse flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 animate-spin text-emerald-600" /> Analyzing leaf features...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick Demo Samples */}
          {!selectedImage && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                Or test with sample problems:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAMPLE_ISSUES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedImage('https://images.unsplash.com/photo-1592417817098-8f3d6eb228cc?w=600&auto=format&fit=crop&q=60');
                      simulateDiagnosis(sample);
                    }}
                    className="p-3 text-left border border-slate-200 hover:border-emerald-500 rounded-xl transition hover:bg-emerald-50/50"
                  >
                    <span className="text-xs font-bold text-slate-800 block">{sample.crop}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{sample.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Diagnosis Results */}
        {diagnosis && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">{diagnosis.title}</h2>
                  <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    {diagnosis.confidence} match
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">Crop: {diagnosis.crop}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Severity:</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  diagnosis.severity === 'High' 
                    ? 'bg-rose-100 text-rose-800' 
                    : diagnosis.severity === 'Moderate'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {diagnosis.severity}
                </span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Identified Symptoms
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{diagnosis.symptoms}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  Primary Cause
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{diagnosis.cause}</p>
              </div>
            </div>

            {/* Treatments */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Recommended Next Steps</h3>
              
              <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-4 flex gap-3">
                <Leaf className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-emerald-900 block">Organic / Natural Remedy (Recommended)</span>
                  <p className="text-emerald-800 leading-relaxed">{diagnosis.organicTreatment}</p>
                </div>
              </div>

              <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex gap-3">
                <Droplets className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-slate-900 block">Chemical / Fast-Acting Control</span>
                  <p className="text-slate-600 leading-relaxed">{diagnosis.chemicalTreatment}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/resources"
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium text-xs px-4 py-2.5 rounded-lg transition"
              >
                Find Spray Equipment & Fertilizer on Agri-Connect →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}