"use client";
import {useState} from "react";
import Link from "next/link";
import {ArrowLeft,ImagePlus,Leaf} from "lucide-react";

export default function CropAssistant(){
 const [file,setFile]=useState(null),[preview,setPreview]=useState(""),[result,setResult]=useState(null),[loading,setLoading]=useState(false);
 function choose(e){const f=e.target.files?.[0];if(!f)return;setFile(f);setPreview(URL.createObjectURL(f));setResult(null)}
 async function analyze(){if(!file)return;setLoading(true);const fd=new FormData();fd.append("image",file);const r=await fetch("/api/crop-assistant",{method:"POST",body:fd});setResult(await r.json());setLoading(false)}
 return <main className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto max-w-4xl px-5 py-4"><Link href="/" className="flex gap-2 text-sm font-semibold"><ArrowLeft size={18}/>Back</Link></div></header>
 <section className="mx-auto max-w-3xl px-5 py-10 text-center"><Leaf className="mx-auto text-green-600" size={40}/><h1 className="mt-3 text-3xl font-black">AI Crop Assistant</h1><p className="mt-2 text-slate-500">Upload a crop leaf image for assistance.</p>
 <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm"><label className="flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-green-200 bg-green-50"><ImagePlus size={42} className="text-green-600"/><b className="mt-3 text-green-800">Choose leaf image</b><input type="file" accept="image/*" onChange={choose} className="hidden"/></label>
 {preview&&<><img src={preview} alt="Crop leaf" className="mx-auto mt-5 max-h-80 rounded-2xl"/><button onClick={analyze} disabled={loading} className="mt-5 w-full rounded-xl bg-green-600 py-3 font-bold text-white">{loading?"Analyzing...":"Analyze Crop"}</button></>}
 {result&&<div className="mt-6 rounded-2xl bg-slate-50 p-5 text-left"><h2 className="font-black">{result.disease||"Result"}</h2><p className="mt-2"><b>Severity:</b> {result.severity}</p><p className="mt-2 text-slate-600">{result.advice}</p><small className="text-slate-500">{result.note}</small></div>}</div></section></main>
}
