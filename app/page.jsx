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

/* =========================================================
   IMAGES
========================================================= */

const IMAGES = {
  hero:
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85",

  cropAssistant:
    "https://images.unsplash.com/photo-1512428813834-c702c7702b78?auto=format&fit=crop&w=1400&q=85",

  equipment:
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=85",

  workers:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=85",

  seeds:
    "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=900&q=85",

  irrigation:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=85",

  fertilizer:
    "https://images.unsplash.com/photo-1598512752271-33f400b7c9c4?auto=format&fit=crop&w=900&q=85",

  tractor:
    "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=85",

  harvester:
    "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=85",

  seedResource:
    "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=900&q=85",

  irrigationResource:
    "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=85",

  fertilizerResource:
    "https://images.unsplash.com/photo-1598512752271-33f400b7c9c4?auto=format&fit=crop&w=900&q=85",
};

/* =========================================================
   RESOURCE IMAGE HELPER
========================================================= */

function getResourceImage(resource) {
  if (resource?.image_url) {
    return resource.image_url;
  }

  const category = String(resource?.category || "").toLowerCase();
  const title = String(resource?.title || "").toLowerCase();

  if (
    category.includes("equipment") ||
    title.includes("tractor") ||
    title.includes("harvester") ||
    title.includes("machine")
  ) {
    return IMAGES.tractor;
  }

  if (
    category.includes("worker") ||
    category.includes("labour") ||
    category.includes("labor")
  ) {
    return IMAGES.workers;
  }

  if (category.includes("seed")) {
    return IMAGES.seedResource;
  }

  if (
    category.includes("irrigation") ||
    title.includes("pump") ||
    title.includes("drip") ||
    title.includes("sprinkler")
  ) {
    return IMAGES.irrigationResource;
  }

  if (category.includes("fertilizer")) {
    return IMAGES.fertilizerResource;
  }

  return IMAGES.hero;
}

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  {
    name: "Equipment",
    icon: Tractor,
    image: IMAGES.equipment,
  },
  {
    name: "Workers",
    icon: UserCheck,
    image: IMAGES.workers,
  },
  {
    name: "Seeds",
    icon: Sprout,
    image: IMAGES.seeds,
  },
  {
    name: "Irrigation",
    icon: Droplets,
    image: IMAGES.irrigation,
  },
  {
    name: "Fertilizer",
    icon: FlaskConical,
    image: IMAGES.fertilizer,
  },
];

/* =========================================================
   SIDEBAR ITEM
========================================================= */

function SidebarItem({
  icon: Icon,
  children,
  active = false,
  onClick,
}) {
  return (
    <button
      type="button"
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

/* =========================================================
   LOADING CARD
========================================================= */

function ResourceSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#e7e2cc] shadow-sm animate-pulse">
      <div className="h-48 bg-[#e8e6d8]" />

      <div className="p-4 space-y-3">
        <div className="h-4 bg-[#e8e6d8] rounded w-3/4" />
        <div className="h-3 bg-[#e8e6d8] rounded w-1/2" />
        <div className="h-5 bg-[#e8e6d8] rounded w-1/3" />
        <div className="h-9 bg-[#e8e6d8] rounded" />
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function Home() {
  const [resources, setResources] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");
  const [sortBy, setSortBy] = useState("distance");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [selectedResource, setSelectedResource] =
    useState(null);

  const [farmerInfo, setFarmerInfo] = useState({
    name: "",
    phone: "",
  });

  const [bookingLoading, setBookingLoading] =
    useState(false);

  const [userLocation, setUserLocation] = useState({
    lat: 9.9312,
    lng: 76.2673,
  });

  const [locationName, setLocationName] =
    useState("Your location");

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {
    fetchResources();
    getLocation();
  }, []);

  /* =====================================================
     GET RESOURCES
  ===================================================== */

  async function fetchResources(refresh = false) {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      if (!supabase) {
        throw new Error(
          "Supabase is not configured. Check your environment variables."
        );
      }

      const {
        data,
        error: supabaseError,
      } = await supabase
        .from("resources")
        .select("*");

      if (supabaseError) {
        const errorMessage =
          supabaseError?.message ||
          String(supabaseError) ||
          "Unknown Supabase error";

        const errorDetails = [
          `Message: ${supabaseError?.message || "N/A"}`,
          `Code: ${supabaseError?.code || "N/A"}`,
          `Details: ${supabaseError?.details || "N/A"}`,
          `Hint: ${supabaseError?.hint || "N/A"}`,
        ].join(" | ");

        console.error(
          "SUPABASE RESOURCE ERROR:",
          errorDetails
        );

        setError(errorMessage);
        setResources([]);
        return;
      }

      console.log("SUPABASE RESOURCES:", data);

      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("RESOURCE FETCH ERROR:", err);

      setError(
        err?.message ||
          "Something went wrong while loading resources."
      );

      setResources([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  /* =====================================================
     GET USER LOCATION
  ===================================================== */

  function getLocation() {
    if (!navigator.geolocation) {
      setLocationName("Location unavailable");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

        setLocationName("Current location");
      },
      (locationError) => {
        console.log(
          "Location unavailable:",
          locationError.message
        );

        setLocationName("Location unavailable");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  /* =====================================================
     FILTER + SEARCH + SORT
  ===================================================== */

  const filteredResources = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    const filtered = resources
      .filter((resource) => {
        const title = resource.title || "";
        const category = resource.category || "";
        const provider =
          resource.provider_name || "";
        const location =
          resource.location || "";
        const description =
          resource.description || "";

        const matchesCategory =
          selectedCategory === "All" ||
          category.toLowerCase() ===
            selectedCategory.toLowerCase();

        const searchable = `
          ${title}
          ${category}
          ${provider}
          ${location}
          ${description}
        `.toLowerCase();

        const matchesSearch =
          searchable.includes(query);

        return (
          matchesCategory &&
          matchesSearch
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

  /* =====================================================
     CATEGORY COUNTS
  ===================================================== */

  const categoryCounts = useMemo(() => {
    return resources.reduce((counts, resource) => {
      const category = resource.category;

      if (category) {
        counts[category] =
          (counts[category] || 0) + 1;
      }

      return counts;
    }, {});
  }, [resources]);

  /* =====================================================
     FIND RESOURCES
  ===================================================== */

  function handleFindResources() {
    document
      .getElementById("resources")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  /* =====================================================
     BOOK RESOURCE
  ===================================================== */

  async function handleBooking(event) {
  event.preventDefault();

  if (!selectedResource?.id) {
    alert("Resource ID is missing.");
    return;
  }

  const farmerName = farmerInfo.name.trim();
  const farmerPhone = farmerInfo.phone.trim();

  if (farmerName.length < 2) {
    alert("Please enter your name.");
    return;
  }

  if (farmerPhone.replace(/\D/g, "").length < 10) {
    alert("Please enter a valid phone number.");
    return;
  }

  setBookingLoading(true);

  try {
    const bookingResult = await supabase
      .from("bookings")
      .insert([
        {
          resource_id: selectedResource.id,
          farmer_name: farmerName,
          farmer_phone: farmerPhone,
          status: "pending",
        },
      ]);

    if (bookingResult.error) {
      console.error(
        "BOOKING ERROR:",
        bookingResult.error
      );

      alert(
        `Booking failed:\n\n${bookingResult.error.message}`
      );

      return;
    }

    console.log("BOOKING SUCCESS");

    alert(
      "✅ Booking request submitted successfully!"
    );

    setSelectedResource(null);

    setFarmerInfo({
      name: "",
      phone: "",
    });

  } catch (bookingException) {
    console.error(
      "UNEXPECTED BOOKING ERROR:",
      bookingException
    );

    alert(
      `Something went wrong:\n\n${
        bookingException.message || bookingException
      }`
    );

  } finally {
    setBookingLoading(false);
  }
}

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("All");
    setSortBy("distance");
  }

  /* =====================================================
     SIDEBAR
  ===================================================== */

  const Sidebar = () => (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-[210px] bg-[#d9f7df] border-r border-[#c9ead0] flex flex-col transition-transform duration-300 ${
        mobileSidebar
          ? "translate-x-0"
          : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="px-5 pt-5 pb-7">
        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-[#075d45] text-white flex items-center justify-center shadow-md">
            <Leaf className="w-5 h-5" />
          </div>

          <span className="font-bold text-[17px] text-[#173e32]">
            Agri-Connect
          </span>
        </Link>
      </div>

      <nav className="px-3 space-y-1">
        <SidebarItem
          icon={Grid2X2}
          active
          onClick={() => {
            setMobileSidebar(false);

            document
              .getElementById("home")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
        >
          Dashboard
        </SidebarItem>

        <SidebarItem
          icon={Store}
          onClick={() => {
            setMobileSidebar(false);

            document
              .getElementById("resources")
              ?.scrollIntoView({
                behavior: "smooth",
              });
          }}
        >
          Marketplace
        </SidebarItem>

        <SidebarItem
          icon={Users}
          onClick={() => {
            alert(
              "Community feature is coming soon."
            );
          }}
        >
          Community
        </SidebarItem>

        <SidebarItem
          icon={CloudSun}
          onClick={() => {
            alert(
              "Weather feature is coming soon."
            );
          }}
        >
          Weather
        </SidebarItem>
      </nav>

      <div className="mt-auto px-3 pb-5">
        <SidebarItem
          icon={Settings}
          onClick={() => {
            alert(
              "Settings feature is coming soon."
            );
          }}
        >
          Settings
        </SidebarItem>

        <div className="border-t border-[#bde1c5] my-4" />

        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-[#075d45] text-white flex items-center justify-center shadow">
            <User className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-bold text-[#173e32] truncate">
              User
            </p>

            <p className="text-[10px] text-[#608174] truncate">
              Signed in user
            </p>
          </div>

          <LogOut className="w-4 h-4 text-[#688579] ml-auto" />
        </div>
      </div>
    </aside>
  );

  /* =====================================================
     PAGE
  ===================================================== */

  return (
    <div
      id="home"
      className="relative min-h-screen bg-[#fffdf0] text-[#173e32] overflow-hidden"
    >
      {/* Animated background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#b9e8c5]/30 rounded-full blur-3xl animate-float-slow" />

        <div className="absolute top-[35%] -right-40 w-[420px] h-[420px] bg-[#d9efb8]/25 rounded-full blur-3xl animate-float-reverse" />

        <div className="absolute bottom-[-150px] left-[35%] w-[380px] h-[380px] bg-[#c7ead7]/25 rounded-full blur-3xl animate-pulse-slow" />

        <div className="absolute top-[70%] left-[-120px] w-[280px] h-[280px] bg-[#e7f3c8]/20 rounded-full blur-3xl animate-float-slow" />
      </div>

      <div className="relative z-10 flex">
        <Sidebar />

        {/* Mobile overlay */}
        {mobileSidebar && (
          <div
            className="fixed inset-0 bg-black/30 z-40 lg:hidden backdrop-blur-[2px]"
            onClick={() =>
              setMobileSidebar(false)
            }
          />
        )}

        <main className="flex-1 min-w-0">
          {/* =================================================
              HEADER
          ================================================= */}

          <header className="h-[58px] border-b border-[#e7e2cc] bg-[#fffdf0]/90 backdrop-blur-xl sticky top-0 z-30">
            <div className="h-full px-4 sm:px-6 lg:px-7 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
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

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center w-[250px] h-8 bg-white/90 border border-[#ddd9c8] rounded-full px-3 shadow-sm">
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
                      type="button"
                      onClick={() =>
                        setSearchQuery("")
                      }
                    >
                      <X className="w-3.5 h-3.5 text-[#89948d]" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="relative"
                  aria-label="Notifications"
                >
                  <Bell className="w-[18px] h-[18px] text-[#49675c]" />

                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 border border-[#fffdf0] animate-pulse" />
                </button>

                <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#e0dccb]">
                  <div className="w-8 h-8 rounded-full bg-[#d5eee0] flex items-center justify-center">
                    <User className="w-4 h-4 text-[#17634d]" />
                  </div>

                  <div>
                    <p className="text-xs font-bold text-[#294b3e]">
                      User
                    </p>

                    <p className="text-[9px] text-[#8a968f]">
                      AgriConnect User
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="px-4 sm:px-6 lg:px-7 py-4 lg:py-5 max-w-[1200px] mx-auto">
            {/* =================================================
                HERO
            ================================================= */}

            <section className="relative h-[310px] sm:h-[350px] rounded-2xl overflow-hidden shadow-lg group">
              <img
                src={IMAGES.hero}
                alt="Agricultural farm"
                className="absolute inset-0 w-full h-full object-cover scale-105 animate-hero-zoom"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-black/5" />

              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_30%,white_0,transparent_30%)]" />

              <div className="relative z-10 h-full flex flex-col justify-center px-7 sm:px-10 max-w-[600px]">
                <span className="w-fit px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-white text-[9px] font-bold tracking-widest uppercase mb-4">
                  Smart Agriculture Platform
                </span>

                <h1 className="font-serif text-white text-3xl sm:text-4xl lg:text-[43px] leading-[1.08] font-bold drop-shadow-lg">
                  Empowering Every
                  <br />
                  Farmer, Everywhere.
                </h1>

                <p className="text-white/90 text-sm sm:text-[15px] mt-4 max-w-[510px] leading-relaxed">
                  Connect with the best tools,
                  seeds, and local expertise to
                  grow your harvest and community.
                </p>
              </div>

              {/* Search */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-[-1px] w-[90%] max-w-[680px]">
                <div className="bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl p-1.5 flex flex-col sm:flex-row gap-1 border border-white/50">
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
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleFindResources();
                        }
                      }}
                      placeholder="What are you looking for?"
                      className="w-full outline-none text-xs text-[#315446]"
                    />
                  </div>

                  <div className="hidden sm:flex items-center gap-2 px-4 border-l border-[#e6e2d4] text-xs text-[#51685e]">
                    <MapPin className="w-3.5 h-3.5 text-[#187154]" />
                    {locationName}
                  </div>

                  <button
                    type="button"
                    onClick={handleFindResources}
                    className="h-10 px-6 bg-[#075d45] hover:bg-[#064c3a] text-white rounded-lg text-xs font-bold transition-all hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Find Resources
                  </button>
                </div>
              </div>
            </section>

            {/* =================================================
                CATEGORIES
            ================================================= */}

            <section className="mt-12">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#173e32]">
                    Explore by Category
                  </h2>

                  <p className="text-xs text-[#7e8b84] mt-1">
                    Browse agricultural resources
                    available for your needs
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategory("All")
                  }
                  className="hidden sm:block border border-[#759b89] text-[#356c57] px-3 py-1.5 rounded-lg text-[10px] font-semibold hover:bg-[#edf7ed] transition-all"
                >
                  View All Categories
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {categories.map((category) => {
                  const selected =
                    selectedCategory ===
                    category.name;

                  return (
                    <button
                      type="button"
                      key={category.name}
                      onClick={() =>
                        setSelectedCategory(
                          selected
                            ? "All"
                            : category.name
                        )
                      }
                      className={`group text-left bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 ${
                        selected
                          ? "border-[#177254] ring-2 ring-[#177254]/15 shadow-lg -translate-y-1"
                          : "border-[#ebe7d7] hover:border-[#b4cdbd] hover:shadow-lg hover:-translate-y-1"
                      }`}
                    >
                      <div className="h-[120px] overflow-hidden bg-[#eef0e9] relative">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />

                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                        <div className="absolute bottom-2 left-2 w-7 h-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow">
                          <category.icon className="w-4 h-4 text-[#075d45]" />
                        </div>
                      </div>

                      <div className="p-3">
                        <p className="text-[10px] font-bold uppercase text-[#315446]">
                          {category.name}
                        </p>

                        <p className="text-[10px] text-[#8b968f] mt-1">
                          {categoryCounts[
                            category.name
                          ] || 0}{" "}
                          Listings
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* =================================================
                CROP ASSISTANT
            ================================================= */}

            <section className="relative mt-7 h-[190px] sm:h-[200px] rounded-2xl overflow-hidden shadow-md group">
              <img
                src={IMAGES.cropAssistant}
                alt="Crop assistant"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1200ms]"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-[#173e32]/95 via-[#173e32]/65 to-transparent" />

              <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-8 max-w-[600px]">
                <div className="inline-flex w-fit items-center gap-1.5 bg-white/90 text-[#17634d] px-2.5 py-1 rounded-full text-[9px] font-bold shadow">
                  <Sparkles className="w-3 h-3" />
                  NEW FEATURE
                </div>

                <h2 className="font-serif text-white text-2xl sm:text-3xl font-bold mt-3">
                  Instant Crop Assistant
                </h2>

                <p className="text-white/85 text-xs sm:text-sm mt-1.5 max-w-[430px]">
                  Upload a photo of your crop
                  to diagnose pests, diseases,
                  or nutrient deficiencies.
                </p>

                <div className="flex gap-2 mt-4">
                  <Link
                    href="/crop-assistant"
                    className="inline-flex items-center gap-2 bg-white text-[#075d45] px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-[#f5f5e9] hover:-translate-y-0.5 transition-all shadow"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Upload Photo
                  </Link>

                  <Link
                    href="/crop-assistant"
                    className="inline-flex items-center gap-2 border border-white/60 text-white px-4 py-2 rounded-lg text-[10px] font-bold hover:bg-white/10 transition-all"
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
              className="mt-8 scroll-mt-20"
            >
              <div className="flex items-end justify-between mb-4">
                <div>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#173e32]">
                    Resources Near You
                  </h2>

                  <p className="text-xs text-[#7e8b84] mt-1">
                    Agricultural listings from
                    your marketplace
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
                    className="hidden sm:block bg-white border border-[#ddd9c8] rounded-lg px-3 py-2 text-[10px] text-[#51685e] outline-none shadow-sm"
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
                    type="button"
                    onClick={() =>
                      fetchResources(true)
                    }
                    disabled={refreshing}
                    className="flex items-center gap-1.5 bg-white border border-[#ddd9c8] rounded-lg px-3 py-2 text-[10px] font-semibold text-[#51685e] hover:bg-[#f7f7ec] disabled:opacity-50 shadow-sm transition-all"
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
                    type="button"
                    onClick={() => {
                      if (
                        selectedCategory !==
                        "All"
                      ) {
                        setSelectedCategory(
                          "All"
                        );
                      } else {
                        setSortBy("rating");
                      }
                    }}
                    className="hidden sm:flex items-center gap-1.5 bg-white border border-[#ddd9c8] rounded-lg px-3 py-2 text-[10px] font-semibold text-[#51685e] hover:bg-[#f7f7ec] shadow-sm transition-all"
                  >
                    <Filter className="w-3 h-3" />

                    {selectedCategory !==
                    "All"
                      ? "Clear Category"
                      : "Top Rated"}
                  </button>
                </div>
              </div>

              {/* Mobile search */}
              <div className="md:hidden flex items-center bg-white border border-[#ddd9c8] rounded-lg px-3 mb-4 shadow-sm">
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

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 mb-4">
                  <p>{error}</p>

                  <button
                    type="button"
                    onClick={() =>
                      fetchResources()
                    }
                    className="font-bold mt-2 underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <ResourceSkeleton />
                  <ResourceSkeleton />
                  <ResourceSkeleton />
                </div>
              )}

              {/* Empty */}
              {!loading &&
                filteredResources.length ===
                  0 && (
                  <div className="bg-white/90 backdrop-blur-sm border border-[#e7e2cc] rounded-2xl py-12 text-center shadow-sm">
                    <Search className="w-8 h-8 text-[#94a49b] mx-auto" />

                    <h3 className="font-bold text-sm mt-3 text-[#315446]">
                      No resources found
                    </h3>

                    <p className="text-xs text-[#89948d] mt-1">
                      Try a different search or
                      category.
                    </p>

                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs text-[#075d45] font-bold mt-3 hover:underline"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}

              {/* Resource cards */}
              {!loading &&
                filteredResources.length >
                  0 && (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredResources.map(
                      (resource) => {
                        const image =
                          getResourceImage(resource);

                        return (
                          <article
                            key={resource.id}
                            className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden border border-[#e7e2cc] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                          >
                            {/* Image */}
                            <div className="relative h-[190px] overflow-hidden bg-[#eef0e9]">
                              <img
                                src={image}
                                alt={
                                  resource.title ||
                                  "Agricultural resource"
                                }
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                onError={(event) => {
                                  if (
                                    event.currentTarget
                                      .src !==
                                    IMAGES.hero
                                  ) {
                                    event.currentTarget.src =
                                      IMAGES.hero;
                                  }
                                }}
                              />

                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                              <span className="absolute top-3 left-3 bg-[#075d45]/95 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                                {resource.category ||
                                  "Marketplace"}
                              </span>

                              {resource.distance !=
                                null && (
                                <span className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm text-[#315446] text-[9px] font-semibold px-2.5 py-1 rounded-full shadow">
                                  {Number(
                                    resource.distance
                                  ).toFixed(
                                    1
                                  )}{" "}
                                  km away
                                </span>
                              )}
                            </div>

                            {/* Content */}
                            <div className="p-4">
                              <div className="flex justify-between gap-2">
                                <h3 className="font-bold text-sm text-[#24473b] leading-tight">
                                  {resource.title ||
                                    "Agricultural Resource"}
                                </h3>

                                {resource.rating !=
                                  null && (
                                  <span className="flex items-center gap-1 text-[10px] text-[#547164] whitespace-nowrap">
                                    <Star className="w-3 h-3 fill-[#e3a52b] text-[#e3a52b]" />

                                    {Number(
                                      resource.rating
                                    ).toFixed(1)}
                                  </span>
                                )}
                              </div>

                              {/* Location */}
                              {resource.location && (
                                <div className="flex items-center gap-1.5 mt-3 text-[10px] text-[#7c8a83]">
                                  <MapPin className="w-3 h-3" />

                                  {resource.location}
                                </div>
                              )}

                              {/* Provider */}
                              {resource.provider_name && (
                                <p className="text-[10px] text-[#8b968f] mt-2">
                                  Provider:{" "}
                                  {
                                    resource.provider_name
                                  }
                                </p>
                              )}

                              {/* Price */}
                              {resource.price != null && (
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
                              )}

                              {/* Details */}
                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedResource(
                                    resource
                                  )
                                }
                                className="w-full mt-4 h-9 rounded-lg bg-[#075d45] hover:bg-[#064c3a] text-white text-[10px] font-bold flex items-center justify-center gap-2 transition-all hover:shadow-lg"
                              >
                                View Details

                                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
                text="Trusted marketplace resources"
              />

              <Feature
                icon={Users}
                title="Local Community"
                text="Connect with nearby farmers"
              />

              <Feature
                icon={Headphones}
                title="Expert Support"
                text="Agriculture assistance"
              />

              <Feature
                icon={Leaf}
                title="Sustainable Growth"
                text="Better farming resources"
              />
            </section>

            {/* =================================================
                FOOTER
            ================================================= */}

            <footer className="py-7 flex flex-col md:flex-row justify-between items-center gap-5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#075d45] text-white flex items-center justify-center shadow">
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

                <button
                  type="button"
                  onClick={handleFindResources}
                  className="hover:text-[#075d45]"
                >
                  Explore Resources
                </button>

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

      {/* =====================================================
          BOOKING MODAL
      ===================================================== */}

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
            {/* Modal image */}
            <div className="relative h-40 bg-[#eef0e9]">
              <img
                src={getResourceImage(
                  selectedResource
                )}
                alt={
                  selectedResource.title ||
                  "Resource"
                }
                className="w-full h-full object-cover"
                onError={(event) => {
                  event.currentTarget.src =
                    IMAGES.hero;
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

              <button
                type="button"
                onClick={() =>
                  setSelectedResource(null)
                }
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow"
                aria-label="Close"
              >
                <X className="w-4 h-4 text-[#315446]" />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-5">
              <span className="text-[9px] font-bold uppercase bg-[#e3f4e5] text-[#17634d] px-2 py-1 rounded">
                {selectedResource.category ||
                  "Resource"}
              </span>

              <h2 className="font-serif text-xl font-bold text-[#173e32] mt-2">
                {selectedResource.title ||
                  "Agricultural Resource"}
              </h2>

              <div className="mt-3 space-y-2 text-xs text-[#687c72]">
                {selectedResource.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#075d45]" />

                    {selectedResource.location}
                  </div>
                )}

                {selectedResource.provider_name && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#075d45]" />

                    {
                      selectedResource.provider_name
                    }
                  </div>
                )}

                {selectedResource.rating !=
                  null && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-[#e3a52b]" />

                    {Number(
                      selectedResource.rating
                    ).toFixed(1)}{" "}
                    rating
                  </div>
                )}
              </div>

              {/* Description */}
              {selectedResource.description && (
                <p className="text-xs text-[#7c8a83] mt-4 leading-relaxed">
                  {
                    selectedResource.description
                  }
                </p>
              )}

              {/* Price */}
              {selectedResource.price != null && (
                <div className="mt-4">
                  <span className="text-xl font-bold text-[#173e32]">
                    ₹
                    {Number(
                      selectedResource.price ||
                        0
                    ).toLocaleString("en-IN")}
                  </span>

                  {selectedResource.price_unit && (
                    <span className="text-xs text-[#89948d]">
                      /
                      {
                        selectedResource.price_unit
                      }
                    </span>
                  )}
                </div>
              )}

              <p className="text-xs text-[#7c8a83] mt-3">
                Enter your details and the
                provider can contact you to
                confirm your booking.
              </p>

              {/* Booking form */}
              <form
                onSubmit={handleBooking}
                className="mt-4 space-y-3"
              >
                <input
                  required
                  minLength={2}
                  value={farmerInfo.name}
                  onChange={(event) =>
                    setFarmerInfo({
                      ...farmerInfo,
                      name: event.target.value,
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
                    value={farmerInfo.phone}
                    onChange={(event) =>
                      setFarmerInfo({
                        ...farmerInfo,
                        phone: event.target.value,
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
                      setSelectedResource(null)
                    }
                    className="flex-1 h-10 border border-[#d9d5c5] rounded-lg text-xs font-semibold text-[#62736b] hover:bg-[#f5f3e8] transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="flex-1 h-10 bg-[#075d45] hover:bg-[#064c3a] text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors"
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

/* =========================================================
   FEATURE COMPONENT
========================================================= */

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