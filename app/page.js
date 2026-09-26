'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getDistanceKm } from '@/lib/geo';
import { Search, MapPin, Phone, Star, Shield, Cpu } from 'lucide-react';

export default function Home() {
  const [resources, setResources] = useState([]);
  const [category, setCategory] = useState('All');
  const [userLocation, setUserLocation] = useState({ lat: 9.9312, lng: 76.2673 }); // Default Kochi coords
  const [bookingModal, setBookingModal] = useState(null);
  const [farmerInfo, setFarmerInfo] = useState({ name: '', phone: '' });

  useEffect(() => {
    // Get live position if allowed
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
    fetchResources();
  }, []);

  async function fetchResources() {
    const { data, error } = await supabase.from('resources').select('*');
    if (!error && data) setResources(data);
  }

  async function handleBooking(e) {
    e.preventDefault();
    if (!bookingModal) return;

    await supabase.from('bookings').insert([
      {
        resource_id: bookingModal.id,
        farmer_name: farmerInfo.name,
        farmer_phone: farmerInfo.phone
      }
    ]);

    alert('Booking request sent successfully!');
    setBookingModal(null);
    setFarmerInfo({ name: '', phone: '' });
  }

  const filtered = resources
    .filter((r) => category === 'All' || r.category === category)
    .map((r) => ({
      ...r,
      distance: getDistanceKm(userLocation.lat, userLocation.lng, r.latitude, r.longitude)
    }))
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      {/* Navbar */}
      <header className="bg-emerald-700 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">🌾 AgriConnect</h1>
          <span className="text-xs bg-emerald-800 px-3 py-1 rounded-full border border-emerald-600">
            Kochi Region
          </span>
        </div>
      </header>

      {/* Hero Category Filter */}
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
          {['All', 'Machinery', 'Labor', 'Inputs', 'Services'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                category === cat ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 border hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Resource Cards */}
        <div className="grid gap-4 mt-4 md:grid-cols-2">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">{item.category}</span>
                  <h2 className="text-lg font-bold text-slate-800 mt-0.5">{item.title}</h2>
                </div>
                <span className="flex items-center text-amber-500 font-bold text-sm bg-amber-50 px-2 py-0.5 rounded">
                  <Star className="w-3.5 h-3.5 fill-current mr-1" /> {item.rating}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" /> {item.distance} km away
                </span>
                <span className="font-semibold text-slate-900">
                  ₹{item.price}/{item.price_unit}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t flex gap-2">
                <button
                  onClick={() => setBookingModal(item)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg text-sm transition-colors"
                >
                  Request Booking
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Request {bookingModal.title}</h3>
            <p className="text-sm text-slate-500 mt-1">Provider will contact you directly to confirm availability.</p>

            <form onSubmit={handleBooking} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Your Name</label>
                <input
                  type="text"
                  required
                  value={farmerInfo.name}
                  onChange={(e) => setFarmerInfo({ ...farmerInfo, name: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm mt-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Rahul Kumar"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={farmerInfo.phone}
                  onChange={(e) => setFarmerInfo({ ...farmerInfo, phone: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm mt-1 focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setBookingModal(null)}
                  className="flex-1 border py-2 rounded-lg text-sm font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}