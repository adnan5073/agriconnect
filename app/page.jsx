"use client";

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
} from "lucide-react";

const categories = [
  {
    name: "EQUIPMENT",
    count: "124 Listings",
    icon: <Tractor size={45} />,
  },
  {
    name: "WORKERS",
    count: "86 Listings",
    icon: <Wrench size={45} />,
  },
  {
    name: "SEEDS",
    count: "312 Listings",
    icon: <Sprout size={45} />,
  },
  {
    name: "IRRIGATION",
    count: "45 Listings",
    icon: <Droplets size={45} />,
  },
  {
    name: "FERTILIZER",
    count: "98 Listings",
    icon: <FlaskConical size={45} />,
  },
];

const resources = [
  {
    type: "Marketplace",
    title: "Sustainable Farmers Market Stall",
    rating: "4.8",
    distance: "2.4 miles away",
    price: "$45",
    unit: "/day",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=800&q=80",
  },
  {
    type: "Lease",
    title: "High-Tech Smart Greenhouse Access",
    rating: "4.9",
    distance: "5.1 miles away",
    price: "$120",
    unit: "/week",
    image:
      "https://images.unsplash.com/photo-1586771107445-d3ca888129ce?auto=format&fit=crop&w=800&q=80",
  },
  {
    type: "Rental",
    title: "Automated Field Irrigation Kit",
    rating: "4.7",
    distance: "3.8 miles away",
    price: "$25",
    unit: "/hr",
    image:
      "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fbf9ed] text-[#123d31]">

      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 z-50 flex h-screen w-[240px] flex-col border-r border-[#ccebd8] bg-[#d9f8e4]">

        <div className="flex items-center gap-3 px-7 py-7">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#075c48] text-white">
            <Leaf size={22} />
          </div>

          <span className="text-lg font-bold">
            Agri-Connect
          </span>
        </div>

        <nav className="px-4">

          <SidebarItem
            icon={<LayoutDashboard size={18} />}
            text="Dashboard"
            active
          />

          <SidebarItem
            icon={<Store size={18} />}
            text="Marketplace"
          />

          <SidebarItem
            icon={<Users size={18} />}
            text="Community"
          />

          <SidebarItem
            icon={<CloudSun size={18} />}
            text="Weather"
          />

        </nav>

        <div className="mt-auto px-4 pb-5">

          <SidebarItem
            icon={<Settings size={18} />}
            text="Settings"
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

      {/* MAIN AREA */}
      <section className="ml-[240px]">

        {/* TOP BAR */}
        <header className="flex h-[70px] items-center justify-between border-b border-[#dedbc8] bg-[#fffef5] px-7">

          <div className="text-sm text-gray-500">
            Dashboard
            <ChevronRight
              size={15}
              className="mx-2 inline"
            />
            <span className="font-semibold text-[#174f40]">
              Resources
            </span>
          </div>

          <div className="flex items-center gap-5">

            <div className="hidden items-center rounded-full border border-gray-200 bg-white px-4 py-2 md:flex">

              <Search size={17} className="text-gray-400" />

              <input
                className="ml-2 w-[220px] bg-transparent text-sm outline-none"
                placeholder="Search tools, markets, seeds..."
              />

            </div>

            <Bell size={20} />

            <div className="flex items-center gap-2">

              <div className="h-9 w-9 rounded-full bg-[#cdebd9] flex items-center justify-center">
                <User size={18} />
              </div>

              <div className="hidden md:block">
                <p className="text-sm font-semibold">
                  Farmer
                </p>
                <p className="text-[10px] text-gray-500">
                  Premium User
                </p>
              </div>

            </div>

          </div>
        </header>

        {/* CONTENT */}
        <div className="mx-auto max-w-[1200px] px-7 py-5">

          {/* HERO */}
          <section
            className="relative min-h-[330px] overflow-hidden rounded-2xl bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=85')",
            }}
          >

            <div className="absolute inset-0 bg-black/25" />

            <div className="relative z-10 max-w-[650px] px-9 pt-32 text-white">

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

            {/* SEARCH BOX */}
            <div className="absolute -bottom-1 left-1/2 flex w-[85%] -translate-x-1/2 translate-y-1/2 overflow-hidden rounded-xl bg-white p-2 shadow-xl">

              <div className="flex flex-1 items-center px-4">
                <Search size={18} className="text-gray-400" />

                <input
                  className="ml-3 w-full outline-none"
                  placeholder="What are you looking for?"
                />
              </div>

              <div className="hidden items-center border-l px-5 md:flex">
                <MapPin size={18} className="text-gray-500" />

                <span className="ml-2 text-sm">
                  Idukki, Kerala
                </span>
              </div>

              <button className="rounded-lg bg-[#075c48] px-7 py-3 font-semibold text-white hover:bg-[#064d3d]">
                Find Resources
              </button>

            </div>

          </section>

          {/* CATEGORY */}
          <section className="mt-24">

            <div className="mb-5 flex items-end justify-between">

              <div>
                <h2 className="text-2xl font-bold">
                  Explore by Category
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Browse high-quality listings curated for your needs
                </p>
              </div>

              <button className="rounded-lg border border-[#57977e] px-4 py-2 text-sm font-medium">
                View All Categories
              </button>

            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">

              {categories.map((category) => (
                <div
                  key={category.name}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
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

                </div>
              ))}

            </div>

          </section>

          {/* CROP ASSISTANT */}
          <section className="relative mt-7 overflow-hidden rounded-xl bg-[#315f3d]">

            <img
              src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1400&q=80"
              className="absolute inset-0 h-full w-full object-cover opacity-60"
              alt="Crop"
            />

            <div className="absolute inset-0 bg-[#123d31]/45" />

            <div className="relative z-10 px-8 py-8 text-white">

              <span className="rounded-full bg-[#d9f8e4] px-3 py-1 text-xs font-bold text-[#174f40]">
                NEW FEATURE
              </span>

              <h2 className="mt-3 font-serif text-2xl font-bold">
                Instant Crop Assistant
              </h2>

              <p className="mt-2 max-w-[500px] text-sm">
                Upload a photo of your crop to diagnose pests,
                diseases, or nutrient deficiencies in seconds.
              </p>

              <div className="mt-5 flex gap-3">

                <button className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#174f40]">
                  <Camera size={17} />
                  Upload Photo
                </button>

                <button className="rounded-lg border border-white px-5 py-3 text-sm font-semibold">
                  Learn More
                </button>

              </div>

            </div>

          </section>

          {/* RESOURCES */}
          <section className="mt-7">

            <div className="mb-5 flex items-end justify-between">

              <div>
                <h2 className="text-2xl font-bold">
                  Resources Near You
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Top rated listings available within 10 miles
                </p>
              </div>

              <div className="flex gap-2">

                <button className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm">
                  <SlidersHorizontal size={15} />
                  Filter
                </button>

                <button className="rounded-lg border bg-white px-4 py-2 text-sm">
                  View All
                </button>

              </div>

            </div>

            <div className="grid gap-5 md:grid-cols-3">

              {resources.map((resource) => (

                <div
                  key={resource.title}
                  className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
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

                      <span className="flex items-center gap-1 text-sm">
                        <Star
                          size={14}
                          className="fill-current"
                        />
                        {resource.rating}
                      </span>

                    </div>

                    <p className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                      <MapPin size={14} />
                      {resource.distance}
                    </p>

                    <p className="mt-4 text-lg font-bold">
                      {resource.price}
                      <span className="text-sm font-normal text-gray-500">
                        {" "}
                        {resource.unit}
                      </span>
                    </p>

                    <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#075c48] py-3 text-sm font-semibold text-white hover:bg-[#064d3d]">
                      View Details
                      <ArrowRight size={16} />
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </section>

          {/* FEATURES */}
          <section className="mt-8 grid border-y border-[#dedbc8] py-7 md:grid-cols-4">

            <Feature
              icon="✓"
              title="Verified Listings"
              text="Every tool inspected"
            />

            <Feature
              icon="♙"
              title="Active Community"
              text="5,000+ local farmers"
            />

            <Feature
              icon="⌂"
              title="Expert Support"
              text="Available 24/7"
            />

            <Feature
              icon="♧"
              title="Sustainable Growth"
              text="Eco-friendly focus"
            />

          </section>

          {/* FOOTER */}
          <footer className="flex flex-col gap-5 py-7 md:flex-row md:items-center md:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#075c48] text-white">
                <Leaf size={18} />
              </div>

              <span className="font-bold">
                Agri-Connect
              </span>

            </div>

            <div className="flex flex-wrap gap-6 text-sm text-gray-600">

              <span>Home</span>
              <span>Explore Resources</span>
              <span>Crop Assistant</span>
              <span>List a Resource</span>

            </div>

            <p className="text-xs text-gray-500">
              © 2026 Agri-Connect. All rights reserved.
            </p>

          </footer>

        </div>

      </section>

    </main>
  );
}

function SidebarItem({ icon, text, active }) {
  return (
    <div
      className={`mb-2 flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm ${
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
    </div>
  );
}

function Feature({ icon, title, text }) {
  return (
    <div className="flex items-center gap-3 px-4">

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e4f7e9] text-[#075c48]">
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