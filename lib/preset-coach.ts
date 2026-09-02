import {
  GENERIC_OFFLINE_RESULT,
  SCENE_A_RESULT,
  SCENE_A_SCENARIO,
  SCENE_B_RESULT,
  SCENE_B_SCENARIO,
} from "../data/demo-results";
import type { CompleteCoachResult } from "../types/coach-result";
import type { AppState } from "../types/workflow";
import { getScenario } from "./workflow";

export const PRESET_LOADING_DELAY_MS = 750;

function cloneResult(result: CompleteCoachResult): CompleteCoachResult {
  return {
    ...result,
    options: result.options.map((option) => ({ ...option })),
  };
}

function matchesSceneA(scenario: string): boolean {
  return (
    scenario === SCENE_A_SCENARIO ||
    (scenario.includes("周末加班") && scenario.includes("年底评价"))
  );
}

function matchesSceneB(scenario: string): boolean {
  return (
    scenario === SCENE_B_SCENARIO ||
    (scenario.includes("延后三天") && scenario.includes("客户"))
  );
}

export function getPresetCoachResultForScenario(
  scenario: string,
): CompleteCoachResult {
  if (matchesSceneA(scenario)) {
    return cloneResult(SCENE_A_RESULT);
  }

  if (matchesSceneB(scenario)) {
    return cloneResult(SCENE_B_RESULT);
  }

  return cloneResult(GENERIC_OFFLINE_RESULT);
}

export function getPresetCoachResult(state: AppState): CompleteCoachResult {
  return getPresetCoachResultForScenario(getScenario(state));
}
