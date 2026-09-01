export type AppStatus =
  | "setup"
  | "describe"
  | "clarifying"
  | "generating"
  | "results"
  | "fallback";

export type RoleType = "leader" | "client";

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

export interface AppState {
  status: AppStatus;
  clarificationCount: number;
  target: ConversationTarget;
}

export type WorkflowAction =
  | { type: "SET_ROLE"; role: RoleType }
  | { type: "SET_GENDER"; gender: GenderPresentation }
  | { type: "SET_PERSONALITY_PRESET"; preset: PersonalityPreset }
  | { type: "SET_CUSTOM_PERSONALITY"; value: string }
  | { type: "COMPLETE_SETUP" }
  | { type: "REQUEST_CLARIFICATION" }
  | { type: "START_GENERATING" }
  | { type: "GENERATION_SUCCEEDED" }
  | { type: "GENERATION_FAILED" }
  | { type: "RETRY_GENERATION" }
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
