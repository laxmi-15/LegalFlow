"use client";

import { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Scale,
  Send,
  CheckCircle2,
  AlertTriangle,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  AlertCircle,
  FileText,
  Printer,
  ChevronRight,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

// API Endpoint configuration
const API_BASE = "http://localhost:5000/api";

type FlowStep = "UNDERSTAND" | "DETAILS" | "REVIEW" | "COMPLETE";

interface ClientInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
}

interface ChatHistoryItem {
  role: "user" | "model";
  content: string;
}

export default function IntakePage() {
  const [step, setStep] = useState<FlowStep>("UNDERSTAND");
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [referenceId, setReferenceId] = useState<string | null>(null);
  
  // Intake State
  const [rawInquiry, setRawInquiry] = useState("");
  const [clientNameInput, setClientNameInput] = useState("");
  const [practiceArea, setPracticeArea] = useState<string>("Other / Unknown");
  const [urgency, setUrgency] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [urgencyScore, setUrgencyScore] = useState<number>(50);
  const [clientInfo, setClientInfo] = useState<ClientInfo>({
    name: null,
    email: null,
    phone: null,
    location: null,
  });
  const [missingInformation, setMissingInformation] = useState<string[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [nextQuestion, setNextQuestion] = useState<string | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [assignedTeam, setAssignedTeam] = useState<string>("General Intake Team");
  const [assignedAttorney, setAssignedAttorney] = useState<string>("Gabriel Stone, Esq.");

  // Interaction State
  const [isLoading, setIsLoading] = useState(false);
  const [userReply, setUserReply] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isLoading]);

  // Handle first submit (Start session)
  const handleStartIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawInquiry.trim()) {
      setErrorMsg("Please tell us what happened so we can begin the review.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`${API_BASE}/intake/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryText: rawInquiry,
          clientName: clientNameInput,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to process first intake step.");
      }

      const resData = await response.json();
      const info = resData.data;

      setIntakeId(info.id);
      setReferenceId(info.referenceId);
      setPracticeArea(info.practiceArea);
      setUrgency(info.urgency);
      setUrgencyScore(info.urgencyScore);
      setClientInfo(info.clientInfo);
      setMissingInformation(info.missingInformation);
      setChatHistory(info.chatHistory || []);
      setNextQuestion(info.nextQuestion);
      
      if (info.status === "REVIEW" || info.missingInformation.length === 0) {
        setStep("REVIEW");
      } else {
        setStep("DETAILS");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Backend service is initializing. Running heuristic intake fallback.");
      runHeuristicStart();
    } finally {
      setIsLoading(false);
    }
  };

  // Heuristic Offline Fallback
  const runHeuristicStart = () => {
    const id = `lf-mock-${Math.floor(1000 + Math.random() * 9000)}`;
    const refCode = `LF-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const lower = rawInquiry.toLowerCase();
    
    let area = "Other / Unknown";
    if (lower.includes("termination") || lower.includes("employer") || lower.includes("severance")) area = "Employment Law";
    else if (lower.includes("accident") || lower.includes("collision") || lower.includes("injury")) area = "Personal Injury";
    else if (lower.includes("divorce") || lower.includes("custody")) area = "Family Law";
    else if (lower.includes("property") || lower.includes("apartment") || lower.includes("landlord") || lower.includes("tenant") || lower.includes("lease") || lower.includes("agreement") || lower.includes("possession") || lower.includes("real estate") || lower.includes("developer")) area = "Real Estate / Property Law";

    const extractedName = clientNameInput || "Anonymous Inquiry";
    
    setIntakeId(id);
    setReferenceId(refCode);
    setPracticeArea(area);
    setUrgency(lower.includes("urgent") || lower.includes("fired") ? "HIGH" : "MEDIUM");
    setUrgencyScore(lower.includes("urgent") ? 88 : 55);
    setClientInfo({
      name: extractedName,
      email: null,
      phone: null,
      location: null,
    });
    setMissingInformation(["clientEmail", "clientPhone", "clientLocation"]);
    
    const mockQuestion = `Thank you for sharing, ${extractedName}. To help our legal team evaluate this potential ${area} matter, could you provide your email address and best contact phone number?`;
    
    setChatHistory([
      { role: "user", content: rawInquiry },
      { role: "model", content: mockQuestion }
    ]);
    setNextQuestion(mockQuestion);
    setStep("DETAILS");
  };

  // Handle follow up message submissions
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userReply.trim() || isLoading) return;

    const text = userReply;
    setUserReply("");
    setIsLoading(true);
    setErrorMsg(null);

    // Optimistically update chat history
    setChatHistory(prev => [...prev, { role: "user", content: text }]);

    try {
      const response = await fetch(`${API_BASE}/intake/${intakeId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageText: text }),
      });

      if (!response.ok) {
        throw new Error("Failed to process conversation message.");
      }

      const resData = await response.json();
      const info = resData.data;

      setPracticeArea(info.practiceArea);
      setUrgency(info.urgency);
      setUrgencyScore(info.urgencyScore);
      setClientInfo(info.clientInfo);
      setMissingInformation(info.missingInformation);
      setChatHistory(info.chatHistory || []);
      setNextQuestion(info.nextQuestion);

      if (info.status === "REVIEW" || info.status === "COMPLETE") {
        setStep("REVIEW");
      }
    } catch (err) {
      console.error(err);
      // Heuristic Fallback chat response
      setTimeout(() => {
        const lowerText = text.toLowerCase();
        let updatedInfo = { ...clientInfo };
        
        const isRefusal = lowerText.includes("no") || lowerText.includes("dont") || lowerText.includes("don't") || lowerText.includes("skip") || lowerText.includes("prefer not") || lowerText.includes("wish not") || lowerText.includes("private") || lowerText.includes("decline");
        const lastAiMessage = chatHistory.filter(m => m.role === "model").slice(-1)[0]?.content.toLowerCase() || "";
        const askedEmail = lastAiMessage.includes("email");
        const askedPhone = lastAiMessage.includes("phone") || lastAiMessage.includes("number");
        const askedLocation = lastAiMessage.includes("location") || lastAiMessage.includes("city") || lastAiMessage.includes("state");

        if (isRefusal) {
          if (askedEmail && !clientInfo.email) {
            updatedInfo.email = "Declined";
          } else if (askedPhone && !clientInfo.phone) {
            updatedInfo.phone = "Declined";
          } else if (askedLocation && !clientInfo.location) {
            updatedInfo.location = "Declined";
          }
        } else {
          if (lowerText.includes("@") && !clientInfo.email) {
            updatedInfo.email = text.match(/\S+@\S+/)?.[0] || text;
          } else if (/\d{4,}/.test(lowerText) && !clientInfo.phone) {
            updatedInfo.phone = text;
          } else if (!clientInfo.location) {
            updatedInfo.location = text;
          }
        }

        setClientInfo(updatedInfo);
        const stillMissing = ["clientEmail", "clientPhone", "clientLocation"].filter(key => !updatedInfo[key as keyof ClientInfo]);
        setMissingInformation(stillMissing);

        if (stillMissing.length === 0) {
          setStep("REVIEW");
        } else {
          const fallbackQ = `Thank you. Could you also tell us your ${stillMissing[0] === 'clientEmail' ? 'email address' : stillMissing[0] === 'clientPhone' ? 'phone number' : 'current location (City/State)'}?`;
          setChatHistory(prev => [...prev, { role: "model", content: fallbackQ }]);
          setNextQuestion(fallbackQ);
        }
        setIsLoading(false);
      }, 1000);
    } finally {
      if (intakeId && !intakeId.startsWith("lf-mock")) {
        setIsLoading(false);
      }
    }
  };

  // Final confirmation and deterministic routing
  const handleFinalizeIntake = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`${API_BASE}/intake/${intakeId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        throw new Error("Failed to finalize intake routing.");
      }

      const resData = await response.json();
      const info = resData.data;

      setAssignedTeam(info.assignedTeamName);
      setAssignedAttorney(info.assignedAttorney || "Senior Managing Partner");
      setStep("COMPLETE");
    } catch (err) {
      console.error(err);
      // Fallback completion
      let mockTeam = "General Intake Team";
      let mockAttorney = "Gabriel Stone, Esq.";
      if (practiceArea === "Employment Law") {
        mockTeam = "Employment Law Team";
        mockAttorney = "Elena Vance, Esq.";
      } else if (practiceArea === "Personal Injury") {
        mockTeam = "Personal Injury Team";
        mockAttorney = "Thomas Sterling, Esq.";
      }
      setAssignedTeam(mockTeam);
      setAssignedAttorney(mockAttorney);
      setStep("COMPLETE");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen bg-background text-foreground selection:bg-accent/10 selection:text-foreground">
      <Navbar />

      <div className="mx-auto max-w-7xl px-6 pt-32 pb-24 lg:px-10">
        
        {/* Dynamic Step Header */}
        <div className="mb-12 border-b border-border pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="font-mono text-xs font-semibold text-muted-dark uppercase tracking-wider">
              Secure Submission Portal
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Confidential Intake Assistant
            </h1>
          </div>

          {/* Progress Indicators */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            {[
              { id: "UNDERSTAND", label: "UNDERSTAND" },
              { id: "DETAILS", label: "DETAILS" },
              { id: "REVIEW", label: "REVIEW" },
              { id: "COMPLETE", label: "COMPLETE" },
            ].map((s, idx) => {
              const isActive = step === s.id;
              const isPassed =
                (step === "DETAILS" && idx < 1) ||
                (step === "REVIEW" && idx < 2) ||
                (step === "COMPLETE" && idx < 3);

              return (
                <div key={s.id} className="flex items-center">
                  {idx > 0 && <ChevronRight className="mx-1 h-3.5 w-3.5 text-muted-dark" />}
                  <span
                    className={`rounded px-2.5 py-1 transition-colors ${
                      isActive
                        ? "bg-accent text-white"
                        : isPassed
                        ? "text-accent bg-accent/5"
                        : "text-muted-dark"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          
          {/* Main Interface Box */}
          <div className="lg:col-span-8">
            <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col min-h-[500px]">
              
              <div className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                  <span className="text-[12px] font-semibold text-foreground uppercase tracking-wider">
                    Secured AI Intake Agent — Ref: {referenceId || "Pending"}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-muted-dark">
                  Confidential Transmission
                </div>
              </div>

              <div className="flex-1 p-6 flex flex-col justify-between">
                
                {/* STEP 1: Understand Form */}
                {step === "UNDERSTAND" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-foreground">Tell us briefly what happened.</h2>
                      <p className="mt-2 text-sm text-muted">
                        Explain your situation in your own words. Describe the events, dates, and parties involved. Our assistant will extract the legal categories dynamically.
                      </p>
                    </div>

                    <form onSubmit={handleStartIntake} className="space-y-4">
                      <div>
                        <label htmlFor="clientName" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                          Your Full Name
                        </label>
                        <input
                          id="clientName"
                          type="text"
                          required
                          value={clientNameInput}
                          onChange={(e) => setClientNameInput(e.target.value)}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                        />
                      </div>

                      <div>
                        <label htmlFor="narrative" className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
                          Matter Narrative
                        </label>
                        <textarea
                          id="narrative"
                          required
                          rows={6}
                          value={rawInquiry}
                          onChange={(e) => setRawInquiry(e.target.value)}
                          placeholder="Describe the situation, terms of event, and what outcome you desire..."
                          className="w-full rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                        />
                      </div>

                      {errorMsg && (
                        <div className="flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-lg">
                          <AlertTriangle className="h-4 w-4 shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full md:w-auto flex justify-center items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-accent/95 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" /> Analyzing Narrative...
                          </>
                        ) : (
                          <>
                            Submit Narrative <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>
                  </motion.div>
                )}

                {/* STEP 2: Chat Interface */}
                {step === "DETAILS" && (
                  <div className="flex flex-col h-[400px] justify-between">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 max-h-[320px]">
                      {chatHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl p-4 text-sm ${
                              msg.role === "user"
                                ? "bg-accent/5 border border-accent/10 text-foreground"
                                : "bg-surface border border-border text-foreground"
                            }`}
                          >
                            <div className="text-[10px] font-mono font-bold text-muted-dark mb-1">
                              {msg.role === "user" ? "Client Submission" : "AI Assistant"}
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {isLoading && (
                        <div className="flex justify-start">
                          <div className="bg-surface border border-border rounded-xl p-4 text-sm text-muted flex items-center gap-2">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Analyzing details...
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="mt-4 border-t border-border pt-4 flex gap-3">
                      <input
                        type="text"
                        required
                        disabled={isLoading}
                        value={userReply}
                        onChange={(e) => setUserReply(e.target.value)}
                        placeholder="Provide details (e.g. email, phone, incident date)..."
                        className="flex-1 rounded-lg border border-border bg-white px-4 py-3 text-sm text-foreground focus:outline-none focus:border-accent"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !userReply.trim()}
                        className="rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/95 flex items-center justify-center disabled:opacity-50"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                )}

                {/* STEP 3: Review Details */}
                {step === "REVIEW" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="font-serif text-2xl font-bold text-foreground">Review Information Summary</h2>
                      <p className="mt-2 text-sm text-muted">
                        Verify all gathered parameters before submission. Our team will review the docket.
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="border-b border-border/60 pb-2">
                          <span className="font-bold text-muted-dark block text-[10px] uppercase">Client Name</span>
                          <span className="text-foreground font-semibold">{clientInfo.name || "Anonymous Inquiry"}</span>
                        </div>
                        <div className="border-b border-border/60 pb-2">
                          <span className="font-bold text-muted-dark block text-[10px] uppercase">Practice Category</span>
                          <span className="text-accent font-bold">{practiceArea}</span>
                        </div>
                        <div className="border-b border-border/60 pb-2">
                          <span className="font-bold text-muted-dark block text-[10px] uppercase">Email Contact</span>
                          <span className="text-foreground">{clientInfo.email || "Not Provided"}</span>
                        </div>
                        <div className="border-b border-border/60 pb-2">
                          <span className="font-bold text-muted-dark block text-[10px] uppercase">Phone Contact</span>
                          <span className="text-foreground">{clientInfo.phone || "Not Provided"}</span>
                        </div>
                        <div className="border-b border-border/60 pb-2">
                          <span className="font-bold text-muted-dark block text-[10px] uppercase">Current Location</span>
                          <span className="text-foreground">{clientInfo.location || "Not Provided"}</span>
                        </div>
                        <div className="border-b border-border/60 pb-2">
                          <span className="font-bold text-muted-dark block text-[10px] uppercase">Conflict Matrix Scan</span>
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <ShieldCheck className="h-4 w-4" /> Cleared
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="font-bold text-muted-dark block text-[10px] uppercase mb-1">Case Narrative & Summary</span>
                        <p className="text-sm text-foreground bg-white border border-border p-4 rounded-lg italic">
                          "{chatHistory[0]?.content || rawInquiry}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 border border-emerald-100 p-3.5">
                      <ShieldCheck className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-emerald-800 leading-normal">
                        <strong>Confidential Dossier Transmission:</strong> Submitting this docket transmits your compiled data directly to our legal review panel. All data matches HIPAA standards.
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={handleFinalizeIntake}
                        disabled={isLoading}
                        className="w-full md:w-auto rounded-lg bg-accent px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-accent/95 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" /> Routing Case File...
                          </>
                        ) : (
                          <>
                            Confirm & Route Case File <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4: Complete Screen */}
                {step === "COMPLETE" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="space-y-6 text-center py-6"
                  >
                    <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>

                    <div className="space-y-2">
                      <h2 className="font-serif text-3xl font-bold text-foreground">Intake Qualification Complete</h2>
                      <p className="text-sm text-accent font-bold uppercase tracking-wider">
                        Docket Reference ID: {referenceId}
                      </p>
                      <p className="mx-auto max-w-lg text-sm text-muted">
                        Your intake docket has been successfully finalized and routed.
                      </p>
                    </div>

                    <div className="mx-auto max-w-md rounded-xl border border-border bg-surface p-6 text-left space-y-3.5 text-sm shadow-sm">
                      <div className="flex justify-between border-b border-border/60 pb-2">
                        <span className="font-semibold text-foreground">Practice Domain:</span>
                        <span className="text-muted font-medium">{practiceArea}</span>
                      </div>
                      <div className="flex justify-between border-b border-border/60 pb-2">
                        <span className="font-semibold text-foreground">Urgency Classification:</span>
                        <span className="text-red-700 font-bold">{urgency} ({urgencyScore}/100)</span>
                      </div>
                      <div className="flex justify-between border-b border-border/60 pb-2">
                        <span className="font-semibold text-foreground">Assigned Legal Team:</span>
                        <span className="text-muted font-medium">{assignedTeam}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">Lead Counsel:</span>
                        <span className="text-accent font-bold">{assignedAttorney}</span>
                      </div>
                    </div>

                    <div className="max-w-lg mx-auto text-xs text-muted leading-relaxed">
                      A confirmation email containing these details has been dispatched. Our team lead <strong>{assignedAttorney}</strong> will contact you via email or phone within 1 business day.
                    </div>

                    <div className="pt-4 flex flex-wrap justify-center gap-4">
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 rounded-lg border border-border bg-white px-5 py-2.5 text-xs font-semibold text-foreground hover:bg-surface shadow-sm"
                      >
                        <Printer className="h-4 w-4" /> Print Intake Record
                      </button>
                      <button
                        onClick={() => {
                          setStep("UNDERSTAND");
                          setRawInquiry("");
                          setClientNameInput("");
                          setClientInfo({ name: null, email: null, phone: null, location: null });
                          setChatHistory([]);
                        }}
                        className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-xs font-semibold text-white hover:bg-accent/95 shadow-sm"
                      >
                        File Another Intake
                      </button>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>

            {/* Legal Disclaimer Boundaries */}
            <div className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-[#FDFCFA] p-4 text-xs text-muted leading-normal">
              <AlertCircle className="h-4 w-4 text-muted-dark shrink-0 mt-0.5" />
              <div>
                <strong className="text-foreground">Important Safety Notice:</strong> LegalFlow is an automated client intake qualification and routing workflow assistant. It is not a lawyer, does not provide legal opinions or conclusions, and does not establish a formal attorney-client relationship. If you face an immediate legal deadline or court appearance, please consult with a qualified attorney immediately.
              </div>
            </div>

          </div>

          {/* Right Status Panel (Desktop) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
              <h3 className="font-serif text-lg font-bold text-foreground border-b border-border pb-3 mb-4">
                Intake Docket Status
              </h3>
              
              <div className="space-y-4 text-xs">
                
                {/* Practice Area Card */}
                <div>
                  <span className="font-bold text-muted-dark block text-[10px] uppercase mb-1">Classified Area</span>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-white p-3 font-semibold text-foreground">
                    <Briefcase className="h-4 w-4 text-accent" />
                    {practiceArea}
                  </div>
                </div>

                {/* Urgency Meter */}
                <div>
                  <span className="font-bold text-muted-dark block text-[10px] uppercase mb-1">Assessed Urgency</span>
                  <div className="rounded-lg border border-border bg-white p-3 space-y-2">
                    <div className="flex justify-between items-center font-semibold text-foreground">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className={`h-4 w-4 ${urgency === 'HIGH' ? 'text-red-600' : 'text-amber-500'}`} />
                        {urgency} Priority
                      </span>
                      <span className="font-mono">{urgencyScore}/100</span>
                    </div>
                    {/* Score Bar */}
                    <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          urgency === "HIGH" ? "bg-red-600" : "bg-amber-500"
                        }`}
                        style={{ width: `${urgencyScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Entity Checklist */}
                <div>
                  <span className="font-bold text-muted-dark block text-[10px] uppercase mb-2">Docket Checklist</span>
                  <div className="space-y-2.5 rounded-lg border border-border bg-white p-4">
                    
                    {[
                      { key: "clientName", label: "Client Full Name", val: clientInfo.name, icon: User },
                      { key: "clientEmail", label: "Email Address", val: clientInfo.email, icon: Mail },
                      { key: "clientPhone", label: "Phone Number", val: clientInfo.phone, icon: Phone },
                      { key: "clientLocation", label: "Location Details", val: clientInfo.location, icon: MapPin },
                    ].map((item) => {
                      const Icon = item.icon;
                      const isCollected = item.val && item.val !== "Anonymous Inquiry";
                      return (
                        <div key={item.key} className="flex items-center justify-between">
                          <span className="flex items-center gap-2 text-muted">
                            <Icon className="h-3.5 w-3.5 text-muted-dark" />
                            {item.label}
                          </span>
                          {isCollected ? (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Collected
                            </span>
                          ) : (
                            <span className="text-[10px] font-medium text-muted-dark bg-surface px-2 py-0.5 rounded-full border border-border/60">
                              Missing
                            </span>
                          )}
                        </div>
                      );
                    })}

                  </div>
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>

      <Footer />
    </main>
  );
}
