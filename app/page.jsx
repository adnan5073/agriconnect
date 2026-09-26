"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getDistanceKm } from "@/lib/geo";

import {
  Search,
  MapPin,
  Bell,
  ChevronRight,
  Grid2X2,
  Store,
  Users,
  CloudSun,
  Settings,
  User,
  LogOut,
  Tractor,
  UserCheck,
  Sprout,
  Droplets,
  FlaskConical,
  Sparkles,
  Camera,
  ArrowRight,
  Star,
  Filter,
  ShieldCheck,
  Headphones,
  Leaf,
  X,
  Loader2,
  RefreshCw,
  Menu,
  Phone,
} from "lucide-react";


// ============================================================
// IMAGE CONFIGURATION
// Replace these URLs with your own images if you have them.
// ============================================================

const IMAGES = {
  hero:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85",

  cropAssistant:
    "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1400&q=85",

  equipment:
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=700&q=80",

  workers:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=700&q=80",

  seeds:
    "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=700&q=80",

  irrigation:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=700&q=80",

  fertilizer:
    "https://images.unsplash.com/photo-1598512752271-33f400b7c9c4?auto=format&fit=crop&w=700&q=80",

  resource1:
    "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=900&q=80",

  resource2:
    "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?auto=format&fit=crop&w=900&q=80",

  resource3:
    "https://images.unsplash.com/photo-1523742812070-1f2e3c3c6c0f?auto=format&fit=crop&w=900&q=80",
};


// ============================================================
// CATEGORY CONFIG
// ============================================================

const categories = [
  {
    name: "Equipment",
    count: "124 Listings",
    icon: Tractor,
    image: IMAGES.equipment,
  },
  {
    name: "Workers",
    count: "86 Listings",
    icon: UserCheck,
    image: IMAGES.workers,
  },
  {
    name: "Seeds",
    count: "312 Listings",
    icon: Sprout,
    image: IMAGES.seeds,
  },
  {
    name: "Irrigation",
    count: "45 Listings",
    icon: Droplets,
    image: IMAGES.irrigation,
  },
  {
    name: "Fertilizer",
    count: "98 Listings",
    icon: FlaskConical,
    image: IMAGES.fertilizer,
  },
];


// ============================================================
// SIDEBAR ITEM
// ============================================================

function SidebarItem({
  icon: Icon,
  children,
  active = false,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
        active
          ? "bg-white text-[#155c45] shadow-sm font-semibold"
          : "text-[#42665a] hover:bg-white/70 hover:text-[#155c45]"
      }`}
    >
      <Icon className="w-[18px] h-[18px]" />

      <span>{children}</span>

      {active && (
        <ChevronRight className="w-4 h-4 ml-auto" />
      )}
    </button>
  );
}


// ============================================================
// RESOURCE SKELETON
// ============================================================

function ResourceSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden border border-[#e7e2cc] animate-pulse">
      <div className="h-44 bg-[#e8e6d8]" />

      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#e8e6d8] rounded w-3/4" />
        <div className="h-3 bg-[#e8e6d8] rounded w-1/2" />
        <div className="h-5 bg-[#e8e6d8] rounded w-1/3" />
        <div className="h-9 bg-[#e8e6d8] rounded" />
      </div>
    </div>
  );
}


// ============================================================
// MAIN PAGE
// ============================================================

export default function Home() {

  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [resources, setResources] = useState([]);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("distance");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [mobileSidebar, setMobileSidebar] =
    useState(false);

  const [selectedResource, setSelectedResource] =
    useState(null);

  const [farmerInfo, setFarmerInfo] =
    useState({
      name: "",
      phone: "",
    });

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [userLocation, setUserLocation] =
    useState({
      lat: 9.9312,
      lng: 76.2673,
    });


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    fetchResources();
    getLocation();
  }, []);


  // ==========================================================
  // FETCH SUPABASE RESOURCES
  // ==========================================================

  async function fetchResources(refresh = false) {

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    const {
      data,
      error: supabaseError,
    } = await supabase
      .from("resources")
      .select("*")
      .eq("available", true)
      .order("created_at", {
        ascending: false,
      });

    if (supabaseError) {

      console.error(
        "Supabase error:",
        supabaseError
      );

      setError(
        "Unable to load resources. Please try again."
      );

    } else {

      setResources(data || []);

    }

    setLoading(false);
    setRefreshing(false);
  }


  // ==========================================================
  // GET LOCATION
  // ==========================================================

  function getLocation() {

    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {

        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

      },

      () => {
        console.log(
          "Location unavailable."
        );
      }
    );
  }


  // ==========================================================
  // FILTER RESOURCES
  // ==========================================================

  const filteredResources = useMemo(() => {

    const query =
      searchQuery.trim().toLowerCase();

    const filtered = resources
      .filter((resource) => {

        const title =
          resource.title || "";

        const category =
          resource.category || "";

        const provider =
          resource.provider_name || "";

        const location =
          resource.location || "";

        const matchesCategory =
          selectedCategory === "All" ||
          category.toLowerCase() ===
            selectedCategory.toLowerCase();

        const searchable =
          `${title} ${category} ${provider} ${location}`
            .toLowerCase();

        return (
          matchesCategory &&
          searchable.includes(query)
        );
      })
      .map((resource) => {

        let distance = null;

        if (
          resource.latitude != null &&
          resource.longitude != null
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

      });


    // SORT

    if (sortBy === "distance") {

      filtered.sort((a, b) => {

        if (a.distance == null) return 1;
        if (b.distance == null) return -1;

        return a.distance - b.distance;

      });

    }

    if (sortBy === "rating") {

      filtered.sort(
        (a, b) =>
          Number(b.rating || 0) -
          Number(a.rating || 0)
      );

    }

    if (sortBy === "price") {

      filtered.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );

    }

    return filtered;

  }, [
    resources,
    searchQuery,
    selectedCategory,
    sortBy,
    userLocation,
  ]);


  // ==========================================================
  // BOOKING
  // ==========================================================

  async function handleBooking(event) {

    event.preventDefault();

    if (!selectedResource) {
      return;
    }

    if (
      farmerInfo.name.trim().length < 2
    ) {
      alert(
        "Please enter your name."
      );

      return;
    }

    if (
      farmerInfo.phone.trim().length < 10
    ) {
      alert(
        "Please enter a valid phone number."
      );

      return;
    }

    setBookingLoading(true);

    const {
      error: bookingError,
    } = await supabase
      .from("bookings")
      .insert([
        {
          resource_id:
            selectedResource.id,

          farmer_name:
            farmerInfo.name.trim(),

          farmer_phone:
            farmerInfo.phone.trim(),

          status:
            "pending",
        },
      ]);

    setBookingLoading(false);

    if (bookingError) {

      console.error(
        "Booking error:",
        bookingError
      );

      alert(
        "Booking failed. Please try again."
      );

      return;
    }

    alert(
      "Booking request sent successfully!"
    );

    setSelectedResource(null);

    setFarmerInfo({
      name: "",
      phone: "",
    });
  }


  // ==========================================================
  // SIDEBAR
  // ==========================================================

  const Sidebar = () => (

    <aside
      className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[210px] bg-[#d9f7df] border-r border-[#c9ead0] flex flex-col transition-transform duration-300 ${
        mobileSidebar
          ? "translate-x-0"
          : "-translate-x-full lg:translate-x-0"
      }`}
    >

      {/* LOGO */}

      <div className="px-5 pt-5 pb-7">

        <Link
          href="/"
          className="flex items-center gap-3"
        >

          <div className="w-9 h-9 rounded-lg bg-[#075d45] text-white flex items-center justify-center">

            <Leaf className="w-5 h-5" />

          </div>

          <span className="font-bold text-[17px] text-[#173e32]">
            Agri-Connect
          </span>

        </Link>

      </div>


      {/* NAVIGATION */}

      <nav className="px-3 space-y-1">

        <SidebarItem
          icon={Grid2X2}
          active
          onClick={() =>
            document
              .getElementById("home")
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }
        >
          Dashboard
        </SidebarItem>


        <SidebarItem
          icon={Store}
          onClick={() =>
            document
              .getElementById("resources")
              ?.scrollIntoView({
                behavior: "smooth",
              })
          }
        >
          Marketplace
        </SidebarItem>


        <SidebarItem
          icon={Users}
        >
          Community
        </SidebarItem>


        <SidebarItem
          icon={CloudSun}
        >
          Weather
        </SidebarItem>

      </nav>


      {/* BOTTOM */}

      <div className="mt-auto px-3 pb-5">

        <SidebarItem icon={Settings}>
          Settings
        </SidebarItem>


        <div className="border-t border-[#bde1c5] my-4" />


        <div className="flex items-center gap-3 px-2">

          <div className="w-9 h-9 rounded-full bg-[#075d45] text-white flex items-center justify-center">

            <User className="w-4 h-4" />

          </div>


          <div className="min-w-0">

            <p className="text-xs font-bold text-[#173e32] truncate">
              Farmer
            </p>

            <p className="text-[10px] text-[#608174] truncate">
              farmer@agri-connect.com
            </p>

          </div>


          <LogOut className="w-4 h-4 text-[#688579] ml-auto" />

        </div>

      </div>

    </aside>
  );


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <div
      id="home"
      className="min-h-screen bg-[#fffdf0] text-[#173e32]"
    >

      <div className="flex">


        {/* SIDEBAR */}

        <Sidebar />


        {/* MOBILE OVERLAY */}

        {mobileSidebar && (

          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden"
            onClick={() =>
              setMobileSidebar(false)
            }
          />

        )}


        {/* MAIN */}

        <main className="flex-1 min-w-0">


          {/* =================================================
              TOP BAR
          ================================================= */}

          <header className="h-[58px] border-b border-[#e7e2cc] bg-[#fffdf0]/95 backdrop-blur sticky top-0 z-30">

            <div className="h-full px-4 sm:px-6 lg:px-7 flex items-center justify-between">


              {/* LEFT */}

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    setMobileSidebar(true)
                  }
                  className="lg:hidden p-2 rounded-lg hover:bg-[#eef7e9]"
                >

                  <Menu className="w-5 h-5" />

                </button>


                <div className="hidden sm:flex items-center gap-2 text-xs">

                  <span className="text-[#8b978f]">
                    Dashboard
                  </span>

                  <ChevronRight className="w-3 h-3 text-[#b5bdb8]" />

                  <span className="font-semibold text-[#315446]">
                    Resources
                  </span>

                </div>

              </div>


              {/* RIGHT */}

              <div className="flex items-center gap-4">


                {/* SEARCH */}

                <div className="hidden md:flex items-center w-[250px] h-8 bg-white border border-[#ddd9c8] rounded-full px-3">

                  <Search className="w-3.5 h-3.5 text-[#89948d]" />

                  <input
                    type="search"
                    placeholder="Search tools, markets, seeds..."
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(
                        event.target.value
                      )
                    }
                    className="w-full bg-transparent outline-none text-xs px-2 text-[#315446] placeholder:text-[#9ca69f]"
                  />

                  {searchQuery && (

                    <button
                      onClick={() =>
                        setSearchQuery("")
                      }
                    >

                      <X className="w-3.5 h-3.5 text-[#89948d]" />

                    </button>

                  )}

                </div>


                {/* NOTIFICATION */}

                <button className="relative">

                  <Bell className="w-[18px] h-[18px] text-[#49675c]" />

                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border border-[#fffdf0]" />

                </button>


                {/* PROFILE */}

                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#e0dccb]">

                  <div className="w-8 h-8 rounded-full bg-[#d5eee0] flex items-center justify-center">

                    <User className="w-4 h-4 text-[#17634d]" />

                  </div>

                  <div>

                    <p className="text-xs font-bold text-[#294b3e]">
                      Alex Farmer
                    </p>

                    <p className="text-[9px] text-[#8a968f]">
                      Premium User
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </header>


          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="px-4 sm:px-6 lg:px-7 py-4 lg:py-5 max-w-[1200px] mx-auto">


            {/* =================================================
                HERO
            ================================================= */}

            <section className="relative h-[310px] sm:h-[350px] rounded-xl overflow-hidden shadow-sm">

              <img
                src={IMAGES.hero}
                alt="Agricultural farm"
                className="absolute inset-0 w-full h-full object-cover"
              />


              {/* DARK GRADIENT */}

              <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-black/5" />


              {/* HERO CONTENT */}

              <div className="relative z-10 h-full flex flex-col justify-center px-7 sm:px-10 max-w-[600px]">

                <h1 className="font-serif text-white text-3xl sm:text-4xl lg:text-[43px] leading-[1.08] font-bold">

                  Empowering Every
                  <br />
                  Farmer, Everywhere.

                </h1>


                <p className="text-white/90 text-sm sm:text-[15px] mt-4 max-w-[510px] leading-relaxed">

                  Connect with the best tools, seeds, and local expertise to grow your harvest and community.

                </p>

              </div>


              {/* SEARCH OVER HERO */}

              <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-[90%] max-w-[680px]">

                <div className="bg-white rounded-xl shadow-xl p-1.5 flex flex-col sm:flex-row gap-1">


                  <div className="flex-1 flex items-center gap-2 px-3 h-10">

                    <Search className="w-4 h-4 text-[#89948d]" />

                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(event) =>
                        setSearchQuery(
                          event.target.value
                        )
                      }
                      placeholder="What are you looking for?"
                      className="w-full outline-none text-xs text-[#315446]"
                    />

                  </div>


                  <div className="hidden sm:flex items-center gap-2 px-4 border-l border-[#e6e2d4] text-xs text-[#51685e]">

                    <MapPin className="w-3.5 h-3.5 text-[#187154]" />

                    Kochi, India

                  </div>


                  <button
                    onClick={() =>
                      document
                        .getElementById(
                          "resources"
                        )
                        ?.scrollIntoView({
                          behavior: "smooth",
                        })
                    }
                    className="h-10 px-6 bg-[#075d45] hover:bg-[#064c3a] text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Find Resources
                  </button>

                </div>

              </div>

            </section>


            {/* =================================================
                CATEGORY SECTION
            ================================================= */}

            <section className="mt-12">

              <div className="flex items-end justify-between mb-4">

                <div>

                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#173e32]">
                    Explore by Category
                  </h2>

                  <p className="text-xs text-[#7e8b84] mt-1">
                    Browse high-quality listings curated for your needs
                  </p>

                </div>


                <button
                  onClick={() =>
                    setSelectedCategory("All")
                  }
                  className="hidden sm:block border border-[#759b89] text-[#356c57] px-3 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-[#edf7ed]"
                >
                  View All Categories
                </button>

              </div>


              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">

                {categories.map(
                  (category) => {

                    const selected =
                      selectedCategory ===
                      category.name;


                    return (

                      <button
                        key={
                          category.name
                        }
                        onClick={() =>
                          setSelectedCategory(
                            selected
                              ? "All"
                              : category.name
                          )
                        }
                        className={`group text-left bg-white rounded-xl overflow-hidden border transition-all ${
                          selected
                            ? "border-[#177254] ring-2 ring-[#177254]/15 shadow-md"
                            : "border-[#ebe7d7] hover:border-[#b4cdbd] hover:shadow-md"
                        }`}
                      >

                        <div className="h-[110px] overflow-hidden bg-[#eef0e9]">

                          <img
                            src={
                              category.image
                            }
                            alt={
                              category.name
                            }
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                        </div>


                        <div className="p-3">

                          <p className="text-[10px] font-bold uppercase text-[#315446]">
                            {category.name}
                          </p>

                          <p className="text-[10px] text-[#8b968f] mt-1">
                            {category.count}
                          </p>

                        </div>

                      </button>

                    );

                  }
                )}

              </div>

            </section>


            {/* =================================================
                CROP ASSISTANT
            ================================================= */}

            <section className="relative mt-7 h-[190px] sm:h-[200px] rounded-xl overflow-hidden">

              <img
                src={IMAGES.cropAssistant}
                alt="Crop assistant"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#173e32]/90 via-[#173e32]/65 to-transparent" />


              <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-8 max-w-[600px]">

                <div className="inline-flex w-fit items-center gap-1.5 bg-white/90 text-[#17634d] px-2.5 py-1 rounded-full text-[9px] font-bold">

                  <Sparkles className="w-3 h-3" />

                  NEW FEATURE

                </div>


                <h2 className="font-serif text-white text-2xl sm:text-3xl font-bold mt-3">

                  Instant Crop Assistant

                </h2>


                <p className="text-white/85 text-xs sm:text-sm mt-1.5 max-w-[430px]">

                  Upload a photo of your crop to diagnose pests, diseases, or nutrient deficiencies in seconds.

                </p>


                <div className="flex gap-2 mt-4">

                  <Link
                    href="/crop-assistant"
                    className="inline-flex items-center gap-2 bg-white text-[#075d45] px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-[#f5f5e9]"
                  >

                    <Camera className="w-3.5 h-3.5" />

                    Upload Photo

                  </Link>


                  <Link
                    href="/crop-assistant"
                    className="inline-flex items-center gap-2 border border-white/60 text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-white/10"
                  >
                    Learn More
                  </Link>

                </div>

              </div>

            </section>


            {/* =================================================
                RESOURCES
            ================================================= */}

            <section
              id="resources"
              className="mt-8"
            >

              <div className="flex items-end justify-between mb-4">

                <div>

                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#173e32]">
                    Resources Near You
                  </h2>

                  <p className="text-xs text-[#7e8b84] mt-1">
                    Top rated listings available near you
                  </p>

                </div>


                <div className="flex items-center gap-2">

                  <select
                    value={sortBy}
                    onChange={(event) =>
                      setSortBy(
                        event.target.value
                      )
                    }
                    className="hidden sm:block bg-white border border-[#ddd9c8] rounded-lg px-3 py-2 text-[10px] text-[#51685e] outline-none"
                  >

                    <option value="distance">
                      Nearest
                    </option>

                    <option value="rating">
                      Highest Rated
                    </option>

                    <option value="price">
                      Lowest Price
                    </option>

                  </select>


                  <button
                    onClick={() =>
                      fetchResources(true)
                    }
                    className="flex items-center gap-1.5 bg-white border border-[#ddd9c8] rounded-lg px-3 py-2 text-[10px] font-semibold text-[#51685e] hover:bg-[#f7f7ec]"
                  >

                    <RefreshCw
                      className={`w-3 h-3 ${
                        refreshing
                          ? "animate-spin"
                          : ""
                      }`}
                    />

                    Refresh

                  </button>


                  <button
                    onClick={() =>
                      setSelectedCategory(
                        "All"
                      )
                    }
                    className="hidden sm:flex items-center gap-1.5 bg-white border border-[#ddd9c8] rounded-lg px-3 py-2 text-[10px] font-semibold text-[#51685e]"
                  >

                    <Filter className="w-3 h-3" />

                    Filter

                  </button>

                </div>

              </div>


              {/* MOBILE SEARCH */}

              <div className="md:hidden flex items-center bg-white border border-[#ddd9c8] rounded-lg px-3 mb-4">

                <Search className="w-4 h-4 text-[#89948d]" />

                <input
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                  placeholder="Search resources..."
                  className="w-full px-2 py-2.5 outline-none text-xs"
                />

              </div>


              {/* ERROR */}

              {error && (

                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">

                  {error}

                  <button
                    onClick={() =>
                      fetchResources()
                    }
                    className="font-bold ml-3 underline"
                  >
                    Retry
                  </button>

                </div>

              )}


              {/* LOADING */}

              {loading && (

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

                  <ResourceSkeleton />
                  <ResourceSkeleton />
                  <ResourceSkeleton />

                </div>

              )}


              {/* EMPTY */}

              {!loading &&
                filteredResources.length ===
                  0 && (

                  <div className="bg-white border border-[#e7e2cc] rounded-xl py-12 text-center">

                    <Search className="w-8 h-8 text-[#94a49b] mx-auto" />

                    <h3 className="font-bold text-sm mt-3 text-[#315446]">
                      No resources found
                    </h3>

                    <p className="text-xs text-[#89948d] mt-1">
                      Try a different search or category.
                    </p>

                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory(
                          "All"
                        );
                      }}
                      className="text-xs text-[#075d45] font-bold mt-3"
                    >
                      Clear Filters
                    </button>

                  </div>

                )}


              {/* RESOURCE CARDS */}

              {!loading &&
                filteredResources.length >
                  0 && (

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">

                    {filteredResources.map(
                      (resource, index) => {

                        const fallbackImages = [
                          IMAGES.resource1,
                          IMAGES.resource2,
                          IMAGES.resource3,
                        ];

                        const image =
                          resource.image_url ||
                          fallbackImages[
                            index %
                              fallbackImages.length
                          ];


                        return (

                          <article
                            key={
                              resource.id
                            }
                            className="bg-white rounded-xl overflow-hidden border border-[#e7e2cc] shadow-sm hover:shadow-lg transition-all group"
                          >

                            {/* IMAGE */}

                            <div className="relative h-[170px] overflow-hidden">

                              <img
                                src={image}
                                alt={
                                  resource.title ||
                                  "Agricultural resource"
                                }
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />


                              <span className="absolute top-3 left-3 bg-[#075d45] text-white text-[9px] font-bold px-2.5 py-1 rounded-full">

                                {resource.category ||
                                  "Marketplace"}

                              </span>

                            </div>


                            {/* CONTENT */}

                            <div className="p-4">

                              <div className="flex justify-between gap-2">

                                <h3 className="font-bold text-sm text-[#24473b] leading-tight">

                                  {resource.title ||
                                    "Agricultural Resource"}

                                </h3>


                                <span className="flex items-center gap-1 text-[10px] text-[#547164] whitespace-nowrap">

                                  <Star className="w-3 h-3 fill-[#e3a52b] text-[#e3a52b]" />

                                  {resource.rating ||
                                    "4.8"}

                                </span>

                              </div>


                              {/* LOCATION */}

                              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-[#7c8a83]">

                                <MapPin className="w-3 h-3" />

                                {resource.location ||
                                  "Location available"}

                              </div>


                              {resource.distance !=
                                null && (

                                <p className="text-[10px] text-[#9aa49e] mt-1">

                                  {Number(
                                    resource.distance
                                  ).toFixed(
                                    1
                                  )}{" "}
                                  km away

                                </p>

                              )}


                              {/* PRICE */}

                              <div className="mt-4">

                                <span className="text-lg font-bold text-[#173e32]">

                                  ₹
                                  {Number(
                                    resource.price ||
                                      0
                                  ).toLocaleString(
                                    "en-IN"
                                  )}

                                </span>

                                {resource.price_unit && (

                                  <span className="text-[10px] text-[#8d9892]">

                                    /
                                    {
                                      resource.price_unit
                                    }

                                  </span>

                                )}

                              </div>


                              {/* BUTTON */}

                              <button
                                onClick={() =>
                                  setSelectedResource(
                                    resource
                                  )
                                }
                                className="w-full mt-4 h-9 rounded-lg bg-[#075d45] hover:bg-[#064c3a] text-white text-[10px] font-bold flex items-center justify-center gap-2 transition-colors"
                              >

                                View Details

                                <ArrowRight className="w-3.5 h-3.5" />

                              </button>

                            </div>

                          </article>

                        );

                      }
                    )}

                  </div>

                )}

            </section>


            {/* =================================================
                FEATURES
            ================================================= */}

            <section className="grid grid-cols-2 md:grid-cols-4 gap-5 border-t border-b border-[#e7e2cc] py-7 mt-10">

              <Feature
                icon={ShieldCheck}
                title="Verified Listings"
                text="Every tool inspected"
              />

              <Feature
                icon={Users}
                title="Active Community"
                text="5,000+ local farmers"
              />

              <Feature
                icon={Headphones}
                title="Expert Support"
                text="Available 24/7"
              />

              <Feature
                icon={Leaf}
                title="Sustainable Growth"
                text="Eco-friendly focus"
              />

            </section>


            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="py-7 flex flex-col md:flex-row justify-between items-center gap-5">

              <div className="flex items-center gap-2">

                <div className="w-7 h-7 rounded-lg bg-[#075d45] text-white flex items-center justify-center">

                  <Leaf className="w-4 h-4" />

                </div>

                <span className="font-bold text-sm text-[#173e32]">
                  Agri-Connect
                </span>

              </div>


              <div className="flex gap-6 text-[10px] text-[#687c72]">

                <Link
                  href="/"
                  className="hover:text-[#075d45]"
                >
                  Home
                </Link>

                <Link
                  href="#resources"
                  className="hover:text-[#075d45]"
                >
                  Explore Resources
                </Link>

                <Link
                  href="/crop-assistant"
                  className="hover:text-[#075d45]"
                >
                  Crop Assistant
                </Link>

                <Link
                  href="/provider"
                  className="hover:text-[#075d45]"
                >
                  List a Resource
                </Link>

              </div>


              <p className="text-[9px] text-[#9aa39e]">
                © 2026 Agri-Connect. All rights reserved.
              </p>

            </footer>

          </div>

        </main>

      </div>


      {/* ========================================================
          BOOKING / DETAILS MODAL
      ======================================================== */}

      {selectedResource && (

        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(event) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedResource(null);
            }

          }}
        >

          <div className="bg-[#fffdf5] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* HEADER IMAGE */}

            <div className="relative h-40">

              <img
                src={
                  selectedResource.image_url ||
                  IMAGES.resource1
                }
                alt={
                  selectedResource.title
                }
                className="w-full h-full object-cover"
              />


              <button
                onClick={() =>
                  setSelectedResource(
                    null
                  )
                }
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center"
              >

                <X className="w-4 h-4 text-[#315446]" />

              </button>

            </div>


            {/* DETAILS */}

            <div className="p-5">

              <span className="text-[9px] font-bold uppercase bg-[#e3f4e5] text-[#17634d] px-2 py-1 rounded">
                {selectedResource.category ||
                  "Resource"}
              </span>


              <h2 className="font-serif text-xl font-bold text-[#173e32] mt-2">

                {selectedResource.title}

              </h2>


              <div className="mt-3 space-y-2 text-xs text-[#687c72]">

                <div className="flex items-center gap-2">

                  <MapPin className="w-4 h-4 text-[#075d45]" />

                  {selectedResource.location ||
                    "Location unavailable"}

                </div>


                {selectedResource.provider_name && (

                  <div className="flex items-center gap-2">

                    <User className="w-4 h-4 text-[#075d45]" />

                    {selectedResource.provider_name}

                  </div>

                )}


                <div className="flex items-center gap-2">

                  <Star className="w-4 h-4 text-[#e3a52b]" />

                  {selectedResource.rating ||
                    "4.8"}{" "}
                  rating

                </div>

              </div>


              {/* PRICE */}

              <div className="mt-4">

                <span className="text-xl font-bold text-[#173e32]">

                  ₹
                  {Number(
                    selectedResource.price ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}

                </span>

                {selectedResource.price_unit && (

                  <span className="text-xs text-[#89948d]">
                    /{selectedResource.price_unit}
                  </span>

                )}

              </div>


              <p className="text-xs text-[#7c8a83] mt-3">
                Enter your details and the provider can contact you to confirm your booking.
              </p>


              {/* BOOKING FORM */}

              <form
                onSubmit={handleBooking}
                className="mt-4 space-y-3"
              >

                <input
                  required
                  minLength={2}
                  value={
                    farmerInfo.name
                  }
                  onChange={(event) =>
                    setFarmerInfo({
                      ...farmerInfo,
                      name:
                        event.target.value,
                    })
                  }
                  placeholder="Your name"
                  className="w-full h-10 rounded-lg border border-[#dedbca] bg-white px-3 text-xs outline-none focus:ring-2 focus:ring-[#075d45]/20 focus:border-[#075d45]"
                />


                <div className="relative">

                  <Phone className="absolute left-3 top-3 w-4 h-4 text-[#8a968f]" />

                  <input
                    required
                    minLength={10}
                    type="tel"
                    value={
                      farmerInfo.phone
                    }
                    onChange={(event) =>
                      setFarmerInfo({
                        ...farmerInfo,
                        phone:
                          event.target.value,
                      })
                    }
                    placeholder="Phone number"
                    className="w-full h-10 rounded-lg border border-[#dedbca] bg-white pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-[#075d45]/20 focus:border-[#075d45]"
                  />

                </div>


                <div className="flex gap-2 pt-2">

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedResource(
                        null
                      )
                    }
                    className="flex-1 h-10 border border-[#d9d5c5] rounded-lg text-xs font-semibold text-[#62736b]"
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={
                      bookingLoading
                    }
                    className="flex-1 h-10 bg-[#075d45] hover:bg-[#064c3a] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2"
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

        </div>

      )}

    </div>
  );
}


// ============================================================
// FEATURE COMPONENT
// ============================================================

function Feature({
  icon: Icon,
  title,
  text,
}) {

  return (

    <div className="flex items-center gap-3">

      <div className="w-9 h-9 rounded-full bg-[#e4f6e6] flex items-center justify-center shrink-0">

        <Icon className="w-4 h-4 text-[#087154]" />

      </div>


      <div>

        <h4 className="text-[11px] font-bold text-[#315446]">
          {title}
        </h4>

        <p className="text-[9px] text-[#8a968f] mt-0.5">
          {text}
        </p>

      </div>

    </div>

  );
}