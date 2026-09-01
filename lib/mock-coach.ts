import type { ClarificationTurn } from "../types/workflow";

export const MOCK_SCENE_A_QUESTION =
  "这次是周末完全无法安排，还是只处理一小段时间也能接受？";

export const MOCK_SCENE_B_QUESTION =
  "完整版必须延后三天，还是可以按原时间先交一个可验收的部分版本？";

export const MOCK_TWO_TURN_SCENARIO =
  "[Mock测试] 我需要连续两轮梳理这次沟通。";

const GENERIC_BOUNDARY_QUESTION =
  "这次沟通里，你最不能接受的结果是什么？";

const SECOND_TEST_QUESTION =
  "在不突破这个底线的前提下，你可以接受哪种折中安排？";

export type MockCoachDecision =
  | { type: "clarify"; question: string }
  | { type: "generate" };

export interface MockCoachContext {
  scenario: string;
  clarificationTurns: readonly ClarificationTurn[];
}

function isSceneA(scenario: string): boolean {
  return (
    scenario.includes("周末加班") &&
    (scenario.includes("年底评价") || scenario.includes("拒绝"))
  );
}

function isSceneB(scenario: string): boolean {
  return (
    scenario.includes("延后三天") &&
    (scenario.includes("客户") || scenario.includes("不信任"))
  );
}

function alreadyStatesBoundaryAndAlternative(scenario: string): boolean {
  const statesBoundary = /底线|不能接受|确实.{0,4}不了/.test(scenario);
  const statesAlternative = /可以|愿意|折中|替代/.test(scenario);

  return statesBoundary && statesAlternative;
}

export function diagnoseWithMockCoach({
  scenario,
  clarificationTurns,
}: MockCoachContext): MockCoachDecision {
  const normalizedScenario = scenario.trim();

  if (normalizedScenario === MOCK_TWO_TURN_SCENARIO) {
    if (clarificationTurns.length === 0) {
      return { type: "clarify", question: GENERIC_BOUNDARY_QUESTION };
    }

    if (clarificationTurns.length === 1) {
      return { type: "clarify", question: SECOND_TEST_QUESTION };
    }

    return { type: "generate" };
  }

  if (clarificationTurns.length > 0) {
    return { type: "generate" };
  }

  if (isSceneA(normalizedScenario)) {
    return { type: "clarify", question: MOCK_SCENE_A_QUESTION };
  }

  if (isSceneB(normalizedScenario)) {
    return { type: "clarify", question: MOCK_SCENE_B_QUESTION };
  }

  if (alreadyStatesBoundaryAndAlternative(normalizedScenario)) {
    return { type: "generate" };
  }

  return { type: "clarify", question: GENERIC_BOUNDARY_QUESTION };
}
