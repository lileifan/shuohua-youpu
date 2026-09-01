import { scenes } from "../data/scenes";
import type {
  AppState,
  AppStatus,
  SceneNumber,
  SceneProgressItem,
  WorkflowAction,
} from "../types/workflow";

export const MAX_CLARIFICATION_COUNT = 2;

export const INITIAL_APP_STATE: Readonly<AppState> = {
  status: "setup",
  clarificationCount: 0,
};

const STATUS_TO_SCENE: Record<AppStatus, SceneNumber> = {
  setup: 1,
  describe: 2,
  clarifying: 2,
  generating: 3,
  results: 3,
  fallback: 3,
};

function startGenerating(state: AppState): AppState {
  return {
    ...state,
    status: "generating",
    clarificationCount: Math.min(
      state.clarificationCount,
      MAX_CLARIFICATION_COUNT,
    ),
  };
}

export function workflowReducer(
  state: AppState,
  action: WorkflowAction,
): AppState {
  switch (action.type) {
    case "COMPLETE_SETUP":
      return state.status === "setup" ? { ...state, status: "describe" } : state;

    case "REQUEST_CLARIFICATION": {
      const canRequestClarification =
        state.status === "describe" || state.status === "clarifying";

      if (!canRequestClarification) {
        return state;
      }

      if (state.clarificationCount >= MAX_CLARIFICATION_COUNT) {
        return startGenerating(state);
      }

      return {
        ...state,
        status: "clarifying",
        clarificationCount: state.clarificationCount + 1,
      };
    }

    case "START_GENERATING":
      return state.status === "describe" || state.status === "clarifying"
        ? startGenerating(state)
        : state;

    case "GENERATION_SUCCEEDED":
      return state.status === "generating"
        ? { ...state, status: "results" }
        : state;

    case "GENERATION_FAILED":
      return state.status === "generating"
        ? { ...state, status: "fallback" }
        : state;

    case "RETRY_GENERATION":
      return state.status === "fallback" ? startGenerating(state) : state;

    case "RESET":
      return state.status === "results" ? { ...INITIAL_APP_STATE } : state;
  }
}

export function getCurrentScene(status: AppStatus): SceneNumber {
  return STATUS_TO_SCENE[status];
}

export function getCompletedScenes(status: AppStatus): SceneNumber[] {
  const currentScene = getCurrentScene(status);

  return scenes
    .filter((scene) => scene.number < currentScene)
    .map((scene) => scene.number);
}

export function isSceneUnlocked(
  sceneNumber: SceneNumber,
  status: AppStatus,
): boolean {
  return sceneNumber <= getCurrentScene(status);
}

export function getSceneProgress(status: AppStatus): SceneProgressItem[] {
  const currentScene = getCurrentScene(status);

  return scenes.map((scene) => ({
    ...scene,
    progressStatus:
      scene.number < currentScene
        ? "completed"
        : scene.number === currentScene
          ? "current"
          : "locked",
    isUnlocked: isSceneUnlocked(scene.number, status),
  }));
}
