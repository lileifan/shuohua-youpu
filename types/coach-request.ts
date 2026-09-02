import type { ClarificationTurn, RoleType } from "./workflow";

export const MAX_COACH_CLARIFICATIONS = 2 as const;

export interface CoachRequestTarget {
  role: RoleType;
  personality: string;
}

export interface CoachRequestContext {
  target: CoachRequestTarget;
  scenario: string;
  clarificationTurns: readonly ClarificationTurn[];
  clarificationCount: number;
  maxClarifications: typeof MAX_COACH_CLARIFICATIONS;
}
