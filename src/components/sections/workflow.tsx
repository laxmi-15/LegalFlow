"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Cpu,
  ShieldCheck,
  CalendarCheck,
  Check,
  ArrowRight,
  Code,
  Layers,
} from "lucide-react";

const WORKFLOW_STEPS = [
  {
    id: 1,
    title: "1. Omni-Channel Ingestion",
    subtitle: "Web, SMS, Phone, Live Chat",
    icon: MessageSquare,
    badge: "Input Stage",
    description:
      "Client submits an inquiry through web forms, AI phone intake bot, SMS text message, or chat widget. Route normalizes multi-format inquiries instantly into structured JSON text stream.",
    highlights: [
      "24/7 Multi-channel intake coverage",
      "Real-time voice-to-text transcript conversion",
      "Multi-lingual translation (25+ languages)",
      "Zero drop-off form abandonment recovery",
    ],
    payload: {
      channel: "Web Widget / Voice AI",
      client_name: "Marcus Vance",
      inquiry_raw: "I was hit by a commercial delivery vehicle in Houston. Fractured vertebra and $45k medical bills...",
      submitted_at: "2026-08-07T12:30:15Z",
    },
  },
  {
    id: 2,
    title: "2. Legal Intent & Entity Extraction",
    subtitle: "NLP Classification Engine",
    icon: Cpu,
    badge: "AI Analysis",
    description:
      "Custom Legal NLP parses the raw narrative to extract practice domain, parties involved, financial damage estimates, jurisdiction, and Statute of Limitations deadline.",
    highlights: [
      "Entity extraction (Parties, Dates, Venues)",
      "Practice area classification precision: 99.4%",
      "Damage severity assessment matrix",
      "Statute of Limitations countdown timer",
    ],
    payload: {
      practice_area: "Personal Injury — Trucking Litigation",
      extracted_entities: {
        plaintiff: "Marcus Vance",
        defendant: "Apex Cargo Logistics LLC",
        jurisdiction: "Harris County, TX",
        estimated_damages: "$350,000 - $600,000",
      },
      urgency_score: 96,
    },
  },
  {
    id: 3,
    title: "3. Automated Conflict Check Matrix",
    subtitle: "Database Cross-Referencing",
    icon: ShieldCheck,
    badge: "Risk Audit",
    description:
      "Before any attorney opens the file, Route checks your law firm's active client roster, past adverse parties, and opposing counsel databases to prevent ethical conflicts of interest.",
    highlights: [
      "Sub-second conflict database scan",
      "Exact & fuzzy name matching algorithms",
      "Opposing counsel conflict detection",
      "Audit trail logged for state bar compliance",
    ],
    payload: {
      conflict_status: "CLEARED",
      matches_found: 0,
      checked_databases: ["Active Clients", "Prior Cases", "Opposing Counsel List"],
      ethics_audit_id: "ETH-2026-89412",
    },
  },
  {
    id: 4,
    title: "4. Smart Routing & Auto-Scheduling",
    subtitle: "Calendar & Practice Sync",
    icon: CalendarCheck,
    badge: "Booking Stage",
    description:
      "Route evaluates attorney practice specialties, current caseload, conversion rates, and real-time calendar availability to instantly book consultation with the best partner.",
    highlights: [
      "Specialty & fee-tier attorney matching",
      "Direct Clio, MyCase & Outlook calendar sync",
      "Automated SMS/Email confirmation & reminders",
      "Retainer agreement pre-qualification",
    ],
    payload: {
      assigned_attorney: "Thomas Sterling, Esq. (Senior Partner)",
      match_reasoning: "Highest PI conversion rate in Harris County jurisdiction",
      booked_slot: "Today at 3:30 PM CST",
      calendar_invite: "SENT (Clio Sync Active)",
    },
  },
];

export function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(1);
  const currentStepData = WORKFLOW_STEPS.find((s) => s.id === activeStep) || WORKFLOW_STEPS[0];

  return (
    <section id="workflow" className="relative py-28 overflow-hidden bg-background/50">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-sky-400">
            <Layers className="h-3.5 w-3.5" />
            Autonomous AI Workflow
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            From First Click to <span className="text-gradient">Booked Consultation</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            See how Route automates the intake pipeline step-by-step with complete transparency and zero human delay.
          </p>
        </div>

        {/* Workflow Steps Tabs */}
        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {WORKFLOW_STEPS.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(step.id)}
                className={`relative flex flex-col justify-between rounded-xl border p-5 text-left transition-all duration-300 ${
                  isActive
                    ? "border-accent bg-accent/10 shadow-xl shadow-accent/10"
                    : "border-white/10 bg-surface/60 hover:border-white/20 hover:bg-surface"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        isActive
                          ? "bg-accent-gradient text-white"
                          : "bg-white/[0.05] text-muted group-hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-sky-400 bg-sky-400/10 px-2 py-0.5 rounded-md">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{step.title}</h3>
                  <p className="mt-1 text-xs text-muted">{step.subtitle}</p>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute inset-0 rounded-xl border-2 border-accent pointer-events-none"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Active Step Visualizer Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="mt-8 rounded-2xl border border-white/10 bg-surface p-6 sm:p-10 backdrop-blur-xl"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Description & Highlights */}
              <div className="lg:col-span-6 flex flex-col justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-mono font-semibold text-sky-300 mb-4">
                    Step {currentStepData.id} Breakdown
                  </div>
                  <h3 className="text-2xl font-semibold text-white">{currentStepData.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{currentStepData.description}</p>

                  <div className="mt-6 space-y-2.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-dark">
                      Key Pipeline Features:
                    </span>
                    {currentStepData.highlights.map((h, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-muted">
                        <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => setActiveStep((prev) => (prev % 4) + 1)}
                    className="flex items-center gap-2 text-xs font-semibold text-sky-400 hover:text-sky-300 transition-colors"
                  >
                    Next Pipeline Stage <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-xs font-mono text-muted-dark">Stage {activeStep} of 4</span>
                </div>
              </div>

              {/* JSON Live Payload Inspection Window */}
              <div className="lg:col-span-6 rounded-xl border border-white/10 bg-black/80 p-5 font-mono text-xs text-sky-200">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-sky-400" />
                    <span className="text-[11px] font-semibold tracking-wide text-white uppercase">
                      Live AI Data Stream Output
                    </span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-black/60 p-4 text-[12px] leading-relaxed text-emerald-300">
                  {JSON.stringify(currentStepData.payload, null, 2)}
                </pre>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
