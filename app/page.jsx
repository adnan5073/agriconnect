"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, Tractor, Users, Sprout, Droplets, FlaskConical, Star, Phone, X, Leaf, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getDistanceKm } from "@/lib/geo";

const categories = [
  ["All", Sprout], ["Equipment", Tractor], ["Workers", Users],
  ["Seeds", Sprout], ["Irrigation", Droplets], ["Fertilizer", FlaskConical]
];

export default function Home() {
  const [resources,setResources]=useState([]);
  const [query,setQuery]=useState("");
  const [category,setCategory]=useState("All");
  const [loading,setLoading]=useState(true);
  const [coords,setCoords]=useState({lat:9.9312,lon:76.2673});
  const [locationName,setLocationName]=useState("Kochi, Kerala");
  const [selected,setSelected]=useState(null);
  const [form,setForm]=useState({name:"",phone:""});
  const [message,setMessage]=useState("");

  useEffect(()=>{
    loadResources();
    if(navigator.geolocation){
      navigator.geolocation.getCurrentPosition(p=>{
        setCoords({lat:p.coords.latitude,lon:p.coords.longitude});
        setLocationName("Your current location");
      },()=>{});
    }
  },[]);

  async function loadResources(){
    setLoading(true);
    const {data,error}=await supabase.from("resources").select("*").eq("available",true).order("created_at",{ascending:false});
    if(!error)setResources(data||[]);
    setLoading(false);
  }

  const filtered=useMemo(()=>resources
    .filter(r=>category==="All"||r.category===category)
    .filter(r=>`${r.title} ${r.description||""} ${r.location_text||""} ${r.provider_name}`.toLowerCase().includes(query.toLowerCase()))
    .map(r=>({...r,distance:getDistanceKm(coords.lat,coords.lon,Number(r.latitude),Number(r.longitude))}))
    .sort((a,b)=>a.distance-b.distance),[resources,query,category,coords]);

  async function book(e){
    e.preventDefault();
    const {error}=await supabase.from("bookings").insert({
      resource_id:selected.id, farmer_name:form.name, farmer_phone:form.phone, status:"pending"
    });
    setMessage(error?"Booking failed. Please try again.":"Booking request sent successfully!");
    if(!error)setForm({name:"",phone:""});
  }

  return <main className="min-h-screen bg-slate-50">
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-xl bg-green-600 p-2 text-white"><Leaf size={22}/></div>
          <div><h1 className="text-xl font-bold text-green-700">AgriConnect</h1><p className="text-xs text-slate-500">Resources for every farmer</p></div>
        </Link>
        <nav className="flex gap-2">
          <Link href="/crop-assistant" className="rounded-lg px-3 py-2 text-sm font-semibold text-green-700">Crop Assistant</Link>
          <Link href="/provider" className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white"><PlusCircle size={17}/>Add Resource</Link>
        </nav>
      </div>
    </header>

    <section className="bg-gradient-to-br from-green-700 via-green-600 to-emerald-500 px-5 py-14 text-white">
      <div className="mx-auto max-w-7xl">
        <p className="font-semibold text-green-100">AGRICULTURAL RESOURCE PLATFORM</p>
        <h2 className="mt-3 max-w-3xl text-4xl font-black md:text-6xl">Find the right resources near you.</h2>
        <p className="mt-5 max-w-2xl text-lg text-green-50">Find equipment, skilled workers, seeds, irrigation, fertilizers and agricultural services.</p>
        <div className="mt-8 flex max-w-3xl flex-col gap-3 rounded-2xl bg-white p-3 md:flex-row">
          <div className="flex flex-1 items-center gap-3 px-3">
            <Search className="text-slate-400" size={21}/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tractor, seeds, workers..." className="w-full bg-transparent py-3 text-slate-800 outline-none"/>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"><MapPin size={18}/>{locationName}</div>
        </div>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-5 py-8">
      <h3 className="text-2xl font-bold">Browse Resources</h3>
      <div className="my-7 flex gap-2 overflow-x-auto pb-2">
        {categories.map(([name,Icon])=><button key={name} onClick={()=>setCategory(name)} className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${category===name?"bg-green-600 text-white":"bg-white text-slate-600 ring-1 ring-slate-200"}`}><Icon size={16}/>{name}</button>)}
      </div>

      {loading?<div className="rounded-2xl bg-white p-12 text-center">Loading resources...</div>:
      filtered.length===0?<div className="rounded-2xl bg-white p-12 text-center"><Sprout className="mx-auto mb-3 text-green-500" size={40}/><b>No resources found</b></div>:
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map(item=>
        <article key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex h-36 items-center justify-center bg-green-50"><Tractor className="text-green-600" size={58}/></div>
          <div className="p-5">
            <div className="flex justify-between"><span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">{item.category}</span><span className="flex items-center gap-1"><Star size={15} className="fill-yellow-400 text-yellow-400"/>{item.rating}</span></div>
            <h4 className="mt-3 text-lg font-bold">{item.title}</h4>
            <p className="mt-2 text-sm text-slate-500">{item.description}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2"><MapPin size={16}/>{item.location_text||"Nearby"} · {item.distance.toFixed(1)} km</div>
              <div className="font-bold text-green-700">₹{item.price} / {item.price_unit}</div>
              <div>Provider: {item.provider_name}</div>
            </div>
            <button onClick={()=>{setSelected(item);setMessage("")}} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-bold text-white"><Phone size={17}/>Book / Contact</button>
          </div>
        </article>
      )}</div>}
    </section>

    <section className="mx-auto max-w-7xl px-5 pb-12">
      <div className="rounded-3xl bg-slate-900 p-7 text-white md:flex md:items-center md:justify-between">
        <div><div className="flex items-center gap-2 text-green-400"><Leaf size={21}/><b>AI Crop Assistant</b></div><h3 className="mt-2 text-2xl font-black">Upload a crop leaf and get assistance.</h3><p className="mt-2 text-slate-300">Analyze a crop leaf image and receive disease-assistance information.</p></div>
        <Link href="/crop-assistant" className="mt-5 rounded-xl bg-green-500 px-5 py-3 font-bold md:mt-0">Open Crop Assistant</Link>
      </div>
    </section>

    <footer className="border-t bg-white px-5 py-8 text-center text-sm text-slate-500"><b className="text-green-700">AgriConnect</b><p>Helping farmers access the right resources.</p></footer>

    {selected&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="flex justify-between"><div><h3 className="text-xl font-bold">Book Resource</h3><p className="text-sm text-slate-500">{selected.title}</p></div><button onClick={()=>setSelected(null)}><X/></button></div>
        <form onSubmit={book} className="mt-6 space-y-4">
          <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Your name" className="w-full rounded-xl border px-4 py-3"/>
          <input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="Phone number" className="w-full rounded-xl border px-4 py-3"/>
          {message&&<div className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-700">{message}</div>}
          <button className="w-full rounded-xl bg-green-600 py-3 font-bold text-white">Send Booking Request</button>
        </form>
      </div>
    </div>}
  </main>;
}
