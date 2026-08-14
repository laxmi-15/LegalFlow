import { Request, Response } from "express";
import { DBService, UrgencyLevel, ConflictStatus } from "../services/db.service";
import { llmService, ChatMessage } from "../services/llm/llm.service";
import { RoutingService } from "../services/routing.service";
import { EmailService } from "../services/email.service";
import { sendTelegramNotification } from "../services/telegram.service";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

/**
 * Helper to build visual logs of conversations
 */
function buildChatHistoryText(history: ChatMessage[]): string {
  return history
    .map(msg => `${msg.role === "user" ? "Client" : "Assistant"}: ${msg.content}`)
    .join("\n");
}

/**
 * Helper to generate reference code e.g. LF-2026-X123
 */
function generateReferenceCode(): string {
  const year = new Date().getFullYear();
  const randNum = Math.floor(1000 + Math.random() * 9000);
  return `LF-${year}-${randNum}`;
}

// 1. START INTAKE SESSION
export async function startIntake(req: Request, res: Response): Promise<void> {
  try {
    const { inquiryText, clientName, clientEmail, clientPhone, clientLocation } = req.body;

    if (!inquiryText || typeof inquiryText !== "string" || inquiryText.trim().length === 0) {
      res.status(400).json({ success: false, error: "Initial inquiryText is required to start intake." });
      return;
    }

    console.log(`[startIntake] Starting session with initial input: "${inquiryText.substring(0, 80)}..."`);

    // First-pass LLM Extraction
    const extracted = await llmService.extractIntake(inquiryText);

    // Overrides from manual form fields if client supplied them explicitly
    if (clientName && clientName.trim().length > 0) extracted.clientName = clientName.trim();
    if (clientEmail && clientEmail.trim().length > 0) extracted.clientEmail = clientEmail.trim();
    if (clientPhone && clientPhone.trim().length > 0) extracted.clientPhone = clientPhone.trim();
    if (clientLocation && clientLocation.trim().length > 0) extracted.clientLocation = clientLocation.trim();

    // Create chat history logs
    const chatHistory: ChatMessage[] = [
      { role: "user", content: inquiryText }
    ];

    // Determine next question
    let nextQuestion = "";
    if (extracted.missingInformation.length > 0) {
      nextQuestion = await llmService.generateQuestion(chatHistory, extracted.missingInformation);
      chatHistory.push({ role: "model", content: nextQuestion });
    }

    const referenceId = generateReferenceCode();
    
    // Save as DRAFT state in database
    const saved = await DBService.createIntake({
      referenceId,
      clientName: extracted.clientName,
      clientEmail: extracted.clientEmail,
      clientPhone: extracted.clientPhone,
      clientLocation: extracted.clientLocation,
      practiceArea: extracted.practiceArea,
      urgency: extracted.urgency as UrgencyLevel,
      urgencyScore: extracted.urgencyScore,
      summary: extracted.summary,
      rawInquiry: inquiryText,
      conflictStatus: extracted.conflictStatus as ConflictStatus,
      estValue: extracted.estValue,
      assignedAttorney: null,
      assignedTeamId: null,
      status: "DRAFT",
      incidentDate: extracted.incidentDate,
      relevantParties: extracted.relevantParties.join(", "),
      desiredOutcome: extracted.desiredOutcome,
      missingInfo: extracted.missingInformation.join(", "),
      chatHistory: JSON.stringify(chatHistory),
    });

    res.status(201).json({
      success: true,
      data: {
        id: saved.id,
        referenceId: saved.referenceId,
        status: "UNDERSTAND",
        practiceArea: saved.practiceArea,
        clientInfo: {
          name: saved.clientName,
          email: saved.clientEmail,
          phone: saved.clientPhone,
          location: saved.clientLocation,
        },
        urgency: saved.urgency,
        urgencyScore: saved.urgencyScore,
        missingInformation: extracted.missingInformation,
        nextQuestion: nextQuestion || null,
        chatHistory,
      }
    });
  } catch (error) {
    console.error("[startIntake Error]:", error);
    res.status(500).json({ success: false, error: "Failed to initialize client intake session." });
  }
}

// 2. SUBMIT CHAT MESSAGE
export async function submitMessage(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const { messageText } = req.body;

    if (!messageText || typeof messageText !== "string" || messageText.trim().length === 0) {
      res.status(400).json({ success: false, error: "messageText is required." });
      return;
    }

    // Load current state
    const intake = await DBService.getIntakeById(id);
    if (!intake) {
      res.status(404).json({ success: false, error: "Intake session not found." });
      return;
    }

    // Secure status updates from admin command center
    const isStatusUpdate = messageText.startsWith("System directive: Set status to ");
    if (isStatusUpdate) {
      let token = "";
      if (req.headers.cookie) {
        const cookies = req.headers.cookie.split(";").reduce((acc: Record<string, string>, cookie) => {
          const parts = cookie.split("=");
          acc[parts[0].trim()] = (parts[1] || "").trim();
          return acc;
        }, {});
        token = cookies.token || "";
      }
      if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
      }

      if (!token) {
        res.status(401).json({ success: false, error: "Unauthorized", message: "Authentication required to update status." });
        return;
      }

      try {
        const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
        if (decoded.role === "LAWYER" && intake.assignedTeamId !== decoded.teamId) {
          res.status(403).json({ success: false, error: "Forbidden", message: "You are not authorized to update status for other teams." });
          return;
        }

        const newStatus = messageText.substring("System directive: Set status to ".length).trim();
        const updated = await DBService.updateIntake(id, {
          status: newStatus,
        });

        res.status(200).json({
          success: true,
          message: `Status updated to ${newStatus} successfully.`,
          data: {
            id: updated.id,
            referenceId: updated.referenceId,
            status: updated.status,
            practiceArea: updated.practiceArea,
            urgency: updated.urgency,
            urgencyScore: updated.urgencyScore,
          }
        });
        return;
      } catch (err: any) {
        if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
          res.status(401).json({ success: false, error: "Unauthorized", message: "Invalid or expired session token." });
          return;
        }
        console.error("[isStatusUpdate Error]:", err);
        res.status(500).json({ success: false, error: "Failed to update intake status." });
        return;
      }
    }

    console.log(`[submitMessage] Intake ${id} user message: "${messageText}"`);

    // Parse chat history
    let chatHistory: ChatMessage[] = [];
    try {
      chatHistory = intake.chatHistory ? JSON.parse(intake.chatHistory) : [];
    } catch (e) {
      chatHistory = [{ role: "user", content: intake.rawInquiry }];
    }

    // Append new message
    chatHistory.push({ role: "user", content: messageText });

    // Build overall history block for LLM parsing context
    const historyText = buildChatHistoryText(chatHistory);

    // Re-extract data using context
    const extracted = await llmService.extractIntake(intake.rawInquiry, historyText);

    // Merge logic: keep previously extracted fields if current extraction is empty
    const mergedData = {
      clientName: extracted.clientName !== "Anonymous Inquiry" ? extracted.clientName : (intake.clientName || "Anonymous Inquiry"),
      clientEmail: extracted.clientEmail || intake.clientEmail,
      clientPhone: extracted.clientPhone || intake.clientPhone,
      clientLocation: extracted.clientLocation || intake.clientLocation,
      practiceArea: extracted.practiceArea !== "Other / Unknown" ? extracted.practiceArea : (intake.practiceArea || "Other / Unknown"),
      urgency: extracted.urgency || intake.urgency,
      urgencyScore: Math.max(extracted.urgencyScore, intake.urgencyScore),
      summary: extracted.summary || intake.summary,
      conflictStatus: extracted.conflictStatus || intake.conflictStatus,
      estValue: extracted.estValue || intake.estValue,
      incidentDate: extracted.incidentDate || intake.incidentDate,
      relevantParties: extracted.relevantParties.length > 0 ? extracted.relevantParties.join(", ") : intake.relevantParties,
      desiredOutcome: extracted.desiredOutcome || intake.desiredOutcome,
      missingInfo: extracted.missingInformation.join(", "),
    };

    // Check if we can complete:
    // Transition to REVIEW if missing fields are resolved OR conversation turns exceed 5 turns (2 users, 2 models + this user = 5 entries)
    const tooManyTurns = chatHistory.length >= 7;
    const noMissingDetails = extracted.missingInformation.length === 0;

    let nextQuestion = "";
    let status = "DETAILS";

    if (noMissingDetails || tooManyTurns) {
      status = "REVIEW";
      nextQuestion = "";
    } else {
      nextQuestion = await llmService.generateQuestion(chatHistory, extracted.missingInformation);
      chatHistory.push({ role: "model", content: nextQuestion });
    }

    // Update database
    const updated = await DBService.updateIntake(id, {
      clientName: mergedData.clientName,
      clientEmail: mergedData.clientEmail,
      clientPhone: mergedData.clientPhone,
      clientLocation: mergedData.clientLocation,
      practiceArea: mergedData.practiceArea,
      urgency: mergedData.urgency as UrgencyLevel,
      urgencyScore: mergedData.urgencyScore,
      summary: mergedData.summary,
      conflictStatus: mergedData.conflictStatus as ConflictStatus,
      estValue: mergedData.estValue,
      incidentDate: mergedData.incidentDate,
      relevantParties: mergedData.relevantParties,
      desiredOutcome: mergedData.desiredOutcome,
      missingInfo: mergedData.missingInfo,
      chatHistory: JSON.stringify(chatHistory),
      status: status === "REVIEW" ? "REVIEW" : "DRAFT",
    });

    res.status(200).json({
      success: true,
      data: {
        id: updated.id,
        referenceId: updated.referenceId,
        status,
        practiceArea: updated.practiceArea,
        clientInfo: {
          name: updated.clientName,
          email: updated.clientEmail,
          phone: updated.clientPhone,
          location: updated.clientLocation,
        },
        urgency: updated.urgency,
        urgencyScore: updated.urgencyScore,
        missingInformation: extracted.missingInformation,
        nextQuestion: nextQuestion || null,
        chatHistory,
      }
    });
  } catch (error) {
    console.error("[submitMessage Error]:", error);
    res.status(500).json({ success: false, error: "Failed to process chat response." });
  }
}

// 3. COMPLETE & ROUTE INTAKE
export async function completeIntake(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;

    // Load draft intake
    const intake = await DBService.getIntakeById(id);
    if (!intake) {
      res.status(404).json({ success: false, error: "Intake record not found." });
      return;
    }

    console.log(`[completeIntake] Finalizing intake ${id} for client: ${intake.clientName}`);

    // Deterministic Routing rules lookup
    const routingResult = await RoutingService.routeIntake(intake.practiceArea);

    // Commit state
    const finalized = await DBService.updateIntake(id, {
      status: "NEW", // NEW status pushes it to active admin dashboard queues
      assignedTeamId: routingResult.assignedTeamId,
      assignedAttorney: routingResult.assignedAttorney,
    });

    // Send notifications asynchronously to keep API fast
    // 1. Resend Email Dispatch
    // Internal Staff Email
    const internalMail = EmailService.buildInternalTemplate(finalized, routingResult.assignedTeamName);
    EmailService.sendEmail({
      to: routingResult.assignedEmail,
      subject: `[LEGALFLOW] New Case Assigned: ${finalized.referenceId} (${finalized.practiceArea})`,
      htmlContent: internalMail
    }, finalized.id).catch(err => console.error("Internal Email failed:", err));

    // Client Confirmation Email
    if (finalized.clientEmail && finalized.clientEmail !== "Declined") {
      const clientMail = EmailService.buildClientConfirmationTemplate(finalized);
      EmailService.sendEmail({
        to: finalized.clientEmail,
        subject: `LegalFlow Submission Received - Ref: ${finalized.referenceId}`,
        htmlContent: clientMail
      }, finalized.id, true).catch(err => console.error("Client Email failed:", err));
    }

    // 2. Telegram Alert Dispatch (uses preexisting telegram helper)
    sendTelegramNotification({
      id: finalized.id,
      clientName: finalized.clientName,
      practiceArea: finalized.practiceArea,
      urgency: finalized.urgency,
      urgencyScore: finalized.urgencyScore,
      summary: finalized.summary,
      conflictStatus: finalized.conflictStatus,
      assignedAttorney: finalized.assignedAttorney || "Managing Partner",
      estValue: finalized.estValue || "Pending Evaluation",
      rawInquiry: finalized.rawInquiry
    }).catch(err => console.error("Telegram Dispatch failed:", err));

    res.status(200).json({
      success: true,
      message: "Intake finalized and routed successfully.",
      data: {
        id: finalized.id,
        referenceId: finalized.referenceId,
        status: "COMPLETE",
        practiceArea: finalized.practiceArea,
        assignedTeamName: routingResult.assignedTeamName,
        assignedAttorney: "Firm Counsel",
        urgency: finalized.urgency,
        urgencyScore: finalized.urgencyScore,
        createdAt: finalized.createdAt,
      }
    });
  } catch (error) {
    console.error("[completeIntake Error]:", error);
    res.status(500).json({ success: false, error: "Failed to finalize and route client intake." });
  }
}

// 4. GET INTAKE STATUS
export async function getIntakeStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = req.params.id as string;
    const record = await DBService.getIntakeById(id);
    if (!record) {
      res.status(404).json({ success: false, error: "Intake not found." });
      return;
    }

    let chatHistory: ChatMessage[] = [];
    try {
      chatHistory = record.chatHistory ? JSON.parse(record.chatHistory) : [];
    } catch (e) {
      chatHistory = [];
    }

    res.status(200).json({
      success: true,
      data: {
        id: record.id,
        referenceId: record.referenceId,
        status: record.status === "DRAFT" ? "DETAILS" : record.status,
        practiceArea: record.practiceArea,
        clientInfo: {
          name: record.clientName,
          email: record.clientEmail,
          phone: record.clientPhone,
          location: record.clientLocation,
        },
        urgency: record.urgency,
        urgencyScore: record.urgencyScore,
        missingInformation: record.missingInfo ? record.missingInfo.split(", ") : [],
        chatHistory,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch intake status." });
  }
}

// 5. GET ALL INTAKES (ADMIN DASHBOARD)
export async function listIntakes(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Unauthorized", message: "User session missing." });
      return;
    }

    const intakes = await DBService.getIntakes();
    const { search, status, practiceArea, urgency } = req.query;

    let filtered = intakes;

    // Filter out DRAFT entries from the production admin dashboard
    filtered = filtered.filter(item => item.status !== "DRAFT");

    // Apply role-based query restrictions
    if (user.role === "LAWYER") {
      if (!user.teamId) {
        filtered = [];
      } else {
        filtered = filtered.filter(item => item.assignedTeamId === user.teamId);
      }
    }

    if (status) {
      filtered = filtered.filter(item => item.status.toLowerCase() === (status as string).toLowerCase());
    }
    if (practiceArea) {
      filtered = filtered.filter(item => item.practiceArea.toLowerCase() === (practiceArea as string).toLowerCase());
    }
    if (urgency) {
      filtered = filtered.filter(item => item.urgency.toLowerCase() === (urgency as string).toLowerCase());
    }

    if (search) {
      const q = (search as string).toLowerCase();
      filtered = filtered.filter(
        item =>
          item.clientName.toLowerCase().includes(q) ||
          item.referenceId.toLowerCase().includes(q) ||
          item.practiceArea.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          (item.clientLocation && item.clientLocation.toLowerCase().includes(q))
      );
    }

    res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to list intakes for command center." });
  }
}

// 6. GET INTAKE DETAILS
export async function getIntakeDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Unauthorized", message: "User session missing." });
      return;
    }

    const id = req.params.id as string;
    const intake = await DBService.getIntakeById(id);
    if (!intake) {
      res.status(404).json({ success: false, error: "Intake record not found." });
      return;
    }

    // Role check: LAWYER can only access cases assigned to their own team
    if (user.role === "LAWYER" && intake.assignedTeamId !== user.teamId) {
      res.status(403).json({ success: false, error: "Forbidden", message: "You are not authorized to access this case." });
      return;
    }

    res.status(200).json({
      success: true,
      data: intake,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to retrieve intake details." });
  }
}

// 7. GET CONFIGURABLE PRACTICE AREAS
export async function getPracticeAreas(_req: Request, res: Response): Promise<void> {
  try {
    const list = await DBService.getPracticeAreas();
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to retrieve practice areas." });
  }
}

// 8. GET CONFIGURABLE ROUTING RULES
export async function getRoutingRules(_req: Request, res: Response): Promise<void> {
  try {
    const list = await DBService.getRoutingRules();
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to retrieve routing rules." });
  }
}
