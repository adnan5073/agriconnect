'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getDistanceKm } from '@/lib/geo';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Star, 
  ShieldCheck, 
  Users, 
  Headphones, 
  Leaf, 
  Tractor, 
  UserCheck, 
  Sprout, 
  Droplets, 
  FlaskConical, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userLocation, setUserLocation] = useState({ lat: 9.9312, lng: 76.2673 }); // Default Kochi/Fresno mock fallback
  const [bookingModal, setBookingModal] = useState(null);
  const [farmerInfo, setFarmerInfo] = useState({ name: '', phone: '' });

  useEffect(() => {
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

  const categories = [
    { name: 'Equipment', count: '124 Listings', icon: Tractor },
    { name: 'Workers', count: '86 Listings', icon: UserCheck },
    { name: 'Seeds', count: '312 Listings', icon: Sprout },
    { name: 'Irrigation', count: '45 Listings', icon: Droplets },
    { name: 'Fertilizer', count: '96 Listings', icon: FlaskConical },
  ];

  const filteredResources = resources
    .filter((r) => {
      const matchesCategory = selectedCategory === 'All' || r.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .map((r) => ({
      ...r,
      distance: getDistanceKm(userLocation.lat, userLocation.lng, r.latitude, r.longitude)
    }))
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 1. Header / Navbar */}
      <header className="bg-emerald-800 text-white border-b border-emerald-700 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white text-emerald-800 font-bold w-8 h-8 rounded-lg flex items-center justify-center text-lg">
              🌾
            </div>
            <span className="font-bold text-xl tracking-tight">Agri-Connect</span>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline-block text-emerald-200">Kochi, India</span>
            <div className="flex items-center gap-2 bg-emerald-900/60 px-3 py-1.5 rounded-full border border-emerald-700">
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                A
              </div>
              <span className="font-medium text-xs">Alex Farmer</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-gradient-to-b from-emerald-800 to-emerald-900 text-white py-12 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Empowering Every Farmer, Everywhere.
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto">
            Connect with the best tools, seeds, and local expertise to grow your harvest and community.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-xl p-2 max-w-2xl mx-auto shadow-lg flex flex-col sm:flex-row gap-2 mt-6">
            <div className="flex-1 flex items-center gap-2 px-3 py-2 text-slate-700">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 px-3 py-2 border-t sm:border-t-0 sm:border-l border-slate-200 text-slate-600 text-sm">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Fresno, CA</span>
            </div>
            <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors">
              Find Resources
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10 flex-1 w-full">

        {/* 3. Category Grid */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Explore by Category</h2>
              <p className="text-xs text-slate-500">Browse high-quality listings curated for your needs</p>
            </div>
            <button 
              onClick={() => setSelectedCategory('All')} 
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              View All Categories
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((cat) => {
              const IconComponent = cat.icon;
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(isSelected ? 'All' : cat.name)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20' 
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{cat.name}</h3>
                  <p className="text-xs text-slate-400">{cat.count}</p>
                </button>
              );
            })}
          </div>
        </section>

        {/* 4. Instant Crop Assistant Banner */}
        <section className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-md">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-emerald-800 border border-emerald-700 text-emerald-200 text-xs px-3 py-1 rounded-full font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              NEW FEATURE
            </div>
            <h2 className="text-2xl font-bold">Instant Crop Assistant</h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Upload a photo of your crop to diagnose pests, diseases, or nutrient deficiencies in seconds.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link 
                href="/crop-assistant" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors inline-block"
              >
                Upload Photo
              </Link>
              <Link 
                href="/crop-assistant" 
                className="bg-emerald-800/80 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold border border-emerald-700 transition-colors inline-block"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Resources Near You */}
        <section>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Resources Near You</h2>
              <p className="text-xs text-slate-500">Top rated listings available within 10 miles</p>
            </div>
            <button className="text-xs font-semibold text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50">
              Filter
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
            {filteredResources.map((item) => (
              <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
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
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {item.distance} miles away
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-slate-900">₹{item.price}</span>
                    <span className="text-xs text-slate-400">/{item.price_unit}</span>
                  </div>
                  <button
                    onClick={() => setBookingModal(item)}
                    className="text-xs font-semibold text-emerald-700 flex items-center gap-1 hover:gap-1.5 transition-all"
                  >
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Trust Badges / Key Features */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-700" />
            <div>
              <h4 className="font-bold text-xs text-slate-800">Verified Listings</h4>
              <p className="text-[11px] text-slate-500">Every tool inspected</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-700" />
            <div>
              <h4 className="font-bold text-xs text-slate-800">Active Community</h4>
              <p className="text-[11px] text-slate-500">5000+ local farmers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Headphones className="w-8 h-8 text-emerald-700" />
            <div>
              <h4 className="font-bold text-xs text-slate-800">Expert Support</h4>
              <p className="text-[11px] text-slate-500">Available 24/7</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Leaf className="w-8 h-8 text-emerald-700" />
            <div>
              <h4 className="font-bold text-xs text-slate-800">Sustainable Growth</h4>
              <p className="text-[11px] text-slate-500">Eco-friendly focus</p>
            </div>
          </div>
        </section>
      </main>

      {/* 7. Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white text-sm">Agri-Connect</span>
            <span>© 2026 Agri-Connect Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <Link href="/" className="hover:text-white">Explore Resources</Link>
            <Link href="/crop-assistant" className="hover:text-white">Crop Assistant</Link>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">Request {bookingModal.title}</h3>
            <p className="text-sm text-slate-500 mt-1">Provider will contact you directly to confirm booking.</p>

            <form onSubmit={handleBooking} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-600">Your Name</label>
                <input
                  type="text"
                  required
                  value={farmerInfo.name}
                  onChange={(e) => setFarmerInfo({ ...farmerInfo, name: e.target.value })}
                  className="w-full border rounded-lg p-2 text-sm mt-1 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Alex Farmer"
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
                  className="flex-1 border py-2 rounded-lg text-sm font-medium text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
                >
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}