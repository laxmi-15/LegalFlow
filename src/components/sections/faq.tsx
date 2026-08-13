"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FAQS = [
  {
    q: "How does Route check for adverse conflicts of interest?",
    a: "Route connects directly to your practice management database (Clio, MyCase, PracticePanther, custom SQL databases) and scans incoming client names, corporate entities, opposing parties, and related counsel against your active and historical client rosters before intake completion.",
  },
  {
    q: "Is client data safe and compliant with attorney-client privilege & SOC 2?",
    a: "Yes. Route complies strictly with SOC 2 Type II, HIPAA, and state bar confidentiality mandates. All data is encrypted with AES-256 bit encryption in transit and at rest. We never use your firm's intake data to train public foundation AI models.",
  },
  {
    q: "Can Route handle phone calls and voice intakes, or just web forms?",
    a: "Route includes 24/7 AI Voice Intake. Incoming phone inquiries are answered naturally by our legal conversational voice agent, transcribed live, qualified, checked for conflicts, and routed to the assigned attorney within seconds.",
  },
  {
    q: "How long does setup and Clio / MyCase integration take?",
    a: "Standard integration takes less than 30 minutes. Our team provides turn-key onboarding where we sync your practice management calendar, map custom intake questionnaires, and configure attorney routing rules.",
  },
  {
    q: "What happens if an incoming lead is low quality or not in our practice area?",
    a: "Route automatically flags and filters out non-qualifying inquiries. You can set custom disposition workflows (e.g., auto-referring out non-covered practice areas to partner firms or sending automated polite rejection responses).",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-28 overflow-hidden bg-background">
      <div className="mx-auto max-w-5xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-sky-400">
            <HelpCircle className="h-3.5 w-3.5" />
            Frequently Asked Questions
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Everything You Need to Know <span className="text-gradient">About Route</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Answers to common security, legal compliance, integration, and routing questions.
          </p>
        </div>

        <div className="mt-14 space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="overflow-hidden rounded-xl border border-white/10 bg-surface/80 transition-colors"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="text-base font-semibold text-white">{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-sky-400" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="border-t border-white/[0.06] px-6 pb-6 pt-4 text-sm leading-relaxed text-muted">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
