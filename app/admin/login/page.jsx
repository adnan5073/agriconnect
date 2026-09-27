"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Leaf,
  Lock,
  Mail,
  Loader2,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);

  useEffect(() => {
    checkExistingSession();
  }, []);

  async function checkExistingSession() {
    try {
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
    } catch (err) {
      console.error("Session check error:", err);
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

    try {
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
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  /*
   * Interactive background
   */
  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    let animationFrame;
    let width = 0;
    let height = 0;

    const mouse = {
      x: -500,
      y: -500,
      targetX: -500,
      targetY: -500,
    };

    const dots = [];

    const DOT_COUNT = 120;

    function resize() {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * ratio;
      canvas.height = height * ratio;

      canvas.style.width = width + "px";
      canvas.style.height = height + "px";

      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    function createDots() {
      dots.length = 0;

      for (let i = 0; i < DOT_COUNT; i++) {
        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseX: Math.random() * width,
          baseY: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.45 + 0.15,
          speed: Math.random() * 0.001 + 0.0005,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }

    function mouseMove(event) {
      mouse.targetX = event.clientX;
      mouse.targetY = event.clientY;
    }

    function mouseLeave() {
      mouse.targetX = -500;
      mouse.targetY = -500;
    }

    function draw(time) {
      ctx.clearRect(0, 0, width, height);

      /*
       * Smooth cursor
       */
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      /*
       * Cursor glow
       */
      if (
        mouse.x > 0 &&
        mouse.y > 0 &&
        mouse.x < width &&
        mouse.y < height
      ) {
        const glow = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          220
        );

        glow.addColorStop(
          0,
          "rgba(35, 150, 105, 0.14)"
        );

        glow.addColorStop(
          0.5,
          "rgba(35, 150, 105, 0.05)"
        );

        glow.addColorStop(
          1,
          "rgba(35, 150, 105, 0)"
        );

        ctx.fillStyle = glow;

        ctx.beginPath();
        ctx.arc(
          mouse.x,
          mouse.y,
          220,
          0,
          Math.PI * 2
        );

        ctx.fill();
      }

      /*
       * Dots
       */
      dots.forEach((dot) => {
        const distanceX = mouse.x - dot.x;
        const distanceY = mouse.y - dot.y;

        const distance = Math.sqrt(
          distanceX * distanceX +
            distanceY * distanceY
        );

        let influenceX = 0;
        let influenceY = 0;

        if (distance < 180 && distance > 0) {
          const force = (180 - distance) / 180;

          influenceX =
            -(distanceX / distance) * force * 25;

          influenceY =
            -(distanceY / distance) * force * 25;
        }

        const floating =
          Math.sin(
            time * dot.speed + dot.phase
          ) * 6;

        dot.x +=
          (dot.baseX + influenceX - dot.x) * 0.015;

        dot.y +=
          (dot.baseY + floating + influenceY - dot.y) *
          0.015;

        /*
         * Connection line
         */
        if (distance < 140) {
          ctx.beginPath();

          ctx.moveTo(dot.x, dot.y);
          ctx.lineTo(mouse.x, mouse.y);

          const alpha =
            0.1 * (1 - distance / 140);

          ctx.strokeStyle =
            "rgba(23, 99, 77, " + alpha + ")";

          ctx.lineWidth = 0.6;
          ctx.stroke();
        }

        /*
         * Dot
         */
        ctx.beginPath();

        let radius = dot.size;

        if (distance < 180) {
          radius = dot.size * 2;
        }

        ctx.arc(
          dot.x,
          dot.y,
          radius,
          0,
          Math.PI * 2
        );

        ctx.fillStyle =
          "rgba(23, 99, 77, " +
          dot.opacity +
          ")";

        ctx.fill();
      });

      animationFrame = requestAnimationFrame(draw);
    }

    resize();
    createDots();

    window.addEventListener("resize", () => {
      resize();
      createDots();
    });

    window.addEventListener(
      "mousemove",
      mouseMove
    );

    window.addEventListener(
      "mouseleave",
      mouseLeave
    );

    animationFrame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener(
        "mousemove",
        mouseMove
      );

      window.removeEventListener(
        "mouseleave",
        mouseLeave
      );
    };
  }, []);

  if (checking) {
    return (
      <main className="min-h-screen bg-[#f5f7ef] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#d5eee0] flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#17634d] animate-spin" />
          </div>

          <p className="text-sm text-[#49675c]">
            Checking secure session...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f7ef]">

      {/* Interactive canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      {/* Background grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#17634d 1px, transparent 1px), linear-gradient(90deg, #17634d 1px, transparent 1px)",
          backgroundSize: "45px 45px",
        }}
      />

      {/* Background glow */}
      <div className="fixed -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />

      <div className="fixed -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-green-200/20 blur-3xl pointer-events-none" />

      {/* Main */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-10">

        <div className="w-full max-w-md">

          {/* Logo */}
          <div className="text-center mb-7">

            <div className="relative mx-auto w-20 h-20">

              <div className="absolute inset-0 rounded-[26px] bg-emerald-400/20 blur-xl animate-pulse" />

              <div className="relative w-20 h-20 rounded-[26px] bg-white/80 backdrop-blur-xl border border-white shadow-xl flex items-center justify-center">

                <Leaf className="w-9 h-9 text-[#17634d]" />

              </div>

            </div>

            <div className="flex items-center justify-center gap-2 mt-5">

              <h1 className="text-3xl font-black tracking-tight text-[#294b3e]">
                AgriConnect
              </h1>

              <Sparkles className="w-4 h-4 text-emerald-600" />

            </div>

            <p className="text-sm text-slate-500 mt-1">
              Administrator Portal
            </p>

          </div>

          {/* Login card */}
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-[28px] border border-white shadow-[0_30px_80px_rgba(32,70,55,0.15)] overflow-hidden">

            {/* Top line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-emerald-500 animate-pulse" />

            {/* Header */}
            <div className="relative px-7 py-6 bg-gradient-to-br from-[#dff3e8] via-[#d5eee0] to-[#c8e9d8] overflow-hidden">

              <div className="absolute -right-10 -top-16 w-40 h-40 rounded-full bg-white/20" />

              <div className="relative flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-white/90 flex items-center justify-center shadow-sm">

                  <ShieldCheck className="w-6 h-6 text-[#17634d]" />

                </div>

                <div>

                  <h2 className="font-black text-lg text-[#294b3e]">
                    Admin Login
                  </h2>

                  <p className="text-xs text-[#49675c] mt-0.5">
                    Secure management access
                  </p>

                </div>

              </div>

            </div>

            {/* Form */}
            <form
              onSubmit={handleLogin}
              className="relative p-7 space-y-5"
            >

              {/* Error */}
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Email */}
              <div>

                <label className="text-sm font-bold text-[#294b3e]">
                  Admin Email
                </label>

                <div className="relative mt-2">

                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="admin@example.com"
                    autoComplete="email"
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                  />

                </div>

              </div>

              {/* Password */}
              <div>

                <label className="text-sm font-bold text-[#294b3e]">
                  Password
                </label>

                <div className="relative mt-2">

                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter admin password"
                    autoComplete="current-password"
                    className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none transition-all focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10"
                  />

                </div>

              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={loading}
                className="relative overflow-hidden w-full bg-[#17634d] hover:bg-[#0f513e] active:scale-[0.98] disabled:opacity-60 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
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
            <div className="border-t border-slate-100 px-7 py-5">

              <Link
                href="/"
                className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-emerald-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to AgriConnect
              </Link>

            </div>

          </div>

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-6">

            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />

            <p className="text-xs text-slate-400">
              Authorized administrators only
            </p>

          </div>

        </div>

      </div>

    </main>
  );
}