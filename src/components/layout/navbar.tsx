"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, LogOut, User } from "lucide-react";
import { useScrolled } from "@/hooks/use-scrolled";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const scrolled = useScrolled(24);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      // Helper to read token cookie
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) return;

      try {
        const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const response = await fetch(`${apiBase}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
      }
    };
    fetchSession();
  }, []);

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    window.location.href = "/login";
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 z-50 w-full"
    >
      <div
        className={cn(
          "transition-all duration-500",
          scrolled
            ? "border-b border-border bg-background/85 backdrop-blur-xl shadow-sm"
            : "border-b border-transparent bg-transparent"
        )}
      >
        <nav className="mx-auto flex max-w-8xl items-center justify-between px-6 py-4 lg:px-10">
          {/* Logo */}
          <a href="/" className="group flex items-center gap-2.5">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-md bg-accent">
              <span className="h-2.5 w-2.5 rounded-sm bg-background transition-transform duration-500 group-hover:rotate-45" />
            </span>
            <span className="text-[16px] font-bold tracking-tight text-foreground">
              Legal<span className="text-accent">Flow</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 rounded-full border border-border bg-surface/50 px-1.5 py-1.5 lg:flex">
            {!user ? (
              <>
                <a
                  href="/"
                  className="relative rounded-full px-4 py-1.5 text-[13.5px] font-medium text-muted transition-colors duration-300 hover:text-foreground"
                >
                  Home
                </a>
                <a
                  href="/intake"
                  className="relative rounded-full px-4 py-1.5 text-[13.5px] font-medium text-muted transition-colors duration-300 hover:text-foreground"
                >
                  Client Intake
                </a>
              </>
            ) : (
              <>
                <a
                  href="/admin"
                  className="relative rounded-full px-4 py-1.5 text-[13.5px] font-medium text-muted transition-colors duration-300 hover:text-foreground"
                >
                  Command Center
                </a>
                <a
                  href="/admin"
                  className="relative rounded-full px-4 py-1.5 text-[13.5px] font-medium text-muted transition-colors duration-300 hover:text-foreground"
                >
                  Intakes
                </a>
                {user.role === "ADMIN" && (
                  <span
                    title="Seeded dynamically based on admin role"
                    className="relative rounded-full px-4 py-1.5 text-[13.5px] font-medium text-[#3F5144]/80 bg-[#3F5144]/5 border border-[#3F5144]/15"
                  >
                    Teams / Routing
                  </span>
                )}
              </>
            )}
          </div>

          {/* CTA & User Profile Section */}
          <div className="hidden items-center gap-4 lg:flex">
            {!user ? (
              <>
                <a
                  href="/login"
                  className="text-[13.5px] font-medium text-muted transition-colors duration-300 hover:text-foreground"
                >
                  Command Center
                </a>
                <MagneticButton
                  as="a"
                  href="/intake"
                  className="group rounded-full bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors duration-300 hover:bg-accent/95 shadow-sm"
                >
                  Start Intake
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </MagneticButton>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* Profile Display */}
                <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-foreground font-semibold">
                  <User className="h-3.5 w-3.5 text-accent" />
                  <span>
                    {user.name} ({user.role})
                  </span>
                </div>
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="group flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-xs font-semibold text-foreground hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-all duration-300 shadow-sm"
                >
                  <LogOut className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                  Sign out
                </button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground lg:hidden hover:bg-surface transition-colors"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-b border-border bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 py-6">
              {!user ? (
                <>
                  <a
                    href="/"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-[15px] font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
                  >
                    Home
                  </a>
                  <a
                    href="/intake"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-[15px] font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
                  >
                    Client Intake
                  </a>
                  <a
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-[15px] font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
                  >
                    Command Center Login
                  </a>
                  <a
                    href="/intake"
                    onClick={() => setOpen(false)}
                    className="mt-3 rounded-full bg-accent py-3 text-center text-[14px] font-semibold text-white shadow-sm"
                  >
                    Start Intake
                  </a>
                </>
              ) : (
                <>
                  <div className="px-3 py-2 text-xs font-bold text-accent border-b border-border/50 mb-1">
                    Logged in as: {user.name} ({user.role})
                  </div>
                  <a
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-[15px] font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
                  >
                    Command Center
                  </a>
                  <a
                    href="/admin"
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-[15px] font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
                  >
                    Intakes
                  </a>
                  {user.role === "ADMIN" && (
                    <span className="rounded-lg px-3 py-3 text-[15px] font-medium text-[#3F5144] bg-[#3F5144]/5 border border-[#3F5144]/10 select-none">
                      Teams & Routing (Admin)
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="mt-3 w-full rounded-full bg-red-600 hover:bg-red-700 py-3 text-center text-[14px] font-semibold text-white shadow-sm"
                  >
                    Sign out
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
