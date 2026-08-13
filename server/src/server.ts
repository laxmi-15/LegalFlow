import express from "express";
import cors from "cors";
import { ENV } from "./config/env";
import intakeRoutes from "./routes/intake.routes";
import authRoutes from "./routes/auth.routes";
import { initializeDatabase } from "./services/db.service";

// Prevent server crash on unhandled promise rejections or uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ [Unhandled Rejection at Promise]:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("⚠️ [Uncaught Exception]:", error);
});

const app = express();

// Initialize the database / fallback engine
initializeDatabase().then(() => {
  console.log("💼 LegalFlow Core DB Service ready.");
});

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    service: "Route Law Firm AI Intake Backend",
    version: "1.0.0",
    geminiConfigured: Boolean(ENV.GEMINI_API_KEY),
    telegramConfigured: Boolean(ENV.TELEGRAM_BOT_TOKEN && ENV.TELEGRAM_CHAT_ID),
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", intakeRoutes);

// Error Handling Middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[Unhandled Express Error]:", err);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred",
  });
});

const PORT = parseInt(ENV.PORT, 10) || 5000;

app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Route AI Agent Express Server Running on Port ${PORT}`);
  console.log(`📍 Endpoint: http://localhost:${PORT}/api/intake`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`==================================================\n`);
});
