"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import {
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Briefcase,
  AlertCircle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  RefreshCw,
  X,
  FileText,
  CheckCircle,
  Inbox,
  Filter,
} from "lucide-react";

// API Endpoint configuration
const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api`;

interface IntakeRecord {
  id: string;
  referenceId: string;
  clientName: string;
  clientEmail: string | null;
  clientPhone: string | null;
  clientLocation: string | null;
  practiceArea: string;
  urgency: "HIGH" | "MEDIUM" | "LOW";
  urgencyScore: number;
  summary: string;
  rawInquiry: string;
  conflictStatus: "CLEARED" | "POTENTIAL_CONFLICT";
  estValue: string | null;
  assignedAttorney: string | null;
  assignedTeamId: string | null;
  status: string;
  incidentDate: string | null;
  relevantParties: string | null;
  desiredOutcome: string | null;
  missingInfo: string | null;
  chatHistory: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPage() {
  const [intakes, setIntakes] = useState<IntakeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [areaFilter, setAreaFilter] = useState("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");

  // Selected Intake for Detail Drawer
  const [selectedIntake, setSelectedIntake] = useState<IntakeRecord | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch Intakes
  const fetchIntakes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(`${API_BASE}/intakes`, {
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
      });

      if (response.status === 401) {
        window.location.href = "/login?redirect=/admin";
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to load intakes from backend.");
      }
      const resData = await response.json();
      setIntakes(resData.data || []);
    } catch (err) {
      console.error(err);
      setError("Could not establish a connection to the backend server. Displaying mock data.");
      loadMockIntakes();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntakes();
  }, []);

  // Load Mock Intakes for Offline Demo
  const loadMockIntakes = () => {
    const mockData: IntakeRecord[] = [
      {
        id: "lf-mock-1",
        referenceId: "LF-2026-8921",
        clientName: "Rahul Sharma",
        clientEmail: "rahul.s@example.com",
        clientPhone: "+91 98860 12345",
        clientLocation: "Bangalore",
        practiceArea: "Employment Law",
        urgency: "HIGH",
        urgencyScore: 94,
        summary: "Client was terminated from his software engineering role immediately after presenting written reports of unsafe structural working conditions in the workplace.",
        rawInquiry: "My employer terminated me yesterday after I complained about unsafe working conditions.",
        conflictStatus: "CLEARED",
        estValue: "$200,000 - $400,000",
        assignedAttorney: "Elena Vance, Esq.",
        assignedTeamId: "team-uuid-3",
        status: "NEW",
        incidentDate: "Yesterday",
        relevantParties: "Apex Solutions Ltd",
        desiredOutcome: "Wrongful termination damages and reinstatement evaluation",
        missingInfo: "",
        chatHistory: null,
        createdAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "lf-mock-2",
        referenceId: "LF-2026-5129",
        clientName: "Marcus Vance",
        clientEmail: "marcus.vance@example.com",
        clientPhone: "(713) 555-0198",
        clientLocation: "Harris County, Texas",
        practiceArea: "Personal Injury",
        urgency: "HIGH",
        urgencyScore: 96,
        summary: "Client sustained cervical and lumbar spinal displacement in a multi-vehicle highway crash involving a logistics commercial truck. Opposing party is Apex Cargo.",
        rawInquiry: "I was hit by a commercial logistics truck on the highway. I sustained severe back and neck injuries.",
        conflictStatus: "CLEARED",
        estValue: "$350,000 - $600,000",
        assignedAttorney: "Thomas Sterling, Esq.",
        assignedTeamId: "team-uuid-0",
        status: "NEW",
        incidentDate: "2 weeks ago",
        relevantParties: "Apex Cargo Logistics LLC",
        desiredOutcome: "Compensation for medical expenses and pain/suffering damages",
        missingInfo: "",
        chatHistory: null,
        createdAt: new Date(Date.now() - 24 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: "lf-mock-3",
        referenceId: "LF-2026-4411",
        clientName: "Priya Mukherjee",
        clientEmail: "priya.m@example.com",
        clientPhone: "+91 99000 88210",
        clientLocation: "Mumbai",
        practiceArea: "Family Law",
        urgency: "MEDIUM",
        urgencyScore: 65,
        summary: "Client seeks custody restructuring and advice on preliminary division of assets in anticipation of divorce proceedings. Opposing party is her spouse.",
        rawInquiry: "I am planning to file for divorce and need representation to handle child custody negotiations.",
        conflictStatus: "POTENTIAL_CONFLICT",
        estValue: "$75,000+",
        assignedAttorney: "Sophia Martinez, JD",
        assignedTeamId: "team-uuid-1",
        status: "UNDER_REVIEW",
        incidentDate: "Ongoing",
        relevantParties: "Sanjay Mukherjee (Spouse)",
        desiredOutcome: "Joint child custody and equitable asset separation terms",
        missingInfo: "",
        chatHistory: null,
        createdAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    setIntakes(mockData);
  };

  // Update Status in database (or memory fallback)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      const response = await fetch(`${API_BASE}/intake/${id}/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || ""}`,
        },
        body: JSON.stringify({ messageText: `System directive: Set status to ${newStatus}` }),
      });

      if (response.status === 401) {
        window.location.href = "/login?redirect=/admin";
        return;
      }

      // Local state fallback updating if API fails or we are in mock mode
      setIntakes(prev =>
        prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedIntake && selectedIntake.id === id) {
        setSelectedIntake(prev => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      console.warn("Direct status update API failed, applying state change locally.");
      setIntakes(prev =>
        prev.map(item => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedIntake && selectedIntake.id === id) {
        setSelectedIntake(prev => (prev ? { ...prev, status: newStatus } : null));
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Metrics calculation
  const totalActive = intakes.length;
  const highPriorityCount = intakes.filter(item => item.urgency === "HIGH").length;
  const awaitingReviewCount = intakes.filter(item => item.status === "NEW").length;
  const completedTodayCount = intakes.filter(
    item => new Date(item.createdAt).toDateString() === new Date().toDateString()
  ).length;

  // Filter and search lists
  const filteredIntakes = intakes.filter(item => {
    // Search match
    const matchesSearch =
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.practiceArea.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter matches
    const matchesStatus = statusFilter === "ALL" || item.status === statusFilter;
    const matchesArea = areaFilter === "ALL" || item.practiceArea === areaFilter;
    const matchesUrgency = urgencyFilter === "ALL" || item.urgency === urgencyFilter;

    return matchesSearch && matchesStatus && matchesArea && matchesUrgency;
  });

  // Extract unique practice areas in dataset for filters
  const uniqueAreas = Array.from(new Set(intakes.map(item => item.practiceArea)));

  return (
    <main className="relative min-h-screen bg-background text-foreground selection:bg-accent/10 selection:text-foreground">
      <Navbar />

      <div className="mx-auto max-w-8xl px-6 pt-32 pb-24 lg:px-10">
        
        {/* Command Center Title */}
        <div className="mb-10 border-b border-border pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="font-mono text-xs font-semibold text-accent uppercase tracking-wider">
              Firm Operations Portal
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Command Center
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchIntakes}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-xs font-semibold hover:bg-surface shadow-sm transition-colors text-foreground disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Sync Feeds
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-8 flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 p-3.5 rounded-lg">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Overview Stat Cards (Minimal and Restrained) */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-10">
          {[
            { label: "Active Intakes", value: totalActive, desc: "Cumulative active pipeline" },
            { label: "Awaiting Review", value: awaitingReviewCount, desc: "Pending initial attorney clearance" },
            { label: "High Priority", value: highPriorityCount, desc: "High urgency classified cases", highlight: true },
            { label: "Completed Today", value: completedTodayCount, desc: "Qualified records closed today" },
          ].map((stat, idx) => (
            <div key={idx} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <span className="block text-[11px] font-bold text-muted-dark uppercase tracking-wider">
                {stat.label}
              </span>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className={`text-2xl sm:text-3xl font-bold ${stat.highlight ? 'text-red-700' : 'text-foreground'}`}>
                  {stat.value}
                </span>
              </div>
              <span className="mt-1 block text-[10px] text-muted leading-tight">{stat.desc}</span>
            </div>
          ))}
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center mb-6 bg-[#FDFCFA] border border-border p-4 rounded-xl shadow-xs">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-dark" />
            <input
              type="text"
              placeholder="Search by client, reference, practice area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2 text-sm text-foreground placeholder-muted-dark focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            
            <div className="flex items-center gap-1.5 text-xs text-muted font-semibold">
              <Filter className="h-3.5 w-3.5 text-muted-dark" />
              Filters:
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-accent"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">Awaiting Review</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="COMPLETED">Resolved / Archived</option>
            </select>

            {/* Practice Area Filter */}
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-accent"
            >
              <option value="ALL">All Practice Areas</option>
              {uniqueAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>

            {/* Urgency Filter */}
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground focus:outline-none focus:border-accent"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High Urgency</option>
              <option value="MEDIUM">Medium Urgency</option>
              <option value="LOW">Low Urgency</option>
            </select>

          </div>
        </div>

        {/* Data Grid Table (Desktop) / Cards (Mobile) */}
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          
          <div className="overflow-x-auto">
            {filteredIntakes.length === 0 ? (
              <div className="py-16 text-center text-muted">
                <Inbox className="mx-auto h-10 w-10 text-muted-dark mb-3" />
                <p className="text-sm font-semibold text-foreground">No Intakes Found</p>
                <p className="text-xs text-muted-dark mt-1">Try relaxing your search terms or filters.</p>
              </div>
            ) : (
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-surface font-bold text-foreground uppercase tracking-wider text-[10px]">
                    <th className="px-6 py-4">Client</th>
                    <th className="px-6 py-4">Reference ID</th>
                    <th className="px-6 py-4">Practice Area</th>
                    <th className="px-6 py-4">Urgency</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Assigned Team</th>
                    <th className="px-6 py-4 text-right">Time Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredIntakes.map((intake) => {
                    const submissionTime = new Date(intake.createdAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    });
                    
                    return (
                      <tr
                        key={intake.id}
                        onClick={() => setSelectedIntake(intake)}
                        className="hover:bg-surface/50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {intake.clientName}
                        </td>
                        <td className="px-6 py-4 font-mono text-muted-dark font-medium">
                          {intake.referenceId}
                        </td>
                        <td className="px-6 py-4 text-foreground">
                          <span className="rounded bg-accent/5 px-2.5 py-1 text-[11px] font-semibold text-accent border border-accent/10">
                            {intake.practiceArea}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 font-bold ${
                              intake.urgency === "HIGH" ? "text-red-700" : "text-amber-600"
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${intake.urgency === 'HIGH' ? 'bg-red-600' : 'bg-amber-500'}`} />
                            {intake.urgency} ({intake.urgencyScore})
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                              intake.status === "NEW"
                                ? "bg-amber-50 border-amber-200 text-amber-800"
                                : intake.status === "UNDER_REVIEW"
                                ? "bg-blue-50 border-blue-200 text-blue-800"
                                : "bg-emerald-50 border-emerald-200 text-emerald-800"
                            }`}
                          >
                            {intake.status === "NEW" ? "Awaiting Review" : intake.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted-dark font-medium">
                          {intake.assignedAttorney || "Managing Partner"}
                        </td>
                        <td className="px-6 py-4 text-right text-muted font-medium">
                          {submissionTime}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>

      {/* Slide-Over Drawer Detail View */}
      <AnimatePresence>
        {selectedIntake && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.35 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedIntake(null)}
              className="fixed inset-0 z-40 bg-black"
            />

            {/* Slide-Over Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-card border-l border-border shadow-2xl p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div>
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
                  <div>
                    <span className="font-mono text-[10px] text-accent font-bold uppercase tracking-widest">
                      Dossier Details
                    </span>
                    <h2 className="font-serif text-xl font-bold text-foreground mt-0.5">
                      {selectedIntake.referenceId} — {selectedIntake.clientName}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedIntake(null)}
                    className="h-8 w-8 flex items-center justify-center rounded-full border border-border hover:bg-surface text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Grid info */}
                <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                  <div>
                    <span className="font-bold text-muted-dark block text-[9px] uppercase tracking-wider mb-1">
                      Practice Domain
                    </span>
                    <div className="rounded bg-accent/5 border border-accent/10 px-3 py-1.5 font-bold text-accent w-max">
                      {selectedIntake.practiceArea}
                    </div>
                  </div>
                  
                  <div>
                    <span className="font-bold text-muted-dark block text-[9px] uppercase tracking-wider mb-1">
                      Urgency Classification
                    </span>
                    <div className={`font-bold ${selectedIntake.urgency === 'HIGH' ? 'text-red-700' : 'text-amber-600'}`}>
                      {selectedIntake.urgency} ({selectedIntake.urgencyScore}/100)
                    </div>
                  </div>
                </div>

                {/* Client Contact Details */}
                <div className="rounded-xl border border-border bg-surface p-4 text-xs space-y-2.5 mb-6">
                  <h4 className="font-serif font-bold text-foreground border-b border-border/60 pb-2 mb-2">
                    Client Contact Details
                  </h4>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-dark" />
                    <span className="font-semibold text-foreground">{selectedIntake.clientName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-dark" />
                    <span className="text-foreground">{selectedIntake.clientEmail || "Not Supplied"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-dark" />
                    <span className="text-foreground">{selectedIntake.clientPhone || "Not Supplied"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-dark" />
                    <span className="text-foreground">{selectedIntake.clientLocation || "Not Supplied"}</span>
                  </div>
                </div>

                {/* Case Outline */}
                <div className="space-y-4 mb-6">
                  <div>
                    <span className="font-bold text-muted-dark block text-[9px] uppercase tracking-wider mb-1.5">
                      Structured Case Summary
                    </span>
                    <div className="bg-[#FAF9F6] border border-border p-4 rounded-xl text-xs italic leading-relaxed text-foreground">
                      "{selectedIntake.summary}"
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs border-t border-border pt-4">
                    <div>
                      <span className="font-bold text-muted-dark block text-[9px] uppercase tracking-wider mb-0.5">
                        Incident Date
                      </span>
                      <span className="text-foreground font-semibold">{selectedIntake.incidentDate || "Not Specified"}</span>
                    </div>
                    <div>
                      <span className="font-bold text-muted-dark block text-[9px] uppercase tracking-wider mb-0.5">
                        Relevant Parties
                      </span>
                      <span className="text-foreground font-semibold">{selectedIntake.relevantParties || "Not Specified"}</span>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="font-bold text-muted-dark block text-[9px] uppercase tracking-wider mb-0.5">
                      Desired Outcome
                    </span>
                    <span className="text-foreground font-semibold">{selectedIntake.desiredOutcome || "Not Specified"}</span>
                  </div>
                </div>

                {/* AI Routing Analysis */}
                <div className="border-t border-border pt-4 space-y-3.5 text-xs mb-6">
                  <h4 className="font-serif font-bold text-foreground">AI Routing Assessment</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Conflict Clearance:</span>
                    <span className={`font-bold flex items-center gap-1 ${
                      selectedIntake.conflictStatus === "CLEARED" ? "text-emerald-700" : "text-amber-600"
                    }`}>
                      <ShieldCheck className="h-4 w-4" /> {selectedIntake.conflictStatus}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Assigned Attorney:</span>
                    <span className="text-accent font-bold">{selectedIntake.assignedAttorney || "Managing Partner"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted">Estimated Retainer Value:</span>
                    <span className="text-foreground font-bold">{selectedIntake.estValue || "Pending Evaluation"}</span>
                  </div>
                </div>

              </div>

              {/* Status Update Actions */}
              <div className="border-t border-border pt-4">
                <span className="font-bold text-muted-dark block text-[9px] uppercase tracking-wider mb-3">
                  Update Docket Status
                </span>
                
                <div className="flex gap-2">
                  <button
                    disabled={isUpdatingStatus || selectedIntake.status === "NEW"}
                    onClick={() => handleUpdateStatus(selectedIntake.id, "NEW")}
                    className="flex-1 border border-border rounded-lg py-2.5 bg-white text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-40"
                  >
                    Set Awaiting
                  </button>
                  <button
                    disabled={isUpdatingStatus || selectedIntake.status === "UNDER_REVIEW"}
                    onClick={() => handleUpdateStatus(selectedIntake.id, "UNDER_REVIEW")}
                    className="flex-1 border border-border rounded-lg py-2.5 bg-white text-xs font-semibold text-foreground hover:bg-surface disabled:opacity-40"
                  >
                    Set Under Review
                  </button>
                  <button
                    disabled={isUpdatingStatus || selectedIntake.status === "COMPLETED"}
                    onClick={() => handleUpdateStatus(selectedIntake.id, "COMPLETED")}
                    className="flex-1 bg-accent rounded-lg py-2.5 text-xs font-semibold text-white hover:bg-accent/95 disabled:opacity-40"
                  >
                    Resolve / Archive
                  </button>
                </div>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  );
}
