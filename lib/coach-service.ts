import { requestCoachFromProvider } from "./ai-provider";
import { diagnoseWithMockCoach } from "./mock-coach";
import {
  getPresetCoachResultForScenario,
  PRESET_LOADING_DELAY_MS,
} from "./preset-coach";
import { validateCoachResponseForState } from "./coach-schema";
import type { CoachRequestContext } from "../types/coach-request";
import type { CoachResponse } from "../types/coach-result";

export type CoachMode = "real" | "preset";

export type CoachServiceErrorCode =
  | "COACH_MODE_CONFIGURATION_ERROR"
  | "INVALID_AI_JSON"
  | "INVALID_AI_RESPONSE"
  | "CLARIFICATION_LIMIT_REACHED";

export class CoachServiceError extends Error {
  constructor(
    public readonly code: CoachServiceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CoachServiceError";
  }
}

export interface CoachServiceEnvironment {
  [key: string]: string | undefined;
  COACH_MODE?: string;
  AI_API_KEY?: string;
  AI_BASE_URL?: string;
  AI_MODEL?: string;
}

interface CoachServiceOptions {
  env?: CoachServiceEnvironment;
  provider?: (request: CoachRequestContext) => Promise<unknown>;
  sleep?: (milliseconds: number) => Promise<void>;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function getCoachMode(env: CoachServiceEnvironment): CoachMode {
  const configuredMode = env.COACH_MODE?.trim().toLowerCase() || "preset";

  if (configuredMode === "real" || configuredMode === "preset") {
    return configuredMode;
  }

  throw new CoachServiceError(
    "COACH_MODE_CONFIGURATION_ERROR",
    "COACH_MODE 只允许 real 或 preset。",
  );
}

export function parseRawCoachResponse(rawResponse: unknown): unknown {
  if (typeof rawResponse !== "string") {
    return rawResponse;
  }

  try {
    return JSON.parse(rawResponse) as unknown;
  } catch {
    throw new CoachServiceError(
      "INVALID_AI_JSON",
      "AI 没有返回有效 JSON。",
    );
  }
}

export function acceptCoachResponse(
  rawResponse: unknown,
  clarificationCount: number,
): CoachResponse {
  const candidate = parseRawCoachResponse(rawResponse);
  const validation = validateCoachResponseForState(candidate, {
    clarificationCount,
  });

  if (!validation.success) {
    const code =
      validation.code === "CLARIFICATION_LIMIT_REACHED"
        ? "CLARIFICATION_LIMIT_REACHED"
        : "INVALID_AI_RESPONSE";

    throw new CoachServiceError(code, validation.message);
  }

  return validation.data;
}

function getPresetResponse(request: CoachRequestContext): CoachResponse {
  const decision = diagnoseWithMockCoach({
    scenario: request.scenario,
    clarificationTurns: request.clarificationTurns,
  });

  if (decision.type === "clarify") {
    return {
      status: "clarify",
      clarification_question: decision.question,
      context: {
        real_concern: null,
        flexibility: null,
      },
    };
  }

  return getPresetCoachResultForScenario(request.scenario);
}

export async function getCoachResponse(
  request: CoachRequestContext,
  options: CoachServiceOptions = {},
): Promise<CoachResponse> {
  const env = options.env ?? process.env;
  const mode = getCoachMode(env);
  let rawResponse: unknown;

  if (mode === "preset") {
    await (options.sleep ?? wait)(PRESET_LOADING_DELAY_MS);
    rawResponse = getPresetResponse(request);
  } else {
    rawResponse = await (options.provider ?? ((context) =>
      requestCoachFromProvider(context, { env })))(request);
  }

  return acceptCoachResponse(rawResponse, request.clarificationCount);
}
