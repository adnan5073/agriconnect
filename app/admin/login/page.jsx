"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Leaf,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        window.location.href = "/admin";
        return;
      }
    }

    setChecking(false);
  }

  async function handleLogin(event) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

    if (loginError) {
      setError(loginError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Login failed. Please try again.");
      setLoading(false);
      return;
    }

    // Check whether this account is actually an admin.
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

    if (profileError || profile?.role !== "admin") {
      await supabase.auth.signOut();

      setError(
        "This account does not have administrator access."
      );

      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-[#fffdf5] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-700 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f5e9] flex items-center justify-center px-4">

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-7">

          <div className="mx-auto w-16 h-16 rounded-2xl bg-[#d5eee0] flex items-center justify-center">
            <Leaf className="w-8 h-8 text-[#17634d]" />
          </div>

          <h1 className="mt-4 text-2xl font-bold text-[#294b3e]">
            AgriConnect
          </h1>

          <p className="text-sm text-slate-500 mt-1">
            Administrator Portal
          </p>

        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-[#e5dfca] shadow-xl overflow-hidden">

          {/* Header */}
          <div className="bg-[#d5eee0] px-6 py-5">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#17634d]" />
              </div>

              <div>
                <h2 className="font-bold text-[#294b3e]">
                  Admin Login
                </h2>

                <p className="text-xs text-[#49675c]">
                  Secure management access
                </p>
              </div>

            </div>

          </div>

          <form
            onSubmit={handleLogin}
            className="p-6 space-y-5"
          >

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <div>

              <label className="text-sm font-semibold text-[#294b3e]">
                Admin Email
              </label>

              <div className="relative mt-2">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="admin@example.com"
                  autoComplete="email"
                  className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500"
                />

              </div>

            </div>

            {/* Password */}
            <div>

              <label className="text-sm font-semibold text-[#294b3e]">
                Password
              </label>

              <div className="relative mt-2">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className="w-full border border-slate-200 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-emerald-500"
                />

              </div>

            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#17634d] hover:bg-[#0f513e] disabled:opacity-60 text-white rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 transition"
            >

              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Login to Admin Panel
                </>
              )}

            </button>

          </form>

          {/* Back */}
          <div className="border-t border-slate-100 px-6 py-4">

            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-emerald-700"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to AgriConnect
            </Link>

          </div>

        </div>

        <p className="text-center text-xs text-slate-400 mt-5">
          Authorized administrators only
        </p>

      </div>

    </main>
  );
}