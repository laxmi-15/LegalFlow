"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  TrendingUp,
  X,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

interface Inquiry {
  id: string;
  client: string;
  practiceArea: string;
  summary: string;
  time: string;
  status: "Booked" | "Conflict Cleared" | "High Urgency" | "Under Review";
  assignedAttorney: string;
  estValue: string;
  matchScore: number;
  parties: string[];
}

const INITIAL_INQUIRIES: Inquiry[] = [
  {
    id: "INT-8901",
    client: "Marcus Vance",
    practiceArea: "Personal Injury",
    summary: "Multi-vehicle commercial truck collision on I-10, severe spinal injury and vehicle damage.",
    time: "2 mins ago",
    status: "Booked",
    assignedAttorney: "Thomas Sterling, Esq.",
    estValue: "$450,000",
    matchScore: 98,
    parties: ["Marcus Vance", "Apex Cargo Logistics LLC"],
  },
  {
    id: "INT-8902",
    client: "NeuralStack Inc",
    practiceArea: "Intellectual Property",
    summary: "Proprietary AI code leak & trade secret infringement by former executive.",
    time: "14 mins ago",
    status: "High Urgency",
    assignedAttorney: "Sophia Martinez, JD",
    estValue: "$1,200,000",
    matchScore: 96,
    parties: ["NeuralStack Inc", "Kratos Systems Inc"],
  },
  {
    id: "INT-8903",
    client: "PayFlow Dynamics",
    practiceArea: "Corporate & M&A",
    summary: "$45M Series B term sheet audit and shareholder agreement restructuring.",
    time: "42 mins ago",
    status: "Conflict Cleared",
    assignedAttorney: "Evelyn Wright, Esq.",
    estValue: "$150,000 Retainer",
    matchScore: 99,
    parties: ["PayFlow Dynamics", "Summit Ventures"],
  },
  {
    id: "INT-8904",
    client: "Dr. Elena Rostova",
    practiceArea: "Employment Law",
    summary: "Wrongful termination claim following hospital merger & non-compete dispute.",
    time: "1 hour ago",
    status: "Under Review",
    assignedAttorney: "Elena Vance, Esq.",
    estValue: "$300,000",
    matchScore: 92,
    parties: ["Dr. Elena Rostova", "Vanguard Health Network"],
  },
];

export function DashboardPreview() {
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");
  const [inquiries, setInquiries] = useState<Inquiry[]>(INITIAL_INQUIRIES);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);

  const fetchLiveIntakes = async () => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiBase}/api/intake`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          const mapped: Inquiry[] = json.data.map((item: any) => ({
            id: item.id || `INT-${Math.floor(1000 + Math.random() * 9000)}`,
            client: item.clientName || "Client Inquiry",
            practiceArea: item.practiceArea || "General Litigation",
            summary: item.summary || item.rawInquiry,
            time: "Just now",
            status: item.conflictStatus === "CLEARED" ? "Conflict Cleared" : "High Urgency",
            assignedAttorney: item.assignedAttorney || "Senior Managing Partner",
            estValue: item.estValue || "$250,000+",
            matchScore: item.urgencyScore || 95,
            parties: [item.clientName || "Client"],
          }));
          setInquiries((prev) => {
            const ids = new Set(prev.map((x) => x.id));
            const newOnes = mapped.filter((x) => !ids.has(x.id));
            return [...newOnes, ...prev];
          });
        }
      }
    } catch (e) {
      // Ignore if backend offline
    }
  };

  useEffect(() => {
    fetchLiveIntakes();
    const interval = setInterval(fetchLiveIntakes, 8000);
    return () => clearInterval(interval);
  }, []);

  const filteredInquiries = inquiries.filter((item) => {
    const matchesFilter = filter === "All" || item.status === filter || item.practiceArea === filter;
    const matchesSearch =
      item.client.toLowerCase().includes(search.toLowerCase()) ||
      item.summary.toLowerCase().includes(search.toLowerCase()) ||
      item.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <section id="dashboard" className="relative py-28 overflow-hidden bg-background/60">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-sky-400">
            <LayoutDashboard className="h-3.5 w-3.5" />
            Attorney Operations Hub
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Real-Time Law Firm <span className="text-gradient">Intake Control Center</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Monitor incoming leads live from PostgreSQL & Express API, view Gemini AI reasoning logs, review conflict clearances, and oversee attorney calendar assignments.
          </p>
        </div>

        {/* Mock Dashboard Window Container */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-surface/90 shadow-2xl backdrop-blur-xl">
          {/* Header Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-white/[0.08] px-6 py-4 bg-black/40 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="h-4 w-[1px] bg-white/10" />
              <span className="text-xs font-mono font-medium text-white">Route Command Desk v4.2 (Live API Sync)</span>
            </div>

            {/* Live Metrics Bar */}
            <div className="flex items-center gap-6 text-xs">
              <button
                onClick={fetchLiveIntakes}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> Refresh
              </button>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-muted">Conversion:</span>
                <strong className="text-white">94.8%</strong>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-sky-400" />
                <span className="text-muted">Avg Route Time:</span>
                <strong className="text-white">0.9s</strong>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-muted">Prisma Sync:</span>
                <strong className="text-emerald-400">Active</strong>
              </div>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-white/[0.06] bg-surface">
            <div className="flex flex-wrap items-center gap-2">
              {["All", "Booked", "High Urgency", "Conflict Cleared", "Personal Injury", "Intellectual Property"].map(
                (tag) => (
                  <button
                    key={tag}
                    onClick={() => setFilter(tag)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      filter === tag
                        ? "bg-accent text-white"
                        : "bg-white/[0.04] text-muted hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {tag}
                  </button>
                )
              )}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-dark" />
              <input
                type="text"
                placeholder="Search lead or party..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black/40 pl-9 pr-3 py-1.5 text-xs text-white placeholder-muted-dark focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {/* Inquiries List */}
          <div className="divide-y divide-white/[0.06]">
            {filteredInquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                onClick={() => setSelectedInquiry(inquiry)}
                className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:bg-white/[0.02] cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 font-mono text-xs font-bold border border-sky-500/20">
                    {inquiry.matchScore}%
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                        {inquiry.client}
                      </h4>
                      <span className="rounded bg-white/[0.06] px-2 py-0.5 text-[10px] font-mono text-muted">
                        {inquiry.id}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          inquiry.status === "Booked"
                            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                            : inquiry.status === "High Urgency"
                            ? "bg-rose-500/15 text-rose-300 border border-rose-500/30"
                            : "bg-sky-500/15 text-sky-300 border border-sky-500/30"
                        }`}
                      >
                        {inquiry.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted line-clamp-1">{inquiry.summary}</p>
                    <div className="mt-2 flex items-center gap-4 text-[11px] text-muted-dark">
                      <span>Area: <strong className="text-white">{inquiry.practiceArea}</strong></span>
                      <span>Assigned: <strong className="text-sky-300">{inquiry.assignedAttorney}</strong></span>
                      <span>Est. Value: <strong className="text-emerald-400">{inquiry.estValue}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-[11px] font-mono text-muted-dark">{inquiry.time}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.04] text-muted group-hover:bg-accent group-hover:text-white transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Modal Drawer */}
        <AnimatePresence>
          {selectedInquiry && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
              onClick={() => setSelectedInquiry(null)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-surface p-6 sm:p-8 shadow-2xl"
              >
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="absolute right-5 top-5 rounded-full bg-white/10 p-1.5 text-muted hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold text-sky-400 uppercase">
                    {selectedInquiry.id}
                  </span>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                    PostgreSQL Record Synced
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">{selectedInquiry.client}</h3>
                <p className="mt-2 text-xs leading-relaxed text-muted">{selectedInquiry.summary}</p>

                <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-white/10 bg-black/40 p-4 text-xs">
                  <div>
                    <span className="text-muted-dark">Practice Domain</span>
                    <p className="font-semibold text-white mt-0.5">{selectedInquiry.practiceArea}</p>
                  </div>
                  <div>
                    <span className="text-muted-dark">Assigned Counsel</span>
                    <p className="font-semibold text-sky-300 mt-0.5">{selectedInquiry.assignedAttorney}</p>
                  </div>
                  <div>
                    <span className="text-muted-dark">Gemini Match Score</span>
                    <p className="font-semibold text-emerald-400 mt-0.5">{selectedInquiry.matchScore}% Confidence</p>
                  </div>
                  <div>
                    <span className="text-muted-dark">Adverse Parties Check</span>
                    <p className="font-semibold text-emerald-400 mt-0.5">0 Adverse Conflicts Found</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedInquiry(null)}
                    className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
                  >
                    Close Inspection
                  </button>
                  <button
                    onClick={() => {
                      alert(`Case ${selectedInquiry.id} confirmed and transferred to ${selectedInquiry.assignedAttorney}`);
                      setSelectedInquiry(null);
                    }}
                    className="rounded-lg bg-accent-gradient px-4 py-2 text-xs font-semibold text-white hover:opacity-90"
                  >
                    Confirm & Sync Clio Record
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
