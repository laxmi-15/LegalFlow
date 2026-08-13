import { Router } from "express";
import {
  startIntake,
  submitMessage,
  completeIntake,
  getIntakeStatus,
  listIntakes,
  getIntakeDetails,
  getPracticeAreas,
  getRoutingRules,
} from "../controllers/intake.controller";
import { requireAuth, requireAdmin } from "../middlewares/auth.middleware";

const router = Router();

// CLIENT INTAKE FLOW ENDPOINTS
router.post("/intake/start", startIntake);
router.post("/intake/:id/message", submitMessage);
router.post("/intake/:id/complete", completeIntake);
router.get("/intake/:id", getIntakeStatus);

// ADMIN DASHBOARD / COMMAND CENTER ENDPOINTS
router.get("/intakes", requireAuth, listIntakes as any);
router.get("/intakes/:id", requireAuth, getIntakeDetails as any);
router.get("/practice-areas", requireAuth, getPracticeAreas as any);
router.get("/routing-rules", requireAuth, requireAdmin, getRoutingRules as any);

export default router;
