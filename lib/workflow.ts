import { scenes } from "../data/scenes";
import {
  GENDER_LABELS,
  PERSONALITY_LABELS,
  ROLE_LABELS,
} from "../data/target-options";
import type {
  AppState,
  AppStatus,
  SceneNumber,
  SceneProgressItem,
  WorkflowAction,
} from "../types/workflow";

export const MAX_CLARIFICATION_COUNT = 2;
export const MAX_CUSTOM_PERSONALITY_LENGTH = 20;

export const INITIAL_APP_STATE: Readonly<AppState> = {
  status: "setup",
  clarificationCount: 0,
  target: {
    role: "leader",
    gender: null,
    personalityPreset: null,
    customPersonality: "",
  },
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
    case "SET_ROLE":
      return state.status === "setup"
        ? { ...state, target: { ...state.target, role: action.role } }
        : state;

    case "SET_GENDER":
      return state.status === "setup"
        ? { ...state, target: { ...state.target, gender: action.gender } }
        : state;

    case "SET_PERSONALITY_PRESET":
      return state.status === "setup"
        ? {
            ...state,
            target: { ...state.target, personalityPreset: action.preset },
          }
        : state;

    case "SET_CUSTOM_PERSONALITY":
      return state.status === "setup"
        ? {
            ...state,
            target: {
              ...state.target,
              customPersonality: action.value.slice(
                0,
                MAX_CUSTOM_PERSONALITY_LENGTH,
              ),
            },
          }
        : state;

    case "COMPLETE_SETUP":
      return state.status === "setup" && isSetupComplete(state)
        ? { ...state, status: "describe" }
        : state;

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
      return state.status === "results"
        ? {
            ...INITIAL_APP_STATE,
            target: { ...INITIAL_APP_STATE.target },
          }
        : state;
  }
}

export function getEffectivePersonality(state: AppState): string | null {
  const customPersonality = state.target.customPersonality.trim();

  if (customPersonality) {
    return customPersonality;
  }

  return state.target.personalityPreset
    ? PERSONALITY_LABELS[state.target.personalityPreset]
    : null;
}

export function isSetupComplete(state: AppState): boolean {
  return Boolean(
    state.target.role &&
      state.target.gender &&
      getEffectivePersonality(state),
  );
}

export function getTargetSummary(state: AppState): string | null {
  const { role, gender } = state.target;
  const personality = getEffectivePersonality(state);

  if (!role || !gender || !personality) {
    return null;
  }

  return `当前对象：${personality}的${GENDER_LABELS[gender]}${ROLE_LABELS[role]}`;
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
