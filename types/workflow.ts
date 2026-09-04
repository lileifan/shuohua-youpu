import type { CompleteCoachResult } from "./coach-result";

export type AppStatus =
  | "setup"
  | "describe"
  | "clarifying"
  | "generating"
  | "results"
  | "fallback";

export type RoleType = "leader" | "client" | "peer";

export type GenderPresentation = "male" | "female";

export type PersonalityPreset =
  | "strong"
  | "rigorous"
  | "casual"
  | "easygoing"
  | "suspicious";

export interface ConversationTarget {
  role: RoleType | null;
  gender: GenderPresentation | null;
  personalityPreset: PersonalityPreset | null;
  customPersonality: string;
}

export interface ClarificationTurn {
  question: string;
  answer: string;
}

export interface ConversationState {
  scenario: string;
  clarificationTurns: ClarificationTurn[];
  pendingClarificationQuestion: string | null;
}

export interface AppState {
  status: AppStatus;
  clarificationCount: number;
  target: ConversationTarget;
  conversation: ConversationState;
  result: CompleteCoachResult | null;
}

export type WorkflowAction =
  | { type: "SET_ROLE"; role: RoleType }
  | { type: "SET_GENDER"; gender: GenderPresentation }
  | { type: "SET_PERSONALITY_PRESET"; preset: PersonalityPreset }
  | { type: "SET_CUSTOM_PERSONALITY"; value: string }
  | {
      type: "LOAD_DEMO_SCENARIO";
      role: RoleType;
      gender: GenderPresentation;
      personality: PersonalityPreset;
      scenario: string;
    }
  | { type: "COMPLETE_SETUP" }
  | { type: "SET_SCENARIO"; value: string }
  | { type: "REQUEST_CLARIFICATION"; question: string }
  | {
      type: "ANSWER_CLARIFICATION";
      answer: string;
      nextQuestion: string | null;
    }
  | { type: "SKIP_CLARIFICATION" }
  | { type: "START_GENERATING" }
  | { type: "GENERATION_SUCCEEDED"; result: CompleteCoachResult }
  | { type: "GENERATION_FAILED" }
  | { type: "RETRY_GENERATION" }
  | { type: "USE_PRESET_RESULT"; result: CompleteCoachResult }
  | { type: "REHEARSE_ANOTHER" }
  | { type: "RESET" };

export type SceneNumber = 1 | 2 | 3;

export type SceneProgressStatus = "completed" | "current" | "locked";

export interface SceneDefinition {
  number: SceneNumber;
  label: string;
}

export interface SceneProgressItem extends SceneDefinition {
  progressStatus: SceneProgressStatus;
  isUnlocked: boolean;
}
