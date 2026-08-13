import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { DBService } from "../services/db.service";
import { ENV } from "../config/env";
import { AuthenticatedRequest } from "../middlewares/auth.middleware";

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, error: "Bad Request", message: "Email and password are required." });
      return;
    }

    const user = await DBService.getUserByEmail(email);
    if (!user) {
      // Avoid revealing if email exists or not for security
      res.status(401).json({ success: false, error: "Unauthorized", message: "Unable to verify those credentials." });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: "Unauthorized", message: "Unable to verify those credentials." });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        name: user.name,
      },
      ENV.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        teamId: user.teamId,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("[Auth Controller Login Error]:", error);
    res.status(500).json({ success: false, error: "Internal Server Error", message: "Failed to authenticate." });
  }
}

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Unauthorized", message: "Session expired or invalid." });
      return;
    }

    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.error("[Auth Controller Me Error]:", error);
    res.status(500).json({ success: false, error: "Internal Server Error", message: "Failed to fetch user session." });
  }
}
