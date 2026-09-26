'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { getDistanceKm } from '@/lib/geo';
import { 
  ArrowLeft, 
  Search, 
  MapPin, 
  Star, 
  Filter, 
  SlidersHorizontal,
  X,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

const FALLBACK_RESOURCES = [
  {
    id: '1',
    title: 'John Deere 5050D Tractor (50 HP)',
    category: 'Equipment',
    price: 850,
    price_unit: 'hour',
    latitude: 9.9390,
    longitude: 76.2705,
    rating: 4.9,
    provider_name: 'Harpreet Singh',
  },
  {
    id: '2',
    title: 'Skilled Paddy Harvester Labor (Team of 4)',
    category: 'Workers',
    price: 2400,
    price_unit: 'day',
    latitude: 9.9450,
    longitude: 76.2600,
    rating: 4.8,
    provider_name: 'Kerala Agro Crew',
  },
  {
    id: '3',
    title: 'Hybrid High-Yield Basmati Seeds (25kg)',
    category: 'Seeds',
    price: 1800,
    price_unit: 'bag',
    latitude: 9.9200,
    longitude: 76.2500,
    rating: 4.7,
    provider_name: 'Green Field Agronomics',
  },
  {
    id: '4',
    title: 'Drip Irrigation Pipe Roll (500m)',
    category: 'Irrigation',
    price: 3200,
    price_unit: 'unit',
    latitude: 9.9600,
    longitude: 76.2900,
    rating: 4.9,
    provider_name: 'Jain Agrotech Center',
  },
  {
    id: '5',
    title: 'Organic Vermicompost (50kg Bag)',
    category: 'Fertilizer',
    price: 650,
    price_unit: 'bag',
    latitude: 9.9150,
    longitude: 76.2800,
    rating: 4.6,
    provider_name: 'Bhoomi Organics',
  },
];

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [maxDistance, setMaxDistance] = useState(50);
  const [userLocation, setUserLocation] = useState({ lat: 9.9312, lng: 76.2673 });
  const [bookingModal, setBookingModal] = useState(null);
  const [farmerInfo, setFarmerInfo] = useState({ name: '', phone: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
    fetchResources();
  }, []);

  async function fetchResources() {
    try {
      const { data, error } = await supabase.from('resources').select('*');
      if (!error && data && data.length > 0) {
        setResources(data);
      } else {
        setResources(FALLBACK_RESOURCES);
      }
    } catch {
      setResources(FALLBACK_RESOURCES);
    }
  }

  async function handleBooking(e) {
    e.preventDefault();
    if (!bookingModal) return;

    try {
      await supabase.from('bookings').insert([
        {
          resource_id: bookingModal.id,
          farmer_name: farmerInfo.name,
          farmer_phone: farmerInfo.phone,
        }
      ]);
    } catch (err) {
      console.log('Using mock booking store:', err);
    }

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingModal(null);
      setFarmerInfo({ name: '', phone: '' });
    }, 1500);
  }

  const categories = ['All', 'Equipment', 'Workers', 'Seeds', 'Irrigation', 'Fertilizer'];

  const filtered = resources
    .map((r) => {
      const dist = getDistanceKm
        ? getDistanceKm(userLocation.lat, userLocation.lng, r.latitude, r.longitude)
        : '3.2';
      return { ...r, distance: parseFloat(dist) || 2.5 };
    })
    .filter((r) => {
      const matchCat = category === 'All' || r.category.toLowerCase() === category.toLowerCase();
      const matchSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDist = r.distance <= maxDistance;
      return matchCat && matchSearch && matchDist;
    })
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Navbar */}
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
            <span className="text-emerald-300 text-sm hidden sm:inline">/ Browse Resources</span>
          </div>

          <Link href="/my-bookings" className="text-xs bg-emerald-900/60 hover:bg-emerald-900 border border-emerald-700 px-3 py-1.5 rounded-full transition">
            My Bookings
          </Link>
        </div>
      </header>

      {/* Main Filter & Listing View */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 flex-1 w-full">
        {/* Search & Filter Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 border rounded-xl bg-slate-50 text-slate-700">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search tractors, workers, seeds, fertilizer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')}>
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 px-3 py-2 border rounded-xl text-xs text-slate-600 bg-slate-50">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <span>Radius: <strong>{maxDistance} km</strong></span>
              <input 
                type="range" 
                min="5" 
                max="100" 
                value={maxDistance} 
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="accent-emerald-600 w-24 cursor-pointer"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition ${
                  category === c 
                    ? 'bg-emerald-700 text-white shadow-sm' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Found {filtered.length} listings near you</span>
          <span>Sorted by nearest distance</span>
        </div>

        {/* Resources Grid */}
        <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
          {filtered.map((item) => (
            <div 
              key={item.id} 
              className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {item.category}
                  </span>
                  <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    <Star className="w-3 h-3 fill-current mr-0.5" /> {item.rating || 4.8}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-base leading-snug">{item.title}</h3>
                
                {item.provider_name && (
                  <p className="text-xs text-slate-400 mt-1">Provider: {item.provider_name}</p>
                )}

                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.distance} km away
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-lg font-extrabold text-slate-900">₹{item.price}</span>
                  <span className="text-xs text-slate-400">/{item.price_unit}</span>
                </div>
                <button
                  onClick={() => setBookingModal(item)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-3.5 py-1.5 rounded-lg transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative">
            {bookingSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Request Sent!</h3>
                <p className="text-xs text-slate-500">The provider will contact you shortly.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-900">Request {bookingModal.title}</h3>
                <p className="text-xs text-slate-500 mt-1">₹{bookingModal.price} / {bookingModal.price_unit}</p>

                <form onSubmit={handleBooking} className="mt-4 space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={farmerInfo.name}
                      onChange={(e) => setFarmerInfo({ ...farmerInfo, name: e.target.value })}
                      className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="e.g. Ramesh Kumar"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={farmerInfo.phone}
                      onChange={(e) => setFarmerInfo({ ...farmerInfo, phone: e.target.value })}
                      className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button
                      type="button"
                      onClick={() => setBookingModal(null)}
                      className="flex-1 border py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-semibold"
                    >
                      Confirm Request
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}