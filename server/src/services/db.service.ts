import { prisma } from "./prisma.service";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

// Urgency level enum type matching Prisma
export type UrgencyLevel = "HIGH" | "MEDIUM" | "LOW";
export type ConflictStatus = "CLEARED" | "POTENTIAL_CONFLICT";

export interface DBIntake {
  id: string;
  referenceId: string;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientLocation?: string | null;
  practiceArea: string;
  urgency: UrgencyLevel;
  urgencyScore: number;
  summary: string;
  rawInquiry: string;
  conflictStatus: ConflictStatus;
  estValue?: string | null;
  assignedAttorney?: string | null;
  assignedTeamId?: string | null;
  status: string;
  incidentDate?: string | null;
  relevantParties?: string | null;
  desiredOutcome?: string | null;
  missingInfo?: string | null;
  chatHistory?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBPracticeArea {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBLawyerTeam {
  id: string;
  name: string;
  email: string;
  leadAttorney: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBRoutingRule {
  id: string;
  practiceAreaId: string;
  assignedTeamId: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBNotification {
  id: string;
  intakeId: string;
  type: string;
  status: string;
  recipient?: string | null;
  errorMessage?: string | null;
  sentAt: Date;
}

export interface DBUser {
  id: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "LAWYER";
  name: string;
  teamId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// In-Memory Database Store Fallbacks
const memoryPracticeAreas: DBPracticeArea[] = [];
const memoryLawyerTeams: DBLawyerTeam[] = [];
const memoryRoutingRules: DBRoutingRule[] = [];
const memoryIntakes: DBIntake[] = [];
const memoryNotifications: DBNotification[] = [];
const memoryUsers: DBUser[] = [];

let isDbOnline = false;

// Default Seeding Configuration
const defaultPracticeAreas = [
  { name: "Personal Injury", description: "Accidents, slips, medical malpractice, and physical injury claims." },
  { name: "Family Law", description: "Divorce, child custody, prenuptial agreements, and domestic matters." },
  { name: "Criminal Law", description: "Defense representation for misdemeanors, felonies, and traffic offenses." },
  { name: "Employment Law", description: "Wrongful termination, workplace harassment, wage disputes, and discrimination." },
  { name: "Immigration Law", description: "Visas, green cards, naturalization, asylum, and deportation defense." },
  { name: "Real Estate / Property Law", description: "Landlord-tenant disputes, zoning, property transactions, and title issues." },
  { name: "Corporate / Business Law", description: "Contracts, business formation, intellectual property, mergers, and compliance." },
  { name: "Other / Unknown", description: "General inquiries that fall outside main practice categories." },
];

const defaultLawyerTeams = [
  { name: "Personal Injury Team", leadAttorney: "Thomas Sterling, Esq.", email: "laxmiml025@gmail.com" },
  { name: "Family Law Team", leadAttorney: "Sophia Martinez, JD", email: "laxmiml027@gmail.com" },
  { name: "Criminal Law Team", leadAttorney: "Jonathan Kross, Esq.", email: "lml150220@gmail.com" },
  { name: "Employment Law Team", leadAttorney: "Elena Vance, Esq.", email: "laxmiml025@gmail.com" },
  { name: "Immigration Law Team", leadAttorney: "Mateo Ruiz, JD", email: "laxmiml027@gmail.com" },
  { name: "Property Law Team", leadAttorney: "Evelyn Wright, Esq.", email: "lml150220@gmail.com" },
  { name: "Corporate Law Team", leadAttorney: "Alexander Pierce, JD", email: "laxmiml025@gmail.com" },
  { name: "General Intake Team", leadAttorney: "Gabriel Stone, Esq.", email: "laxmiml027@gmail.com" },
];

export async function initializeDatabase() {
  try {
    // Probe database connection
    await prisma.$queryRaw`SELECT 1`;
    isDbOnline = true;
    console.log("⚡ PostgreSQL Database connection validated via Prisma.");
    
    // Always sync lawyer teams to update lead attorney name and email
    const createdTeams: Record<string, any> = {};
    for (const team of defaultLawyerTeams) {
      createdTeams[team.name] = await prisma.lawyerTeam.upsert({
        where: { name: team.name },
        update: {
          leadAttorney: team.leadAttorney,
          email: team.email,
        },
        create: {
          name: team.name,
          leadAttorney: team.leadAttorney,
          email: team.email,
        },
      });
    }
    
    // Always seed/upsert default users to ensure all department accounts exist
    console.log("🌱 Syncing default ADMIN and LAWYER accounts for all departments...");
    const demoPasswordHash = await bcrypt.hash("LegalFlowDemo2026!", 10);
    
    const defaultUsers = [
      { email: "admin@legalflow.com", name: "Global Administrator", role: "ADMIN", teamName: null },
      { email: "injury@legalflow.com", name: "Thomas Sterling, Esq.", role: "LAWYER", teamName: "Personal Injury Team" },
      { email: "family@legalflow.com", name: "Sophia Martinez, JD", role: "LAWYER", teamName: "Family Law Team" },
      { email: "criminal@legalflow.com", name: "Jonathan Kross, Esq.", role: "LAWYER", teamName: "Criminal Law Team" },
      { email: "employment@legalflow.com", name: "Elena Vance, Esq.", role: "LAWYER", teamName: "Employment Law Team" },
      { email: "immigration@legalflow.com", name: "Mateo Ruiz, JD", role: "LAWYER", teamName: "Immigration Law Team" },
      { email: "property@legalflow.com", name: "Evelyn Wright, Esq.", role: "LAWYER", teamName: "Property Law Team" },
      { email: "corporate@legalflow.com", name: "Alexander Pierce, JD", role: "LAWYER", teamName: "Corporate Law Team" },
      { email: "general@legalflow.com", name: "Gabriel Stone, Esq.", role: "LAWYER", teamName: "General Intake Team" },
    ];

    for (const u of defaultUsers) {
      const teamObj = u.teamName ? createdTeams[u.teamName] : null;
      await prisma.user.upsert({
        where: { email: u.email },
        update: {
          name: u.name,
          role: u.role as Role,
          teamId: teamObj ? teamObj.id : null,
        },
        create: {
          email: u.email,
          name: u.name,
          passwordHash: demoPasswordHash,
          role: u.role as Role,
          teamId: teamObj ? teamObj.id : null,
        },
      });
    }
    console.log("✅ Database user seeding complete.");
    
    // Seed database if empty
    const areaCount = await prisma.practiceArea.count();
    if (areaCount === 0) {
      console.log("🌱 Database is empty. Seeding default practice areas and routing rules...");
      
      for (const area of defaultPracticeAreas) {
        const createdArea = await prisma.practiceArea.upsert({
          where: { name: area.name },
          update: {},
          create: {
            name: area.name,
            description: area.description,
            isActive: true,
          },
        });
        
        // Find matching team
        let targetTeamName = "General Intake Team";
        if (area.name === "Personal Injury") targetTeamName = "Personal Injury Team";
        else if (area.name === "Family Law") targetTeamName = "Family Law Team";
        else if (area.name === "Criminal Law") targetTeamName = "Criminal Law Team";
        else if (area.name === "Employment Law") targetTeamName = "Employment Law Team";
        else if (area.name === "Immigration Law") targetTeamName = "Immigration Law Team";
        else if (area.name === "Real Estate / Property Law") targetTeamName = "Property Law Team";
        else if (area.name === "Corporate / Business Law") targetTeamName = "Corporate Law Team";
        
        const teamObj = createdTeams[targetTeamName];
        if (teamObj) {
          await prisma.routingRule.create({
            data: {
              practiceAreaId: createdArea.id,
              assignedTeamId: teamObj.id,
              priority: 1,
            },
          });
        }
      }
      console.log("✅ Database seeding complete.");
    }
  } catch (err) {
    isDbOnline = false;
    console.warn("⚠️ PostgreSQL connection failed. LegalFlow will run in in-memory simulation mode.", (err as Error).message);
  }
  
  // Seed in-memory structures anyway to ensure fallback is populated
  seedMemoryStore();
}

function seedMemoryStore() {
  if (memoryPracticeAreas.length > 0) return;
  
  console.log("🌱 Seeding fallback in-memory store...");
  const now = new Date();
  
  defaultLawyerTeams.forEach((team, index) => {
    memoryLawyerTeams.push({
      id: `team-uuid-${index}`,
      name: team.name,
      leadAttorney: team.leadAttorney,
      email: team.email,
      createdAt: now,
      updatedAt: now,
    });
  });
  
  defaultPracticeAreas.forEach((area, index) => {
    const areaId = `area-uuid-${index}`;
    memoryPracticeAreas.push({
      id: areaId,
      name: area.name,
      description: area.description,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    
    let targetTeamName = "General Intake Team";
    if (area.name === "Personal Injury") targetTeamName = "Personal Injury Team";
    else if (area.name === "Family Law") targetTeamName = "Family Law Team";
    else if (area.name === "Criminal Law") targetTeamName = "Criminal Law Team";
    else if (area.name === "Employment Law") targetTeamName = "Employment Law Team";
    else if (area.name === "Immigration Law") targetTeamName = "Immigration Law Team";
    else if (area.name === "Real Estate / Property Law") targetTeamName = "Property Law Team";
    else if (area.name === "Corporate / Business Law") targetTeamName = "Corporate Law Team";
    
    const teamObj = memoryLawyerTeams.find(t => t.name === targetTeamName);
    if (teamObj) {
      memoryRoutingRules.push({
        id: `rule-uuid-${index}`,
        practiceAreaId: areaId,
        assignedTeamId: teamObj.id,
        priority: 1,
        createdAt: now,
        updatedAt: now,
      });
    }
  });
  
  // Seed in-memory users
  const demoPasswordHash = bcrypt.hashSync("LegalFlowDemo2026!", 10);
  memoryUsers.push({
    id: "admin-uuid-1",
    email: "admin@legalflow.com",
    name: "Global Administrator",
    passwordHash: demoPasswordHash,
    role: "ADMIN",
    createdAt: now,
    updatedAt: now,
  });

  const injuryTeam = memoryLawyerTeams.find(t => t.name === "Personal Injury Team");
  if (injuryTeam) {
    memoryUsers.push({
      id: "lawyer-uuid-injury",
      email: "injury@legalflow.com",
      name: "Thomas Sterling, Esq.",
      passwordHash: demoPasswordHash,
      role: "LAWYER",
      teamId: injuryTeam.id,
      createdAt: now,
      updatedAt: now,
    });
  }

  const familyTeam = memoryLawyerTeams.find(t => t.name === "Family Law Team");
  if (familyTeam) {
    memoryUsers.push({
      id: "lawyer-uuid-family",
      email: "family@legalflow.com",
      name: "Sophia Martinez, JD",
      passwordHash: demoPasswordHash,
      role: "LAWYER",
      teamId: familyTeam.id,
      createdAt: now,
      updatedAt: now,
    });
  }

  const employmentTeam = memoryLawyerTeams.find(t => t.name === "Employment Law Team");
  if (employmentTeam) {
    memoryUsers.push({
      id: "lawyer-uuid-employment",
      email: "employment@legalflow.com",
      name: "Elena Vance, Esq.",
      passwordHash: demoPasswordHash,
      role: "LAWYER",
      teamId: employmentTeam.id,
      createdAt: now,
      updatedAt: now,
    });
  }
  
  console.log(`✅ Seeded in-memory store: ${memoryPracticeAreas.length} practice areas, ${memoryLawyerTeams.length} teams, ${memoryRoutingRules.length} rules, ${memoryUsers.length} users.`);
}

export const DBService = {
  isOnline: () => isDbOnline,
  
  // PRACTICE AREAS
  async getPracticeAreas(): Promise<DBPracticeArea[]> {
    if (isDbOnline) {
      try {
        const list = await prisma.practiceArea.findMany({ where: { isActive: true } });
        return list.map(item => ({
          ...item,
          description: item.description ?? null
        }));
      } catch (e) {
        isDbOnline = false;
      }
    }
    return memoryPracticeAreas.filter(p => p.isActive);
  },

  // TEAMS
  async getLawyerTeams(): Promise<DBLawyerTeam[]> {
    if (isDbOnline) {
      try {
        return await prisma.lawyerTeam.findMany();
      } catch (e) {
        isDbOnline = false;
      }
    }
    return memoryLawyerTeams;
  },

  // ROUTING RULES
  async getRoutingRules(): Promise<DBRoutingRule[]> {
    if (isDbOnline) {
      try {
        return await prisma.routingRule.findMany();
      } catch (e) {
        isDbOnline = false;
      }
    }
    return memoryRoutingRules;
  },

  // INTAKES - CREATE
  async createIntake(data: Omit<DBIntake, "id" | "createdAt" | "updatedAt">): Promise<DBIntake> {
    const now = new Date();
    const id = `lf-${Math.random().toString(36).substr(2, 9)}`;
    const newRecord: DBIntake = {
      id,
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    
    if (isDbOnline) {
      try {
        const saved = await prisma.intake.create({
          data: {
            referenceId: newRecord.referenceId,
            clientName: newRecord.clientName,
            clientEmail: newRecord.clientEmail,
            clientPhone: newRecord.clientPhone,
            clientLocation: newRecord.clientLocation,
            practiceArea: newRecord.practiceArea,
            urgency: newRecord.urgency,
            urgencyScore: newRecord.urgencyScore,
            summary: newRecord.summary,
            rawInquiry: newRecord.rawInquiry,
            conflictStatus: newRecord.conflictStatus,
            estValue: newRecord.estValue,
            assignedAttorney: newRecord.assignedAttorney,
            assignedTeamId: newRecord.assignedTeamId,
            status: newRecord.status,
            incidentDate: newRecord.incidentDate,
            relevantParties: newRecord.relevantParties,
            desiredOutcome: newRecord.desiredOutcome,
            missingInfo: newRecord.missingInfo,
            chatHistory: newRecord.chatHistory,
          },
        });
        return {
          ...saved,
          clientEmail: saved.clientEmail ?? null,
          clientPhone: saved.clientPhone ?? null,
          clientLocation: saved.clientLocation ?? null,
          estValue: saved.estValue ?? null,
          assignedAttorney: saved.assignedAttorney ?? null,
          assignedTeamId: saved.assignedTeamId ?? null,
          incidentDate: saved.incidentDate ?? null,
          relevantParties: saved.relevantParties ?? null,
          desiredOutcome: saved.desiredOutcome ?? null,
          missingInfo: saved.missingInfo ?? null,
          chatHistory: saved.chatHistory ?? null,
        };
      } catch (e) {
        isDbOnline = false;
        console.warn("[Prisma DB Error] Falling back to memory storage for creating intake:", (e as Error).message);
      }
    }
    
    memoryIntakes.unshift(newRecord);
    return newRecord;
  },

  // INTAKES - UPDATE
  async updateIntake(id: string, data: Partial<Omit<DBIntake, "id" | "createdAt" | "updatedAt">>): Promise<DBIntake> {
    if (isDbOnline) {
      try {
        const saved = await prisma.intake.update({
          where: { id },
          data: {
            ...data,
            // Cast properties explicitly to avoid conflicts with undefined vs null
            clientEmail: data.clientEmail === undefined ? undefined : data.clientEmail,
            clientPhone: data.clientPhone === undefined ? undefined : data.clientPhone,
            clientLocation: data.clientLocation === undefined ? undefined : data.clientLocation,
            estValue: data.estValue === undefined ? undefined : data.estValue,
            assignedAttorney: data.assignedAttorney === undefined ? undefined : data.assignedAttorney,
            assignedTeamId: data.assignedTeamId === undefined ? undefined : data.assignedTeamId,
            incidentDate: data.incidentDate === undefined ? undefined : data.incidentDate,
            relevantParties: data.relevantParties === undefined ? undefined : data.relevantParties,
            desiredOutcome: data.desiredOutcome === undefined ? undefined : data.desiredOutcome,
            missingInfo: data.missingInfo === undefined ? undefined : data.missingInfo,
            chatHistory: data.chatHistory === undefined ? undefined : data.chatHistory,
          },
        });
        return {
          ...saved,
          clientEmail: saved.clientEmail ?? null,
          clientPhone: saved.clientPhone ?? null,
          clientLocation: saved.clientLocation ?? null,
          estValue: saved.estValue ?? null,
          assignedAttorney: saved.assignedAttorney ?? null,
          assignedTeamId: saved.assignedTeamId ?? null,
          incidentDate: saved.incidentDate ?? null,
          relevantParties: saved.relevantParties ?? null,
          desiredOutcome: saved.desiredOutcome ?? null,
          missingInfo: saved.missingInfo ?? null,
          chatHistory: saved.chatHistory ?? null,
        };
      } catch (e) {
        isDbOnline = false;
        console.warn("[Prisma DB Error] Falling back to memory storage for updating intake:", (e as Error).message);
      }
    }

    const idx = memoryIntakes.findIndex(item => item.id === id);
    if (idx === -1) {
      throw new Error(`Intake not found: ${id}`);
    }
    const updated = {
      ...memoryIntakes[idx],
      ...data,
      updatedAt: new Date(),
    };
    memoryIntakes[idx] = updated;
    return updated;
  },

  // INTAKES - LIST
  async getIntakes(): Promise<DBIntake[]> {
    if (isDbOnline) {
      try {
        const list = await prisma.intake.findMany({
          orderBy: { createdAt: "desc" },
        });
        return list.map(saved => ({
          ...saved,
          clientEmail: saved.clientEmail ?? null,
          clientPhone: saved.clientPhone ?? null,
          clientLocation: saved.clientLocation ?? null,
          estValue: saved.estValue ?? null,
          assignedAttorney: saved.assignedAttorney ?? null,
          assignedTeamId: saved.assignedTeamId ?? null,
          incidentDate: saved.incidentDate ?? null,
          relevantParties: saved.relevantParties ?? null,
          desiredOutcome: saved.desiredOutcome ?? null,
          missingInfo: saved.missingInfo ?? null,
          chatHistory: saved.chatHistory ?? null,
        }));
      } catch (e) {
        isDbOnline = false;
      }
    }
    return memoryIntakes;
  },

  // INTAKES - SINGLE
  async getIntakeById(id: string): Promise<DBIntake | null> {
    if (isDbOnline) {
      try {
        const saved = await prisma.intake.findUnique({
          where: { id },
          include: {
            assignedTeam: true,
          }
        });
        if (saved) {
          return {
            ...saved,
            clientEmail: saved.clientEmail ?? null,
            clientPhone: saved.clientPhone ?? null,
            clientLocation: saved.clientLocation ?? null,
            estValue: saved.estValue ?? null,
            assignedAttorney: saved.assignedAttorney ?? null,
            assignedTeamId: saved.assignedTeamId ?? null,
            incidentDate: saved.incidentDate ?? null,
            relevantParties: saved.relevantParties ?? null,
            desiredOutcome: saved.desiredOutcome ?? null,
            missingInfo: saved.missingInfo ?? null,
            chatHistory: saved.chatHistory ?? null,
          };
        }
        return null;
      } catch (e) {
        isDbOnline = false;
      }
    }
    return memoryIntakes.find(item => item.id === id) || null;
  },

  // NOTIFICATION
  async createNotification(data: Omit<DBNotification, "id" | "sentAt">): Promise<DBNotification> {
    const now = new Date();
    const id = `notif-${Math.random().toString(36).substr(2, 9)}`;
    const newRecord: DBNotification = {
      id,
      ...data,
      sentAt: now,
    };
    
    if (isDbOnline) {
      try {
        await prisma.notification.create({
          data: {
            intakeId: newRecord.intakeId,
            type: newRecord.type,
            status: newRecord.status,
            recipient: newRecord.recipient,
            errorMessage: newRecord.errorMessage,
          },
        });
      } catch (e) {
        isDbOnline = false;
        console.warn("[Prisma DB Error] Falling back to memory storage for creating notification:", (e as Error).message);
      }
    }
    
    memoryNotifications.push(newRecord);
    return newRecord;
  },

  // USERS
  async getUserByEmail(email: string): Promise<DBUser | null> {
    if (isDbOnline) {
      try {
        const u = await prisma.user.findUnique({ where: { email } });
        if (u) return { ...u, role: u.role as "ADMIN" | "LAWYER" };
        return null;
      } catch (e) {
        isDbOnline = false;
      }
    }
    return memoryUsers.find(u => u.email === email) || null;
  },

  async getUserById(id: string): Promise<DBUser | null> {
    if (isDbOnline) {
      try {
        const u = await prisma.user.findUnique({ where: { id } });
        if (u) return { ...u, role: u.role as "ADMIN" | "LAWYER" };
        return null;
      } catch (e) {
        isDbOnline = false;
      }
    }
    return memoryUsers.find(u => u.id === id) || null;
  }
};
