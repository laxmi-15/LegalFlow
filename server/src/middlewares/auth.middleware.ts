import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: "ADMIN" | "LAWYER";
    teamId?: string | null;
    name: string;
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  let token = "";

  // 1. Check cookies
  if (req.headers.cookie) {
    const cookies = req.headers.cookie.split(";").reduce((acc: Record<string, string>, cookie) => {
      const parts = cookie.split("=");
      acc[parts[0].trim()] = (parts[1] || "").trim();
      return acc;
    }, {});
    token = cookies.token || "";
  }

  // 2. Check Authorization header
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    res.status(401).json({ success: false, error: "Unauthorized", message: "Authentication token missing." });
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as any;
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      teamId: decoded.teamId || null,
      name: decoded.name,
    };
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: "Unauthorized", message: "Invalid or expired token." });
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: "Unauthorized", message: "Authentication required." });
    return;
  }

  if (req.user.role !== "ADMIN") {
    res.status(403).json({ success: false, error: "Forbidden", message: "Admin access privileges required." });
    return;
  }

  next();
}

export function requireLawyerOrAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: "Unauthorized", message: "Authentication required." });
    return;
  }

  if (req.user.role !== "ADMIN" && req.user.role !== "LAWYER") {
    res.status(403).json({ success: false, error: "Forbidden", message: "Insufficient permissions." });
    return;
  }

  next();
}
