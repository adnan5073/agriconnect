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
  X, 
  CheckCircle2, 
  Loader2, 
  RefreshCw, 
  AlertTriangle,
  Database
} from 'lucide-react';

export default function ResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [userLocation, setUserLocation] = useState({ lat: 9.9312, lng: 76.2673 });
  
  // Booking modal state
  const [bookingModal, setBookingModal] = useState(null);
  const [farmerInfo, setFarmerInfo] = useState({ name: '', phone: '' });
  const [submittingBooking, setSubmittingBooking] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (pos?.coords?.latitude && pos?.coords?.longitude) {
            setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          }
        },
        () => {}
      );
    }
    fetchRealResources();
  }, []);

  async function fetchRealResources() {
    setLoading(true);
    setErrorMsg(null);

    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*');

      if (error) {
        console.error('Supabase error:', error);
        setErrorMsg(`Supabase query failed: ${error.message} (Code: ${error.code})`);
        setResources([]);
        return;
      }

      if (!data || data.length === 0) {
        setErrorMsg('Supabase connected successfully, but the "resources" table returned 0 rows. Check that rows exist and RLS policies are enabled.');
        setResources([]);
      } else {
        setResources(data);
      }
    } catch (err) {
      console.error('Connection error:', err);
      setErrorMsg('Failed to connect to Supabase. Check your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
      setResources([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleBooking(e) {
    e.preventDefault();
    if (!bookingModal) return;

    setSubmittingBooking(true);
    try {
      const { error } = await supabase.from('bookings').insert([
        {
          resource_id: bookingModal.id,
          farmer_name: farmerInfo.name.trim(),
          farmer_phone: farmerInfo.phone.trim(),
        }
      ]);

      if (error) {
        alert(`Booking failed: ${error.message}`);
        setSubmittingBooking(false);
        return;
      }

      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setBookingModal(null);
        setFarmerInfo({ name: '', phone: '' });
        setSubmittingBooking(false);
      }, 1600);
    } catch (err) {
      alert('Network error while saving booking.');
      setSubmittingBooking(false);
    }
  }

  const categories = ['All', 'Equipment', 'Workers', 'Seeds', 'Irrigation', 'Fertilizer'];

  // Process data strictly from Supabase
  const filtered = resources
    .map((r) => {
      let dist = null;
      if (r.latitude != null && r.longitude != null && typeof getDistanceKm === 'function') {
        const d = getDistanceKm(userLocation.lat, userLocation.lng, Number(r.latitude), Number(r.longitude));
        dist = parseFloat(d);
      }
      return { ...r, distance: dist };
    })
    .filter((r) => {
      const itemCategory = (r.category || '').toLowerCase().trim();
      const matchCat = category === 'All' || itemCategory === category.toLowerCase().trim();

      const itemTitle = (r.title || '').toLowerCase();
      const matchSearch = itemTitle.includes(searchQuery.trim().toLowerCase());

      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (a.distance == null) return 1;
      if (b.distance == null) return -1;
      return a.distance - b.distance;
    });

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
            <span className="text-emerald-300 text-xs hidden sm:inline">/ Live Database</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchRealResources}
              disabled={loading}
              className="flex items-center gap-1.5 bg-emerald-900/70 hover:bg-emerald-900 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Reload DB</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6 flex-1 w-full">
        
        {/* Error / Diagnostic Box */}
        {errorMsg && (
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Database Notice</p>
              <p className="text-amber-800 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Search & Category Filter */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
          <div className="flex items-center gap-2 px-3 py-2 border rounded-xl bg-slate-50 text-slate-700">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search live resources by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm outline-none bg-transparent"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}>
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Categories */}
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

        {/* Count Info */}
        <div className="flex justify-between items-center text-xs text-slate-500">
          <span>Found <strong>{filtered.length}</strong> items in database</span>
          <span className="flex items-center gap-1 text-emerald-700">
            <Database className="w-3.5 h-3.5" /> Connected to Supabase
          </span>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            <p className="text-xs text-slate-500">Querying Supabase database...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
            <p className="text-base font-bold text-slate-800">No resources available</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching records found in your database for this filter.
            </p>
            <button
              onClick={() => { setSearchQuery(''); setCategory('All'); }}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Real Data Grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
            {filtered.map((item) => (
              <div 
                key={item.id} 
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {item.category || 'General'}
                    </span>
                    <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-current mr-0.5" /> {item.rating || '4.8'}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">{item.title}</h3>
                  
                  {item.provider_name && (
                    <p className="text-xs text-slate-400 mt-1">Provider: {item.provider_name}</p>
                  )}

                  {item.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  )}

                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> 
                    {item.distance != null ? `${item.distance} km away` : (item.location || 'Local')}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-slate-900">₹{item.price}</span>
                    {item.price_unit && (
                      <span className="text-xs text-slate-400">/{item.price_unit}</span>
                    )}
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
        )}
      </main>

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl relative">
            {bookingSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">Request Recorded in Supabase!</h3>
                <p className="text-xs text-slate-500">The provider will contact you shortly.</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold text-slate-900">Request {bookingModal.title}</h3>
                <p className="text-xs text-slate-500 mt-1">₹{bookingModal.price} / {bookingModal.price_unit || 'unit'}</p>

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
                      disabled={submittingBooking}
                      onClick={() => setBookingModal(null)}
                      className="flex-1 border py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingBooking}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      {submittingBooking ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        'Confirm Request'
                      )}
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