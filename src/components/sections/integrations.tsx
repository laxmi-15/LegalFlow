"use client";

import { useState } from "react";
import { Cpu, CheckCircle2, ArrowUpRight } from "lucide-react";

const INTEGRATIONS = [
  { name: "Clio", category: "Practice Management", badge: "2-Way Calendar Sync", desc: "Sync leads, clients, and conflict notes directly to Clio Manage." },
  { name: "MyCase", category: "Practice Management", badge: "Direct API", desc: "Auto-create cases, consultation events, and contact cards." },
  { name: "PracticePanther", category: "Practice Management", badge: "Real-time Webhook", desc: "Push qualified leads into workflow pipelines instantly." },
  { name: "LawPay", category: "Payments & Retainers", badge: "Retainer Lock", desc: "Collect consultation fees during intake booking flow." },
  { name: "Salesforce", category: "CRM & Enterprise", badge: "Native Connector", desc: "Map custom legal fields, opportunity stages, and lead owners." },
  { name: "HubSpot", category: "CRM & Enterprise", badge: "Lead Pipeline", desc: "Automate email sequences for non-qualified legal inquiries." },
  { name: "Twilio Voice & SMS", category: "Communications", badge: "Omni-Channel", desc: "Powers Route's 24/7 AI phone answering and SMS dispatch." },
  { name: "Google Workspace", category: "Calendar & Mail", badge: "OAuth 2.0", desc: "Real-time calendar slot availability checking and Meet links." },
  { name: "Microsoft Outlook 365", category: "Calendar & Mail", badge: "Enterprise Sync", desc: "Full Exchange calendar integration for partner schedules." },
];

export function IntegrationsSection() {
  const [activeCat, setActiveCat] = useState("All");

  const categories = ["All", "Practice Management", "CRM & Enterprise", "Communications", "Payments & Retainers"];

  const filtered = activeCat === "All" ? INTEGRATIONS : INTEGRATIONS.filter((i) => i.category === activeCat);

  return (
    <section id="integrations" className="relative py-28 overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-sky-400">
            <Cpu className="h-3.5 w-3.5" />
            Seamless Legal Ecosystem
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Integrates with Your <span className="text-gradient">Existing Legal Tech Stack</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            No disruption to your team’s workflow. Route syncs bi-directionally with your practice management software, calendar, and billing tools.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                activeCat === cat
                  ? "bg-accent text-white shadow-lg shadow-accent/20"
                  : "border border-white/10 bg-white/[0.02] text-muted hover:border-white/20 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, idx) => (
            <div
              key={idx}
              className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-surface/70 p-6 transition-all duration-300 hover:border-sky-500/30 hover:bg-surface hover:shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-sm font-bold text-white group-hover:bg-accent group-hover:text-white transition-colors">
                    {item.name.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="rounded-full bg-sky-400/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-sky-400">
                    {item.badge}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-sky-300 transition-colors">
                  {item.name}
                </h3>
                <p className="mt-2 text-xs text-muted leading-relaxed">{item.desc}</p>
              </div>

              <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-sky-400 opacity-80 group-hover:opacity-100 transition-opacity">
                <span>View Integration API Docs</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
