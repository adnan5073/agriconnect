"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function ProviderPage() {
  const [form, setForm] = useState({
    title: "",
    category: "Equipment",
    description: "",
    price: "",
    price_unit: "day",
    provider_name: "",
    provider_phone: "",
    location_text: "",
    latitude: "9.9312",
    longitude: "76.2673"
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function updateField(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  }

  function getLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateField(
          "latitude",
          position.coords.latitude.toString()
        );

        updateField(
          "longitude",
          position.coords.longitude.toString()
        );

        alert("Location captured successfully!");
      },
      () => {
        alert("Unable to get your location.");
      }
    );
  }

  async function submitForm(event) {
    event.preventDefault();

    setLoading(true);
    setSuccess(false);

    const { error } = await supabase
      .from("resources")
      .insert([
        {
          title: form.title,
          category: form.category,
          description: form.description,
          price: Number(form.price),
          price_unit: form.price_unit,
          provider_name: form.provider_name,
          provider_phone: form.provider_phone,
          location_text: form.location_text,
          latitude: Number(form.latitude),
          longitude: Number(form.longitude),
          rating: 5,
          available: true
        }
      ]);

    setLoading(false);

    if (error) {
      console.error(error);
      alert("Unable to register resource.");
      return;
    }

    setSuccess(true);

    setForm({
      title: "",
      category: "Equipment",
      description: "",
      price: "",
      price_unit: "day",
      provider_name: "",
      provider_phone: "",
      location_text: "",
      latitude: "9.9312",
      longitude: "76.2673"
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="bg-emerald-800 text-white">

        <div className="max-w-4xl mx-auto px-4 py-4">

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-emerald-100 hover:text-white text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to AgriConnect
          </Link>

          <h1 className="text-3xl font-bold mt-6">
            Register Agricultural Resource
          </h1>

          <p className="text-emerald-100 mt-2">
            List your equipment, services or agricultural resources.
          </p>

        </div>

      </header>

      <main className="max-w-4xl mx-auto px-4 py-10">

        <div className="bg-white rounded-2xl shadow border p-6 md:p-8">

          {success && (
            <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 flex gap-3">

              <CheckCircle2 className="w-5 h-5" />

              <div>
                <div className="font-semibold">
                  Resource registered successfully!
                </div>

                <div className="text-sm">
                  Farmers can now discover your resource.
                </div>
              </div>

            </div>
          )}

          <form
            onSubmit={submitForm}
            className="space-y-6"
          >

            <div className="grid md:grid-cols-2 gap-5">

              <Field
                label="Resource Name"
                required
                value={form.title}
                onChange={(value) =>
                  updateField("title", value)
                }
                placeholder="Example: John Tractor Service"
              />

              <div>
                <label className="font-semibold text-sm">
                  Category
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    updateField(
                      "category",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3 mt-2"
                >
                  <option>Equipment</option>
                  <option>Workers</option>
                  <option>Seeds</option>
                  <option>Irrigation</option>
                  <option>Fertilizer</option>
                  <option>Services</option>
                </select>
              </div>

            </div>

            <div>
              <label className="font-semibold text-sm">
                Description
              </label>

              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Describe your resource..."
                className="w-full border rounded-xl p-3 mt-2"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <Field
                label="Price"
                required
                type="number"
                value={form.price}
                onChange={(value) =>
                  updateField("price", value)
                }
                placeholder="1000"
              />

              <div>
                <label className="font-semibold text-sm">
                  Price Unit
                </label>

                <select
                  value={form.price_unit}
                  onChange={(e) =>
                    updateField(
                      "price_unit",
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3 mt-2"
                >
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="item">Item</option>
                  <option value="service">Service</option>
                  <option value="kg">Kg</option>
                  <option value="acre">Acre</option>
                </select>
              </div>

            </div>

            <div className="border-t pt-6">

              <h2 className="font-bold text-lg">
                Provider Information
              </h2>

              <div className="grid md:grid-cols-2 gap-5 mt-4">

                <Field
                  label="Provider Name"
                  required
                  value={form.provider_name}
                  onChange={(value) =>
                    updateField(
                      "provider_name",
                      value
                    )
                  }
                  placeholder="Your name / business"
                />

                <Field
                  label="Phone Number"
                  required
                  type="tel"
                  value={form.provider_phone}
                  onChange={(value) =>
                    updateField(
                      "provider_phone",
                      value
                    )
                  }
                  placeholder="+91 98765 43210"
                />

              </div>

            </div>

            <div className="border-t pt-6">

              <h2 className="font-bold text-lg">
                Location
              </h2>

              <Field
                label="Location"
                value={form.location_text}
                onChange={(value) =>
                  updateField(
                    "location_text",
                    value
                  )
                }
                placeholder="Example: Idukki, Kerala"
              />

              <button
                type="button"
                onClick={getLocation}
                className="mt-4 border border-emerald-600 text-emerald-700 px-4 py-2 rounded-lg font-semibold hover:bg-emerald-50"
              >
                📍 Use My Current Location
              </button>

              <div className="grid md:grid-cols-2 gap-5 mt-4">

                <Field
                  label="Latitude"
                  value={form.latitude}
                  onChange={(value) =>
                    updateField("latitude", value)
                  }
                />

                <Field
                  label="Longitude"
                  value={form.longitude}
                  onChange={(value) =>
                    updateField("longitude", value)
                  }
                />

              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold"
            >
              {loading
                ? "Registering..."
                : "Register Resource"}
            </button>

          </form>

        </div>

      </main>

    </div>
  );
}

function Field({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder
}) {
  return (
    <div>
      <label className="font-semibold text-sm">
        {label}
        {required && (
          <span className="text-red-500"> *</span>
        )}
      </label>

      <input
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border rounded-xl p-3 mt-2 outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}