"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getDistanceKm } from "@/lib/geo";

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
  Loader2,
  RefreshCw,
  PlusCircle,
} from "lucide-react";

export default function Home() {
  // -----------------------------
  // STATE
  // -----------------------------

  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [userLocation, setUserLocation] = useState({
    lat: 9.9312,
    lng: 76.2673,
  });

  const [locationName, setLocationName] = useState("Your location");

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [bookingModal, setBookingModal] = useState(null);

  const [detailsModal, setDetailsModal] = useState(null);

  const [farmerInfo, setFarmerInfo] = useState({
    name: "",
    phone: "",
  });

  const [bookingLoading, setBookingLoading] = useState(false);

  const [showAllResources, setShowAllResources] = useState(false);

  // -----------------------------
  // CATEGORIES
  // -----------------------------

  const categories = [
    {
      name: "Equipment",
      icon: Tractor,
    },
    {
      name: "Workers",
      icon: UserCheck,
    },
    {
      name: "Seeds",
      icon: Sprout,
    },
    {
      name: "Irrigation",
      icon: Droplets,
    },
    {
      name: "Fertilizer",
      icon: FlaskConical,
    },
  ];

  // -----------------------------
  // GET USER LOCATION
  // -----------------------------

  useEffect(() => {
    if (!navigator.geolocation) {
      fetchResources();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setUserLocation({
          lat,
          lng,
        });

        setLocationName("Near you");

        fetchResources();
      },
      () => {
        // Location permission denied.
        // Use default location.
        setLocationName("Default location");
        fetchResources();
      }
    );
  }, []);

  // -----------------------------
  // LOAD RESOURCES FROM SUPABASE
  // -----------------------------

  async function fetchResources() {
    setLoading(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("available", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("Supabase error:", error);

      setErrorMessage(
        "Could not load resources. Please check your Supabase connection."
      );

      setResources([]);
      setLoading(false);
      return;
    }

    setResources(data || []);
    setLoading(false);
  }

  // -----------------------------
  // FILTER + DISTANCE
  // -----------------------------

  const filteredResources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = resources
      .filter((resource) => {
        const category = resource.category || "";

        const matchesCategory =
          selectedCategory === "All" ||
          category.toLowerCase() === selectedCategory.toLowerCase();

        const searchableText = `
          ${resource.title || ""}
          ${resource.category || ""}
          ${resource.provider_name || ""}
          ${resource.location || ""}
        `.toLowerCase();

        const matchesSearch =
          query.length === 0 || searchableText.includes(query);

        return matchesCategory && matchesSearch;
      })
      .map((resource) => {
        let distance = null;

        if (
          resource.latitude !== null &&
          resource.latitude !== undefined &&
          resource.longitude !== null &&
          resource.longitude !== undefined
        ) {
          distance = getDistanceKm(
            userLocation.lat,
            userLocation.lng,
            Number(resource.latitude),
            Number(resource.longitude)
          );
        }

        return {
          ...resource,
          distance,
        };
      })
      .sort((a, b) => {
        if (a.distance === null) return 1;
        if (b.distance === null) return -1;

        return Number(a.distance) - Number(b.distance);
      });

    return result;
  }, [
    resources,
    searchQuery,
    selectedCategory,
    userLocation,
  ]);

  // -----------------------------
  // CATEGORY COUNT
  // -----------------------------

  function getCategoryCount(category) {
    return resources.filter(
      (resource) =>
        (resource.category || "").toLowerCase() ===
        category.toLowerCase()
    ).length;
  }

  // -----------------------------
  // BOOKING
  // -----------------------------

  async function handleBooking(event) {
    event.preventDefault();

    if (!bookingModal) return;

    if (!farmerInfo.name.trim() || !farmerInfo.phone.trim()) {
      alert("Please enter your name and phone number.");
      return;
    }

    setBookingLoading(true);

    const { error } = await supabase.from("bookings").insert([
      {
        resource_id: bookingModal.id,
        farmer_name: farmerInfo.name.trim(),
        farmer_phone: farmerInfo.phone.trim(),
      },
    ]);

    if (error) {
      console.error("Booking error:", error);

      alert(
        "Booking failed. Please check your Supabase bookings table and RLS policies."
      );

      setBookingLoading(false);
      return;
    }

    alert("Booking request sent successfully!");

    setBookingLoading(false);

    setBookingModal(null);

    setFarmerInfo({
      name: "",
      phone: "",
    });
  }

  // -----------------------------
  // FIND RESOURCES BUTTON
  // -----------------------------

  function handleFindResources() {
    const resourceSection = document.getElementById(
      "resources-section"
    );

    if (resourceSection) {
      resourceSection.scrollIntoView({
        behavior: "smooth",
      });
    }
  }

  // -----------------------------
  // RESET FILTERS
  // -----------------------------

  function resetFilters() {
    setSearchQuery("");
    setSelectedCategory("All");
  }

  // -----------------------------
  // RESOURCE LIMIT
  // -----------------------------

  const visibleResources = showAllResources
    ? filteredResources
    : filteredResources.slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">

      {/* =========================================================
          HEADER
      ========================================================= */}

      <header className="bg-emerald-800 text-white border-b border-emerald-700 sticky top-0 z-40">

        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* LOGO */}

          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="bg-white text-emerald-800 font-bold w-9 h-9 rounded-lg flex items-center justify-center text-lg">
              🌾
            </div>

            <span className="font-bold text-xl tracking-tight">
              Agri-Connect
            </span>
          </Link>

          {/* NAVIGATION */}

          <div className="hidden md:flex items-center gap-6 text-sm">

            <button
              onClick={handleFindResources}
              className="text-emerald-100 hover:text-white transition"
            >
              Explore
            </button>

            <Link
              href="/crop-assistant"
              className="text-emerald-100 hover:text-white transition"
            >
              Crop Assistant
            </Link>

            <Link
              href="/provider"
              className="text-emerald-100 hover:text-white transition"
            >
              Add Resource
            </Link>

          </div>

          {/* USER */}

          <div className="flex items-center gap-3">

            <span className="hidden sm:inline-block text-emerald-200 text-xs">
              {locationName}
            </span>

            <div className="flex items-center gap-2 bg-emerald-900/60 px-3 py-1.5 rounded-full border border-emerald-700">

              <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs font-bold text-white">
                F
              </div>

              <span className="font-medium text-xs hidden sm:block">
                Farmer
              </span>

            </div>

          </div>

        </div>

      </header>


      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="bg-gradient-to-b from-emerald-800 to-emerald-900 text-white py-12 px-4">

        <div className="max-w-3xl mx-auto text-center">

          <div className="inline-flex items-center gap-2 bg-emerald-700/50 border border-emerald-600 rounded-full px-3 py-1 text-xs text-emerald-100 mb-4">

            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />

            Smart Agriculture Resource Platform

          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">

            Empowering Every Farmer, Everywhere.

          </h1>

          <p className="text-emerald-100 text-sm sm:text-base max-w-xl mx-auto mt-4">

            Find agricultural equipment, skilled workers, seeds,
            irrigation solutions and other resources near you.

          </p>


          {/* SEARCH */}

          <div className="bg-white rounded-xl p-2 max-w-2xl mx-auto shadow-lg flex flex-col sm:flex-row gap-2 mt-7">

            <div className="flex-1 flex items-center gap-2 px-3 py-2 text-slate-700">

              <Search className="w-5 h-5 text-slate-400" />

              <input
                type="text"
                placeholder="Search equipment, seeds, workers..."
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value)
                }
                className="w-full text-sm outline-none bg-transparent"
              />

            </div>

            <div className="flex items-center gap-2 px-3 py-2 border-t sm:border-t-0 sm:border-l border-slate-200 text-slate-600 text-sm">

              <MapPin className="w-4 h-4 text-emerald-600" />

              <span>{locationName}</span>

            </div>

            <button
              onClick={handleFindResources}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Find Resources
            </button>

          </div>

        </div>

      </section>


      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-10 flex-1 w-full">


        {/* =====================================================
            CATEGORIES
        ===================================================== */}

        <section>

          <div className="flex justify-between items-end mb-4">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Explore by Category
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Browse resources based on your agricultural needs
              </p>

            </div>

            <button
              onClick={resetFilters}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              View All
            </button>

          </div>


          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">

            {categories.map((category) => {

              const Icon = category.icon;

              const isSelected =
                selectedCategory.toLowerCase() ===
                category.name.toLowerCase();

              const count = getCategoryCount(
                category.name
              );

              return (
                <button
                  key={category.name}
                  onClick={() =>
                    setSelectedCategory(
                      isSelected
                        ? "All"
                        : category.name
                    )
                  }
                  className={`p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-emerald-50 border-emerald-600 ring-2 ring-emerald-600/20"
                      : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm"
                  }`}
                >

                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${
                      isSelected
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm">
                    {category.name}
                  </h3>

                  <p className="text-xs text-slate-400">
                    {count} Listings
                  </p>

                </button>
              );
            })}

          </div>

        </section>


        {/* =====================================================
            CROP ASSISTANT
        ===================================================== */}

        <section className="bg-emerald-900 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-md">

          <div className="absolute right-0 top-0 opacity-10 text-[150px]">
            🌱
          </div>

          <div className="relative z-10 max-w-xl space-y-3">

            <div className="inline-flex items-center gap-1.5 bg-emerald-800 border border-emerald-700 text-emerald-200 text-xs px-3 py-1 rounded-full font-semibold">

              <Sparkles className="w-3.5 h-3.5 text-amber-400" />

              AI CROP ASSISTANT

            </div>

            <h2 className="text-2xl font-bold">
              Instant Crop Assistant
            </h2>

            <p className="text-emerald-100 text-sm leading-relaxed">

              Upload a photo of your crop and get assistance
              identifying possible diseases and crop problems.

            </p>

            <div className="pt-2 flex flex-wrap gap-3">

              <Link
                href="/crop-assistant"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2"
              >
                Upload Photo

                <ArrowRight className="w-4 h-4" />

              </Link>

              <Link
                href="/crop-assistant"
                className="bg-emerald-800/80 hover:bg-emerald-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold border border-emerald-700 transition-colors"
              >
                Learn More
              </Link>

            </div>

          </div>

        </section>


        {/* =====================================================
            RESOURCES
        ===================================================== */}

        <section id="resources-section">

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Resources Near You
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Find agricultural resources available in your area
              </p>

            </div>

            <div className="flex gap-2">

              <button
                onClick={fetchResources}
                className="text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 flex items-center gap-1.5"
              >

                <RefreshCw className="w-3.5 h-3.5" />

                Refresh

              </button>

              <button
                onClick={resetFilters}
                className="text-xs font-semibold text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-50"
              >
                Clear Filters
              </button>

            </div>

          </div>


          {/* LOADING */}

          {loading && (

            <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">

              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />

              <p className="text-sm text-slate-500 mt-3">
                Loading resources...
              </p>

            </div>

          )}


          {/* ERROR */}

          {!loading && errorMessage && (

            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">

              <p className="text-sm text-red-700">
                {errorMessage}
              </p>

              <button
                onClick={fetchResources}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
              >
                Try Again
              </button>

            </div>

          )}


          {/* NO RESULTS */}

          {!loading &&
            !errorMessage &&
            filteredResources.length === 0 && (

              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">

                <Search className="w-10 h-10 text-slate-300 mx-auto" />

                <h3 className="font-bold text-slate-800 mt-3">
                  No resources found
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Try another search or category.
                </p>

                <button
                  onClick={resetFilters}
                  className="mt-4 text-sm font-semibold text-emerald-700"
                >
                  Clear filters
                </button>

              </div>

            )}


          {/* RESOURCE CARDS */}

          {!loading &&
            !errorMessage &&
            visibleResources.length > 0 && (

              <div className="grid gap-4 md:grid-cols-3 sm:grid-cols-2">

                {visibleResources.map((item) => (

                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
                  >

                    <div>

                      <div className="flex justify-between items-start mb-2">

                        <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          {item.category || "Resource"}
                        </span>

                        <span className="flex items-center text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">

                          <Star className="w-3 h-3 fill-current mr-0.5" />

                          {item.rating || "4.8"}

                        </span>

                      </div>


                      <h3 className="font-bold text-slate-900 text-base leading-snug">
                        {item.title}
                      </h3>


                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">

                        <MapPin className="w-3.5 h-3.5 text-slate-400" />

                        {item.location || "Location not specified"}

                      </p>


                      {item.provider_name && (

                        <p className="text-xs text-slate-500 mt-1">

                          Provider:{" "}

                          <span className="font-medium text-slate-700">
                            {item.provider_name}
                          </span>

                        </p>

                      )}


                      {item.distance !== null && (

                        <p className="text-xs text-emerald-600 mt-1">

                          {Number(item.distance).toFixed(1)} km away

                        </p>

                      )}

                    </div>


                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">

                      <div>

                        <span className="text-lg font-extrabold text-slate-900">
                          ₹{item.price || 0}
                        </span>

                        {item.price_unit && (

                          <span className="text-xs text-slate-400">
                            /{item.price_unit}
                          </span>

                        )}

                      </div>


                      <button
                        onClick={() =>
                          setDetailsModal(item)
                        }
                        className="text-xs font-semibold text-slate-600 border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50"
                      >
                        Details
                      </button>

                    </div>


                    <button
                      onClick={() =>
                        setBookingModal(item)
                      }
                      className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-sm font-semibold transition"
                    >
                      Request / Book
                    </button>

                  </div>

                ))}

              </div>

            )}


          {/* SHOW MORE */}

          {!loading &&
            filteredResources.length > 6 && (

              <div className="text-center mt-6">

                <button
                  onClick={() =>
                    setShowAllResources(
                      !showAllResources
                    )
                  }
                  className="text-sm font-semibold text-emerald-700 border border-emerald-200 px-5 py-2 rounded-lg hover:bg-emerald-50"
                >
                  {showAllResources
                    ? "Show Less"
                    : `View All ${filteredResources.length} Resources`}
                </button>

              </div>

            )}

        </section>


        {/* =====================================================
            ADD RESOURCE CTA
        ===================================================== */}

        <section className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-5">

          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">

              <PlusCircle className="w-6 h-6" />

            </div>

            <div>

              <h3 className="font-bold text-slate-900">
                Have an agricultural resource?
              </h3>

              <p className="text-sm text-slate-500 mt-1">
                Add your equipment, service or agricultural product.
              </p>

            </div>

          </div>

          <Link
            href="/provider"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold"
          >
            Add Resource
          </Link>

        </section>


        {/* =====================================================
            TRUST FEATURES
        ===================================================== */}

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-slate-200">

          <div className="flex items-center gap-3">

            <ShieldCheck className="w-8 h-8 text-emerald-700" />

            <div>

              <h4 className="font-bold text-xs text-slate-800">
                Verified Listings
              </h4>

              <p className="text-[11px] text-slate-500">
                Reliable resources
              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <Users className="w-8 h-8 text-emerald-700" />

            <div>

              <h4 className="font-bold text-xs text-slate-800">
                Farmer Community
              </h4>

              <p className="text-[11px] text-slate-500">
                Connect locally
              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <Headphones className="w-8 h-8 text-emerald-700" />

            <div>

              <h4 className="font-bold text-xs text-slate-800">
                Expert Support
              </h4>

              <p className="text-[11px] text-slate-500">
                Agricultural assistance
              </p>

            </div>

          </div>


          <div className="flex items-center gap-3">

            <Leaf className="w-8 h-8 text-emerald-700" />

            <div>

              <h4 className="font-bold text-xs text-slate-800">
                Sustainable Growth
              </h4>

              <p className="text-[11px] text-slate-500">
                Better farming
              </p>

            </div>

          </div>

        </section>

      </main>


      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4">

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">

          <div className="flex items-center gap-2">

            <span className="font-bold text-white text-sm">
              Agri-Connect
            </span>

            <span>
              © 2026 Agri-Connect
            </span>

          </div>

          <div className="flex gap-6">

            <Link
              href="/"
              className="hover:text-white"
            >
              Home
            </Link>

            <button
              onClick={handleFindResources}
              className="hover:text-white"
            >
              Explore Resources
            </button>

            <Link
              href="/crop-assistant"
              className="hover:text-white"
            >
              Crop Assistant
            </Link>

            <Link
              href="/provider"
              className="hover:text-white"
            >
              Add Resource
            </Link>

          </div>

        </div>

      </footer>


      {/* =========================================================
          RESOURCE DETAILS MODAL
      ========================================================= */}

      {detailsModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">

            <div className="bg-emerald-800 text-white p-5 flex justify-between items-start">

              <div>

                <p className="text-xs text-emerald-200 uppercase font-bold">
                  {detailsModal.category}
                </p>

                <h3 className="text-xl font-bold mt-1">
                  {detailsModal.title}
                </h3>

              </div>

              <button
                onClick={() =>
                  setDetailsModal(null)
                }
                className="p-1 hover:bg-emerald-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

            </div>


            <div className="p-5 space-y-4">

              <div className="flex items-center gap-2 text-sm text-slate-600">

                <MapPin className="w-4 h-4 text-emerald-600" />

                {detailsModal.location ||
                  "Location not specified"}

              </div>


              {detailsModal.provider_name && (

                <div>

                  <p className="text-xs text-slate-400">
                    Provider
                  </p>

                  <p className="font-semibold text-slate-800">
                    {detailsModal.provider_name}
                  </p>

                </div>

              )}


              <div className="flex items-center justify-between bg-slate-50 rounded-xl p-4">

                <div>

                  <p className="text-xs text-slate-400">
                    Price
                  </p>

                  <p className="text-xl font-extrabold text-slate-900">
                    ₹{detailsModal.price || 0}
                  </p>

                </div>


                <div className="flex items-center gap-1 text-amber-600">

                  <Star className="w-4 h-4 fill-current" />

                  <span className="font-bold">
                    {detailsModal.rating || "4.8"}
                  </span>

                </div>

              </div>


              <button
                onClick={() => {
                  setDetailsModal(null);
                  setBookingModal(detailsModal);
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-semibold"
              >
                Request / Book
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =========================================================
          BOOKING MODAL
      ========================================================= */}

      {bookingModal && (

        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">

            <div className="flex items-start justify-between">

              <div>

                <h3 className="text-lg font-bold text-slate-900">
                  Request {bookingModal.title}
                </h3>

                <p className="text-sm text-slate-500 mt-1">
                  Enter your details and the provider can contact you.
                </p>

              </div>

              <button
                onClick={() =>
                  setBookingModal(null)
                }
                className="p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>

            </div>


            <form
              onSubmit={handleBooking}
              className="mt-5 space-y-4"
            >

              {/* NAME */}

              <div>

                <label className="text-xs font-semibold text-slate-600">
                  Your Name
                </label>

                <input
                  type="text"
                  required
                  value={farmerInfo.name}
                  onChange={(e) =>
                    setFarmerInfo({
                      ...farmerInfo,
                      name: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm mt-1 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter your name"
                />

              </div>


              {/* PHONE */}

              <div>

                <label className="text-xs font-semibold text-slate-600">
                  Phone Number
                </label>

                <input
                  type="tel"
                  required
                  value={farmerInfo.phone}
                  onChange={(e) =>
                    setFarmerInfo({
                      ...farmerInfo,
                      phone: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 rounded-lg p-3 text-sm mt-1 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="+91 98765 43210"
                />

              </div>


              {/* BUTTONS */}

              <div className="flex gap-2 pt-2">

                <button
                  type="button"
                  onClick={() =>
                    setBookingModal(null)
                  }
                  className="flex-1 border border-slate-200 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                  disabled={bookingLoading}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2"
                >

                  {bookingLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Request"
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}