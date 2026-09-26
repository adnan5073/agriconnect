"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ArrowLeft,
  Loader2,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  Leaf,
} from "lucide-react";
import Link from "next/link";

const categories = [
  "Equipment",
  "Workers",
  "Seeds",
  "Irrigation",
  "Fertilizer",
];

export default function ProviderPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [resources, setResources] = useState([]);

  const [form, setForm] = useState({
    name: "",
    category: "Equipment",
    description: "",
    price: "",
    location: "",
    phone: "",
    image_url: "",
  });

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/";
      return;
    }

    setUser(user);
    await loadResources(user.id);
    setLoading(false);
  }

  async function loadResources(userId) {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("RESOURCE LOAD ERROR:", error);
      return;
    }

    setResources(data || []);
  }

  function handleChange(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) {
      alert("Please login first.");
      return;
    }

    if (!form.name.trim()) {
      alert("Please enter the resource name.");
      return;
    }

    if (!form.description.trim()) {
      alert("Please enter a description.");
      return;
    }

    if (!form.location.trim()) {
      alert("Please enter the location.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("resources").insert([
      {
        owner_id: user.id,
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        price: form.price
          ? Number(form.price)
          : null,
        location: form.location.trim(),
        phone: form.phone.trim(),
        image_url: form.image_url.trim(),
        available: true,
        status: "pending",
      },
    ]);

    if (error) {
      console.error("RESOURCE INSERT ERROR:", error);
      alert(`Failed to submit resource:\n\n${error.message}`);
      setSaving(false);
      return;
    }

    alert(
      "Resource submitted successfully!\n\nIt will appear on AgriConnect after admin approval."
    );

    setForm({
      name: "",
      category: "Equipment",
      description: "",
      price: "",
      location: "",
      phone: "",
      image_url: "",
    });

    await loadResources(user.id);

    setSaving(false);
  }

  async function deleteResource(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", id);

    if (error) {
      alert(`Delete failed:\n\n${error.message}`);
      return;
    }

    await loadResources(user.id);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffdf5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffdf5] text-[#294b3e]">

      {/* Header */}
      <header className="border-b border-[#e5dfca] bg-[#fffdf5]">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">

          <Link
            href="/"
            className="flex items-center gap-2 font-bold"
          >
            <div className="w-9 h-9 rounded-xl bg-[#d5eee0] flex items-center justify-center">
              <Leaf className="w-5 h-5 text-[#17634d]" />
            </div>

            <span>AgriConnect</span>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-[#17634d]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-8">

        {/* Title */}
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-emerald-700 font-bold">
            Provider Center
          </p>

          <h1 className="text-3xl font-serif font-bold mt-2">
            List Your Agricultural Resource
          </h1>

          <p className="text-sm text-slate-500 mt-2">
            Rent out your equipment, offer agricultural services,
            or provide farming resources to other users.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_0.9fr] gap-8">

          {/* Form */}
          <section className="bg-white rounded-2xl border border-[#e5dfca] shadow-sm p-6">

            <h2 className="text-xl font-bold mb-5">
              Resource Details
            </h2>

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              <div>
                <label className="text-sm font-semibold">
                  Resource Name
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Example: Mahindra Tractor"
                  className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Category
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded-xl px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category}
                    >
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the resource, condition, usage, etc."
                  className="mt-1 w-full border rounded-xl px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">

                <div>
                  <label className="text-sm font-semibold">
                    Rental Price
                  </label>

                  <input
                    name="price"
                    type="number"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="₹ per day"
                    className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Contact number"
                    className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

              </div>

              <div>
                <label className="text-sm font-semibold">
                  Location
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Example: Idukki, Kerala"
                  className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold">
                  Image URL
                </label>

                <input
                  name="image_url"
                  value={form.image_url}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <p className="text-xs text-slate-400 mt-1">
                  We can add Supabase image upload later.
                </p>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#17634d] hover:bg-[#0f513e] disabled:opacity-60 text-white rounded-xl py-3 font-bold flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Submit Resource
                  </>
                )}
              </button>

            </form>
          </section>

          {/* My resources */}
          <section>

            <h2 className="text-xl font-bold mb-4">
              My Resources
            </h2>

            <div className="space-y-4">

              {resources.length === 0 && (
                <div className="bg-white border border-[#e5dfca] rounded-2xl p-8 text-center">
                  <p className="font-semibold">
                    No resources listed yet.
                  </p>

                  <p className="text-sm text-slate-500 mt-1">
                    Submit your first resource using the form.
                  </p>
                </div>
              )}

              {resources.map((resource) => (

                <div
                  key={resource.id}
                  className="bg-white border border-[#e5dfca] rounded-2xl p-5"
                >

                  <div className="flex justify-between gap-4">

                    <div>
                      <p className="text-xs uppercase text-emerald-700 font-bold">
                        {resource.category}
                      </p>

                      <h3 className="font-bold text-lg mt-1">
                        {resource.name}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {resource.location}
                      </p>
                    </div>

                    <button
                      onClick={() =>
                        deleteResource(resource.id)
                      }
                      className="text-red-500 hover:bg-red-50 rounded-lg p-2 h-fit"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                  </div>

                  <div className="mt-4">

                    {resource.status === "approved" && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approved
                      </span>
                    )}

                    {resource.status === "pending" && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Approval
                      </span>
                    )}

                    {resource.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-50 text-red-700 px-3 py-1.5 rounded-full">
                        <XCircle className="w-3.5 h-3.5" />
                        Rejected
                      </span>
                    )}

                  </div>

                </div>

              ))}

            </div>

          </section>

        </div>
      </div>
    </main>
  );
}