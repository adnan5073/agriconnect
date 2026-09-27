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
  ShieldCheck,
  Headphones,
  Leaf,
  X,
  Loader2,
  RefreshCw,
  Menu,
  Phone,
  Plus,
  ImagePlus,
} from "lucide-react";

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

const CATEGORY_IMAGES = {
  Equipment: IMAGES.equipment,
  Workers: IMAGES.workers,
  Seeds: IMAGES.seeds,
  Irrigation: IMAGES.irrigation,
  Fertilizer: IMAGES.fertilizer,
};

const CATEGORIES = [
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

const FALLBACK_IMAGES = [
  IMAGES.resource1,
  IMAGES.resource2,
  IMAGES.resource3,
];

function getResourceImage(resource, index = 0) {
  return (
    resource?.image_url ||
    CATEGORY_IMAGES[resource?.category] ||
    FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]
  );
}

function getProviderName(resource) {
  return (
    resource?.provider_name ||
    resource?.owner_name ||
    resource?.provider ||
    "Local Provider"
  );
}

function getLocation(resource) {
  return resource?.location || "Location not specified";
}

function getPhone(resource) {
  return resource?.phone || "";
}

export default function HomePage() {
  const [resources, setResources] = useState([]);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [supabaseError, setSupabaseError] = useState("");

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [mobileMenu, setMobileMenu] = useState(false);

  const [selectedResource, setSelectedResource] = useState(null);

  const [showBooking, setShowBooking] = useState(false);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [showAddResource, setShowAddResource] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const [resourceForm, setResourceForm] = useState({
    title: "",
    category: "Equipment",
    description: "",
    price: "",
    price_unit: "day",
    location: "",
    phone: "",
    image_url: "",
  });

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    loadResources();
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (mounted) {
        setUser(session?.user ?? null);

        if (session?.user) {
          const fullName =
            session.user.user_metadata?.full_name ||
            session.user.email?.split("@")[0] ||
            "";

          setBookingName(fullName);
        }

        setAuthLoading(false);
      }
    }

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setUser(session?.user ?? null);

      if (session?.user) {
        const fullName =
          session.user.user_metadata?.full_name ||
          session.user.email?.split("@")[0] ||
          "";

        setBookingName(fullName);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        setUserLocation(null);
      }
    );
  }, []);

  async function loadResources(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setSupabaseError("");

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("SUPABASE RESOURCES ERROR:", error);
      setSupabaseError(error.message);
      setResources([]);
    } else {
      console.log("RESOURCES FROM SUPABASE:", data);

      const normalized = (data || []).map((item, index) => {
        let distance = null;

        if (
          userLocation &&
          item.latitude != null &&
          item.longitude != null
        ) {
          try {
            distance = getDistanceKm(
              userLocation.latitude,
              userLocation.longitude,
              Number(item.latitude),
              Number(item.longitude)
            );
          } catch {
            distance = null;
          }
        }

        return {
          ...item,
          distance,
          _index: index,
        };
      });

      setResources(normalized);
    }

    setLoading(false);
    setRefreshing(false);
  }

  function openLogin() {
    setAuthMode("login");
    setAuthError("");
    setAuthMessage("");
    setShowAuthModal(true);
  }

  function openSignup() {
    setAuthMode("signup");
    setAuthError("");
    setAuthMessage("");
    setShowAuthModal(true);
  }

  async function handleAuthSubmit(e) {
    e.preventDefault();

    setAuthError("");
    setAuthMessage("");
    setAuthSubmitting(true);

    try {
      if (authMode === "signup") {
        if (!authName.trim()) {
          setAuthError("Please enter your name.");
          setAuthSubmitting(false);
          return;
        }

        if (authPassword.length < 6) {
          setAuthError("Password must be at least 6 characters.");
          setAuthSubmitting(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: {
            data: {
              full_name: authName.trim(),
            },
          },
        });

        if (error) {
          setAuthError(error.message);
          setAuthSubmitting(false);
          return;
        }

        if (data.session) {
          setUser(data.session.user);
          setShowAuthModal(false);
        } else {
          setAuthMessage(
            "Account created successfully. Please check your email to verify your account."
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail.trim(),
          password: authPassword,
        });

        if (error) {
          setAuthError(error.message);
          setAuthSubmitting(false);
          return;
        }

        setUser(data.user);
        setShowAuthModal(false);
      }
    } catch (error) {
      console.error("AUTH ERROR:", error);
      setAuthError(error.message || "Authentication failed.");
    }

    setAuthSubmitting(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  function openAddResource() {
    if (!user) {
      openLogin();
      return;
    }

    setAddError("");

    setResourceForm({
      title: "",
      category: "Equipment",
      description: "",
      price: "",
      price_unit: "day",
      location: "",
      phone: "",
      image_url: "",
    });

    setShowAddResource(true);
    setMobileMenu(false);
  }

  async function handleAddResource(e) {
    e.preventDefault();

    if (!user) {
      openLogin();
      return;
    }

    setAddError("");

    if (!resourceForm.title.trim()) {
      setAddError("Please enter a resource name.");
      return;
    }

    if (!resourceForm.description.trim()) {
      setAddError("Please enter a description.");
      return;
    }

    if (!resourceForm.price) {
      setAddError("Please enter the price.");
      return;
    }

    if (!resourceForm.location.trim()) {
      setAddError("Please enter the location.");
      return;
    }

    if (!resourceForm.phone.trim()) {
      setAddError("Please enter a contact number.");
      return;
    }

    setAddLoading(true);

    const providerName =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Resource Owner";

    const insertData = {
      owner_id: user.id,
      title: resourceForm.title.trim(),
      provider_name: providerName,
      category: resourceForm.category,
      description: resourceForm.description.trim(),
      price: Number(resourceForm.price),
      price_unit: resourceForm.price_unit,
      location: resourceForm.location.trim(),
      phone: resourceForm.phone.trim(),
      image_url: resourceForm.image_url.trim() || null,
      available: true,
      status: "pending",
    };

    console.log("ADDING RESOURCE:", insertData);

    const { error } = await supabase
      .from("resources")
      .insert([insertData]);

    if (error) {
      console.error("ADD RESOURCE ERROR:", error);
      setAddError(error.message);
      setAddLoading(false);
      return;
    }

    alert(
      "Resource submitted successfully!\n\nIt will appear after admin approval."
    );

    setShowAddResource(false);
    setAddLoading(false);

    await loadResources(true);
  }

  function openResource(resource) {
    setSelectedResource(resource);
  }

  function closeResource() {
    setSelectedResource(null);
  }

  function handleBook(resource) {
    if (!user) {
      setSelectedResource(null);
      openLogin();
      return;
    }

    setSelectedResource(resource);
    setBookingName(
      user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        ""
    );
    setBookingPhone(resource.phone || "");
    setShowBooking(true);
  }

  async function handleBooking(e) {
    e.preventDefault();

    if (!user) {
      openLogin();
      return;
    }

    if (!selectedResource?.id) {
      alert("Resource information is missing.");
      return;
    }

    if (!bookingName.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!bookingPhone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    setBookingLoading(true);

    const bookingData = {
      resource_id: selectedResource.id,
      farmer_id: user.id,
      farmer_name: bookingName.trim(),
      farmer_phone: bookingPhone.trim(),
      status: "pending",
    };

    console.log("BOOKING DATA:", bookingData);

    const { error } = await supabase
      .from("bookings")
      .insert([bookingData]);

    if (error) {
      console.error("BOOKING ERROR:", error);

      alert(
        `Booking failed:\n\n${error.message}`
      );

      setBookingLoading(false);
      return;
    }

    setBookingLoading(false);
    setShowBooking(false);

    alert(
      "Booking request submitted successfully!\n\nThe provider/admin can now review your request."
    );
  }

  function handleFindResources() {
    const element = document.getElementById("resources");

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function handleCategory(category) {
    setSelectedCategory(category);

    const element = document.getElementById("resources");

    if (element) {
      setTimeout(() => {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }

  const filteredResources = useMemo(() => {
    let result = [...resources];

    if (selectedCategory !== "All") {
      result = result.filter(
        (resource) =>
          String(resource.category || "").toLowerCase() ===
          selectedCategory.toLowerCase()
      );
    }

    const query = search.trim().toLowerCase();

    if (query) {
      result = result.filter((resource) => {
        const title = String(resource.title || "").toLowerCase();
        const category = String(resource.category || "").toLowerCase();
        const description = String(
          resource.description || ""
        ).toLowerCase();
        const provider = String(
          getProviderName(resource)
        ).toLowerCase();
        const location = String(
          getLocation(resource)
        ).toLowerCase();

        return (
          title.includes(query) ||
          category.includes(query) ||
          description.includes(query) ||
          provider.includes(query) ||
          location.includes(query)
        );
      });
    }

    result = result.filter((resource) => {
      if (resource.status === undefined || resource.status === null) {
        return true;
      }

      return resource.status !== "rejected";
    });

    if (sortBy === "price-low") {
      result.sort(
        (a, b) =>
          Number(a.price || 0) -
          Number(b.price || 0)
      );
    }

    if (sortBy === "price-high") {
      result.sort(
        (a, b) =>
          Number(b.price || 0) -
          Number(a.price || 0)
      );
    }

    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
      );
    }

    return result;
  }, [
    resources,
    selectedCategory,
    search,
    sortBy,
  ]);

  const categoryCounts = useMemo(() => {
    const counts = {};

    CATEGORIES.forEach((category) => {
      counts[category.name] = resources.filter(
        (resource) =>
          String(resource.category || "").toLowerCase() ===
          category.name.toLowerCase()
      ).length;
    });

    return counts;
  }, [resources]);

  return (
    <main className="min-h-screen bg-[#f8f7ef] text-[#17372b] overflow-hidden">

      <style jsx global>{`
        @keyframes agriFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-12px);
          }
        }

        @keyframes agriFloatSlow {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(20px, -20px, 0);
          }
        }

        @keyframes agriPulse {
          0%, 100% {
            opacity: .25;
            transform: scale(1);
          }
          50% {
            opacity: .5;
            transform: scale(1.08);
          }
        }

        @keyframes agriShimmer {
          0% {
            background-position: -500px 0;
          }
          100% {
            background-position: 500px 0;
          }
        }

        .agri-float {
          animation: agriFloat 5s ease-in-out infinite;
        }

        .agri-float-slow {
          animation: agriFloatSlow 9s ease-in-out infinite;
        }

        .agri-pulse {
          animation: agriPulse 6s ease-in-out infinite;
        }

        .agri-shimmer {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.05),
            rgba(255,255,255,0.25),
            rgba(255,255,255,0.05)
          );
          background-size: 500px 100%;
          animation: agriShimmer 3s infinite linear;
        }

        html {
          scroll-behavior: smooth;
        }

        ::selection {
          background: #b8e6d1;
          color: #17372b;
        }
      `}</style>

      {/* Decorative Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#ccebdc] opacity-30 blur-3xl agri-float-slow" />
        <div className="absolute top-[35%] -right-40 w-[450px] h-[450px] rounded-full bg-[#e8e1b9] opacity-25 blur-3xl agri-float-slow" />
        <div className="absolute bottom-0 left-[35%] w-96 h-96 rounded-full bg-[#bce1d1] opacity-20 blur-3xl agri-pulse" />
      </div>

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 bottom-0 z-40 hidden lg:flex w-[250px] flex-col bg-[#d9eee3] border-r border-[#c6ddd1]">

        <div className="px-7 pt-8 pb-7">
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#075d45] text-white flex items-center justify-center shadow-lg">
              <Leaf size={23} />
            </div>

            <div>
              <h1 className="font-bold text-xl tracking-tight">
                Agri-Connect
              </h1>

              <p className="text-[10px] uppercase tracking-[0.2em] text-[#668077]">
                Farm Resource Network
              </p>
            </div>
          </Link>
        </div>

        <nav className="px-4 space-y-2">

          <button
            onClick={() => {
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              });
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-white/70 text-[#075d45] font-semibold text-sm"
          >
            <Grid2X2 size={18} />
            Dashboard
          </button>

          <button
            onClick={handleFindResources}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#49645a] hover:bg-white/60 transition text-sm"
          >
            <Store size={18} />
            Resources
          </button>

          <button
            onClick={() => handleCategory("Workers")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#49645a] hover:bg-white/60 transition text-sm"
          >
            <Users size={18} />
            Workers
          </button>

          <button
            onClick={() => handleCategory("Equipment")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#49645a] hover:bg-white/60 transition text-sm"
          >
            <Tractor size={18} />
            Equipment
          </button>

          <Link
            href="/crop-assistant"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#49645a] hover:bg-white/60 transition text-sm"
          >
            <Sparkles size={18} />
            Crop Assistant
          </Link>

          <button
            onClick={openAddResource}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#49645a] hover:bg-white/60 transition text-sm"
          >
            <Plus size={18} />
            Add Tool for Rent
          </button>
        </nav>

        <div className="mt-auto p-5">

          <div className="rounded-2xl bg-white/60 p-4 mb-4 border border-white">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck
                size={17}
                className="text-[#075d45]"
              />

              <span className="font-semibold text-sm">
                Trusted Network
              </span>
            </div>

            <p className="text-xs text-[#71867d] leading-relaxed">
              Find agricultural resources and
              connect with local providers.
            </p>
          </div>

          <Link
            href="/admin/login"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#49645a] hover:bg-white/70 transition text-sm"
          >
            <Settings size={18} />
            Admin Login
          </Link>
        </div>
      </aside>

      {/* MOBILE SIDEBAR */}
      {mobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">

          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileMenu(false)}
          />

          <aside className="absolute left-0 top-0 bottom-0 w-[280px] bg-[#d9eee3] p-6 shadow-2xl">

            <div className="flex items-center justify-between mb-8">

              <Link
                href="/"
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#075d45] text-white flex items-center justify-center">
                  <Leaf size={20} />
                </div>

                <span className="font-bold">
                  Agri-Connect
                </span>
              </Link>

              <button
                onClick={() => setMobileMenu(false)}
                className="p-2 rounded-xl bg-white/60"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">

              <button
                onClick={() => {
                  setMobileMenu(false);
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  });
                }}
                className="w-full text-left px-4 py-3 rounded-xl bg-white/70 text-sm font-semibold"
              >
                Dashboard
              </button>

              <button
                onClick={() => {
                  setMobileMenu(false);
                  handleFindResources();
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/60 text-sm"
              >
                Resources
              </button>

              <button
                onClick={() => {
                  setMobileMenu(false);
                  openAddResource();
                }}
                className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/60 text-sm"
              >
                Add Tool for Rent
              </button>

              <Link
                href="/crop-assistant"
                onClick={() => setMobileMenu(false)}
                className="block px-4 py-3 rounded-xl hover:bg-white/60 text-sm"
              >
                Crop Assistant
              </Link>

              <Link
                href="/admin/login"
                onClick={() => setMobileMenu(false)}
                className="block px-4 py-3 rounded-xl hover:bg-white/60 text-sm"
              >
                Admin Login
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN */}
      <div className="lg:ml-[250px] relative z-10">

        {/* TOP BAR */}
        <header className="h-[76px] bg-white/70 backdrop-blur-md border-b border-[#e4e7df] flex items-center justify-between px-5 md:px-8 sticky top-0 z-30">

          <div className="flex items-center gap-3">

            <button
              onClick={() => setMobileMenu(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-[#edf5ef]"
            >
              <Menu size={22} />
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#75877f]">
              <span>Home</span>
              <ChevronRight size={13} />
              <span className="text-[#17372b] font-medium">
                Dashboard
              </span>
            </div>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={handleFindResources}
              className="hidden md:flex items-center gap-2 w-[230px] rounded-xl border border-[#dfe7e0] bg-white px-4 py-2.5 text-xs text-[#85938c]"
            >
              <Search size={15} />
              Search resources
            </button>

            <button className="relative w-10 h-10 rounded-xl bg-white border border-[#e4e7df] flex items-center justify-center">
              <Bell size={18} />

              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#d56b54]" />
            </button>

            {authLoading ? (
              <div className="w-10 h-10 rounded-full bg-[#e7eee9] animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">

                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold">
                    {user.user_metadata?.full_name ||
                      user.email?.split("@")[0] ||
                      "User"}
                  </p>

                  <p className="text-[10px] text-[#84928b]">
                    Farmer
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="w-10 h-10 rounded-full bg-[#d9eee3] text-[#075d45] flex items-center justify-center"
                >
                  <LogOut size={17} />
                </button>
              </div>
            ) : (
              <button
                onClick={openLogin}
                className="px-4 py-2.5 rounded-xl bg-[#075d45] text-white text-xs font-semibold hover:bg-[#064d3a] transition"
              >
                Login
              </button>
            )}
          </div>
        </header>

        {/* HERO */}
        <section className="px-5 md:px-8 pt-7">

          <div className="relative h-[390px] md:h-[430px] rounded-[30px] overflow-hidden shadow-xl">

            <img
              src={IMAGES.hero}
              alt="Agricultural field"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#102c20]/85 via-[#193b29]/50 to-transparent" />

            <div className="absolute inset-0 agri-shimmer opacity-30" />

            <div className="relative h-full flex flex-col justify-center px-7 md:px-14 max-w-3xl text-white">

              <div className="inline-flex items-center gap-2 w-fit rounded-full bg-white/15 backdrop-blur px-4 py-2 mb-5 text-xs border border-white/20">
                <Leaf size={14} />
                Everything farmers need, in one place
              </div>

              <h2 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                Empowering Every
                <br />
                Farmer, Everywhere.
              </h2>

              <p className="mt-5 max-w-xl text-white/80 text-sm md:text-base leading-relaxed">
                Discover equipment, workers, seeds,
                irrigation and fertilizers from
                agricultural providers around you.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3">

                <button
                  onClick={handleFindResources}
                  className="px-6 py-3.5 rounded-xl bg-white text-[#075d45] font-semibold text-sm hover:scale-[1.02] transition"
                >
                  Explore Resources
                </button>

                <button
                  onClick={openAddResource}
                  className="px-6 py-3.5 rounded-xl bg-white/15 border border-white/30 backdrop-blur font-semibold text-sm hover:bg-white/20 transition"
                >
                  List Your Resource
                </button>
              </div>
            </div>

            <div className="absolute right-8 top-10 hidden md:block agri-float">
              <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center">
                <Sprout size={36} />
              </div>
            </div>

          </div>

          {/* SEARCH */}
          <div className="relative -mt-7 mx-5 md:mx-14 z-10">

            <div className="bg-white rounded-2xl shadow-xl border border-[#e7e9e2] p-3 flex flex-col md:flex-row gap-3">

              <div className="flex-1 flex items-center gap-3 px-4">
                <Search
                  size={20}
                  className="text-[#8b9992]"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  placeholder="Search equipment, workers, seeds..."
                  className="w-full outline-none text-sm bg-transparent"
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value)
                }
                className="px-4 py-3 rounded-xl bg-[#f4f7f3] text-xs outline-none border-none"
              >
                <option value="default">
                  Sort: Default
                </option>
                <option value="newest">
                  Newest
                </option>
                <option value="price-low">
                  Price: Low to High
                </option>
                <option value="price-high">
                  Price: High to Low
                </option>
              </select>

              <button
                onClick={handleFindResources}
                className="px-7 py-3 rounded-xl bg-[#075d45] text-white text-sm font-semibold"
              >
                Search
              </button>
            </div>
          </div>
        </section>

        {/* CATEGORY SECTION */}
        <section className="px-5 md:px-8 pt-16">

          <div className="flex items-end justify-between mb-6">

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7c8e86] mb-2">
                Browse resources
              </p>

              <h2 className="text-2xl md:text-3xl font-bold">
                Find What You Need
              </h2>
            </div>

            <button
              onClick={() => handleCategory("All")}
              className="hidden md:flex items-center gap-2 text-sm font-semibold text-[#075d45]"
            >
              View all
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">

            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              const active =
                selectedCategory === category.name;

              return (
                <button
                  key={category.name}
                  onClick={() =>
                    handleCategory(category.name)
                  }
                  className={`group text-left rounded-2xl overflow-hidden border transition-all duration-300 ${
                    active
                      ? "border-[#075d45] shadow-lg scale-[1.01]"
                      : "border-[#e1e7e2] hover:-translate-y-1 hover:shadow-lg"
                  } bg-white`}
                >
                  <div className="h-32 relative overflow-hidden">

                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute bottom-3 left-3 w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center text-[#075d45]">
                      <Icon size={18} />
                    </div>
                  </div>

                  <div className="p-4">

                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">
                        {category.name}
                      </h3>

                      <ChevronRight
                        size={15}
                        className="text-[#899891]"
                      />
                    </div>

                    <p className="text-xs text-[#87958e] mt-1">
                      {categoryCounts[category.name] || 0} resources
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* CROP ASSISTANT */}
        <section className="px-5 md:px-8 pt-16">

          <div className="relative min-h-[260px] rounded-[28px] overflow-hidden">

            <img
              src={IMAGES.cropAssistant}
              alt="Crop assistant"
              className="absolute inset-0 w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#153a2a]/90 via-[#24553d]/75 to-transparent" />

            <div className="relative p-8 md:p-12 text-white max-w-2xl">

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs mb-5">
                <Sparkles size={14} />
                AI powered
              </div>

              <h2 className="text-3xl md:text-4xl font-bold">
                Need help with your crop?
              </h2>

              <p className="mt-3 text-sm text-white/75 max-w-lg leading-relaxed">
                Upload a crop leaf image and get
                assistance identifying possible
                diseases and recommended next steps.
              </p>

              <Link
                href="/crop-assistant"
                className="inline-flex items-center gap-2 mt-7 px-5 py-3 rounded-xl bg-white text-[#075d45] text-sm font-semibold hover:scale-[1.02] transition"
              >
                <Camera size={17} />
                Open Crop Assistant
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* RESOURCES */}
        <section
          id="resources"
          className="px-5 md:px-8 pt-16"
        >

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#7c8e86] mb-2">
                Marketplace
              </p>

              <h2 className="text-2xl md:text-3xl font-bold">
                Agricultural Resources
              </h2>

              <p className="text-sm text-[#81918a] mt-2">
                Find useful resources from local providers.
              </p>
            </div>

            <div className="flex items-center gap-2">

              <button
                onClick={() => handleCategory("All")}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === "All"
                    ? "bg-[#075d45] text-white"
                    : "bg-white border border-[#e2e8e3]"
                }`}
              >
                All
              </button>

              <button
                onClick={() =>
                  loadResources(true)
                }
                className="w-10 h-10 rounded-xl bg-white border border-[#e2e8e3] flex items-center justify-center hover:bg-[#f0f5f1]"
                title="Refresh"
              >
                <RefreshCw
                  size={15}
                  className={
                    refreshing
                      ? "animate-spin"
                      : ""
                  }
                />
              </button>
            </div>
          </div>

          {/* SUPABASE ERROR */}
          {supabaseError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">

              <div className="flex gap-3">

                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <X size={18} />
                </div>

                <div>
                  <h3 className="font-semibold text-red-800 text-sm">
                    Unable to load resources
                  </h3>

                  <p className="text-xs text-red-700 mt-1">
                    {supabaseError}
                  </p>

                  <button
                    onClick={() =>
                      loadResources(true)
                    }
                    className="mt-3 text-xs font-semibold text-red-800 underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LOADING */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {[1, 2, 3, 4, 5, 6].map(
                (item) => (
                  <div
                    key={item}
                    className="bg-white rounded-2xl border border-[#e5e9e5] overflow-hidden"
                  >
                    <div className="h-48 bg-[#e8eee9] animate-pulse" />

                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-[#e8eee9] rounded animate-pulse w-2/3" />
                      <div className="h-3 bg-[#e8eee9] rounded animate-pulse w-full" />
                      <div className="h-3 bg-[#e8eee9] rounded animate-pulse w-4/5" />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : filteredResources.length === 0 ? (

            <div className="rounded-3xl bg-white border border-[#e5e9e5] p-12 text-center">

              <div className="w-16 h-16 rounded-2xl bg-[#eaf4ed] text-[#075d45] mx-auto flex items-center justify-center mb-4">
                <Store size={28} />
              </div>

              <h3 className="text-lg font-bold">
                No resources found
              </h3>

              <p className="text-sm text-[#87958e] mt-2 max-w-md mx-auto">
                Try another search or category.
                You can also add your own agricultural
                resource.
              </p>

              <button
                onClick={openAddResource}
                className="mt-6 px-5 py-3 rounded-xl bg-[#075d45] text-white text-sm font-semibold"
              >
                Add Resource
              </button>
            </div>

          ) : (

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

              {filteredResources.map(
                (resource, index) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    image={getResourceImage(
                      resource,
                      index
                    )}
                    onView={() =>
                      openResource(resource)
                    }
                    onBook={() =>
                      handleBook(resource)
                    }
                  />
                )
              )}

            </div>
          )}
        </section>

        {/* FEATURES */}
        <section className="px-5 md:px-8 pt-16">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <FeatureCard
              icon={MapPin}
              title="Find Nearby Resources"
              description="Discover agricultural resources and services available around your area."
            />

            <FeatureCard
              icon={ShieldCheck}
              title="Verified Resources"
              description="Resources can be reviewed and approved through our admin system."
            />

            <FeatureCard
              icon={Headphones}
              title="Direct Contact"
              description="Connect directly with providers to discuss availability and booking."
            />

          </div>
        </section>

        {/* FOOTER */}
        <footer className="px-5 md:px-8 pt-20 pb-8">

          <div className="border-t border-[#dfe6e0] pt-7 flex flex-col md:flex-row justify-between gap-5">

            <div>
              <div className="flex items-center gap-2">

                <div className="w-9 h-9 rounded-xl bg-[#075d45] text-white flex items-center justify-center">
                  <Leaf size={18} />
                </div>

                <span className="font-bold">
                  Agri-Connect
                </span>
              </div>

              <p className="text-xs text-[#7e8d86] mt-2">
                Connecting farmers with the right resources.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[11px] text-[#687c72]">

              <Link
                href="/"
                className="hover:text-[#075d45]"
              >
                Home
              </Link>

              <button
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

              <button
                onClick={openAddResource}
                className="hover:text-[#075d45]"
              >
                List a Resource
              </button>

              <Link
                href="/admin/login"
                className="hover:text-[#075d45] font-semibold"
              >
                Admin Login
              </Link>
            </div>

            <p className="text-[10px] text-[#91a099]">
              © 2026 Agri-Connect. All rights reserved.
            </p>

          </div>
        </footer>
      </div>

      {/* RESOURCE DETAILS MODAL */}
      {selectedResource && !showBooking && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeResource}
          />

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-[28px] shadow-2xl">

            <div className="relative h-56">

              <img
                src={getResourceImage(
                  selectedResource
                )}
                alt={selectedResource.title}
                className="w-full h-full object-cover"
              />

              <button
                onClick={closeResource}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/40 text-white backdrop-blur flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-7">

              <div className="flex flex-wrap items-center gap-2 mb-3">

                <span className="px-3 py-1 rounded-full bg-[#e7f3eb] text-[#075d45] text-[10px] font-bold">
                  {selectedResource.category}
                </span>

                {selectedResource.status && (
                  <span className="px-3 py-1 rounded-full bg-[#f4f5ef] text-[#69786f] text-[10px]">
                    {selectedResource.status}
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-bold">
                {selectedResource.title}
              </h2>

              <p className="text-sm text-[#788880] mt-3 leading-relaxed">
                {selectedResource.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">

                <InfoBox
                  icon={MapPin}
                  label="Location"
                  value={getLocation(
                    selectedResource
                  )}
                />

                <InfoBox
                  icon={User}
                  label="Provider"
                  value={getProviderName(
                    selectedResource
                  )}
                />

                <InfoBox
                  icon={Phone}
                  label="Contact"
                  value={
                    getPhone(selectedResource) ||
                    "Available after contact"
                  }
                />

                <InfoBox
                  icon={Store}
                  label="Price"
                  value={`₹${Number(
                    selectedResource.price || 0
                  ).toLocaleString("en-IN")} / ${
                    selectedResource.price_unit || "unit"
                  }`}
                />
              </div>

              <button
                onClick={() =>
                  handleBook(selectedResource)
                }
                className="w-full mt-7 py-3.5 rounded-xl bg-[#075d45] text-white font-semibold text-sm hover:bg-[#064d3a] transition"
              >
                Request Booking
              </button>

            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {showBooking && selectedResource && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowBooking(false)}
          />

          <div className="relative w-full max-w-lg bg-white rounded-[28px] shadow-2xl p-7">

            <button
              onClick={() => setShowBooking(false)}
              className="absolute right-5 top-5 w-9 h-9 rounded-full bg-[#f1f4f1] flex items-center justify-center"
            >
              <X size={17} />
            </button>

            <p className="text-xs uppercase tracking-[0.2em] text-[#7a8b83]">
              Booking Request
            </p>

            <h2 className="text-2xl font-bold mt-2">
              {selectedResource.title}
            </h2>

            <p className="text-sm text-[#829089] mt-2">
              Send your details to request this resource.
            </p>

            <form
              onSubmit={handleBooking}
              className="mt-6 space-y-4"
            >

              <div>
                <label className="block text-xs font-semibold mb-2">
                  Your Name
                </label>

                <input
                  value={bookingName}
                  onChange={(e) =>
                    setBookingName(e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#dfe6e1] outline-none focus:border-[#075d45]"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">
                  Phone Number
                </label>

                <input
                  value={bookingPhone}
                  onChange={(e) =>
                    setBookingPhone(e.target.value)
                  }
                  className="w-full px-4 py-3 rounded-xl border border-[#dfe6e1] outline-none focus:border-[#075d45]"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="rounded-xl bg-[#f2f7f3] p-4 text-xs text-[#687b72]">
                Your request will be submitted with
                <strong className="text-[#075d45]">
                  {" "}
                  Pending
                </strong>{" "}
                status until it is reviewed.
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full py-3.5 rounded-xl bg-[#075d45] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {bookingLoading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Sending...
                  </>
                ) : (
                  "Submit Booking Request"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() =>
              setShowAuthModal(false)
            }
          />

          <div className="relative w-full max-w-md bg-white rounded-[28px] shadow-2xl p-7">

            <button
              onClick={() =>
                setShowAuthModal(false)
              }
              className="absolute right-5 top-5 w-9 h-9 rounded-full bg-[#f1f4f1] flex items-center justify-center"
            >
              <X size={17} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#d9eee3] text-[#075d45] flex items-center justify-center mb-5">
              <User size={22} />
            </div>

            <h2 className="text-2xl font-bold">
              {authMode === "login"
                ? "Welcome Back"
                : "Create Account"}
            </h2>

            <p className="text-sm text-[#829089] mt-2">
              {authMode === "login"
                ? "Login to book agricultural resources."
                : "Create your Agri-Connect farmer account."}
            </p>

            {authError && (
              <div className="mt-5 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {authError}
              </div>
            )}

            {authMessage && (
              <div className="mt-5 p-3 rounded-xl bg-green-50 border border-green-200 text-xs text-green-700">
                {authMessage}
              </div>
            )}

            <form
              onSubmit={handleAuthSubmit}
              className="mt-6 space-y-4"
            >

              {authMode === "signup" && (
                <div>
                  <label className="block text-xs font-semibold mb-2">
                    Full Name
                  </label>

                  <input
                    value={authName}
                    onChange={(e) =>
                      setAuthName(e.target.value)
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#dfe6e1] outline-none focus:border-[#075d45]"
                    placeholder="Your name"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-2">
                  Email
                </label>

                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) =>
                    setAuthEmail(e.target.value)
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#dfe6e1] outline-none focus:border-[#075d45]"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">
                  Password
                </label>

                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) =>
                    setAuthPassword(e.target.value)
                  }
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#dfe6e1] outline-none focus:border-[#075d45]"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3.5 rounded-xl bg-[#075d45] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {authSubmitting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Please wait...
                  </>
                ) : authMode === "login" ? (
                  "Login"
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="text-center mt-5 text-xs text-[#7c8c85]">

              {authMode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={openSignup}
                    className="font-semibold text-[#075d45]"
                  >
                    Create one
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={openLogin}
                    className="font-semibold text-[#075d45]"
                  >
                    Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD RESOURCE MODAL */}
      {showAddResource && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">

          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() =>
              setShowAddResource(false)
            }
          />

          <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-[28px] shadow-2xl p-7">

            <button
              onClick={() =>
                setShowAddResource(false)
              }
              className="absolute right-5 top-5 w-9 h-9 rounded-full bg-[#f1f4f1] flex items-center justify-center"
            >
              <X size={17} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#d9eee3] text-[#075d45] flex items-center justify-center mb-5">
              <Plus size={23} />
            </div>

            <h2 className="text-2xl font-bold">
              List a Resource
            </h2>

            <p className="text-sm text-[#829089] mt-2">
              Add equipment, workers, seeds,
              irrigation or fertilizer for farmers.
            </p>

            <div className="mt-4 p-3 rounded-xl bg-[#f0f7f2] border border-[#dcebe0] text-xs text-[#61776c]">
              Your resource will be submitted for
              admin approval before appearing publicly.
            </div>

            {addError && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
                {addError}
              </div>
            )}

            <form
              onSubmit={handleAddResource}
              className="mt-6 space-y-4"
            >

              <div>
                <label className="block text-xs font-semibold mb-2">
                  Resource Name
                </label>

                <input
                  value={resourceForm.title}
                  onChange={(e) =>
                    setResourceForm({
                      ...resourceForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Example: Ravi Tractor Service"
                  className="w-full px-4 py-3 rounded-xl border border-[#dfe6e1] outline-none focus:border-[#075d45]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-semibold mb-2">
                    Category
                  </label>

                  <select
                    value={resourceForm.category}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-[#dfe6e1] outline-none bg-white"
                  >
                    <option value="Equipment">
                      Equipment
                    </option>

                    <option value="Workers">
                      Workers
                    </option>

                    <option value="Seeds">
                      Seeds
                    </option>

                    <option value="Irrigation">
                      Irrigation
                    </option>

                    <option value="Fertilizer">
                      Fertilizer
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-2">
                    Price
                  </label>

                  <div className="flex gap-2">

                    <input
                      type="number"
                      min="0"
                      value={resourceForm.price}
                      onChange={(e) =>
                        setResourceForm({
                          ...resourceForm,
                          price: e.target.value,
                        })
                      }
                      placeholder="1200"
                      className="min-w-0 flex-1 px-4 py-3 rounded-xl border border-[#dfe6e1] outline-none"
                    />

                    <select
                      value={resourceForm.price_unit}
                      onChange={(e) =>
                        setResourceForm({
                          ...resourceForm,
                          price_unit: e.target.value,
                        })
                      }
                      className="w-28 px-3 py-3 rounded-xl border border-[#dfe6e1] bg-white outline-none"
                    >
                      <option value="day">
                        / day
                      </option>

                      <option value="hour">
                        / hour
                      </option>

                      <option value="week">
                        / week
                      </option>

                      <option value="month">
                        / month
                      </option>

                      <option value="item">
                        / item
                      </option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">
                  Location
                </label>

                <input
                  value={resourceForm.location}
                  onChange={(e) =>
                    setResourceForm({
                      ...resourceForm,
                      location: e.target.value,
                    })
                  }
                  placeholder="Example: Idukki, Kerala"
                  className="w-full px-4 py-3 rounded-xl border border-[#dfe6e1] outline-none focus:border-[#075d45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">
                  Contact Phone
                </label>

                <input
                  value={resourceForm.phone}
                  onChange={(e) =>
                    setResourceForm({
                      ...resourceForm,
                      phone: e.target.value,
                    })
                  }
                  placeholder="Contact number"
                  className="w-full px-4 py-3 rounded-xl border border-[#dfe6e1] outline-none focus:border-[#075d45]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">
                  Description
                </label>

                <textarea
                  value={resourceForm.description}
                  onChange={(e) =>
                    setResourceForm({
                      ...resourceForm,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  placeholder="Describe the resource, availability and useful details..."
                  className="w-full px-4 py-3 rounded-xl border border-[#dfe6e1] outline-none focus:border-[#075d45] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2">
                  Image URL
                </label>

                <div className="relative">

                  <ImagePlus
                    size={17}
                    className="absolute left-4 top-3.5 text-[#8b9992]"
                  />

                  <input
                    value={resourceForm.image_url}
                    onChange={(e) =>
                      setResourceForm({
                        ...resourceForm,
                        image_url: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#dfe6e1] outline-none focus:border-[#075d45]"
                  />
                </div>

                <p className="text-[10px] text-[#8b9992] mt-2">
                  Optional. If empty, Agri-Connect will
                  use a category image.
                </p>
              </div>

              <button
                type="submit"
                disabled={addLoading}
                className="w-full py-3.5 rounded-xl bg-[#075d45] text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {addLoading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Plus size={17} />
                    Submit Resource
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}

function ResourceCard({
  resource,
  image,
  onView,
  onBook,
}) {
  const price = Number(resource.price || 0);

  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-[#e2e8e3] hover:-translate-y-1 hover:shadow-xl transition-all duration-300">

      <div className="relative h-48 overflow-hidden">

        <img
          src={image}
          alt={resource.title || "Agricultural resource"}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        <div className="absolute top-3 left-3">

          <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur text-[10px] font-semibold text-[#075d45]">
            {resource.category || "Resource"}
          </span>
        </div>

        {resource.status === "pending" && (
          <div className="absolute top-3 right-3">

            <span className="px-3 py-1.5 rounded-full bg-amber-100/95 text-amber-800 text-[10px] font-semibold">
              Pending
            </span>
          </div>
        )}

        {resource.status === "approved" && (
          <div className="absolute top-3 right-3">

            <span className="px-3 py-1.5 rounded-full bg-white/90 text-[#075d45] text-[10px] font-semibold flex items-center gap-1">
              <ShieldCheck size={12} />
              Verified
            </span>
          </div>
        )}
      </div>

      <div className="p-5">

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">

            <h3 className="font-bold text-base truncate">
              {resource.title || "Untitled Resource"}
            </h3>

            <p className="text-xs text-[#81918a] mt-1">
              {getProviderName(resource)}
            </p>
          </div>

          <div className="text-right shrink-0">

            <p className="font-bold text-[#075d45]">
              ₹{price.toLocaleString("en-IN")}
            </p>

            <p className="text-[10px] text-[#8a9891]">
              / {resource.price_unit || "unit"}
            </p>
          </div>
        </div>

        <p className="text-xs text-[#71827a] mt-4 line-clamp-2 leading-relaxed min-h-[34px]">
          {resource.description ||
            "No description available."}
        </p>

        <div className="flex items-center gap-2 mt-4 text-xs text-[#7d8d86]">

          <MapPin size={14} />

          <span className="truncate">
            {getLocation(resource)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 mt-5">

          <button
            onClick={onView}
            className="flex-1 py-2.5 rounded-xl border border-[#dce5df] text-xs font-semibold hover:bg-[#f3f7f4] transition"
          >
            View Details
          </button>

          <button
            onClick={onBook}
            className="flex-1 py-2.5 rounded-xl bg-[#075d45] text-white text-xs font-semibold hover:bg-[#064d3a] transition"
          >
            Book
          </button>
        </div>
      </div>
    </article>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}) {
  return (
    <div className="bg-white border border-[#e3e9e4] rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg transition">

      <div className="w-11 h-11 rounded-xl bg-[#e5f2e9] text-[#075d45] flex items-center justify-center mb-5">
        <Icon size={21} />
      </div>

      <h3 className="font-bold text-base">
        {title}
      </h3>

      <p className="text-xs text-[#7e8d86] mt-2 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function InfoBox({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-xl bg-[#f5f8f5] p-4">

      <div className="flex items-center gap-2 text-[#075d45]">
        <Icon size={15} />

        <span className="text-[10px] uppercase tracking-wider font-semibold">
          {label}
        </span>
      </div>

      <p className="text-xs font-medium text-[#40574d] mt-2 break-words">
        {value}
      </p>
    </div>
  );
}