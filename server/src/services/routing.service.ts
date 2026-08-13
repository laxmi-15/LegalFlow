import { DBService, DBLawyerTeam } from "./db.service";

export interface RoutedResult {
  assignedTeamId: string;
  assignedTeamName: string;
  assignedAttorney: string;
  assignedEmail: string;
}

export const RoutingService = {
  /**
   * Deterministically route a practice area to its corresponding team
   */
  async routeIntake(practiceAreaName: string): Promise<RoutedResult> {
    console.log(`[RoutingService] Routing intake for practice area: "${practiceAreaName}"`);
    
    try {
      const practiceAreas = await DBService.getPracticeAreas();
      const targetArea = practiceAreas.find(
        (p) => p.name.toLowerCase().trim() === practiceAreaName.toLowerCase().trim()
      );

      const teams = await DBService.getLawyerTeams();
      const rules = await DBService.getRoutingRules();

      if (targetArea) {
        // Find routing rule for this area
        const matchedRule = rules
          .filter((r) => r.practiceAreaId === targetArea.id)
          .sort((a, b) => b.priority - a.priority)[0]; // highest priority first

        if (matchedRule) {
          const team = teams.find((t) => t.id === matchedRule.assignedTeamId);
          if (team) {
            console.log(`[RoutingService] Routed to team: "${team.name}" (Lead: ${team.leadAttorney})`);
            return {
              assignedTeamId: team.id,
              assignedTeamName: team.name,
              assignedAttorney: team.leadAttorney,
              assignedEmail: team.email,
            };
          }
        }
      }

      // Fallback: General Intake Team
      const generalTeam = teams.find((t) => t.name === "General Intake Team") || teams[teams.length - 1];
      console.log(`[RoutingService] Fallback routing to general team: "${generalTeam?.name || 'General Intake Team'}"`);
      
      return {
        assignedTeamId: generalTeam?.id || "fallback-team-id",
        assignedTeamName: generalTeam?.name || "General Intake Team",
        assignedAttorney: generalTeam?.leadAttorney || "Senior Managing Partner",
        assignedEmail: generalTeam?.email || "intake@legalflow-demo.com",
      };
    } catch (err) {
      console.error("[RoutingService] Error executing routing logic. Defaulting to general team:", err);
      return {
        assignedTeamId: "fallback-team-id",
        assignedTeamName: "General Intake Team",
        assignedAttorney: "Senior Managing Partner",
        assignedEmail: "intake@legalflow-demo.com",
      };
    }
  },
};
