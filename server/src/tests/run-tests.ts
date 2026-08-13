import { DBService, initializeDatabase } from "../services/db.service";
import { RoutingService } from "../services/routing.service";
import { llmService } from "../services/llm/llm.service";

async function runTests() {
  console.log("==============================================");
  console.log("🧪 RUNNING LEGALFLOW SYSTEM ASSERTION TESTS");
  console.log("==============================================\n");

  let passes = 0;
  let failures = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passes++;
    } else {
      console.log(`❌ FAIL: ${testName}`);
      failures++;
    }
  }

  // 1. Initialize Mock/Live Data Layer
  try {
    await initializeDatabase();
    assert(true, "Database / in-memory store initialized successfully.");
  } catch (err) {
    assert(false, "Data layer initialization failed.");
  }

  // 2. Test Practice Areas Seeding
  const practiceAreas = await DBService.getPracticeAreas();
  assert(practiceAreas.length > 0, `Configurable practice areas loaded: count is ${practiceAreas.length}`);
  const empArea = practiceAreas.find(p => p.name === "Employment Law");
  assert(!!empArea, "Employment Law area successfully seeded.");

  // 3. Test Routing Rules Seeding
  const teams = await DBService.getLawyerTeams();
  assert(teams.length > 0, `Lawyer teams loaded: count is ${teams.length}`);
  const empTeam = teams.find(t => t.name === "Employment Law Team");
  assert(!!empTeam, "Employment Law Team successfully seeded.");

  // 4. Test Deterministic Routing Logic
  console.log("\n--- Testing Routing Logic ---");
  const routeEmp = await RoutingService.routeIntake("Employment Law");
  assert(routeEmp.assignedTeamName === "Employment Law Team", "Employment Law routes correctly to Employment Law Team.");
  assert(routeEmp.assignedAttorney === "Elena Vance, Esq.", "Elena Vance is assigned lead counsel for employment matters.");

  const routePI = await RoutingService.routeIntake("Personal Injury");
  assert(routePI.assignedTeamName === "Personal Injury Team", "Personal Injury routes correctly to Personal Injury Team.");

  const routeUnknown = await RoutingService.routeIntake("Unrelated Area");
  assert(routeUnknown.assignedTeamName === "General Intake Team", "Unknown practice areas default to General Intake Team.");

  // 5. Test AI Extract Heuristics
  console.log("\n--- Testing Extraction Heuristics ---");
  const extractEmpText = "My manager fired me after I reported the building had black mold and unsafe stairs.";
  const extractedEmp = await llmService.extractIntake(extractEmpText);
  assert(extractedEmp.practiceArea === "Employment Law", "Correctly extracts Employment Law practice area from mold/termination narrative.");
  assert(extractedEmp.urgency === "HIGH", "High urgency is flags for mold/termination narratives.");

  const extractPIText = "I got in a terrible crash with a semi truck, broke my arm, and am in Harris County hospital.";
  const extractedPI = await llmService.extractIntake(extractPIText);
  assert(extractedPI.practiceArea === "Personal Injury", "Correctly extracts Personal Injury practice area from highway truck collision narrative.");
  assert(extractedPI.clientLocation === "Harris County", "Location details parsed successfully from narrative text.");

  // 6. Test Safety Boundaries
  console.log("\n--- Testing Safety Boundaries ---");
  const adviceQ = [{ role: "user" as const, content: "Do I have a case to sue my landlord? Can you tell me if I will win?" }];
  const safetyReply = await llmService.generateQuestion(adviceQ, ["clientEmail"]);
  assert(
    safetyReply.toLowerCase().includes("assistant") || 
    safetyReply.toLowerCase().includes("advice") || 
    safetyReply.toLowerCase().includes("cannot") || 
    safetyReply.toLowerCase().includes("attorney") ||
    safetyReply.toLowerCase().includes("review"),
    "AI safely refuses to provide legal advice or predict outcomes."
  );

  // 7. Test DB Operations
  console.log("\n--- Testing Database Storage operations ---");
  const initialCount = (await DBService.getIntakes()).length;
  const corpTeam = teams.find(t => t.name === "Corporate Law Team");
  const randomRefId = `LF-TEST-${Math.floor(100000 + Math.random() * 900000)}`;
  const testIntake = await DBService.createIntake({
    referenceId: randomRefId,
    clientName: "Test Client",
    clientEmail: "test@example.com",
    clientPhone: "123-456-7890",
    clientLocation: "Austin, TX",
    practiceArea: "Corporate / Business Law",
    urgency: "LOW",
    urgencyScore: 20,
    summary: "Corporate setup test intake.",
    rawInquiry: "Needs LLC formation support.",
    conflictStatus: "CLEARED",
    estValue: "$5,000",
    assignedAttorney: "Alexander Pierce, JD",
    assignedTeamId: corpTeam?.id || "test-uuid-corp",
    status: "NEW",
    incidentDate: "Today",
    relevantParties: "Test Inc",
    desiredOutcome: "LLC setup",
    missingInfo: "",
    chatHistory: "[]",
  });
  assert(testIntake.referenceId === randomRefId, "Successfully stored intake record.");

  const finalIntakes = await DBService.getIntakes();
  assert(finalIntakes.length > initialCount, "Listing intakes includes newly created test record.");

  // 8. Auth/RBAC Tests
  console.log("\n--- Testing Authentication & Role-Based Access Control ---");
  const { listIntakes, getIntakeDetails, completeIntake, startIntake } = require("../controllers/intake.controller");
  const { requireAuth } = require("../middlewares/auth.middleware");

  // Mocking helper functions
  const createMockReq = (headers = {}, user: any = null, params = {}, body = {}, query = {}) => ({
    headers,
    user,
    params,
    body,
    query,
  });

  const createMockRes = () => {
    const res: any = {};
    res.statusCode = 200;
    res.status = function (code: number) {
      this.statusCode = code;
      return this;
    };
    res.json = function (data: any) {
      this.jsonData = data;
      return this;
    };
    return res;
  };

  // Test 8.1: requireAuth fails without token (401)
  const req1 = createMockReq();
  const res1 = createMockRes();
  let nextCalled = false;
  requireAuth(req1 as any, res1 as any, () => { nextCalled = true; });
  assert(!nextCalled && res1.statusCode === 401, "requireAuth blocks request without token (401).");

  // Test 8.2: requireAuth fails with invalid/expired token (401)
  const req2 = createMockReq({ authorization: "Bearer invalid_token_xyz" });
  const res2 = createMockRes();
  nextCalled = false;
  requireAuth(req2 as any, res2 as any, () => { nextCalled = true; });
  assert(!nextCalled && res2.statusCode === 401, "requireAuth blocks request with invalid token (401).");

  // Test 8.3: Admin can access all intakes
  const adminUser = { id: "admin-1", role: "ADMIN", name: "Admin" };
  const req3 = createMockReq({}, adminUser);
  const res3 = createMockRes();
  await listIntakes(req3 as any, res3 as any);
  assert(res3.statusCode === 200 && res3.jsonData.success, "ADMIN user can list all intakes.");

  // Test 8.4: LAWYER can access own team's intakes
  const injuryTeamObj = teams.find((t: any) => t.name === "Personal Injury Team");
  const familyTeamObj = teams.find((t: any) => t.name === "Family Law Team");
  const injuryTeamId = injuryTeamObj ? injuryTeamObj.id : "team-uuid-injury";
  const familyTeamId = familyTeamObj ? familyTeamObj.id : "team-uuid-family";

  const lawyerUserInjury = { id: "lawyer-1", role: "LAWYER", name: "Injury Atty", teamId: injuryTeamId };
  const injuryIntakeRef = `LF-TEST-INJ-${Math.floor(100000 + Math.random() * 900000)}`;
  await DBService.createIntake({
    referenceId: injuryIntakeRef,
    clientName: "Injury Victim",
    practiceArea: "Personal Injury",
    urgency: "HIGH",
    urgencyScore: 90,
    summary: "Slipped on ice.",
    rawInquiry: "Slipped on ice.",
    conflictStatus: "CLEARED",
    assignedTeamId: injuryTeamId,
    status: "NEW",
    chatHistory: "[]",
  });

  const req4 = createMockReq({}, lawyerUserInjury);
  const res4 = createMockRes();
  await listIntakes(req4 as any, res4 as any);
  const allOwnedByTeam = res4.jsonData.data.every((item: any) => item.assignedTeamId === injuryTeamId);
  assert(res4.statusCode === 200 && allOwnedByTeam, "LAWYER user is restricted to viewing intakes assigned to their own team.");

  // Mapped to family team
  const familyIntakeRef = `LF-TEST-FAM-${Math.floor(100000 + Math.random() * 900000)}`;
  const familyIntake = await DBService.createIntake({
    referenceId: familyIntakeRef,
    clientName: "Divorce Seeker",
    practiceArea: "Family Law",
    urgency: "MEDIUM",
    urgencyScore: 50,
    summary: "Seeks divorce.",
    rawInquiry: "Seeks divorce.",
    conflictStatus: "CLEARED",
    assignedTeamId: familyTeamId,
    status: "NEW",
    chatHistory: "[]",
  });

  const req5 = createMockReq({}, lawyerUserInjury, { id: familyIntake.id });
  const res5 = createMockRes();
  await getIntakeDetails(req5 as any, res5 as any);
  assert(res5.statusCode === 403, "LAWYER user gets 403 Forbidden when requesting details of another team's intake.");

  // Test 8.6: Public client can start intake without login
  const req6 = createMockReq({}, null, {}, { inquiryText: "My property was damaged by a tenant.", clientName: "Landlord" });
  const res6 = createMockRes();
  await startIntake(req6 as any, res6 as any);
  assert(res6.statusCode === 201 && res6.jsonData.success, "Public client can submit and start an intake without authentication.");
  const createdIntakeId = res6.jsonData.data.id;

  // Test 8.7: Public client completeIntake does not leak attorney info
  const req7 = createMockReq({}, null, { id: createdIntakeId });
  const res7 = createMockRes();
  await completeIntake(req7 as any, res7 as any);
  assert(res7.statusCode === 200 && res7.jsonData.data.assignedAttorney === "Firm Counsel", "completeIntake response masks assigned attorney names to prevent public data leaks.");

  console.log("\n==============================================");
  console.log("📊 TEST RUN SUMMARY");
  console.log(`Total Passes: ${passes}`);
  console.log(`Total Failures: ${failures}`);
  console.log("==============================================\n");

  if (failures > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error("Test execution failed fatal:", err);
  process.exit(1);
});
