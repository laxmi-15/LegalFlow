"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, Scale, CheckCircle2 } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track scroll position of the hero section for step animations
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Transform scroll positions to opacity and scale values for steps
  const opacity1 = useTransform(scrollYProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const y1 = useTransform(scrollYProgress, [0, 0.15, 0.25], [0, 0, -50]);

  // "Understand"
  const opacity2 = useTransform(scrollYProgress, [0.22, 0.32, 0.45], [0, 1, 0]);
  const scale2 = useTransform(scrollYProgress, [0.22, 0.32, 0.45], [0.95, 1, 0.95]);

  // "Collect"
  const opacity3 = useTransform(scrollYProgress, [0.48, 0.58, 0.70], [0, 1, 0]);
  const scale3 = useTransform(scrollYProgress, [0.48, 0.58, 0.70], [0.95, 1, 0.95]);

  // "Organize"
  const opacity4 = useTransform(scrollYProgress, [0.73, 0.83, 0.93], [0, 1, 0]);
  const scale4 = useTransform(scrollYProgress, [0.73, 0.83, 0.93], [0.95, 1, 0.95]);

  // CTA Section at bottom
  const opacity5 = useTransform(scrollYProgress, [0.91, 0.97], [0, 1]);
  const scale5 = useTransform(scrollYProgress, [0.91, 0.97], [0.97, 1]);

  return (
    <div ref={containerRef} className="relative h-[400vh] bg-background">
      {/* Sticky viewport */}
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden px-6">
        
        {/* Subtle mesh background grid */}
        <div className="pointer-events-none absolute inset-0 bg-mesh opacity-30" />
        <div className="pointer-events-none absolute inset-0 bg-radial-fade" />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#EBE7E0_1px,transparent_1px),linear-gradient(to_bottom,#EBE7E0_1px,transparent_1px)] bg-[size:100px_100px] opacity-[0.15]" />

        {/* STEP 0: Initial Screen */}
        <motion.div
          style={{ opacity: opacity1, y: y1 }}
          className="absolute z-10 mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-1.5 text-[12px] font-semibold text-accent shadow-sm uppercase tracking-wider">
            <Scale className="h-3.5 w-3.5" />
            LegalFlow Client Intake & Routing
          </div>
          
          <h1 className="text-balance font-serif text-[44px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-[72px]">
            Legal intake, <br />
            <span className="text-accent font-sans font-extrabold italic">without the burden.</span>
          </h1>
          
          <p className="mt-8 max-w-2xl text-balance text-[17px] leading-relaxed text-muted sm:text-lg">
            Intelligently organize client inquiry capture, case qualification, and routing. 
            Scroll to see how LegalFlow transforms client communications into qualified legal dossiers.
          </p>

          <div className="mt-12 flex flex-col items-center gap-2 text-xs font-medium text-muted-dark">
            <span className="animate-bounce">↓</span>
            <span>Scroll to explore the flow</span>
          </div>
        </motion.div>

        {/* STEP 1: Understand */}
        <motion.div
          style={{ opacity: opacity2, scale: scale2 }}
          className="absolute z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <span className="font-mono text-xs font-bold text-accent-light uppercase tracking-widest mb-4">Phase 01</span>
          <h2 className="text-4xl font-serif font-bold text-foreground sm:text-5xl">Understand.</h2>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted">
            The client explains what happened in their own words. Our system maps their narrative and extracts the legal domain, client identity, and case details instantly.
          </p>
          <div className="mt-8 rounded-lg border border-border bg-card p-4 text-left max-w-md shadow-sm">
            <div className="text-xs font-semibold text-accent mb-1">Raw Client Narrative</div>
            <p className="text-sm text-foreground italic">"My employer terminated me yesterday after I complained about unsafe working conditions."</p>
            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-muted-dark border-t border-border pt-2">
              <span>Domain: Employment Law</span>
              <span>Urgency: HIGH</span>
            </div>
          </div>
        </motion.div>

        {/* STEP 2: Collect */}
        <motion.div
          style={{ opacity: opacity3, scale: scale3 }}
          className="absolute z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <span className="font-mono text-xs font-bold text-accent-light uppercase tracking-widest mb-4">Phase 02</span>
          <h2 className="text-4xl font-serif font-bold text-foreground sm:text-5xl">Collect.</h2>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted">
            Instead of displaying static forms, LegalFlow dynamically identifies missing critical details and asks tailored follow-up questions in real-time.
          </p>
          <div className="mt-8 rounded-lg border border-border bg-card p-4 text-left max-w-md shadow-sm">
            <div className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-max mb-2">Identified: Rahul, Bangalore, Termination</div>
            <div className="text-xs font-semibold text-accent mb-1">Dynamic LegalFlow Inquiry</div>
            <p className="text-sm text-foreground">"Thanks, Rahul. Was your complaint about the unsafe working conditions made in writing, verbally, or both?"</p>
          </div>
        </motion.div>

        {/* STEP 3: Organize */}
        <motion.div
          style={{ opacity: opacity4, scale: scale4 }}
          className="absolute z-10 mx-auto flex max-w-3xl flex-col items-center text-center"
        >
          <span className="font-mono text-xs font-bold text-accent-light uppercase tracking-widest mb-4">Phase 03</span>
          <h2 className="text-4xl font-serif font-bold text-foreground sm:text-5xl">Organize.</h2>
          <p className="mt-5 max-w-lg text-[16px] leading-relaxed text-muted">
            A structured case outline is prepared, mapping the incident timeline, parties involved, financial value estimates, conflict matches, and missing items.
          </p>
          <div className="mt-8 rounded-lg border border-border bg-card p-4 text-left max-w-md shadow-sm space-y-2 text-xs">
            <div className="flex justify-between border-b border-border pb-1">
              <span className="font-semibold text-foreground">Client Name:</span>
              <span className="text-muted">Rahul S.</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1">
              <span className="font-semibold text-foreground">Incident Date:</span>
              <span className="text-muted">August 7, 2026</span>
            </div>
            <div className="flex justify-between border-b border-border pb-1">
              <span className="font-semibold text-foreground">Practice Area:</span>
              <span className="text-muted">Employment Law</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-foreground">Conflict Scan:</span>
              <span className="text-emerald-600 font-bold">✅ Cleared</span>
            </div>
          </div>
        </motion.div>

        {/* STEP 4: CTA Entry */}
        <motion.div
          style={{ opacity: opacity5, scale: scale5 }}
          className="absolute z-10 mx-auto flex max-w-xl flex-col items-center text-center"
        >
          <h2 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            Route & Review.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Once completed, the qualified file is instantly routed to the correct legal team, and notifications are sent out. The case enters the Command Center for attorney verification.
          </p>

          <div className="mt-8 w-full rounded-xl border border-border bg-card p-6 shadow-md text-left">
            <h3 className="font-serif text-lg font-bold text-foreground mb-2">Confidential Client Intake</h3>
            <p className="text-xs text-muted mb-4">
              Your details will be encrypted, processed, and submitted directly to the appropriate attorney review panel.
            </p>
            
            <div className="flex items-start gap-2.5 rounded-lg bg-surface border border-border p-3 mb-6">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-[11px] text-muted leading-normal">
                <strong className="text-foreground">Confidentiality Guarantee:</strong> Submission does not constitute legal representation. All communications are confidential and routed to qualified professionals.
              </div>
            </div>

            <div className="flex gap-4">
              <MagneticButton
                as="a"
                href="/intake"
                className="w-full flex justify-center items-center gap-2 rounded-lg bg-accent py-3 text-[14px] font-semibold text-white shadow-sm hover:bg-accent/95"
              >
                Start Intake Agent
                <ArrowRight className="h-4 w-4" />
              </MagneticButton>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
