"use client";
import {useState} from "react";
import Link from "next/link";
import {ArrowLeft,MapPin,PlusCircle} from "lucide-react";
import {supabase} from "@/lib/supabase";

const empty={title:"",category:"Equipment",description:"",price:"",price_unit:"day",provider_name:"",provider_phone:"",location_text:"",latitude:"9.9312",longitude:"76.2673"};

export default function ProviderPage(){
 const [f,setF]=useState(empty),[msg,setMsg]=useState("");
 const u=(k,v)=>setF(x=>({...x,[k]:v}));
 async function submit(e){e.preventDefault();const {error}=await supabase.from("resources").insert({...f,price:Number(f.price),latitude:Number(f.latitude),longitude:Number(f.longitude),rating:5,available:true});setMsg(error?error.message:"Resource added successfully!");if(!error)setF(empty);}
 function locate(){navigator.geolocation?.getCurrentPosition(p=>{u("latitude",String(p.coords.latitude));u("longitude",String(p.coords.longitude));u("location_text","Current location")})}
 return <main className="min-h-screen bg-slate-50"><header className="border-b bg-white"><div className="mx-auto max-w-4xl px-5 py-4"><Link href="/" className="flex gap-2 text-sm font-semibold"><ArrowLeft size={18}/>Back</Link></div></header>
 <section className="mx-auto max-w-4xl px-5 py-10"><PlusCircle className="text-green-600" size={38}/><h1 className="mt-3 text-3xl font-black">Add an Agricultural Resource</h1><p className="mt-2 text-slate-500">List equipment, workers, seeds, irrigation or services.</p>
 <form onSubmit={submit} className="mt-8 rounded-2xl bg-white p-6 shadow-sm"><div className="grid gap-5 md:grid-cols-2">
 <Field label="Resource title" value={f.title} onChange={v=>u("title",v)} required/><Field label="Provider name" value={f.provider_name} onChange={v=>u("provider_name",v)} required/><Field label="Phone" value={f.provider_phone} onChange={v=>u("provider_phone",v)} required/>
 <label><span className="mb-2 block text-sm font-bold">Category</span><select value={f.category} onChange={e=>u("category",e.target.value)} className="w-full rounded-xl border px-4 py-3">{["Equipment","Workers","Seeds","Irrigation","Fertilizer","Services"].map(x=><option key={x}>{x}</option>)}</select></label>
 <Field label="Price" type="number" value={f.price} onChange={v=>u("price",v)} required/><Field label="Price unit" value={f.price_unit} onChange={v=>u("price_unit",v)} required/>
 <Field label="Location" value={f.location_text} onChange={v=>u("location_text",v)}/>
 <div className="flex items-end"><button type="button" onClick={locate} className="flex w-full items-center justify-center gap-2 rounded-xl border border-green-600 px-4 py-3 font-bold text-green-700"><MapPin size={18}/>Use My Location</button></div>
 <Field label="Latitude" value={f.latitude} onChange={v=>u("latitude",v)} required/><Field label="Longitude" value={f.longitude} onChange={v=>u("longitude",v)} required/>
 <label className="md:col-span-2"><span className="mb-2 block text-sm font-bold">Description</span><textarea required rows="4" value={f.description} onChange={e=>u("description",e.target.value)} className="w-full rounded-xl border px-4 py-3"/></label>
 </div>{msg&&<div className="mt-5 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-700">{msg}</div>}<button className="mt-5 w-full rounded-xl bg-green-600 py-3 font-bold text-white">Add Resource</button></form></section></main>
}
function Field({label,value,onChange,type="text",required=false}){return <label><span className="mb-2 block text-sm font-bold">{label}</span><input required={required} type={type} value={value} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border px-4 py-3"/></label>}
