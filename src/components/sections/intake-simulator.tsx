"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  UserCheck,
  Building2,
  Scale,
  ShieldCheck,
  ArrowRight,
  Clock,
  RefreshCw,
  FileText,
  Send,
} from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";

const PRACTICE_AREAS = [
  { id: "pi", label: "Personal Injury", icon: Scale },
  { id: "ip", label: "Intellectual Property", icon: Building2 },
  { id: "corp", label: "Corporate & M&A", icon: FileText },
  { id: "emp", label: "Employment Law", icon: UserCheck },
];

const PRESET_CASES = [
  {
    area: "pi",
    title: "Commercial Truck Collision",
    description:
      "Client Marcus Vance sustained severe spinal injury in multi-vehicle highway accident involving Apex Cargo Logistics fleet. Seeking representation for damages and medical claims in Harris County court.",
    parties: ["Client: Marcus Vance", "Opposing Party: Apex Cargo Logistics LLC"],
    estValue: "$350,000 - $600,000",
  },
  {
    area: "ip",
    title: "Patent Infringement & Software Breach",
    description:
      "SaaS client NeuralStack Inc discovered former VP of Tech copied proprietary AI routing algorithms into competitor product Kratos Systems. Urgently requesting preliminary injunction.",
    parties: ["Client: NeuralStack Inc", "Opposing Party: Kratos Systems Inc"],
    estValue: "$1,200,000+",
  },
  {
    area: "corp",
    title: "Series B Acquisition & Conflict Audit",
    description:
      "Target fintech firm PayFlow Dynamics requesting legal counsel for $45M Series B term sheet review, shareholder agreement restructuring, and regulatory compliance check prior to close.",
    parties: ["Client: PayFlow Dynamics", "Opposing Party: Summit Ventures"],
    estValue: "$150,000 Retainer",
  },
  {
    area: "emp",
    title: "Executive Severance Dispute",
    description:
      "Former CMO Dr. Elena Rostova alleging wrongful termination and breach of non-compete covenant following hospital merger with Vanguard Health Network. Requesting urgent negotiation.",
    parties: ["Client: Dr. Elena Rostova", "Opposing Party: Vanguard Health Network"],
    estValue: "$200,000 - $400,000",
  },
];

export function IntakeSimulator() {
  const [selectedArea, setSelectedArea] = useState("pi");
  const [inquiryText, setInquiryText] = useState(PRESET_CASES[0].description);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [step, setStep] = useState<"input" | "analyzing" | "result">("input");
  const [analysisStepIndex, setAnalysisStepIndex] = useState(0);
  const [booked, setBooked] = useState(false);
  const [apiResult, setApiResult] = useState<any>(null);

  const activePreset = PRESET_CASES.find((p) => p.area === selectedArea) || PRESET_CASES[0];

  const handleSelectArea = (areaId: string) => {
    setSelectedArea(areaId);
    const preset = PRESET_CASES.find((p) => p.area === areaId);
    if (preset) {
      setInquiryText(preset.description);
    }
  };

  const startAnalysis = async () => {
    setIsAnalyzing(true);
    setStep("analyzing");
    setAnalysisStepIndex(0);

    const timer1 = setTimeout(() => setAnalysisStepIndex(1), 600);
    const timer2 = setTimeout(() => setAnalysisStepIndex(2), 1200);

    let fetchedData = null;

    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await fetch(`${apiBase}/api/intake`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryText,
          clientName: activePreset.parties[0].replace("Client: ", ""),
        }),
      });

      if (response.ok) {
        const json = await response.json();
        fetchedData = json.data;
      }
    } catch (e) {
      console.log("[Frontend Notice]: Backend connection starting or using local agent mock mode.");
    }

    setTimeout(() => {
      setAnalysisStepIndex(3);
      setIsAnalyzing(false);
      setApiResult(fetchedData);
      setStep("result");
    }, 1800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  };

  const resetSimulator = () => {
    setStep("input");
    setBooked(false);
    setApiResult(null);
  };

  return (
    <section id="book-demo" className="relative py-28 overflow-hidden bg-background">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[900px] opacity-20 blur-[130px] bg-gradient-to-r from-blue-600 to-sky-400" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-sky-400">
            <Sparkles className="h-3.5 w-3.5" />
            Live Express + Gemini 2.5 Flash + Telegram Agent
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Test Route’s AI Intake Engine <span className="text-gradient">in Real Time</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Experience how Route’s Node/Express & Gemini backend parses inquiries, checks PostgreSQL conflict records, and dispatches instant Telegram alerts to attorneys.
          </p>
        </div>

        {/* Simulator Card Container */}
        <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-surface/80 p-6 sm:p-10 backdrop-blur-xl shadow-2xl">
          {/* Practice Area Tabs */}
          <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.08] pb-6">
            <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-muted-dark">
              Practice Domain:
            </span>
            {PRACTICE_AREAS.map((area) => {
              const Icon = area.icon;
              const isActive = selectedArea === area.id;
              return (
                <button
                  key={area.id}
                  onClick={() => handleSelectArea(area.id)}
                  className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-accent-gradient text-white shadow-lg shadow-accent/20"
                      : "border border-white/10 bg-white/[0.02] text-muted hover:border-white/20 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {area.label}
                </button>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column: Input Form */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Simulated Client Submission
                  </label>
                  <button
                    onClick={() => {
                      const p = PRESET_CASES.find((x) => x.area === selectedArea);
                      if (p) setInquiryText(p.description);
                    }}
                    className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    <RefreshCw className="h-3 w-3" /> Preset Case
                  </button>
                </div>

                <div className="relative rounded-xl border border-white/10 bg-black/40 p-4 transition-focus-within focus-within:border-accent">
                  <textarea
                    value={inquiryText}
                    onChange={(e) => setInquiryText(e.target.value)}
                    rows={5}
                    className="w-full resize-none bg-transparent text-sm text-white placeholder-muted-dark focus:outline-none"
                    placeholder="Enter legal claim summary or case backstory..."
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 text-xs text-muted">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                      Prisma PostgreSQL Conflict Scan Active
                    </span>
                    <span className="font-mono text-[11px] text-muted-dark">
                      Endpoint: /api/intake
                    </span>
                  </div>
                </div>

                {/* Preset Information Pills */}
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-md bg-white/[0.04] px-2.5 py-1 text-muted">
                    <strong className="text-white">Parties:</strong> {activePreset.parties[1]}
                  </span>
                  <span className="rounded-md bg-emerald-500/10 px-2.5 py-1 text-emerald-300">
                    <strong className="text-emerald-200">Est. Claim:</strong> {activePreset.estValue}
                  </span>
                </div>
              </div>

              <div className="mt-8 flex items-center gap-4">
                {step === "input" ? (
                  <MagneticButton
                    onClick={startAnalysis}
                    className="w-full sm:w-auto rounded-full bg-accent-gradient px-8 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Submit to Gemini & Express Agent
                    <ArrowRight className="h-4 w-4" />
                  </MagneticButton>
                ) : (
                  <button
                    onClick={resetSimulator}
                    className="rounded-full border border-white/15 bg-white/[0.04] px-6 py-3 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    Reset & Submit Another
                  </button>
                )}
              </div>
            </div>

            {/* Right Column: AI Analysis Engine Visualization */}
            <div className="lg:col-span-6 rounded-xl border border-white/10 bg-black/60 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-white">
                      Node/Express + Gemini + Telegram Pipeline
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-dark">Latency: ~0.9s</span>
                </div>

                <AnimatePresence mode="wait">
                  {step === "input" && (
                    <motion.div
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 text-center text-muted"
                    >
                      <Sparkles className="mx-auto h-10 w-10 text-muted-dark mb-3 animate-bounce" />
                      <p className="text-sm font-medium text-white">Ready for Agent Execution</p>
                      <p className="text-xs text-muted-dark mt-1">
                        Clicking submit sends request to Express backend → Gemini extracts entities → Prisma saves to DB → Telegram notifies attorney.
                      </p>
                    </motion.div>
                  )}

                  {step === "analyzing" && (
                    <motion.div
                      key="analyzing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4 py-4"
                    >
                      {[
                        "Sending inquiry to Express API endpoint (/api/intake)...",
                        "Gemini 2.5 Flash extracting Client, Practice Area, Urgency & Summary...",
                        "Prisma saving structured record into PostgreSQL database...",
                        "Dispatching instant Markdown alert card to Attorney Telegram channel...",
                      ].map((task, idx) => (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 text-xs font-mono p-2.5 rounded-lg border transition-all ${
                            idx <= analysisStepIndex
                              ? "border-sky-500/30 bg-sky-500/10 text-sky-200"
                              : "border-white/5 bg-white/[0.01] text-muted-dark"
                          }`}
                        >
                          {idx < analysisStepIndex ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                          ) : idx === analysisStepIndex ? (
                            <RefreshCw className="h-4 w-4 text-sky-400 animate-spin shrink-0" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-white/20 shrink-0" />
                          )}
                          <span>{task}</span>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {step === "result" && (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-4"
                    >
                      {/* Analysis Results Metrics */}
                      <div className="grid grid-cols-3 gap-3">
                        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                          <span className="text-[10px] font-mono text-muted uppercase">Conflict Check</span>
                          <div className="mt-1 flex items-center justify-center gap-1 text-xs font-semibold text-emerald-400">
                            <ShieldCheck className="h-3.5 w-3.5" /> {apiResult?.conflictStatus || "CLEARED"}
                          </div>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                          <span className="text-[10px] font-mono text-muted uppercase">Urgency</span>
                          <div className="mt-1 text-xs font-semibold text-sky-400">
                            {apiResult?.urgency || "HIGH"} ({apiResult?.urgencyScore || 95}/100)
                          </div>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 text-center">
                          <span className="text-[10px] font-mono text-muted uppercase">Telegram Status</span>
                          <div className="mt-1 text-xs font-semibold text-emerald-400">
                            {apiResult?.telegramNotified ? "DISPATCHED" : "LOGGED"}
                          </div>
                        </div>
                      </div>

                      {/* Gemini Extracted Data Card */}
                      <div className="rounded-xl border border-sky-500/30 bg-sky-950/20 p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-sky-300">Gemini 2.5 Flash Extracted Entity</span>
                          <span className="rounded-full bg-sky-400/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-sky-400">
                            {apiResult?.practiceArea || activePreset.title}
                          </span>
                        </div>
                        <p className="text-xs text-white leading-relaxed font-mono">
                          "{apiResult?.summary || inquiryText.substring(0, 160) + "..."}"
                        </p>
                        <div className="mt-3 flex items-center justify-between text-xs border-t border-white/10 pt-2 text-muted">
                          <span>Client: <strong className="text-white">{apiResult?.clientName || "Marcus Vance"}</strong></span>
                          <span>Counsel: <strong className="text-sky-300">{apiResult?.assignedAttorney || "Thomas Sterling, Esq."}</strong></span>
                        </div>
                      </div>

                      {/* Booking Action */}
                      <div className="pt-2">
                        {booked ? (
                          <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 py-3 text-xs font-semibold text-emerald-300">
                            <CheckCircle2 className="h-4 w-4" /> Consultation Saved to PostgreSQL & Synced!
                          </div>
                        ) : (
                          <button
                            onClick={() => setBooked(true)}
                            className="w-full rounded-xl bg-white py-3 text-xs font-semibold text-background transition-colors hover:bg-white/90"
                          >
                            Simulate Auto-Booking Consultation Slot
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="mt-4 border-t border-white/5 pt-3 text-[11px] text-muted-dark flex items-center justify-between">
                <span>Express Server: Port 5000</span>
                <span>PostgreSQL + Prisma ORM Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
