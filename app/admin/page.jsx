"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

import {
  ShieldCheck,
  Loader2,
  Check,
  X,
  Trash2,
  Users,
  Package,
  ClipboardList,
  Leaf,
  ArrowLeft,
  Search,
  RefreshCw,
  LayoutDashboard,
  Tractor,
  MapPin,
  Phone,
  CalendarDays,
  Eye,
  Pencil,
  Filter,
  ChevronDown,
  Clock3,
  CheckCircle2,
  XCircle,
  CircleAlert,
  UserCircle2,
  Mail,
  IndianRupee,
  ExternalLink,
  Save,
  Menu,
  MoreHorizontal,
} from "lucide-react";

/* =========================================================
   CONSTANTS
========================================================= */

const RESOURCE_STATUSES = [
  "all",
  "pending",
  "approved",
  "rejected",
];

const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "rejected",
  "completed",
];

const CATEGORIES = [
  "all",
  "Equipment",
  "Workers",
  "Seeds",
  "Irrigation",
  "Fertilizer",
];

/* =========================================================
   MAIN ADMIN PAGE
========================================================= */

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [admin, setAdmin] = useState(false);

  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  const [activeTab, setActiveTab] = useState("dashboard");

  const [resourceSearch, setResourceSearch] = useState("");
  const [resourceStatus, setResourceStatus] = useState("all");
  const [resourceCategory, setResourceCategory] = useState("all");

  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatus, setBookingStatus] = useState("all");

  const [userSearch, setUserSearch] = useState("");

  const [selectedResource, setSelectedResource] = useState(null);
  const [editingResource, setEditingResource] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [mobileMenu, setMobileMenu] = useState(false);

  const [message, setMessage] = useState(null);

  /* =========================================================
     ADMIN CHECK
  ========================================================= */

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/admin/login";
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error || profile?.role !== "admin") {
        alert("You do not have admin access.");
        window.location.href = "/admin/login";
        return;
      }

      setAdmin(true);

      await Promise.all([
        loadResources(),
        loadBookings(),
        loadUsers(),
      ]);
    } catch (error) {
      console.error("ADMIN CHECK ERROR:", error);

      showMessage(
        "error",
        error?.message || "Unable to load admin dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     LOAD DATA
  ========================================================= */

  async function loadResources() {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("RESOURCES ERROR:", error);

      showMessage(
        "error",
        `Resources could not be loaded: ${error.message}`
      );

      return;
    }

    setResources(data || []);
  }

  async function loadBookings() {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("BOOKINGS ERROR:", error);

      showMessage(
        "error",
        `Bookings could not be loaded: ${error.message}`
      );

      return;
    }

    setBookings(data || []);
  }

  async function loadUsers() {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error("USERS ERROR:", error);

      showMessage(
        "error",
        `Users could not be loaded: ${error.message}`
      );

      return;
    }

    setUsers(data || []);
  }

  async function refreshAll() {
    setRefreshing(true);

    await Promise.all([
      loadResources(),
      loadBookings(),
      loadUsers(),
    ]);

    setRefreshing(false);

    showMessage("success", "Dashboard refreshed.");
  }

  /* =========================================================
     RESOURCE ACTIONS
  ========================================================= */

  async function updateResourceStatus(id, status) {
    if (!id) return;

    const statusText =
      status === "approved"
        ? "approve"
        : status === "rejected"
        ? "reject"
        : "update";

    if (
      !window.confirm(
        `Are you sure you want to ${statusText} this resource?`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("resources")
      .update({
        status,
      })
      .eq("id", id);

    if (error) {
      console.error("RESOURCE STATUS ERROR:", error);

      showMessage(
        "error",
        `Resource update failed: ${error.message}`
      );

      return;
    }

    await loadResources();

    setSelectedResource(null);

    showMessage(
      "success",
      `Resource ${statusText}d successfully.`
    );
  }

  async function deleteResource(id) {
    if (!id) return;

    const resource = resources.find(
      (item) => item.id === id
    );

    const title =
      resource?.title ||
      "this resource";

    if (
      !window.confirm(
        `Delete "${title}" permanently?\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE RESOURCE ERROR:", error);

      showMessage(
        "error",
        `Resource deletion failed: ${error.message}`
      );

      return;
    }

    await loadResources();

    setSelectedResource(null);

    showMessage(
      "success",
      "Resource deleted successfully."
    );
  }

  async function saveResourceEdit(event) {
    event.preventDefault();

    if (!editingResource?.id) return;

    const price = Number(editingResource.price);

    if (
      Number.isNaN(price) ||
      price < 0
    ) {
      showMessage(
        "error",
        "Please enter a valid price."
      );

      return;
    }

    const { error } = await supabase
      .from("resources")
      .update({
        title: editingResource.title?.trim(),
        category: editingResource.category,
        description:
          editingResource.description?.trim(),
        price,
        price_unit:
          editingResource.price_unit,
        location:
          editingResource.location?.trim(),
        phone:
          editingResource.phone?.trim(),
        image_url:
          editingResource.image_url?.trim() || null,
      })
      .eq("id", editingResource.id);

    if (error) {
      console.error("EDIT RESOURCE ERROR:", error);

      showMessage(
        "error",
        `Resource update failed: ${error.message}`
      );

      return;
    }

    await loadResources();

    setEditingResource(null);

    showMessage(
      "success",
      "Resource updated successfully."
    );
  }

  /* =========================================================
     BOOKING ACTIONS
  ========================================================= */

  async function updateBookingStatus(id, status) {
    const allowedStatuses = [
      "pending",
      "confirmed",
      "rejected",
      "completed",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      showMessage(
        "error",
        "Invalid booking status."
      );

      return;
    }

    const { error } = await supabase
      .from("bookings")
      .update({
        status,
      })
      .eq("id", id);

    if (error) {
      console.error(
        "BOOKING STATUS ERROR:",
        error
      );

      showMessage(
        "error",
        `Booking update failed: ${error.message}`
      );

      return;
    }

    await loadBookings();

    setSelectedBooking(null);

    showMessage(
      "success",
      `Booking marked as ${status}.`
    );
  }

  /* =========================================================
     HELPERS
  ========================================================= */

  function showMessage(type, text) {
    setMessage({
      type,
      text,
    });

    setTimeout(() => {
      setMessage(null);
    }, 3500);
  }

  function getResourceTitle(resourceId) {
    const resource = resources.find(
      (item) => item.id === resourceId
    );

    return (
      resource?.title ||
      "Resource unavailable"
    );
  }

  function formatDate(date) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function formatDateTime(date) {
    if (!date) return "—";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "—";
    }

    return parsed.toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  /* =========================================================
     FILTERED DATA
  ========================================================= */

  const filteredResources = useMemo(() => {
    const query =
      resourceSearch
        .trim()
        .toLowerCase();

    return resources.filter((resource) => {
      const title =
        resource.title ||
        "";

      const description =
        resource.description ||
        "";

      const category =
        resource.category ||
        "";

      const location =
        resource.location ||
        "";

      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        description
          .toLowerCase()
          .includes(query) ||
        category
          .toLowerCase()
          .includes(query) ||
        location
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        resourceStatus === "all" ||
        resource.status ===
          resourceStatus;

      const matchesCategory =
        resourceCategory === "all" ||
        category.toLowerCase() ===
          resourceCategory.toLowerCase();

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory
      );
    });
  }, [
    resources,
    resourceSearch,
    resourceStatus,
    resourceCategory,
  ]);

  const filteredBookings = useMemo(() => {
    const query =
      bookingSearch
        .trim()
        .toLowerCase();

    return bookings.filter((booking) => {
      const farmer =
        booking.farmer_name ||
        "";

      const phone =
        booking.farmer_phone ||
        "";

      const resource =
        getResourceTitle(
          booking.resource_id
        );

      const matchesSearch =
        !query ||
        farmer.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query) ||
        resource.toLowerCase().includes(query);

      const matchesStatus =
        bookingStatus === "all" ||
        booking.status === bookingStatus;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    bookings,
    bookingSearch,
    bookingStatus,
    resources,
  ]);

  const filteredUsers = useMemo(() => {
    const query =
      userSearch
        .trim()
        .toLowerCase();

    return users.filter((user) => {
      const name =
        user.full_name ||
        "";

      const phone =
        user.phone ||
        "";

      const role =
        user.role ||
        "";

      return (
        !query ||
        name.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query) ||
        role.toLowerCase().includes(query)
      );
    });
  }, [users, userSearch]);

  /* =========================================================
     STATISTICS
  ========================================================= */

  const pendingResources =
    resources.filter(
      (item) =>
        item.status === "pending"
    ).length;

  const approvedResources =
    resources.filter(
      (item) =>
        item.status === "approved"
    ).length;

  const rejectedResources =
    resources.filter(
      (item) =>
        item.status === "rejected"
    ).length;

  const pendingBookings =
    bookings.filter(
      (item) =>
        item.status === "pending"
    ).length;

  const confirmedBookings =
    bookings.filter(
      (item) =>
        item.status === "confirmed"
    ).length;

  const completedBookings =
    bookings.filter(
      (item) =>
        item.status === "completed"
    ).length;

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <>
        <style jsx global>{`
          @keyframes agriPulse {
            0%,
            100% {
              opacity: 0.45;
              transform: scale(1);
            }

            50% {
              opacity: 0.9;
              transform: scale(1.08);
            }
          }

          .agri-pulse {
            animation: agriPulse 2.5s ease-in-out infinite;
          }
        `}</style>

        <div className="min-h-screen bg-[#fffdf5] flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#d5eee0] flex items-center justify-center mx-auto mb-4 agri-pulse">
              <Leaf className="w-7 h-7 text-[#075d45]" />
            </div>

            <Loader2 className="w-6 h-6 text-[#075d45] animate-spin mx-auto mb-3" />

            <p className="text-sm font-semibold text-[#294b3e]">
              Loading AgriConnect Admin...
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!admin) {
    return null;
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      <style jsx global>{`
        @keyframes agriFloatOne {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(20px, -18px, 0);
          }
        }

        @keyframes agriFloatTwo {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(-18px, 15px, 0);
          }
        }

        @keyframes agriFadeUp {
          from {
            opacity: 0;
            transform: translateY(8px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .agri-float-one {
          animation: agriFloatOne 9s ease-in-out infinite;
        }

        .agri-float-two {
          animation: agriFloatTwo 11s ease-in-out infinite;
        }

        .agri-fade-up {
          animation: agriFadeUp 0.45s ease-out both;
        }

        .admin-scroll::-webkit-scrollbar {
          height: 7px;
          width: 7px;
        }

        .admin-scroll::-webkit-scrollbar-track {
          background: #f5f3e8;
        }

        .admin-scroll::-webkit-scrollbar-thumb {
          background: #bfd8ca;
          border-radius: 20px;
        }

        .admin-scroll::-webkit-scrollbar-thumb:hover {
          background: #8db8a2;
        }
      `}</style>

      <main className="min-h-screen bg-[#fffdf5] text-[#294b3e] relative overflow-hidden">

        {/* =================================================
            DECORATIVE BACKGROUND
        ================================================= */}

        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-[#d5eee0]/45 blur-3xl agri-float-one" />

          <div className="absolute top-[45%] -left-24 w-80 h-80 rounded-full bg-[#e8f1dc]/40 blur-3xl agri-float-two" />

          <div className="absolute bottom-0 right-[25%] w-56 h-56 rounded-full bg-[#f3ead0]/40 blur-3xl agri-float-one" />
        </div>

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="sticky top-0 z-40 bg-[#fffdf5]/95 backdrop-blur-md border-b border-[#e4dfcf]">

          <div className="max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-7 h-[68px] flex items-center justify-between">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-[#d5eee0] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#075d45]" />
              </div>

              <div>
                <h1 className="font-serif text-xl font-bold text-[#294b3e]">
                  Agri-Connect
                </h1>

                <p className="text-[9px] uppercase tracking-[0.16em] text-[#789087] font-bold">
                  Admin Dashboard
                </p>
              </div>

            </div>

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={refreshAll}
                disabled={refreshing}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-[#ded9c9] bg-white text-[#49675c] text-xs font-bold hover:bg-[#f6f4e9] transition disabled:opacity-60"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    refreshing
                      ? "animate-spin"
                      : ""
                  }`}
                />

                Refresh
              </button>

              <Link
                href="/"
                className="flex items-center gap-2 bg-[#075d45] hover:bg-[#064c3a] text-white px-3.5 py-2 rounded-lg text-xs font-bold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />

                <span className="hidden sm:inline">
                  Website
                </span>
              </Link>

              <button
                type="button"
                onClick={() =>
                  setMobileMenu(
                    !mobileMenu
                  )
                }
                className="lg:hidden w-9 h-9 rounded-lg border border-[#ded9c9] bg-white flex items-center justify-center"
              >
                <Menu className="w-4 h-4" />
              </button>

            </div>

          </div>

        </header>

        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <div className="relative z-10 max-w-[1250px] mx-auto px-4 sm:px-6 lg:px-7 py-6">

          {/* =================================================
              MOBILE NAV
          ================================================= */}

          {mobileMenu && (
            <div className="lg:hidden mb-5 bg-white border border-[#e4dfcf] rounded-2xl p-2 shadow-sm agri-fade-up">

              <MobileNavButton
                active={
                  activeTab ===
                  "dashboard"
                }
                onClick={() => {
                  setActiveTab(
                    "dashboard"
                  );
                  setMobileMenu(false);
                }}
                icon={
                  <LayoutDashboard />
                }
              >
                Dashboard
              </MobileNavButton>

              <MobileNavButton
                active={
                  activeTab ===
                  "resources"
                }
                onClick={() => {
                  setActiveTab(
                    "resources"
                  );
                  setMobileMenu(false);
                }}
                icon={<Package />}
              >
                Resources
              </MobileNavButton>

              <MobileNavButton
                active={
                  activeTab ===
                  "bookings"
                }
                onClick={() => {
                  setActiveTab(
                    "bookings"
                  );
                  setMobileMenu(false);
                }}
                icon={
                  <ClipboardList />
                }
              >
                Enquiries
              </MobileNavButton>

              <MobileNavButton
                active={
                  activeTab === "users"
                }
                onClick={() => {
                  setActiveTab("users");
                  setMobileMenu(false);
                }}
                icon={<Users />}
              >
                Users
              </MobileNavButton>

            </div>
          )}

          {/* =================================================
              TOP INTRO
          ================================================= */}

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#187154] mb-1">
                Management Center
              </p>

              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#294b3e]">
                Welcome, Admin
              </h2>

              <p className="text-sm text-[#77877f] mt-1 max-w-xl">
                Manage farmer resources, enquiries,
                bookings and registered users from one
                place.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshAll}
              disabled={refreshing}
              className="sm:hidden flex items-center justify-center gap-2 border border-[#ded9c9] bg-white px-4 py-2.5 rounded-xl text-xs font-bold text-[#49675c]"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh Data
            </button>

          </div>

          {/* =================================================
              STAT CARDS
          ================================================= */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">

            <DashboardStat
              icon={<Users />}
              label="Total Users"
              value={users.length}
              helper="Registered accounts"
              iconStyle="bg-[#d5eee0] text-[#075d45]"
            />

            <DashboardStat
              icon={<Package />}
              label="Resources"
              value={resources.length}
              helper={`${approvedResources} approved`}
              iconStyle="bg-[#e7f0dc] text-[#52733f]"
            />

            <DashboardStat
              icon={<Clock3 />}
              label="Pending Resources"
              value={pendingResources}
              helper={`${rejectedResources} rejected`}
              iconStyle="bg-[#f9ecd2] text-[#a26b16]"
              onClick={() => {
                setResourceStatus(
                  "pending"
                );
                setActiveTab(
                  "resources"
                );
              }}
            />

            <DashboardStat
              icon={<ClipboardList />}
              label="Pending Enquiries"
              value={pendingBookings}
              helper={`${confirmedBookings} confirmed`}
              iconStyle="bg-[#e0ebf4] text-[#34688d]"
              onClick={() => {
                setBookingStatus(
                  "pending"
                );
                setActiveTab(
                  "bookings"
                );
              }}
            />

          </div>

          {/* =================================================
              QUICK OVERVIEW
          ================================================= */}

          {activeTab === "dashboard" && (
            <section className="agri-fade-up">

              <div className="grid lg:grid-cols-3 gap-4 mb-5">

                <OverviewCard
                  title="Resource Overview"
                  icon={<Package />}
                >
                  <OverviewRow
                    label="Approved"
                    value={approvedResources}
                    icon={
                      <CheckCircle2 />
                    }
                    type="green"
                  />

                  <OverviewRow
                    label="Pending"
                    value={pendingResources}
                    icon={
                      <Clock3 />
                    }
                    type="amber"
                  />

                  <OverviewRow
                    label="Rejected"
                    value={rejectedResources}
                    icon={
                      <XCircle />
                    }
                    type="red"
                  />
                </OverviewCard>

                <OverviewCard
                  title="Booking Overview"
                  icon={
                    <ClipboardList />
                  }
                >
                  <OverviewRow
                    label="Pending"
                    value={pendingBookings}
                    icon={
                      <Clock3 />
                    }
                    type="amber"
                  />

                  <OverviewRow
                    label="Confirmed"
                    value={confirmedBookings}
                    icon={
                      <CheckCircle2 />
                    }
                    type="blue"
                  />

                  <OverviewRow
                    label="Completed"
                    value={completedBookings}
                    icon={
                      <CheckCircle2 />
                    }
                    type="green"
                  />
                </OverviewCard>

                <OverviewCard
                  title="Quick Actions"
                  icon={<Leaf />}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setResourceStatus(
                        "pending"
                      );
                      setActiveTab(
                        "resources"
                      );
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#f7f5e9] hover:bg-[#eef2e5] transition text-left mb-2"
                  >
                    <span className="text-xs font-bold">
                      Review pending resources
                    </span>

                    <ArrowSmall />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setBookingStatus(
                        "pending"
                      );
                      setActiveTab(
                        "bookings"
                      );
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-[#f7f5e9] hover:bg-[#eef2e5] transition text-left"
                  >
                    <span className="text-xs font-bold">
                      Review pending enquiries
                    </span>

                    <ArrowSmall />
                  </button>
                </OverviewCard>

              </div>

              {/* Recent Resources */}

              <section className="bg-white border border-[#e4dfcf] rounded-2xl overflow-hidden">

                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eee9db]">

                  <div>
                    <h3 className="font-bold text-base">
                      Recent Resources
                    </h3>

                    <p className="text-xs text-[#87938d] mt-1">
                      Latest resources submitted to AgriConnect.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        "resources"
                      )
                    }
                    className="text-xs font-bold text-[#075d45] hover:underline"
                  >
                    View all
                  </button>

                </div>

                <div className="divide-y divide-[#eee9db]">

                  {resources
                    .slice(0, 5)
                    .map(
                      (resource) => (
                        <button
                          key={
                            resource.id
                          }
                          type="button"
                          onClick={() =>
                            setSelectedResource(
                              resource
                            )
                          }
                          className="w-full text-left p-4 flex items-center gap-3 hover:bg-[#fbfaf3] transition"
                        >

                          <div className="w-10 h-10 rounded-xl bg-[#d5eee0] flex items-center justify-center shrink-0">
                            <Tractor className="w-4 h-4 text-[#075d45]" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold truncate">
                              {resource.title ||
                                "Untitled Resource"}
                            </p>

                            <p className="text-[11px] text-[#87938d] truncate mt-0.5">
                              {resource.category ||
                                "Category"}{" "}
                              •{" "}
                              {resource.location ||
                                "Location not provided"}
                            </p>
                          </div>

                          <StatusBadge
                            status={
                              resource.status
                            }
                          />

                        </button>
                      )
                    )}

                  {resources.length === 0 && (
                    <EmptyState
                      title="No resources yet"
                      description="Resources submitted by users will appear here."
                    />
                  )}

                </div>

              </section>

            </section>
          )}

          {/* =================================================
              DESKTOP NAV
          ================================================= */}

          <div className="hidden lg:flex items-center gap-1 bg-white border border-[#e4dfcf] rounded-2xl p-1.5 mb-5">

            <DesktopTab
              active={
                activeTab ===
                "dashboard"
              }
              onClick={() =>
                setActiveTab(
                  "dashboard"
                )
              }
              icon={
                <LayoutDashboard />
              }
            >
              Dashboard
            </DesktopTab>

            <DesktopTab
              active={
                activeTab ===
                "resources"
              }
              onClick={() =>
                setActiveTab(
                  "resources"
                )
              }
              icon={<Package />}
              badge={
                pendingResources
              }
            >
              Resources
            </DesktopTab>

            <DesktopTab
              active={
                activeTab ===
                "bookings"
              }
              onClick={() =>
                setActiveTab(
                  "bookings"
                )
              }
              icon={
                <ClipboardList />
              }
              badge={
                pendingBookings
              }
            >
              Enquiries
            </DesktopTab>

            <DesktopTab
              active={
                activeTab === "users"
              }
              onClick={() =>
                setActiveTab("users")
              }
              icon={<Users />}
            >
              Users
            </DesktopTab>

          </div>

          {/* =================================================
              RESOURCES
          ================================================= */}

          {activeTab === "resources" && (
            <section className="bg-white border border-[#e4dfcf] rounded-2xl overflow-hidden agri-fade-up">

              <SectionHeader
                title="Resource Management"
                description="Review, approve and manage resources submitted by farmers and providers."
                icon={<Package />}
                count={
                  filteredResources.length
                }
              />

              {/* Filters */}

              <div className="p-4 border-b border-[#eee9db] bg-[#fcfbf5]">

                <div className="grid lg:grid-cols-[1fr_auto_auto] gap-2">

                  <SearchInput
                    value={
                      resourceSearch
                    }
                    onChange={
                      setResourceSearch
                    }
                    placeholder="Search resources, category or location..."
                  />

                  <SelectFilter
                    value={
                      resourceStatus
                    }
                    onChange={
                      setResourceStatus
                    }
                    options={
                      RESOURCE_STATUSES
                    }
                  />

                  <SelectFilter
                    value={
                      resourceCategory
                    }
                    onChange={
                      setResourceCategory
                    }
                    options={
                      CATEGORIES
                    }
                  />

                </div>

              </div>

              <div className="overflow-x-auto admin-scroll">

                <table className="w-full text-sm min-w-[950px]">

                  <thead className="bg-[#f7f5e9]">

                    <tr>
                      <TableHead>
                        Resource
                      </TableHead>

                      <TableHead>
                        Category
                      </TableHead>

                      <TableHead>
                        Price
                      </TableHead>

                      <TableHead>
                        Location
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead>
                        Added
                      </TableHead>

                      <TableHead>
                        Actions
                      </TableHead>
                    </tr>

                  </thead>

                  <tbody>

                    {filteredResources.map(
                      (resource) => (
                        <tr
                          key={
                            resource.id
                          }
                          className="border-t border-[#eee9db] hover:bg-[#fcfbf6] transition"
                        >

                          <td className="p-4">

                            <div className="flex items-center gap-3">

                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#d5eee0] shrink-0">

                                {resource.image_url ? (
                                  <img
                                    src={
                                      resource.image_url
                                    }
                                    alt={
                                      resource.title ||
                                      "Resource"
                                    }
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Tractor className="w-5 h-5 text-[#075d45]" />
                                  </div>
                                )}

                              </div>

                              <div className="min-w-0">

                                <p className="font-bold text-[#294b3e] truncate max-w-[230px]">
                                  {resource.title ||
                                    "Untitled Resource"}
                                </p>

                                <p className="text-[11px] text-[#89948d] truncate max-w-[230px] mt-0.5">
                                  {resource.provider_name ||
                                    "Resource Provider"}
                                </p>

                              </div>

                            </div>

                          </td>

                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg bg-[#eef4e8] text-[#52733f] text-[11px] font-bold">
                              {resource.category ||
                                "Other"}
                            </span>
                          </td>

                          <td className="p-4">

                            <p className="font-bold">
                              ₹
                              {Number(
                                resource.price || 0
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>

                            <p className="text-[10px] text-[#89948d]">
                              /{" "}
                              {resource.price_unit ||
                                "unit"}
                            </p>

                          </td>

                          <td className="p-4">

                            <div className="flex items-center gap-1.5 text-xs text-[#687c72]">
                              <MapPin className="w-3.5 h-3.5 text-[#187154]" />

                              <span className="max-w-[160px] truncate">
                                {resource.location ||
                                  "Not provided"}
                              </span>
                            </div>

                          </td>

                          <td className="p-4">
                            <StatusBadge
                              status={
                                resource.status
                              }
                            />
                          </td>

                          <td className="p-4 text-xs text-[#7f8b85]">
                            {formatDate(
                              resource.created_at
                            )}
                          </td>

                          <td className="p-4">

                            <div className="flex items-center gap-1.5">

                              <ActionButton
                                title="View"
                                onClick={() =>
                                  setSelectedResource(
                                    resource
                                  )
                                }
                              >
                                <Eye />
                              </ActionButton>

                              <ActionButton
                                title="Edit"
                                onClick={() =>
                                  setEditingResource(
                                    {
                                      ...resource,
                                    }
                                  )
                                }
                              >
                                <Pencil />
                              </ActionButton>

                              {resource.status !==
                                "approved" && (
                                <ActionButton
                                  title="Approve"
                                  green
                                  onClick={() =>
                                    updateResourceStatus(
                                      resource.id,
                                      "approved"
                                    )
                                  }
                                >
                                  <Check />
                                </ActionButton>
                              )}

                              {resource.status !==
                                "rejected" && (
                                <ActionButton
                                  title="Reject"
                                  red
                                  onClick={() =>
                                    updateResourceStatus(
                                      resource.id,
                                      "rejected"
                                    )
                                  }
                                >
                                  <X />
                                </ActionButton>
                              )}

                              <ActionButton
                                title="Delete"
                                onClick={() =>
                                  deleteResource(
                                    resource.id
                                  )
                                }
                              >
                                <Trash2 />
                              </ActionButton>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

                {filteredResources.length ===
                  0 && (
                  <EmptyState
                    title="No resources found"
                    description="Try changing the search or filter options."
                  />
                )}

              </div>

            </section>
          )}

          {/* =================================================
              BOOKINGS
          ================================================= */}

          {activeTab === "bookings" && (
            <section className="bg-white border border-[#e4dfcf] rounded-2xl overflow-hidden agri-fade-up">

              <SectionHeader
                title="Enquiry & Booking Management"
                description="Manage farmer requests and update their booking status."
                icon={
                  <ClipboardList />
                }
                count={
                  filteredBookings.length
                }
              />

              <div className="p-4 border-b border-[#eee9db] bg-[#fcfbf5]">

                <div className="grid lg:grid-cols-[1fr_auto] gap-2">

                  <SearchInput
                    value={
                      bookingSearch
                    }
                    onChange={
                      setBookingSearch
                    }
                    placeholder="Search farmer, phone or resource..."
                  />

                  <SelectFilter
                    value={
                      bookingStatus
                    }
                    onChange={
                      setBookingStatus
                    }
                    options={[
                      "all",
                      ...BOOKING_STATUSES,
                    ]}
                  />

                </div>

              </div>

              <div className="overflow-x-auto admin-scroll">

                <table className="w-full text-sm min-w-[900px]">

                  <thead className="bg-[#f7f5e9]">

                    <tr>

                      <TableHead>
                        Farmer
                      </TableHead>

                      <TableHead>
                        Resource
                      </TableHead>

                      <TableHead>
                        Contact
                      </TableHead>

                      <TableHead>
                        Requested
                      </TableHead>

                      <TableHead>
                        Status
                      </TableHead>

                      <TableHead>
                        Action
                      </TableHead>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredBookings.map(
                      (booking) => (
                        <tr
                          key={
                            booking.id
                          }
                          className="border-t border-[#eee9db] hover:bg-[#fcfbf6] transition"
                        >

                          <td className="p-4">

                            <div className="flex items-center gap-2.5">

                              <div className="w-9 h-9 rounded-full bg-[#d5eee0] flex items-center justify-center">
                                <UserCircle2 className="w-4 h-4 text-[#075d45]" />
                              </div>

                              <div>
                                <p className="font-bold">
                                  {booking.farmer_name ||
                                    "Unknown Farmer"}
                                </p>

                                <p className="text-[10px] text-[#89948d]">
                                  Booking request
                                </p>
                              </div>

                            </div>

                          </td>

                          <td className="p-4">

                            <p className="font-semibold max-w-[220px] truncate">
                              {getResourceTitle(
                                booking.resource_id
                              )}
                            </p>

                            <p className="text-[10px] text-[#89948d]">
                              ID:{" "}
                              {booking.resource_id
                                ? booking.resource_id.slice(
                                    0,
                                    8
                                  )
                                : "—"}
                            </p>

                          </td>

                          <td className="p-4">

                            <div className="flex items-center gap-1.5 text-xs">
                              <Phone className="w-3.5 h-3.5 text-[#187154]" />
                              {booking.farmer_phone ||
                                "Not provided"}
                            </div>

                          </td>

                          <td className="p-4">

                            <div className="flex items-center gap-1.5 text-xs text-[#687c72]">
                              <CalendarDays className="w-3.5 h-3.5" />

                              {formatDateTime(
                                booking.created_at
                              )}
                            </div>

                          </td>

                          <td className="p-4">
                            <StatusBadge
                              status={
                                booking.status
                              }
                            />
                          </td>

                          <td className="p-4">

                            <div className="flex items-center gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedBooking(
                                    booking
                                  )
                                }
                                className="px-3 py-2 rounded-lg border border-[#ded9c9] bg-white text-xs font-bold hover:bg-[#f7f5e9] transition"
                              >
                                View
                              </button>

                              <select
                                value={
                                  booking.status ||
                                  "pending"
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateBookingStatus(
                                    booking.id,
                                    event.target
                                      .value
                                  )
                                }
                                className="border border-[#ded9c9] rounded-lg px-2.5 py-2 text-xs bg-white outline-none focus:border-[#187154]"
                              >

                                <option value="pending">
                                  Pending
                                </option>

                                <option value="confirmed">
                                  Confirmed
                                </option>

                                <option value="rejected">
                                  Rejected
                                </option>

                                <option value="completed">
                                  Completed
                                </option>

                              </select>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

                {filteredBookings.length ===
                  0 && (
                  <EmptyState
                    title="No enquiries found"
                    description="There are no bookings matching your filters."
                  />
                )}

              </div>

            </section>
          )}

          {/* =================================================
              USERS
          ================================================= */}

          {activeTab === "users" && (
            <section className="bg-white border border-[#e4dfcf] rounded-2xl overflow-hidden agri-fade-up">

              <SectionHeader
                title="Registered Users"
                description="View farmer and provider accounts registered through AgriConnect."
                icon={<Users />}
                count={
                  filteredUsers.length
                }
              />

              <div className="p-4 border-b border-[#eee9db] bg-[#fcfbf5]">

                <SearchInput
                  value={userSearch}
                  onChange={setUserSearch}
                  placeholder="Search users by name, phone or role..."
                />

              </div>

              <div className="overflow-x-auto admin-scroll">

                <table className="w-full text-sm min-w-[750px]">

                  <thead className="bg-[#f7f5e9]">

                    <tr>

                      <TableHead>
                        User
                      </TableHead>

                      <TableHead>
                        Phone
                      </TableHead>

                      <TableHead>
                        Role
                      </TableHead>

                      <TableHead>
                        Joined
                      </TableHead>

                      <TableHead>
                        User ID
                      </TableHead>

                    </tr>

                  </thead>

                  <tbody>

                    {filteredUsers.map(
                      (user) => (
                        <tr
                          key={user.id}
                          className="border-t border-[#eee9db] hover:bg-[#fcfbf6] transition"
                        >

                          <td className="p-4">

                            <div className="flex items-center gap-3">

                              <div className="w-10 h-10 rounded-full bg-[#d5eee0] flex items-center justify-center">
                                <UserCircle2 className="w-5 h-5 text-[#075d45]" />
                              </div>

                              <div>
                                <p className="font-bold">
                                  {user.full_name ||
                                    "Unnamed User"}
                                </p>

                                <p className="text-[10px] text-[#89948d]">
                                  AgriConnect account
                                </p>
                              </div>

                            </div>

                          </td>

                          <td className="p-4 text-xs">
                            {user.phone ||
                              "Not provided"}
                          </td>

                          <td className="p-4">

                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                user.role ===
                                "admin"
                                  ? "bg-[#e0ebf4] text-[#34688d]"
                                  : "bg-[#d5eee0] text-[#075d45]"
                              }`}
                            >
                              {user.role ||
                                "farmer"}
                            </span>

                          </td>

                          <td className="p-4 text-xs text-[#7f8b85]">
                            {formatDate(
                              user.created_at
                            )}
                          </td>

                          <td className="p-4">

                            <code className="text-[10px] bg-[#f7f5e9] px-2 py-1 rounded">
                              {user.id
                                ? `${user.id.slice(
                                    0,
                                    8
                                  )}...`
                                : "—"}
                            </code>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

                {filteredUsers.length ===
                  0 && (
                  <EmptyState
                    title="No users found"
                    description="No registered users match your search."
                  />
                )}

              </div>

            </section>
          )}

        </div>

        {/* =================================================
            TOAST
        ================================================= */}

        {message && (
          <div className="fixed bottom-5 right-5 z-[100] max-w-[360px]">

            <div
              className={`flex items-start gap-3 px-4 py-3 rounded-2xl shadow-xl border bg-white ${
                message.type ===
                "success"
                  ? "border-[#b9dcc8]"
                  : "border-[#eccaca]"
              }`}
            >

              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  message.type ===
                  "success"
                    ? "bg-[#d5eee0] text-[#075d45]"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {message.type ===
                "success" ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <CircleAlert className="w-4 h-4" />
                )}
              </div>

              <div className="pt-0.5">

                <p className="text-xs font-bold">
                  {message.type ===
                  "success"
                    ? "Success"
                    : "Something went wrong"}
                </p>

                <p className="text-[11px] text-[#718079] mt-0.5">
                  {message.text}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setMessage(null)
                }
                className="ml-auto text-[#89948d]"
              >
                <X className="w-4 h-4" />
              </button>

            </div>

          </div>
        )}

        {/* =================================================
            RESOURCE DETAILS MODAL
        ================================================= */}

        {selectedResource && (
          <Modal
            onClose={() =>
              setSelectedResource(null)
            }
          >

            <div className="p-5 sm:p-6">

              <div className="flex items-start justify-between gap-4 mb-5">

                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#187154] mb-1">
                    Resource Details
                  </p>

                  <h3 className="font-serif text-2xl font-bold text-[#294b3e]">
                    {selectedResource.title ||
                      "Untitled Resource"}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedResource(null)
                  }
                  className="w-9 h-9 rounded-xl bg-[#f7f5e9] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>

              </div>

              {selectedResource.image_url && (
                <div className="h-48 rounded-2xl overflow-hidden mb-5 bg-[#d5eee0]">

                  <img
                    src={
                      selectedResource.image_url
                    }
                    alt={
                      selectedResource.title ||
                      "Resource"
                    }
                    className="w-full h-full object-cover"
                  />

                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">

                <DetailBox
                  icon={<Package />}
                  label="Category"
                  value={
                    selectedResource.category
                  }
                />

                <DetailBox
                  icon={<IndianRupee />}
                  label="Price"
                  value={`₹${Number(
                    selectedResource.price ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )} / ${
                    selectedResource.price_unit ||
                    "unit"
                  }`}
                />

                <DetailBox
                  icon={<MapPin />}
                  label="Location"
                  value={
                    selectedResource.location ||
                    "Not provided"
                  }
                />

                <DetailBox
                  icon={<Phone />}
                  label="Phone"
                  value={
                    selectedResource.phone ||
                    "Not provided"
                  }
                />

                <DetailBox
                  icon={<UserCircle2 />}
                  label="Provider"
                  value={
                    selectedResource.provider_name ||
                    "Not provided"
                  }
                />

                <DetailBox
                  icon={<CalendarDays />}
                  label="Added"
                  value={formatDate(
                    selectedResource.created_at
                  )}
                />

              </div>

              <div className="mt-4 p-4 rounded-2xl bg-[#f7f5e9]">

                <p className="text-[10px] uppercase tracking-wider font-bold text-[#687c72] mb-2">
                  Description
                </p>

                <p className="text-sm leading-relaxed text-[#51685e]">
                  {selectedResource.description ||
                    "No description provided."}
                </p>

              </div>

              <div className="flex flex-wrap gap-2 mt-5">

                <StatusBadge
                  status={
                    selectedResource.status
                  }
                />

                <button
                  type="button"
                  onClick={() => {
                    setEditingResource({
                      ...selectedResource,
                    });

                    setSelectedResource(
                      null
                    );
                  }}
                  className="ml-auto flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#075d45] text-white text-xs font-bold"
                >
                  <Pencil className="w-3.5 h-3.5" />

                  Edit
                </button>

                {selectedResource.status !==
                  "approved" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateResourceStatus(
                        selectedResource.id,
                        "approved"
                      )
                    }
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#d5eee0] text-[#075d45] text-xs font-bold"
                  >
                    <Check className="w-3.5 h-3.5" />

                    Approve
                  </button>
                )}

                {selectedResource.status !==
                  "rejected" && (
                  <button
                    type="button"
                    onClick={() =>
                      updateResourceStatus(
                        selectedResource.id,
                        "rejected"
                      )
                    }
                    className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-red-50 text-red-700 text-xs font-bold"
                  >
                    <X className="w-3.5 h-3.5" />

                    Reject
                  </button>
                )}

              </div>

            </div>

          </Modal>
        )}

        {/* =================================================
            EDIT RESOURCE MODAL
        ================================================= */}

        {editingResource && (
          <Modal
            onClose={() =>
              setEditingResource(null)
            }
          >

            <form
              onSubmit={saveResourceEdit}
              className="p-5 sm:p-6"
            >

              <div className="flex items-start justify-between mb-5">

                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#187154] mb-1">
                    Resource Management
                  </p>

                  <h3 className="font-serif text-2xl font-bold">
                    Edit Resource
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setEditingResource(
                      null
                    )
                  }
                  className="w-9 h-9 rounded-xl bg-[#f7f5e9] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>

              </div>

              <div className="grid sm:grid-cols-2 gap-4">

                <FormField
                  label="Resource Title"
                  value={
                    editingResource.title ||
                    ""
                  }
                  onChange={(value) =>
                    setEditingResource(
                      (current) => ({
                        ...current,
                        title: value,
                      })
                    )
                  }
                  required
                />

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wide text-[#687c72] mb-1.5">
                    Category
                  </label>

                  <select
                    value={
                      editingResource.category ||
                      "Equipment"
                    }
                    onChange={(event) =>
                      setEditingResource(
                        (current) => ({
                          ...current,
                          category:
                            event.target.value,
                        })
                      )
                    }
                    className="w-full h-10 px-3 rounded-xl border border-[#ddd8c9] bg-white text-xs outline-none focus:border-[#187154]"
                  >
                    {CATEGORIES.filter(
                      (item) =>
                        item !== "all"
                    ).map(
                      (category) => (
                        <option
                          key={category}
                          value={category}
                        >
                          {category}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <FormField
                  label="Price"
                  type="number"
                  value={
                    editingResource.price ??
                    ""
                  }
                  onChange={(value) =>
                    setEditingResource(
                      (current) => ({
                        ...current,
                        price: value,
                      })
                    )
                  }
                  required
                />

                <FormField
                  label="Price Unit"
                  value={
                    editingResource.price_unit ||
                    ""
                  }
                  onChange={(value) =>
                    setEditingResource(
                      (current) => ({
                        ...current,
                        price_unit:
                          value,
                      })
                    )
                  }
                  placeholder="day / item / week"
                  required
                />

                <FormField
                  label="Location"
                  value={
                    editingResource.location ||
                    ""
                  }
                  onChange={(value) =>
                    setEditingResource(
                      (current) => ({
                        ...current,
                        location:
                          value,
                      })
                    )
                  }
                />

                <FormField
                  label="Phone"
                  value={
                    editingResource.phone ||
                    ""
                  }
                  onChange={(value) =>
                    setEditingResource(
                      (current) => ({
                        ...current,
                        phone: value,
                      })
                    )
                  }
                />

                <div className="sm:col-span-2">

                  <FormField
                    label="Image URL"
                    value={
                      editingResource.image_url ||
                      ""
                    }
                    onChange={(value) =>
                      setEditingResource(
                        (current) => ({
                          ...current,
                          image_url:
                            value,
                        })
                      )
                    }
                  />

                </div>

                <div className="sm:col-span-2">

                  <label className="block text-[10px] font-bold uppercase tracking-wide text-[#687c72] mb-1.5">
                    Description
                  </label>

                  <textarea
                    value={
                      editingResource.description ||
                      ""
                    }
                    onChange={(event) =>
                      setEditingResource(
                        (current) => ({
                          ...current,
                          description:
                            event.target.value,
                        })
                      )
                    }
                    rows={4}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#ddd8c9] bg-white text-xs outline-none resize-none focus:border-[#187154]"
                  />

                </div>

              </div>

              <div className="flex justify-end gap-2 mt-6">

                <button
                  type="button"
                  onClick={() =>
                    setEditingResource(
                      null
                    )
                  }
                  className="px-4 py-2.5 rounded-xl border border-[#ddd8c9] bg-white text-xs font-bold"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#075d45] text-white text-xs font-bold"
                >
                  <Save className="w-3.5 h-3.5" />

                  Save Changes
                </button>

              </div>

            </form>

          </Modal>
        )}

        {/* =================================================
            BOOKING DETAILS MODAL
        ================================================= */}

        {selectedBooking && (
          <Modal
            onClose={() =>
              setSelectedBooking(null)
            }
          >

            <div className="p-5 sm:p-6">

              <div className="flex items-start justify-between mb-6">

                <div>
                  <p className="text-[9px] uppercase tracking-[0.15em] font-bold text-[#187154] mb-1">
                    Booking Details
                  </p>

                  <h3 className="font-serif text-2xl font-bold">
                    Farmer Enquiry
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedBooking(
                      null
                    )
                  }
                  className="w-9 h-9 rounded-xl bg-[#f7f5e9] flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>

              </div>

              <div className="grid sm:grid-cols-2 gap-3">

                <DetailBox
                  icon={<UserCircle2 />}
                  label="Farmer"
                  value={
                    selectedBooking.farmer_name
                  }
                />

                <DetailBox
                  icon={<Phone />}
                  label="Phone"
                  value={
                    selectedBooking.farmer_phone
                  }
                />

                <DetailBox
                  icon={<Package />}
                  label="Resource"
                  value={getResourceTitle(
                    selectedBooking.resource_id
                  )}
                />

                <DetailBox
                  icon={<CalendarDays />}
                  label="Requested"
                  value={formatDateTime(
                    selectedBooking.created_at
                  )}
                />

              </div>

              <div className="mt-5 p-4 rounded-2xl bg-[#f7f5e9]">

                <p className="text-[10px] uppercase tracking-wider font-bold text-[#687c72] mb-2">
                  Current Status
                </p>

                <StatusBadge
                  status={
                    selectedBooking.status
                  }
                />

              </div>

              <div className="mt-5">

                <p className="text-[10px] uppercase tracking-wider font-bold text-[#687c72] mb-2">
                  Update Status
                </p>

                <div className="grid grid-cols-2 gap-2">

                  {BOOKING_STATUSES.map(
                    (status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() =>
                          updateBookingStatus(
                            selectedBooking.id,
                            status
                          )
                        }
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition ${
                          selectedBooking.status ===
                          status
                            ? "bg-[#075d45] text-white border-[#075d45]"
                            : "bg-white border-[#ddd8c9] hover:bg-[#f7f5e9]"
                        }`}
                      >
                        {status
                          .charAt(0)
                          .toUpperCase() +
                          status.slice(1)}
                      </button>
                    )
                  )}

                </div>

              </div>

            </div>

          </Modal>
        )}

      </main>
    </>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function DashboardStat({
  icon,
  label,
  value,
  helper,
  iconStyle,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`text-left bg-white border border-[#e4dfcf] rounded-2xl p-4 sm:p-5 transition ${
        onClick
          ? "hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
          : ""
      }`}
    >

      <div className="flex items-start justify-between gap-3">

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconStyle}`}
        >
          {icon}
        </div>

        {onClick && (
          <ExternalLink className="w-3.5 h-3.5 text-[#a0aaa5]" />
        )}

      </div>

      <p className="text-[10px] uppercase tracking-wide text-[#89948d] font-bold mt-4">
        {label}
      </p>

      <p className="text-2xl sm:text-3xl font-bold text-[#294b3e] mt-1">
        {value}
      </p>

      <p className="text-[10px] text-[#89948d] mt-1">
        {helper}
      </p>

    </button>
  );
}

function OverviewCard({
  title,
  icon,
  children,
}) {
  return (
    <div className="bg-white border border-[#e4dfcf] rounded-2xl p-5">

      <div className="flex items-center gap-2 mb-4">

        <div className="w-8 h-8 rounded-lg bg-[#d5eee0] text-[#075d45] flex items-center justify-center">
          {icon}
        </div>

        <h3 className="font-bold text-sm">
          {title}
        </h3>

      </div>

      <div>
        {children}
      </div>

    </div>
  );
}

function OverviewRow({
  label,
  value,
  icon,
  type,
}) {
  const styles = {
    green:
      "bg-[#d5eee0] text-[#075d45]",
    amber:
      "bg-[#f9ecd2] text-[#a26b16]",
    red:
      "bg-red-50 text-red-700",
    blue:
      "bg-[#e0ebf4] text-[#34688d]",
  };

  return (
    <div className="flex items-center justify-between py-2">

      <div className="flex items-center gap-2">

        <div
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${styles[type]}`}
        >
          {icon}
        </div>

        <span className="text-xs text-[#687c72]">
          {label}
        </span>

      </div>

      <span className="text-sm font-bold">
        {value}
      </span>

    </div>
  );
}

function DesktopTab({
  active,
  onClick,
  icon,
  badge,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
        active
          ? "bg-[#075d45] text-white shadow-sm"
          : "text-[#687c72] hover:bg-[#f7f5e9]"
      }`}
    >

      <span className="w-4 h-4">
        {icon}
      </span>

      {children}

      {badge > 0 && (
        <span
          className={`min-w-5 h-5 px-1 rounded-full flex items-center justify-center text-[9px] ${
            active
              ? "bg-white/20 text-white"
              : "bg-[#f9ecd2] text-[#a26b16]"
          }`}
        >
          {badge}
        </span>
      )}

    </button>
  );
}

function MobileNavButton({
  active,
  onClick,
  icon,
  children,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-bold text-left ${
        active
          ? "bg-[#075d45] text-white"
          : "text-[#687c72] hover:bg-[#f7f5e9]"
      }`}
    >
      <span className="w-4 h-4">
        {icon}
      </span>

      {children}
    </button>
  );
}

function SectionHeader({
  title,
  description,
  icon,
  count,
}) {
  return (
    <div className="p-5 border-b border-[#eee9db] flex flex-col sm:flex-row sm:items-center justify-between gap-3">

      <div className="flex items-start gap-3">

        <div className="w-10 h-10 rounded-xl bg-[#d5eee0] text-[#075d45] flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div>

          <h2 className="font-serif text-xl font-bold text-[#294b3e]">
            {title}
          </h2>

          <p className="text-xs text-[#89948d] mt-1">
            {description}
          </p>

        </div>

      </div>

      <div className="px-3 py-1.5 rounded-lg bg-[#f7f5e9] text-[10px] font-bold text-[#687c72]">
        {count}{" "}
        {count === 1
          ? "result"
          : "results"}
      </div>

    </div>
  );
}

function SearchInput({
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="h-10 flex items-center gap-2 px-3 rounded-xl border border-[#ddd8c9] bg-white focus-within:border-[#187154] transition">

      <Search className="w-4 h-4 text-[#89948d] shrink-0" />

      <input
        type="search"
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        className="w-full outline-none text-xs text-[#294b3e] placeholder:text-[#a0aaa5] bg-transparent"
      />

      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          className="text-[#89948d]"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

    </div>
  );
}

function SelectFilter({
  value,
  onChange,
  options,
}) {
  return (
    <div className="relative">

      <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#89948d] pointer-events-none" />

      <select
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="h-10 pl-9 pr-9 rounded-xl border border-[#ddd8c9] bg-white text-xs font-semibold text-[#49675c] outline-none appearance-none min-w-[145px]"
      >

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option === "all"
              ? "All"
              : option
                  .charAt(0)
                  .toUpperCase() +
                option.slice(1)}
          </option>
        ))}

      </select>

      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#89948d] pointer-events-none" />

    </div>
  );
}

function TableHead({
  children,
}) {
  return (
    <th className="text-left p-4 text-[10px] uppercase tracking-wide font-bold text-[#687c72] whitespace-nowrap">
      {children}
    </th>
  );
}

function ActionButton({
  children,
  onClick,
  title,
  green,
  red,
}) {
  let style =
    "bg-[#f4f3ec] text-[#596b63] hover:bg-[#e9e7db]";

  if (green) {
    style =
      "bg-[#d5eee0] text-[#075d45] hover:bg-[#c3e5d1]";
  }

  if (red) {
    style =
      "bg-red-50 text-red-700 hover:bg-red-100";
  }

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${style}`}
    >
      {children}
    </button>
  );
}

function StatusBadge({
  status,
}) {
  const normalized =
    status || "unknown";

  const styles = {
    pending:
      "bg-[#f9ecd2] text-[#a26b16]",
    approved:
      "bg-[#d5eee0] text-[#075d45]",
    confirmed:
      "bg-[#e0ebf4] text-[#34688d]",
    rejected:
      "bg-red-50 text-red-700",
    completed:
      "bg-slate-100 text-slate-700",
    unknown:
      "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[10px] font-bold ${
        styles[normalized] ||
        styles.unknown
      }`}
    >

      <span className="w-1.5 h-1.5 rounded-full bg-current" />

      {normalized
        .charAt(0)
        .toUpperCase() +
        normalized.slice(1)}

    </span>
  );
}

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="py-16 px-5 text-center">

      <div className="w-12 h-12 rounded-2xl bg-[#f7f5e9] flex items-center justify-center mx-auto mb-3">
        <Package className="w-5 h-5 text-[#789087]" />
      </div>

      <p className="font-bold text-sm text-[#294b3e]">
        {title}
      </p>

      <p className="text-xs text-[#89948d] mt-1 max-w-sm mx-auto">
        {description}
      </p>

    </div>
  );
}

function Modal({
  children,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">

      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-[#17362b]/45 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-[#e4dfcf]">
        {children}
      </div>

    </div>
  );
}

function DetailBox({
  icon,
  label,
  value,
}) {
  return (
    <div className="p-3.5 rounded-xl border border-[#eee9db] bg-[#fcfbf6]">

      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wide font-bold text-[#89948d] mb-1.5">

        <span className="w-4 h-4 text-[#187154]">
          {icon}
        </span>

        {label}

      </div>

      <p className="text-xs font-bold text-[#294b3e] break-words">
        {value || "Not provided"}
      </p>

    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}) {
  return (
    <div>

      <label className="block text-[10px] font-bold uppercase tracking-wide text-[#687c72] mb-1.5">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        placeholder={placeholder}
        required={required}
        className="w-full h-10 px-3 rounded-xl border border-[#ddd8c9] bg-white text-xs outline-none focus:border-[#187154] transition"
      />

    </div>
  );
}

function ArrowSmall() {
  return (
    <span className="text-[#187154]">
      →
    </span>
  );
}