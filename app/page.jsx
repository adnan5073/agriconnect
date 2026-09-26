"use client";

import { useMemo, useRef, useState } from "react";

import {
  Search,
  Bell,
  ChevronRight,
  LayoutDashboard,
  Store,
  Users,
  CloudSun,
  Settings,
  User,
  MapPin,
  Camera,
  ArrowRight,
  Star,
  SlidersHorizontal,
  Leaf,
  Sprout,
  Droplets,
  FlaskConical,
  Wrench,
  Tractor,
  X,
  Plus,
  Upload,
  CheckCircle,
  Menu,
} from "lucide-react";

/* =========================
   CATEGORY DATA
========================= */

const categories = [
  {
    name: "EQUIPMENT",
    count: "124 Listings",
    icon: <Tractor size={42} />,
  },
  {
    name: "WORKERS",
    count: "86 Listings",
    icon: <Wrench size={42} />,
  },
  {
    name: "SEEDS",
    count: "312 Listings",
    icon: <Sprout size={42} />,
  },
  {
    name: "IRRIGATION",
    count: "45 Listings",
    icon: <Droplets size={42} />,
  },
  {
    name: "FERTILIZER",
    count: "98 Listings",
    icon: <FlaskConical size={42} />,
  },
];

/* =========================
   INITIAL RESOURCES
========================= */

const initialResources = [
  {
    id: 1,
    type: "EQUIPMENT",
    title: "Tractor Rental",
    rating: 4.8,
    distance: 2.4,
    price: 45,
    unit: "day",
    location: "Idukki, Kerala",
    provider: "Green Valley Farms",
    image:
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    type: "WORKERS",
    title: "Experienced Farm Workers",
    rating: 4.9,
    distance: 5.1,
    price: 700,
    unit: "day",
    location: "Kattappana, Kerala",
    provider: "Kerala Farm Services",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    type: "SEEDS",
    title: "Premium Vegetable Seeds",
    rating: 4.7,
    distance: 3.8,
    price: 120,
    unit: "packet",
    location: "Thodupuzha, Kerala",
    provider: "Fresh Grow Seeds",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    type: "IRRIGATION",
    title: "Smart Irrigation Kit",
    rating: 4.6,
    distance: 6.2,
    price: 1200,
    unit: "week",
    location: "Adimali, Kerala",
    provider: "Smart Agri Solutions",
    image:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    type: "FERTILIZER",
    title: "Organic Fertilizer",
    rating: 4.8,
    distance: 4.5,
    price: 350,
    unit: "bag",
    location: "Nedumkandam, Kerala",
    provider: "Eco Farm Supplies",
    image:
      "https://images.unsplash.com/photo-1585314062604-1a357de8b000?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    type: "EQUIPMENT",
    title: "Power Tiller",
    rating: 4.9,
    distance: 7.2,
    price: 850,
    unit: "day",
    location: "Munnar, Kerala",
    provider: "High Range Machinery",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
  },
];

/* =========================
   MAIN COMPONENT
========================= */

export default function Home() {
  const [resources, setResources] = useState(initialResources);

  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [selectedResource, setSelectedResource] = useState(null);

  const [showAll, setShowAll] = useState(false);

  const [showFilter, setShowFilter] = useState(false);

  const [minRating, setMinRating] = useState(0);

  const [showNotifications, setShowNotifications] = useState(false);

  const [showSettings, setShowSettings] = useState(false);

  const [showCropAssistant, setShowCropAssistant] =
    useState(false);

  const [showAddResource, setShowAddResource] =
    useState(false);

  const [mobileMenu, setMobileMenu] = useState(false);

  const [cropImage, setCropImage] = useState(null);

  const [cropResult, setCropResult] = useState(null);

  const [newResource, setNewResource] = useState({
    title: "",
    type: "EQUIPMENT",
    price: "",
    location: "",
    provider: "",
  });

  const fileInputRef = useRef(null);

  /* =========================
     SEARCH + FILTER
  ========================= */

  const filteredResources = useMemo(() => {
    let result = resources;

    if (selectedCategory !== "ALL") {
      result = result.filter(
        (item) => item.type === selectedCategory
      );
    }

    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter((item) =>
        `${item.title} ${item.type} ${item.location} ${item.provider}`
          .toLowerCase()
          .includes(query)
      );
    }

    if (minRating > 0) {
      result = result.filter(
        (item) => item.rating >= minRating
      );
    }

    return result;
  }, [resources, selectedCategory, search, minRating]);

  const displayedResources = showAll
    ? filteredResources
    : filteredResources.slice(0, 3);

  /* =========================
     NAVIGATION
  ========================= */

  const scrollTo = (id) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth" });

    setMobileMenu(false);
  };

  /* =========================
     CATEGORY
  ========================= */

  const selectCategory = (category) => {
    setSelectedCategory(category);
    scrollTo("resources");
  };

  /* =========================
     CROP IMAGE
  ========================= */

  const handleCropImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    setCropImage(imageUrl);

    setCropResult(null);

    setTimeout(() => {
      setCropResult({
        disease: "Healthy / No Major Disease Detected",
        confidence: "92%",
        advice:
          "Your crop appears healthy. Continue regular watering, sunlight, and monitoring.",
      });
    }, 1200);
  };

  /* =========================
     ADD RESOURCE
  ========================= */

  const addResource = (event) => {
    event.preventDefault();

    if (
      !newResource.title ||
      !newResource.price ||
      !newResource.location ||
      !newResource.provider
    ) {
      alert("Please fill all fields.");
      return;
    }

    const item = {
      id: Date.now(),
      type: newResource.type,
      title: newResource.title,
      rating: 5.0,
      distance: 0.5,
      price: Number(newResource.price),
      unit: "day",
      location: newResource.location,
      provider: newResource.provider,
      image:
        "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80",
    };

    setResources((old) => [item, ...old]);

    setNewResource({
      title: "",
      type: "EQUIPMENT",
      price: "",
      location: "",
      provider: "",
    });

    setShowAddResource(false);

    alert("Resource listed successfully!");
  };

  return (
    <main className="min-h-screen bg-[#fbf9ed] text-[#123d31]">

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[240px]
        flex-col border-r border-[#ccebd8] bg-[#d9f8e4]
        transition-transform duration-300
        ${
          mobileMenu
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >

        {/* LOGO */}

        <div className="flex items-center gap-3 px-7 py-7">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#075c48] text-white">
            <Leaf size={22} />
          </div>

          <span className="text-lg font-bold">
            Agri-Connect
          </span>

        </div>

        {/* NAVIGATION */}

        <nav className="px-4">

          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            text="Dashboard"
            active
            onClick={() => scrollTo("dashboard")}
          />

          <SidebarItem
            icon={<Store size={18} />}
            text="Marketplace"
            onClick={() => scrollTo("categories")}
          />

          <SidebarItem
            icon={<Users size={18} />}
            text="Community"
            onClick={() =>
              alert(
                "Community feature: Connect with nearby farmers and agricultural experts."
              )
            }
          />

          <SidebarItem
            icon={<CloudSun size={18} />}
            text="Weather"
            onClick={() =>
              alert(
                "Weather service will be connected to a live weather API."
              )
            }
          />

        </nav>

        {/* BOTTOM */}

        <div className="mt-auto px-4 pb-5">

          <SidebarItem
            icon={<Settings size={18} />}
            text="Settings"
            onClick={() => setShowSettings(true)}
          />

          <div className="mt-5 flex items-center gap-3 rounded-xl p-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white">
              <User size={18} />
            </div>

            <div className="min-w-0">

              <p className="text-sm font-semibold">
                Farmer
              </p>

              <p className="truncate text-xs text-gray-500">
                farmer@agriconnect.com
              </p>

            </div>

          </div>

        </div>

      </aside>

      {/* MOBILE MENU BUTTON */}

      <button
        onClick={() => setMobileMenu(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-[#075c48] p-3 text-white md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* =========================
          MAIN
      ========================= */}

      <section className="ml-0 md:ml-[240px]">

        {/* TOP BAR */}

        <header className="flex min-h-[70px] items-center justify-between border-b border-[#dedbc8] bg-[#fffef5] px-5 py-3 md:px-7">

          <div className="hidden text-sm text-gray-500 md:block">

            Dashboard

            <ChevronRight
              size={15}
              className="mx-2 inline"
            />

            <span className="font-semibold text-[#174f40]">
              Resources
            </span>

          </div>

          <div className="ml-auto flex items-center gap-4">

            {/* SEARCH */}

            <div className="hidden items-center rounded-full border border-gray-200 bg-white px-4 py-2 sm:flex">

              <Search
                size={17}
                className="text-gray-400"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="ml-2 w-[200px] bg-transparent text-sm outline-none"
                placeholder="Search resources..."
              />

            </div>

            {/* NOTIFICATION */}

            <button
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              className="relative rounded-full p-2 hover:bg-gray-100"
            >

              <Bell size={20} />

              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />

            </button>

            {/* USER */}

            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#cdebd9]">
                <User size={18} />
              </div>

              <div className="hidden text-left md:block">

                <p className="text-sm font-semibold">
                  Farmer
                </p>

                <p className="text-[10px] text-gray-500">
                  Premium User
                </p>

              </div>

            </button>

          </div>

          {/* NOTIFICATION PANEL */}

          {showNotifications && (
            <div className="absolute right-7 top-[65px] z-50 w-[280px] rounded-xl border bg-white p-4 shadow-xl">

              <div className="flex items-center justify-between">

                <h3 className="font-bold">
                  Notifications
                </h3>

                <button
                  onClick={() =>
                    setShowNotifications(false)
                  }
                >
                  <X size={18} />
                </button>

              </div>

              <div className="mt-4 rounded-lg bg-[#eef9f1] p-3 text-sm">
                🌱 Welcome to AgriConnect!
              </div>

              <div className="mt-2 rounded-lg bg-[#eef9f1] p-3 text-sm">
                🚜 New equipment listings are available.
              </div>

            </div>
          )}

        </header>

        {/* CONTENT */}

        <div
          id="dashboard"
          className="mx-auto max-w-[1200px] px-5 py-5 md:px-7"
        >

          {/* =========================
              HERO
          ========================= */}

          <section
            className="relative min-h-[360px] overflow-hidden rounded-2xl bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=85')",
            }}
          >

            <div className="absolute inset-0 bg-black/30" />

            <div className="relative z-10 max-w-[650px] px-7 pt-24 text-white md:px-9 md:pt-28">

              <h1 className="font-serif text-4xl font-bold leading-tight md:text-5xl">

                Empowering Every
                <br />
                Farmer, Everywhere.

              </h1>

              <p className="mt-4 max-w-[600px] text-base">

                Connect with the best tools, seeds, and local
                expertise to grow your harvest and community.

              </p>

            </div>

            {/* HERO SEARCH */}

            <div className="absolute bottom-5 left-1/2 flex w-[92%] -translate-x-1/2 flex-col overflow-hidden rounded-xl bg-white p-2 shadow-xl md:bottom-4 md:w-[85%] md:flex-row">

              <div className="flex flex-1 items-center px-4">

                <Search
                  size={18}
                  className="text-gray-400"
                />

                <input
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="ml-3 w-full py-3 outline-none"
                  placeholder="What are you looking for?"
                />

              </div>

              <button
                onClick={() =>
                  alert(
                    "Using Idukki, Kerala as your current search location."
                  )
                }
                className="hidden items-center border-l px-5 md:flex"
              >

                <MapPin size={18} />

                <span className="ml-2 text-sm">
                  Idukki, Kerala
                </span>

              </button>

              <button
                onClick={() => scrollTo("resources")}
                className="rounded-lg bg-[#075c48] px-7 py-3 font-semibold text-white hover:bg-[#064d3d]"
              >
                Find Resources
              </button>

            </div>

          </section>

          {/* =========================
              CATEGORY
          ========================= */}

          <section
            id="categories"
            className="mt-16 md:mt-24"
          >

            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">

              <div>

                <h2 className="text-2xl font-bold">
                  Explore by Category
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Browse high-quality listings curated
                  for your needs
                </p>

              </div>

              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setShowAll(true);
                  scrollTo("resources");
                }}
                className="rounded-lg border border-[#57977e] px-4 py-2 text-sm font-medium hover:bg-[#e5f7eb]"
              >
                View All Categories
              </button>

            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

              {categories.map((category) => (

                <button
                  key={category.name}
                  onClick={() =>
                    selectCategory(category.name)
                  }
                  className={`overflow-hidden rounded-xl border bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
                    selectedCategory === category.name
                      ? "border-[#075c48] ring-2 ring-[#075c48]/20"
                      : "border-gray-100"
                  }`}
                >

                  <div className="flex h-[135px] items-center justify-center bg-[#f1f1f1] text-[#315f51]">
                    {category.icon}
                  </div>

                  <div className="p-4">

                    <h3 className="text-sm font-bold">
                      {category.name}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      {category.count}
                    </p>

                  </div>

                </button>

              ))}

            </div>

          </section>

          {/* =========================
              CROP ASSISTANT
          ========================= */}

          <section
            id="crop-assistant"
            className="relative mt-7 overflow-hidden rounded-xl bg-[#315f3d]"
          >

            <img
              src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1400&q=80"
              className="absolute inset-0 h-full w-full object-cover opacity-50"
              alt="Crop"
            />

            <div className="absolute inset-0 bg-[#123d31]/50" />

            <div className="relative z-10 px-7 py-8 text-white md:px-8">

              <span className="rounded-full bg-[#d9f8e4] px-3 py-1 text-xs font-bold text-[#174f40]">
                NEW FEATURE
              </span>

              <h2 className="mt-3 font-serif text-2xl font-bold">
                Instant Crop Assistant
              </h2>

              <p className="mt-2 max-w-[500px] text-sm">
                Upload a photo of your crop to diagnose
                pests, diseases, or nutrient deficiencies.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">

                <button
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#174f40] hover:bg-gray-100"
                >

                  <Camera size={17} />

                  Upload Photo

                </button>

                <button
                  onClick={() =>
                    setShowCropAssistant(true)
                  }
                  className="rounded-lg border border-white px-5 py-3 text-sm font-semibold hover:bg-white/10"
                >
                  Open Crop Assistant
                </button>

              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleCropImage}
                className="hidden"
              />

            </div>

          </section>

          {/* =========================
              RESOURCES
          ========================= */}

          <section
            id="resources"
            className="mt-7"
          >

            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">

              <div>

                <h2 className="text-2xl font-bold">
                  Resources Near You
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Top rated listings available near you
                </p>

              </div>

              <div className="flex gap-2">

                {/* FILTER */}

                <button
                  onClick={() =>
                    setShowFilter(!showFilter)
                  }
                  className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50"
                >

                  <SlidersHorizontal size={15} />

                  Filter

                </button>

                {/* VIEW ALL */}

                <button
                  onClick={() => setShowAll(!showAll)}
                  className="rounded-lg border bg-white px-4 py-2 text-sm hover:bg-gray-50"
                >

                  {showAll ? "Show Less" : "View All"}

                </button>

              </div>

            </div>

            {/* FILTER PANEL */}

            {showFilter && (

              <div className="mb-5 rounded-xl border bg-white p-4 shadow-sm">

                <div className="flex flex-wrap items-center gap-3">

                  <span className="text-sm font-semibold">
                    Minimum Rating:
                  </span>

                  {[0, 4, 4.5, 4.8].map((rating) => (

                    <button
                      key={rating}
                      onClick={() =>
                        setMinRating(rating)
                      }
                      className={`rounded-lg px-4 py-2 text-sm ${
                        minRating === rating
                          ? "bg-[#075c48] text-white"
                          : "bg-gray-100"
                      }`}
                    >

                      {rating === 0
                        ? "All"
                        : `${rating}+ ⭐`}

                    </button>

                  ))}

                </div>

              </div>

            )}

            {/* ACTIVE FILTER */}

            {selectedCategory !== "ALL" && (

              <div className="mb-4 flex items-center gap-2">

                <span className="rounded-full bg-[#d9f8e4] px-3 py-1 text-xs font-semibold">
                  {selectedCategory}
                </span>

                <button
                  onClick={() =>
                    setSelectedCategory("ALL")
                  }
                  className="text-xs underline"
                >
                  Clear
                </button>

              </div>

            )}

            {/* RESOURCE CARDS */}

            {displayedResources.length === 0 ? (

              <div className="rounded-xl bg-white p-10 text-center shadow-sm">

                <Search
                  size={40}
                  className="mx-auto text-gray-400"
                />

                <h3 className="mt-3 font-bold">
                  No resources found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Try another search or category.
                </p>

              </div>

            ) : (

              <div className="grid gap-5 md:grid-cols-3">

                {displayedResources.map((resource) => (

                  <div
                    key={resource.id}
                    className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >

                    <div className="relative h-[155px]">

                      <img
                        src={resource.image}
                        alt={resource.title}
                        className="h-full w-full object-cover"
                      />

                      <span className="absolute left-3 top-3 rounded-full bg-[#075c48] px-3 py-1 text-xs font-bold text-white">
                        {resource.type}
                      </span>

                    </div>

                    <div className="p-4">

                      <div className="flex justify-between gap-2">

                        <h3 className="font-bold">
                          {resource.title}
                        </h3>

                        <span className="flex shrink-0 items-center gap-1 text-sm">

                          <Star
                            size={14}
                            className="fill-current"
                          />

                          {resource.rating}

                        </span>

                      </div>

                      <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">

                        <MapPin size={14} />

                        {resource.location}

                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {resource.distance} km away
                      </p>

                      <p className="mt-4 text-lg font-bold">

                        ₹{resource.price}

                        <span className="text-sm font-normal text-gray-500">
                          {" "}
                          /{resource.unit}
                        </span>

                      </p>

                      <button
                        onClick={() =>
                          setSelectedResource(resource)
                        }
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#075c48] py-3 text-sm font-semibold text-white hover:bg-[#064d3d]"
                      >

                        View Details

                        <ArrowRight size={16} />

                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </section>

          {/* =========================
              LIST RESOURCE
          ========================= */}

          <section className="mt-7 overflow-hidden rounded-xl bg-[#e1f5e7]">

            <div className="flex flex-col items-start justify-between gap-5 p-7 md:flex-row md:items-center">

              <div>

                <h2 className="text-xl font-bold">
                  Have an agricultural resource?
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  List your equipment, seeds, workers or
                  services on AgriConnect.
                </p>

              </div>

              <button
                onClick={() => setShowAddResource(true)}
                className="flex items-center gap-2 rounded-lg bg-[#075c48] px-5 py-3 font-semibold text-white hover:bg-[#064d3d]"
              >

                <Plus size={18} />

                List a Resource

              </button>

            </div>

          </section>

          {/* =========================
              FEATURES
          ========================= */}

          <section className="mt-8 grid gap-5 border-y border-[#dedbc8] py-7 md:grid-cols-4">

            <Feature
              icon="✓"
              title="Verified Listings"
              text="Quality resources"
            />

            <Feature
              icon="♙"
              title="Active Community"
              text="Local farmers"
            />

            <Feature
              icon="⌂"
              title="Expert Support"
              text="Agricultural help"
            />

            <Feature
              icon="♧"
              title="Sustainable Growth"
              text="Better farming"
            />

          </section>

          {/* =========================
              FOOTER
          ========================= */}

          <footer className="flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between">

            <button
              onClick={() => scrollTo("dashboard")}
              className="flex items-center gap-3"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#075c48] text-white">

                <Leaf size={18} />

              </div>

              <span className="font-bold">
                Agri-Connect
              </span>

            </button>

            <div className="flex flex-wrap gap-5 text-sm text-gray-600">

              <button
                onClick={() => scrollTo("dashboard")}
                className="hover:text-[#075c48]"
              >
                Home
              </button>

              <button
                onClick={() => scrollTo("resources")}
                className="hover:text-[#075c48]"
              >
                Explore Resources
              </button>

              <button
                onClick={() => scrollTo("crop-assistant")}
                className="hover:text-[#075c48]"
              >
                Crop Assistant
              </button>

              <button
                onClick={() => setShowAddResource(true)}
                className="hover:text-[#075c48]"
              >
                List a Resource
              </button>

            </div>

            <p className="text-xs text-gray-500">
              © 2026 Agri-Connect
            </p>

          </footer>

        </div>

      </section>

      {/* =========================
          RESOURCE DETAILS MODAL
      ========================= */}

      {selectedResource && (

        <Modal
          title="Resource Details"
          onClose={() => setSelectedResource(null)}
        >

          <img
            src={selectedResource.image}
            alt={selectedResource.title}
            className="h-48 w-full rounded-xl object-cover"
          />

          <div className="mt-5">

            <span className="rounded-full bg-[#d9f8e4] px-3 py-1 text-xs font-bold text-[#075c48]">
              {selectedResource.type}
            </span>

            <h2 className="mt-3 text-2xl font-bold">
              {selectedResource.title}
            </h2>

            <p className="mt-2 text-gray-500">
              Provided by {selectedResource.provider}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3">

              <InfoBox
                label="Rating"
                value={`⭐ ${selectedResource.rating}`}
              />

              <InfoBox
                label="Location"
                value={selectedResource.location}
              />

              <InfoBox
                label="Distance"
                value={`${selectedResource.distance} km`}
              />

              <InfoBox
                label="Price"
                value={`₹${selectedResource.price}/${selectedResource.unit}`}
              />

            </div>

            <button
              onClick={() => {
                alert(
                  `Booking request sent to ${selectedResource.provider}!`
                );

                setSelectedResource(null);
              }}
              className="mt-5 w-full rounded-lg bg-[#075c48] py-3 font-semibold text-white"
            >
              Request / Book Resource
            </button>

          </div>

        </Modal>

      )}

      {/* =========================
          CROP ASSISTANT MODAL
      ========================= */}

      {showCropAssistant && (

        <Modal
          title="Crop Assistant"
          onClose={() => setShowCropAssistant(false)}
        >

          <div className="rounded-xl bg-[#eef9f1] p-5 text-center">

            {cropImage ? (

              <img
                src={cropImage}
                alt="Uploaded crop"
                className="mx-auto max-h-64 rounded-xl object-contain"
              />

            ) : (

              <div className="py-10">

                <Camera
                  size={45}
                  className="mx-auto text-[#075c48]"
                />

                <p className="mt-3 text-sm text-gray-500">
                  Upload a crop image to start analysis.
                </p>

              </div>

            )}

          </div>

          {cropResult && (

            <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-5">

              <div className="flex items-center gap-2 font-bold text-green-700">

                <CheckCircle size={20} />

                Analysis Complete

              </div>

              <h3 className="mt-3 font-bold">
                {cropResult.disease}
              </h3>

              <p className="mt-1 text-sm">
                Confidence: {cropResult.confidence}
              </p>

              <p className="mt-3 text-sm text-gray-600">
                {cropResult.advice}
              </p>

            </div>

          )}

          <button
            onClick={() =>
              fileInputRef.current?.click()
            }
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-[#075c48] py-3 font-semibold text-white"
          >

            <Upload size={18} />

            Upload Crop Image

          </button>

        </Modal>

      )}

      {/* =========================
          ADD RESOURCE MODAL
      ========================= */}

      {showAddResource && (

        <Modal
          title="List a Resource"
          onClose={() => setShowAddResource(false)}
        >

          <form
            onSubmit={addResource}
            className="space-y-4"
          >

            <Input
              label="Resource Name"
              value={newResource.title}
              onChange={(value) =>
                setNewResource({
                  ...newResource,
                  title: value,
                })
              }
              placeholder="Example: Tractor Rental"
            />

            <div>

              <label className="mb-1 block text-sm font-semibold">
                Category
              </label>

              <select
                value={newResource.type}
                onChange={(e) =>
                  setNewResource({
                    ...newResource,
                    type: e.target.value,
                  })
                }
                className="w-full rounded-lg border px-3 py-3 outline-none"
              >

                {categories.map((category) => (
                  <option
                    key={category.name}
                    value={category.name}
                  >
                    {category.name}
                  </option>
                ))}

              </select>

            </div>

            <Input
              label="Price"
              type="number"
              value={newResource.price}
              onChange={(value) =>
                setNewResource({
                  ...newResource,
                  price: value,
                })
              }
              placeholder="Example: 500"
            />

            <Input
              label="Location"
              value={newResource.location}
              onChange={(value) =>
                setNewResource({
                  ...newResource,
                  location: value,
                })
              }
              placeholder="Example: Idukki, Kerala"
            />

            <Input
              label="Provider Name"
              value={newResource.provider}
              onChange={(value) =>
                setNewResource({
                  ...newResource,
                  provider: value,
                })
              }
              placeholder="Your name / business"
            />

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#075c48] py-3 font-semibold text-white"
            >

              <Plus size={18} />

              Add Resource

            </button>

          </form>

        </Modal>

      )}

      {/* =========================
          SETTINGS MODAL
      ========================= */}

      {showSettings && (

        <Modal
          title="Settings"
          onClose={() => setShowSettings(false)}
        >

          <div className="space-y-3">

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-sm font-bold">
                Account
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Farmer Account
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-sm font-bold">
                Location
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Idukki, Kerala
              </p>

            </div>

            <div className="rounded-xl bg-gray-50 p-4">

              <p className="text-sm font-bold">
                Notifications
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Notifications are enabled.
              </p>

            </div>

          </div>

        </Modal>

      )}

    </main>
  );
}

/* =========================
   SIDEBAR ITEM
========================= */

function SidebarItem({
  icon,
  text,
  active,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
        active
          ? "bg-white font-semibold shadow-sm"
          : "text-gray-600 hover:bg-white/70"
      }`}
    >

      {icon}

      <span>{text}</span>

      {active && (
        <ChevronRight
          size={16}
          className="ml-auto"
        />
      )}

    </button>
  );
}

/* =========================
   MODAL
========================= */

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">

      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-bold">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100"
          >
            <X size={20} />
          </button>

        </div>

        <div className="mt-5">
          {children}
        </div>

      </div>

    </div>
  );
}

/* =========================
   INPUT
========================= */

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <div>

      <label className="mb-1 block text-sm font-semibold">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-3 outline-none focus:border-[#075c48]"
      />

    </div>
  );
}

/* =========================
   INFO BOX
========================= */

function InfoBox({ label, value }) {
  return (
    <div className="rounded-lg bg-gray-50 p-3">

      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold">
        {value}
      </p>

    </div>
  );
}

/* =========================
   FEATURE
========================= */

function Feature({ icon, title, text }) {
  return (
    <div className="flex items-center gap-3 px-4">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e4f7e9] text-[#075c48]">
        {icon}
      </div>

      <div>

        <p className="text-sm font-bold">
          {title}
        </p>

        <p className="text-xs text-gray-500">
          {text}
        </p>

      </div>

    </div>
  );
}