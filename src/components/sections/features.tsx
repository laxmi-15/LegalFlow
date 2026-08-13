"use client";

import {
  ShieldAlert,
  Brain,
  CalendarCheck2,
  Lock,
  BarChart3,
  Globe2,
  Zap,
  CheckCircle,
} from "lucide-react";

const FEATURES = [
  {
    icon: ShieldAlert,
    title: "Instant Ethical Conflict Checks",
    description:
      "Cross-checks every incoming lead against your firm's entire active client, corporate entity, and past adversary database before intake completion.",
    badge: "Ethics & Compliance",
  },
  {
    icon: Brain,
    title: "Legal Intent & Damage Taxonomy",
    description:
      "Trained on over 500,000 legal filings to parse case severity, jurisdiction boundaries, damage thresholds, and statute deadlines automatically.",
    badge: "Custom Legal AI",
  },
  {
    icon: CalendarCheck2,
    title: "Automated Attorney Auto-Booking",
    description:
      "Directly schedules qualified clients onto the right partner’s calendar based on practice area expertise, fee tier, and live availability.",
    badge: "Zero Latency",
  },
  {
    icon: Lock,
    title: "HIPAA & SOC 2 Type II Security",
    description:
      "Bank-grade AES-256 encryption in transit and at rest. Dedicated private tenant options ensure strict attorney-client privilege.",
    badge: "Enterprise Security",
  },
  {
    icon: BarChart3,
    title: "Intake Conversion Analytics",
    description:
      "Track speed-to-lead metrics, lead source ROI, attorney conversion rates, and lost revenue diagnostics in real time.",
    badge: "Revenue Growth",
  },
  {
    icon: Globe2,
    title: "25+ Language AI Voice & Text",
    description:
      "Engage prospective clients fluently in Spanish, Mandarin, French, Vietnamese, and 20+ other languages via text or phone intake.",
    badge: "Global Reach",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-sky-400">
            <Zap className="h-3.5 w-3.5" />
            Built for Modern Law Firms
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Intelligent Automation for <span className="text-gradient">Legal Intake</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Replace manual phone intake, delayed email callbacks, and administrative conflict checks with a unified AI intake operating system.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div
                key={i}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-surface/60 p-8 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-surface hover:shadow-2xl hover:shadow-sky-500/5"
              >
                {/* Accent glow on hover */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-accent/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100 opacity-0" />

                <div className="flex items-center justify-between mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-gradient text-white shadow-lg shadow-accent/20">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono font-medium text-sky-400 bg-sky-400/10 px-2.5 py-1 rounded-full border border-sky-400/20">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white group-hover:text-sky-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
