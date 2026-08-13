"use client";

import { useState } from "react";
import { Calculator, DollarSign, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/ui/magnetic-button";

export function RoiCalculator() {
  const [monthlyLeads, setMonthlyLeads] = useState<number>(120);
  const [avgCaseValue, setAvgCaseValue] = useState<number>(8500);
  const [currentResponseHours, setCurrentResponseHours] = useState<number>(18);

  // ROI Math calculations
  // Industry standard: Speed to lead under 5 mins increases conversion by ~35%
  const currentConversionRate = 0.18; // 18% base manual conversion
  const routeConversionRate = 0.28; // 28% AI automated conversion

  const currentCasesRetained = Math.round(monthlyLeads * currentConversionRate);
  const routeCasesRetained = Math.round(monthlyLeads * routeConversionRate);
  const additionalCases = routeCasesRetained - currentCasesRetained;

  const monthlyRevenueBoost = additionalCases * avgCaseValue;
  const annualRevenueBoost = monthlyRevenueBoost * 12;

  // Time saved calculation (avg 35 mins per manual intake & conflict check)
  const hoursSavedPerMonth = Math.round((monthlyLeads * 35) / 60);

  return (
    <section id="calculator" className="relative py-28 overflow-hidden bg-background/70">
      <div className="mx-auto max-w-7xl px-6 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1 text-xs font-medium text-sky-400">
            <Calculator className="h-3.5 w-3.5" />
            Intake Acceleration ROI Calculator
          </div>
          <h2 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-5xl">
            Calculate Your Firm’s <span className="text-gradient">Revenue Lift</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">
            Shorter intake response times mean higher client conversion. Calculate how much lost revenue Route reclaims for your law firm every month.
          </p>
        </div>

        <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-surface/90 p-8 sm:p-12 backdrop-blur-xl shadow-2xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
            {/* Sliders Input Column */}
            <div className="lg:col-span-6 space-y-8">
              {/* Slider 1: Monthly Lead Volume */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Monthly Inquiry Volume
                  </label>
                  <span className="text-lg font-bold font-mono text-white">{monthlyLeads} leads/mo</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={500}
                  step={10}
                  value={monthlyLeads}
                  onChange={(e) => setMonthlyLeads(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-white/10 accent-sky-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-dark font-mono mt-1">
                  <span>20 inquiries</span>
                  <span>500 inquiries</span>
                </div>
              </div>

              {/* Slider 2: Average Retainer / Case Value */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Average Case / Retainer Value ($)
                  </label>
                  <span className="text-lg font-bold font-mono text-emerald-400">
                    ${avgCaseValue.toLocaleString()}
                  </span>
                </div>
                <input
                  type="range"
                  min={2000}
                  max={50000}
                  step={500}
                  value={avgCaseValue}
                  onChange={(e) => setAvgCaseValue(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-white/10 accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-dark font-mono mt-1">
                  <span>$2,000</span>
                  <span>$50,000</span>
                </div>
              </div>

              {/* Slider 3: Current Manual Intake Time */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Current Intake Callback Delay
                  </label>
                  <span className="text-lg font-bold font-mono text-sky-300">
                    {currentResponseHours} hours
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={48}
                  step={1}
                  value={currentResponseHours}
                  onChange={(e) => setCurrentResponseHours(Number(e.target.value))}
                  className="w-full h-2 rounded-lg bg-white/10 accent-sky-400 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-muted-dark font-mono mt-1">
                  <span>1 hour (manual)</span>
                  <span>48 hours</span>
                </div>
              </div>
            </div>

            {/* Calculations Output Card */}
            <div className="lg:col-span-6 flex flex-col justify-between rounded-xl border border-sky-500/30 bg-sky-950/20 p-6 sm:p-8">
              <div>
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-sky-400">
                  Projected Route Performance Lift
                </span>

                <div className="mt-6 space-y-6">
                  {/* Annual Revenue Boost */}
                  <div>
                    <span className="text-xs text-muted">Estimated Additional Annual Retainer Revenue</span>
                    <div className="text-3xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400 mt-1">
                      +${annualRevenueBoost.toLocaleString()}
                    </div>
                  </div>

                  {/* Secondary Metrics */}
                  <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                    <div>
                      <span className="text-[11px] text-muted">Extra Cases Retained / Mo</span>
                      <p className="text-xl font-bold text-white mt-0.5">+{additionalCases} Retained Cases</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-muted">Admin Hours Saved / Mo</span>
                      <p className="text-xl font-bold text-sky-300 mt-0.5">{hoursSavedPerMonth} Hours / Mo</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <span className="text-xs text-muted-dark">Based on 1.2 sec instant AI route vs {currentResponseHours}h manual</span>
                <MagneticButton
                  as="a"
                  href="#book-demo"
                  className="rounded-full bg-white px-6 py-2.5 text-xs font-semibold text-background hover:bg-white/90"
                >
                  Claim Your ROI Assessment <ArrowRight className="h-3.5 w-3.5" />
                </MagneticButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
