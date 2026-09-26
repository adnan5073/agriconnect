"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
  X,
  Phone,
  CalendarCheck
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { getDistanceKm } from "@/lib/geo";

export default function Home() {
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [userLocation, setUserLocation] = useState({
    lat: 9.9312,
    lng: 76.2673
  });

  const [locationName, setLocationName] = useState("Kochi, India");

  const [bookingModal, setBookingModal] = useState(null);

  const [farmerInfo, setFarmerInfo] = useState({
    name: "",
    phone: ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserLocation();
    fetchResources();
  }, []);

  async function fetchResources() {
    setLoading(true);

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("available", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Unable to load resources.");
    } else {
      setResources(data || []);
    }

    setLoading(false);
  }

  function getUserLocation() {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });

        setLocationName("Your current location");
      },
      () => {
        console.log("Location permission denied.");
      }
    );
  }

  async function handleBooking(event) {
    event.preventDefault();

    if (!bookingModal) return;

    const { error } = await supabase
      .from("bookings")
      .insert([
        {
          resource_id: bookingModal.id,
          farmer_name: farmerInfo.name,
          farmer_phone: farmerInfo.phone,
          status: "pending"
        }
      ]);

    if (error) {
      console.error(error);
      alert("Booking failed. Please try again.");
      return;
    }

    alert("Booking request sent successfully!");

    setBookingModal(null);

    setFarmerInfo({
      name: "",
      phone: ""
    });
  }

  const categories = [
    {
      name: "Equipment",
      count: "Machinery",
      icon: Tractor
    },
    {
      name: "Workers",
      count: "Skilled workers",
      icon: UserCheck
    },
    {
      name: "Seeds",
      count: "Quality seeds",
      icon: Sprout
    },
    {
      name: "Irrigation",
      count: "Water solutions",
      icon: Droplets
    },
    {
      name: "Fertilizer",
      count: "Farm inputs",
      icon: FlaskConical
    }
  ];

  const filteredResources = resources
    .filter((resource) => {
      const matchesCategory =
        selectedCategory === "All" ||
        resource.category?.toLowerCase() ===
          selectedCategory.toLowerCase();

      const search =
        searchQuery.trim().toLowerCase();

      const matchesSearch =
        !search ||
        resource.title?.toLowerCase().includes(search) ||
        resource.description?.toLowerCase().includes(search) ||
        resource.category?.toLowerCase().includes(search) ||
        resource.location_text?.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    })
    .map((resource) => ({
      ...resource,
      distance: getDistanceKm(
        userLocation.lat,
        userLocation.lng,
        resource.latitude,
        resource.longitude
      )
    }))
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* NAVBAR */}
      <header className="bg-emerald-800 text-white sticky top-0 z-40 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="bg-white text-emerald-800 w-10 h-10 rounded-xl flex items-center justify-center text-xl">
              🌾
            </div>

            <div>
              <div className="font-bold text-xl">
                AgriConnect
              </div>

              <div className="text-xs text-emerald-200">
                Connecting farmers to resources
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">

            <Link
              href="/"
              className="hover:text-emerald-200"
            >
              Home
            </Link>

            <Link
              href="#resources"
              className="hover:text-emerald-200"
            >
              Resources
            </Link>

            <Link
              href="/crop-assistant"
              className="hover:text-emerald-200"
            >
              Crop Assistant
            </Link>

            <Link
              href="/provider"
              className="bg-white text-emerald-800 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-50"
            >
              Become a Provider
            </Link>

          </nav>
        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-emerald-800 to-emerald-950 text-white">

        <div className="max-w-7xl mx-auto px-4 py-16">

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 bg-emerald-700/60 border border-emerald-600 rounded-full px-4 py-2 text-sm mb-5">
              <Leaf className="w-4 h-4" />
              Smart Agriculture Resource Platform
            </div>

            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              Everything Farmers Need,
              <span className="text-emerald-300">
                {" "}Nearby.
              </span>
            </h1>

            <p className="mt-5 text-emerald-100 text-lg leading-relaxed">
              Find agricultural equipment, skilled workers,
              seeds, fertilizers, irrigation solutions and
              agricultural services in your area.
            </p>

            {/* SEARCH */}
            <div className="mt-8 bg-white rounded-2xl p-2 flex flex-col sm:flex-row shadow-xl">

              <div className="flex items-center flex-1 px-3">
                <Search className="text-slate-400 w-5 h-5 mr-3" />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  placeholder="Search tractors, workers, seeds..."
                  className="w-full py-3 outline-none text-slate-800"
                />
              </div>

              <button
                onClick={() =>
                  document
                    .getElementById("resources")
                    ?.scrollIntoView()
                }
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-7 py-3 rounded-xl font-semibold"
              >
                Find Resources
              </button>

            </div>

            <div className="flex items-center gap-2 mt-4 text-sm text-emerald-200">
              <MapPin className="w-4 h-4" />
              {locationName}
            </div>

          </div>
        </div>
      </section>

      {/* TRUST FEATURES */}
      <section className="bg-white border-b">

        <div className="max-w-7xl mx-auto px-4 py-7 grid grid-cols-2 md:grid-cols-4 gap-6">

          <Feature
            icon={<ShieldCheck />}
            title="Verified Providers"
            text="Trusted local resources"
          />

          <Feature
            icon={<MapPin />}
            title="Location Based"
            text="Find resources nearby"
          />

          <Feature
            icon={<Users />}
            title="Farmer Focused"
            text="Built for farmers"
          />

          <Feature
            icon={<Headphones />}
            title="Direct Contact"
            text="Connect directly"
          />

        </div>
      </section>

      <main className="max-w-7xl mx-auto w-full px-4 py-10 space-y-12">

        {/* CATEGORIES */}
        <section>

          <div className="flex justify-between items-end mb-5">

            <div>
              <p className="text-emerald-600 font-semibold text-sm">
                EXPLORE
              </p>

              <h2 className="text-2xl font-bold text-slate-900">
                Agricultural Resources
              </h2>
            </div>

            <button
              onClick={() => setSelectedCategory("All")}
              className="text-sm text-emerald-700 font-semibold"
            >
              View All
            </button>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

            {categories.map((category) => {

              const Icon = category.icon;

              const selected =
                selectedCategory === category.name;

              return (
                <button
                  key={category.name}
                  onClick={() =>
                    setSelectedCategory(
                      selected ? "All" : category.name
                    )
                  }
                  className={`text-left p-5 rounded-2xl border transition ${
                    selected
                      ? "bg-emerald-50 border-emerald-500 shadow"
                      : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow"
                  }`}
                >

                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                      selected
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-bold text-slate-800">
                    {category.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1">
                    {category.count}
                  </p>

                </button>
              );
            })}

          </div>
        </section>

        {/* AI BANNER */}
        <section className="bg-emerald-900 text-white rounded-3xl p-7 md:p-10 overflow-hidden relative">

          <div className="relative z-10 max-w-2xl">

            <div className="inline-flex items-center gap-2 bg-emerald-800 border border-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              AI POWERED
            </div>

            <h2 className="text-3xl font-bold mt-4">
              Instant Crop Assistant
            </h2>

            <p className="text-emerald-100 mt-3 leading-relaxed">
              Upload a crop leaf image and get assistance
              identifying possible diseases, pests and
              nutrient-related problems.
            </p>

            <Link
              href="/crop-assistant"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 mt-6 px-5 py-3 rounded-xl font-semibold"
            >
              Open Crop Assistant
              <ArrowRight className="w-4 h-4" />
            </Link>

          </div>

          <div className="absolute right-8 bottom-0 text-[150px] opacity-10">
            🌱
          </div>

        </section>

        {/* RESOURCES */}
        <section id="resources">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">

            <div>
              <p className="text-emerald-600 font-semibold text-sm">
                FIND WHAT YOU NEED
              </p>

              <h2 className="text-2xl font-bold">
                Resources Near You
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Sorted by distance from your location
              </p>
            </div>

            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
              className="border border-slate-300 bg-white rounded-lg px-4 py-2 text-sm"
            >
              <option value="All">All Categories</option>
              <option value="Equipment">Equipment</option>
              <option value="Workers">Workers</option>
              <option value="Seeds">Seeds</option>
              <option value="Irrigation">Irrigation</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Services">Services</option>
            </select>

          </div>

          {loading ? (

            <div className="bg-white rounded-2xl p-10 text-center">
              <div className="text-emerald-600 font-semibold">
                Loading resources...
              </div>
            </div>

          ) : filteredResources.length === 0 ? (

            <div className="bg-white border rounded-2xl p-10 text-center">

              <div className="text-5xl mb-4">
                🔎
              </div>

              <h3 className="font-bold text-lg">
                No resources found
              </h3>

              <p className="text-sm text-slate-500 mt-2">
                Try another search or category.
              </p>

            </div>

          ) : (

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredResources.map((resource) => (

                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  onBook={() =>
                    setBookingModal(resource)
                  }
                />

              ))}

            </div>

          )}

        </section>

      </main>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 mt-auto">

        <div className="max-w-7xl mx-auto px-4 py-10">

          <div className="flex flex-col md:flex-row justify-between gap-8">

            <div>

              <div className="flex items-center gap-2 text-white font-bold text-xl">
                🌾 AgriConnect
              </div>

              <p className="text-sm mt-3 max-w-md">
                Helping farmers find the right agricultural
                resources, services and information.
              </p>

            </div>

            <div className="flex gap-8 text-sm">

              <div className="space-y-2">
                <div className="text-white font-semibold">
                  Platform
                </div>

                <Link
                  href="/"
                  className="block hover:text-white"
                >
                  Resources
                </Link>

                <Link
                  href="/crop-assistant"
                  className="block hover:text-white"
                >
                  Crop Assistant
                </Link>

              </div>

              <div className="space-y-2">
                <div className="text-white font-semibold">
                  Providers
                </div>

                <Link
                  href="/provider"
                  className="block hover:text-white"
                >
                  Register
                </Link>

              </div>

            </div>

          </div>

          <div className="border-t border-slate-800 mt-8 pt-6 text-xs">
            © 2026 AgriConnect. Hackathon Project.
          </div>

        </div>

      </footer>

      {/* BOOKING MODAL */}
      {bookingModal && (

        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">

            <div className="flex justify-between items-start p-6 border-b">

              <div>
                <h3 className="font-bold text-xl">
                  Request Resource
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  {bookingModal.title}
                </p>
              </div>

              <button
                onClick={() => setBookingModal(null)}
                className="text-slate-400 hover:text-slate-800"
              >
                <X />
              </button>

            </div>

            <form
              onSubmit={handleBooking}
              className="p-6 space-y-4"
            >

              <div>
                <label className="text-sm font-semibold">
                  Your Name
                </label>

                <input
                  required
                  value={farmerInfo.name}
                  onChange={(e) =>
                    setFarmerInfo({
                      ...farmerInfo,
                      name: e.target.value
                    })
                  }
                  placeholder="Enter your name"
                  className="w-full border rounded-xl p-3 mt-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Phone Number
                </label>

                <input
                  required
                  type="tel"
                  value={farmerInfo.phone}
                  onChange={(e) =>
                    setFarmerInfo({
                      ...farmerInfo,
                      phone: e.target.value
                    })
                  }
                  placeholder="+91 98765 43210"
                  className="w-full border rounded-xl p-3 mt-2 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-sm">

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Provider
                </div>

                <div className="font-semibold mt-1">
                  {bookingModal.provider_name}
                </div>

              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-5 h-5" />
                Send Booking Request
              </button>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-emerald-600">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-sm">
          {title}
        </h3>

        <p className="text-xs text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function ResourceCard({ resource, onBook }) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition">

      <div className="h-36 bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center">

        {resource.image_url ? (
          <img
            src={resource.image_url}
            alt={resource.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-6xl">
            {resource.category === "Equipment"
              ? "🚜"
              : resource.category === "Workers"
              ? "👨‍🌾"
              : resource.category === "Seeds"
              ? "🌱"
              : resource.category === "Irrigation"
              ? "💧"
              : resource.category === "Fertilizer"
              ? "🌿"
              : "🌾"}
          </div>
        )}

      </div>

      <div className="p-5">

        <div className="flex justify-between gap-3">

          <div>

            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-semibold">
              {resource.category}
            </span>

            <h3 className="font-bold text-lg mt-3">
              {resource.title}
            </h3>

          </div>

          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            {resource.rating}
          </div>

        </div>

        <p className="text-sm text-slate-500 mt-2 line-clamp-2">
          {resource.description}
        </p>

        <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
          <MapPin className="w-4 h-4" />
          {resource.location_text || "Nearby"}
          {" • "}
          {resource.distance.toFixed(1)} km
        </div>

        <div className="border-t mt-4 pt-4 flex justify-between items-center">

          <div>
            <div className="font-bold text-emerald-700">
              ₹{Number(resource.price).toLocaleString()}
            </div>

            <div className="text-xs text-slate-400">
              per {resource.price_unit}
            </div>
          </div>

          <button
            onClick={onBook}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Request
          </button>

        </div>

      </div>

    </div>
  );
}