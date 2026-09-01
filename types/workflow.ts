export type AppStatus =
  | "setup"
  | "describe"
  | "clarifying"
  | "generating"
  | "results"
  | "fallback";

export interface AppState {
  status: AppStatus;
  clarificationCount: number;
}

export type WorkflowAction =
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
