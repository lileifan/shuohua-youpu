import { MAX_COACH_CLARIFICATIONS } from "../types/coach-request";
import type { CoachRequestContext } from "../types/coach-request";
import type { ClarificationTurn, RoleType } from "../types/workflow";

interface CoachRequestSource {
  role: RoleType | null;
  personality: string | null;
  scenario: string;
  clarificationTurns: readonly ClarificationTurn[];
  clarificationCount: number;
}

export function createCoachRequestContext(
  source: CoachRequestSource,
): CoachRequestContext | null {
  const personality = source.personality?.trim() ?? "";
  const scenario = source.scenario.trim();
  const clarificationTurns = source.clarificationTurns.map((turn) => ({
    question: turn.question.trim(),
    answer: turn.answer.trim(),
  }));

  if (
    !source.role ||
    !personality ||
    !scenario ||
    clarificationTurns.some((turn) => !turn.question || !turn.answer) ||
    source.clarificationCount !== clarificationTurns.length ||
    source.clarificationCount < 0 ||
    source.clarificationCount > MAX_COACH_CLARIFICATIONS
  ) {
    return null;
  }

  return {
    target: { role: source.role, personality },
    scenario,
    clarificationTurns,
    clarificationCount: source.clarificationCount,
    maxClarifications: MAX_COACH_CLARIFICATIONS,
  };
}
