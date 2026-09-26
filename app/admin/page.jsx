"use client";

import { useEffect, useState } from "react";
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
} from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState(false);

  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);

  const [activeTab, setActiveTab] = useState("resources");

  useEffect(() => {
    checkAdmin();
  }, []);

  async function checkAdmin() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || profile?.role !== "admin") {
      alert("You do not have admin access.");
      window.location.href = "/";
      return;
    }

    setAdmin(true);

    await Promise.all([
      loadResources(),
      loadBookings(),
      loadUsers(),
    ]);

    setLoading(false);
  }

  async function loadResources() {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(error);
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
      console.error(error);
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
      console.error(error);
      return;
    }

    setUsers(data || []);
  }

  async function updateResourceStatus(id, status) {
    const { error } = await supabase
      .from("resources")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadResources();
  }

  async function deleteResource(id) {
    if (!window.confirm("Delete this resource?")) {
      return;
    }

    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadResources();
  }

  async function updateBookingStatus(id, status) {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);

    if (error) {
      alert(error.message);
      return;
    }

    await loadBookings();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const pendingResources = resources.filter(
    (item) => item.status === "pending"
  ).length;

  const pendingBookings = bookings.filter(
    (item) => item.status === "pending"
  ).length;

  return (
    <main className="min-h-screen bg-[#f7f5e9] text-[#294b3e]">

      {/* Header */}
      <header className="bg-[#d5eee0] border-b border-[#c4dfd0]">

        <div className="max-w-7xl mx-auto px-5 py-4 flex justify-between items-center">

          <div className="flex items-center gap-3">

            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
              <Leaf className="w-5 h-5 text-emerald-700" />
            </div>

            <div>
              <h1 className="font-bold text-lg">
                AgriConnect Admin
              </h1>

              <p className="text-xs text-emerald-800">
                Management Dashboard
              </p>
            </div>

          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Website
          </Link>

        </div>

      </header>

      <div className="max-w-7xl mx-auto px-5 py-7">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">

          <StatCard
            icon={<Users />}
            title="Users"
            value={users.length}
          />

          <StatCard
            icon={<Package />}
            title="Resources"
            value={resources.length}
          />

          <StatCard
            icon={<Package />}
            title="Pending Resources"
            value={pendingResources}
          />

          <StatCard
            icon={<ClipboardList />}
            title="Pending Enquiries"
            value={pendingBookings}
          />

        </div>

        {/* Tabs */}
        <div className="bg-white border border-[#e5dfca] rounded-2xl p-2 flex gap-2 mb-5">

          <Tab
            active={activeTab === "resources"}
            onClick={() => setActiveTab("resources")}
          >
            Resources
          </Tab>

          <Tab
            active={activeTab === "bookings"}
            onClick={() => setActiveTab("bookings")}
          >
            Enquiries
          </Tab>

          <Tab
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          >
            Users
          </Tab>

        </div>

        {/* Resources */}
        {activeTab === "resources" && (

          <section className="bg-white border border-[#e5dfca] rounded-2xl overflow-hidden">

            <div className="p-5 border-b">
              <h2 className="font-bold text-lg">
                Resource Management
              </h2>

              <p className="text-sm text-slate-500">
                Review and approve resources submitted by users.
              </p>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-[#f7f5e9]">
                  <tr>
                    <th className="text-left p-4">Resource</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Location</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {resources.map((resource) => (

                    <tr
                      key={resource.id}
                      className="border-t"
                    >

                      <td className="p-4">
                        <p className="font-bold">
                          {resource.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {resource.description}
                        </p>
                      </td>

                      <td className="p-4">
                        {resource.category}
                      </td>

                      <td className="p-4">
                        {resource.location}
                      </td>

                      <td className="p-4">
                        <StatusBadge
                          status={resource.status}
                        />
                      </td>

                      <td className="p-4">

                        <div className="flex gap-2">

                          {resource.status !== "approved" && (
                            <button
                              onClick={() =>
                                updateResourceStatus(
                                  resource.id,
                                  "approved"
                                )
                              }
                              className="p-2 rounded-lg bg-emerald-50 text-emerald-700"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}

                          {resource.status !== "rejected" && (
                            <button
                              onClick={() =>
                                updateResourceStatus(
                                  resource.id,
                                  "rejected"
                                )
                              }
                              className="p-2 rounded-lg bg-red-50 text-red-700"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() =>
                              deleteResource(resource.id)
                            }
                            className="p-2 rounded-lg bg-slate-100 text-slate-700"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>
        )}

        {/* Bookings */}
        {activeTab === "bookings" && (

          <section className="bg-white border border-[#e5dfca] rounded-2xl overflow-hidden">

            <div className="p-5 border-b">
              <h2 className="font-bold text-lg">
                Enquiry & Booking Management
              </h2>

              <p className="text-sm text-slate-500">
                Manage booking requests from farmers.
              </p>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-[#f7f5e9]">
                  <tr>
                    <th className="text-left p-4">Farmer</th>
                    <th className="text-left p-4">Phone</th>
                    <th className="text-left p-4">Resource ID</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>

                <tbody>

                  {bookings.map((booking) => (

                    <tr
                      key={booking.id}
                      className="border-t"
                    >

                      <td className="p-4 font-semibold">
                        {booking.farmer_name}
                      </td>

                      <td className="p-4">
                        {booking.farmer_phone}
                      </td>

                      <td className="p-4 text-xs">
                        {booking.resource_id}
                      </td>

                      <td className="p-4">
                        <StatusBadge
                          status={booking.status}
                        />
                      </td>

                      <td className="p-4">

                        <select
                          value={booking.status}
                          onChange={(event) =>
                            updateBookingStatus(
                              booking.id,
                              event.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2 text-xs"
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

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>
        )}

        {/* Users */}
        {activeTab === "users" && (

          <section className="bg-white border border-[#e5dfca] rounded-2xl overflow-hidden">

            <div className="p-5 border-b">
              <h2 className="font-bold text-lg">
                Registered Users
              </h2>

              <p className="text-sm text-slate-500">
                Users registered through AgriConnect.
              </p>
            </div>

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-[#f7f5e9]">
                  <tr>
                    <th className="text-left p-4">
                      Name
                    </th>

                    <th className="text-left p-4">
                      Phone
                    </th>

                    <th className="text-left p-4">
                      Role
                    </th>

                    <th className="text-left p-4">
                      Joined
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {users.map((user) => (

                    <tr
                      key={user.id}
                      className="border-t"
                    >

                      <td className="p-4 font-semibold">
                        {user.full_name || "Unnamed User"}
                      </td>

                      <td className="p-4">
                        {user.phone || "—"}
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4 text-xs text-slate-500">
                        {new Date(
                          user.created_at
                        ).toLocaleDateString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </section>
        )}

      </div>

    </main>
  );
}

function StatCard({ icon, title, value }) {
  return (
    <div className="bg-white border border-[#e5dfca] rounded-2xl p-5">

      <div className="w-10 h-10 rounded-xl bg-[#d5eee0] flex items-center justify-center text-emerald-700 mb-3">
        {icon}
      </div>

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="text-2xl font-bold mt-1">
        {value}
      </p>

    </div>
  );
}

function Tab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold ${
        active
          ? "bg-emerald-700 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending:
      "bg-amber-50 text-amber-700",
    approved:
      "bg-emerald-50 text-emerald-700",
    confirmed:
      "bg-blue-50 text-blue-700",
    rejected:
      "bg-red-50 text-red-700",
    completed:
      "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
        styles[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status || "unknown"}
    </span>
  );
}