'use client';

import { useState, useEffect } from 'react';
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
  ArrowRight,
  SlidersHorizontal,
  CheckCircle2,
  X
} from 'lucide-react';

// Built-in fallback listings so the page renders immediately even if database is empty
const INITIAL_RESOURCES = [
  {
    id: '1',
    title: 'John Deere 5050D Tractor (50 HP)',
    category: 'Equipment',
    price: 850,
    price_unit: 'hour',
    latitude: 9.9390,
    longitude: 76.2705,
    rating: 4.9,
    description: 'Comes with rotary tiller and experienced driver. Well-maintained.',
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
    description: 'Experienced in rapid transplanting and organic weed extraction.',
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
    description: 'Germination rate 94%. Resistant to bacterial leaf blight.',
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
    description: 'UV stabilized, pressure-compensating inline drippers.',
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
    description: '100% pure organic compost rich in NPK and micronutrients.',
  },
];

// Distance calculation helper (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return '2.5';
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

export default function Home() {
  const [resources, setResources] = useState(INITIAL_RESOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userLocation, setUserLocation] = useState({ lat: 9.9312, lng: 76.2673 });
  const [bookingModal, setBookingModal] = useState(null);
  const [farmerInfo, setFarmerInfo] = useState({ name: '', phone: '' });
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [maxDistance, setMaxDistance] = useState(50);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log('Location access not granted, using default fallback')
      );
    }
  }, []);

  function handleSearchSubmit(e) {
    if (e) e.preventDefault();
    const section = document.getElementById('resources-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }

  function handleBooking(e) {
    e.preventDefault();
    if (!bookingModal) return;

    setBookingSuccess(true);
    setTimeout(() => {
      setBookingSuccess(false);
      setBookingModal(null);
      setFarmerInfo({ name: '', phone: '' });
    }, 1800);
  }

  const categories = [
    { name: 'Equipment', count: '124 Listings', icon: Tractor },
    { name: 'Workers', count: '86 Listings', icon: UserCheck },
    { name: 'Seeds', count: '312 Listings', icon: Sprout },
    { name: 'Irrigation', count: '45 Listings', icon: Droplets },
    { name: 'Fertilizer', count: '96 Listings', icon: FlaskConical },
  ];

  const filteredResources = resources
    .map((r) => ({
      ...r,
      distance: calculateDistance(userLocation.lat, userLocation.lng, r.latitude, r.longitude),
    }))
    .filter((r) => {
      const matchesCategory =
        selectedCategory === 'All' || r.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDist = parseFloat(r.distance) <= maxDistance;
      return matchesCategory && matchesSearch && matchesDist;
    })
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* 1. Header / Navbar */}
      <header className="bg-emerald-800 text-white border-b border-emerald-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="bg-white text-emerald-800 font-bold w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm group-hover:scale-105 transition-transform">
              🌾
            </div>
            <span className="font-bold text-xl tracking-tight">Agri-Connect</span>
          </Link>

          <div className="flex items-center gap-4 text-sm">
            <span className="hidden sm:inline-block text-emerald-200 text-xs">
              📍 Kochi, India
            </span>
            <Link 
              href="/my-bookings" 
              className="flex items-center gap-2 bg-emerald-900/70 hover:bg-emerald-900 px-3 py-1.5 rounded-full border border-emerald-700 transition"
              title="View my bookings"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                A
              </div>
              <span className="font-medium text-xs">My Bookings</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-gradient-to-b from-emerald-800 via-emerald-850 to-emerald-900 text-white py-14 px-4 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
            Empowering Every Farmer, Everywhere.
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Rent tractors, hire farm hands, buy certified seeds, and get instant AI leaf diagnosis directly in your area.
          </p>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="bg-white rounded-2xl p-2 max-w-2xl mx-auto shadow-xl flex flex-col sm:flex-row gap-2 mt-8 text-left"
          >
            <div className="flex-1 flex items-center gap-2 px-3 py-2 text-slate-700">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search tractors, seeds, workers, fertilizer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm outline-none bg-transparent"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex items-center gap-2 px-3 py-2 border-t sm:border-t-0 sm:border-l border-slate-200 text-slate-600 text-xs sm:text-sm">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="truncate">Near You (Kochi)</span>
            </div>

            <button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shadow-sm hover:shadow"
            >
              Find Resources
            </button>
          </form>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-12 flex-1 w-full">

        {/* 3. Explore by Category */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Explore by Category</h2>
              <p className="text-xs text-slate-500">Curated agricultural equipment, labor, and supplies</p>
            </div>
            <button 
              onClick={() => {
                setSelectedCategory('All');
                handleSearchSubmit();
              }} 
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
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
                  onClick={() => {
                    setSelectedCategory(isSelected ? 'All' : cat.name);
                    handleSearchSubmit();
                  }}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected 
                      ? 'bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20' 
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
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
        <section className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-md">
          <div className="relative z-10 max-w-xl space-y-3">
            <div className="inline-flex items-center gap-1.5 bg-emerald-800 border border-emerald-700 text-emerald-200 text-xs px-3 py-1 rounded-full font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              NEW FEATURE
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold">Instant Crop Assistant</h2>
            <p className="text-emerald-100 text-sm leading-relaxed">
              Upload a photo of your crop leaf to diagnose pests, fungal blight, or nitrogen deficiency in seconds with organic and chemical remedies.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link 
                href="/crop-assistant" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition inline-block shadow-sm"
              >
                Upload Photo
              </Link>
              <Link 
                href="/crop-assistant" 
                className="bg-emerald-800/80 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold border border-emerald-700 transition inline-block"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Resources Near You */}
        <section id="resources-section" className="scroll-mt-20">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {selectedCategory === 'All' ? 'Resources Near You' : `${selectedCategory} Near You`}
              </h2>
              <p className="text-xs text-slate-500">
                Showing {filteredResources.length} listings within {maxDistance} km
              </p>
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="text-xs font-semibold text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50 flex items-center gap-1.5 transition"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filter
              </button>

              {/* Distance Filter popover */}
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl p-4 shadow-xl z-20 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                    <span>Search Radius</span>
                    <span className="text-emerald-700">{maxDistance} km</span>
                  </div>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    step="5"
                    value={maxDistance} 
                    onChange={(e) => setMaxDistance(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>5 km</span>
                    <span>50 km</span>
                    <span>100 km</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {filteredResources.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <p className="text-slate-600 text-sm font-medium">No listings match your search criteria.</p>
              <button 
                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setMaxDistance(100); }}
                className="text-xs font-semibold text-emerald-700 underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">
              {filteredResources.map((item) => (
                <div 
                  key={item.id} 
                  className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
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
                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
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
                      className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 hover:gap-1.5 transition-all shadow-sm"
                    >
                      Book Now <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. Trust Badges */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-emerald-700 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-slate-800">Verified Listings</h4>
              <p className="text-[11px] text-slate-500">Every tool inspected</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-emerald-700 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-slate-800">Active Community</h4>
              <p className="text-[11px] text-slate-500">5000+ local farmers</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Headphones className="w-8 h-8 text-emerald-700 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-slate-800">Expert Support</h4>
              <p className="text-[11px] text-slate-500">Available 24/7</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Leaf className="w-8 h-8 text-emerald-700 shrink-0" />
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
            <span className="font-bold text-white text-sm">🌾 Agri-Connect</span>
            <span>© 2026 Agri-Connect Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-white transition">Home</Link>
            <a href="#resources-section" className="hover:text-white transition">Explore Resources</a>
            <Link href="/crop-assistant" className="hover:text-white transition">Crop Assistant</Link>
            <Link href="/my-bookings" className="hover:text-white transition">My Bookings</Link>
          </div>
        </div>
      </footer>

      {/* Booking Modal */}
      {bookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            {bookingSuccess ? (
              <div className="py-8 text-center space-y-3">
                <CheckCircle2 className="w-14 h-14 text-emerald-600 mx-auto" />
                <h3 className="text-xl font-bold text-slate-900">Request Sent Successfully!</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  The provider has received your contact details and will call you shortly to confirm schedule.
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Request {bookingModal.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rate: <strong className="text-emerald-700">₹{bookingModal.price}</strong> / {bookingModal.price_unit}
                    </p>
                  </div>
                  <button 
                    onClick={() => setBookingModal(null)} 
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleBooking} className="mt-5 space-y-3.5">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">Your Full Name</label>
                    <input
                      type="text"
                      required
                      value={farmerInfo.name}
                      onChange={(e) => setFarmerInfo({ ...farmerInfo, name: e.target.value })}
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-emerald-500"
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
                      className="w-full border border-slate-300 rounded-xl p-2.5 text-sm mt-1 outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setBookingModal(null)}
                      className="flex-1 border border-slate-200 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl text-xs font-semibold shadow-sm transition"
                    >
                      Submit Booking
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