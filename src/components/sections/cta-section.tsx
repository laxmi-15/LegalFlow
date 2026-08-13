"use client";

import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function CtaSection() {
  return (
    <section className="relative py-24 overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-sky-950/40 via-surface to-surface p-10 sm:p-16 text-center shadow-2xl">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[600px] -translate-x-1/2 bg-sky-500/20 blur-[100px]" />

          <div className="relative z-10 mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-sky-400">
              <Sparkles className="h-3.5 w-3.5" />
              14-Day Risk-Free Trial
            </div>
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Ready to Upgrade Your Firm’s <span className="text-gradient">Intake Pipeline?</span>
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
              Join 200+ top law firms using Route to capture, check conflicts, and book high-value clients automatically.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <MagneticButton
                as="a"
                href="#book-demo"
                className="group rounded-full bg-white px-8 py-4 text-sm font-semibold text-background transition-colors hover:bg-white/90"
              >
                Book Personal Guided Demo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </MagneticButton>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> SOC2 Type II Certified
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Clio & MyCase 1-Click Sync
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> No Long-Term Contracts
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
