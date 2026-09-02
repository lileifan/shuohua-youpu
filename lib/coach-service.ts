import {
  AIProviderError,
  requestCoachFromProvider,
} from "./ai-provider";
import { diagnoseWithMockCoach } from "./mock-coach";
import {
  getPresetCoachResultForScenario,
  PRESET_LOADING_DELAY_MS,
} from "./preset-coach";
import { validateCoachResponseForState } from "./coach-schema";
import type { CoachRequestContext } from "../types/coach-request";
import type { CoachResponse } from "../types/coach-result";

export type CoachMode = "real" | "preset";

export const COACH_RUNTIME_TIMEOUT_MS = 42_000;
export const AI_PROVIDER_ATTEMPT_TIMEOUT_MS = 20_000;
export const MAX_PROVIDER_ATTEMPTS = 2;

export type CoachServiceErrorCode =
  | "COACH_MODE_CONFIGURATION_ERROR"
  | "PROVIDER_INVALID_JSON"
  | "PROVIDER_SCHEMA_ERROR"
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

interface CoachProviderAttemptContext {
  forceComplete: boolean;
  signal: AbortSignal;
}

interface CoachServiceOptions {
  env?: CoachServiceEnvironment;
  provider?: (
    request: CoachRequestContext,
    attempt: CoachProviderAttemptContext,
  ) => Promise<unknown>;
  sleep?: (milliseconds: number, signal?: AbortSignal) => Promise<void>;
  signal?: AbortSignal;
}

function wait(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AIProviderError("AI_REQUEST_ABORTED", "请求已取消。"));
      return;
    }

    const handleAbort = () => {
      clearTimeout(timeoutId);
      reject(new AIProviderError("AI_REQUEST_ABORTED", "请求已取消。"));
    };
    const timeoutId = setTimeout(() => {
      signal?.removeEventListener("abort", handleAbort);
      resolve();
    }, milliseconds);
    signal?.addEventListener("abort", handleAbort, { once: true });
  });
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
      "PROVIDER_INVALID_JSON",
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
        : "PROVIDER_SCHEMA_ERROR";

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

function isRetryableCoachError(error: unknown): boolean {
  if (error instanceof AIProviderError) {
    return error.retryable;
  }

  if (error instanceof CoachServiceError) {
    return (
      error.code === "PROVIDER_INVALID_JSON" ||
      error.code === "PROVIDER_SCHEMA_ERROR" ||
      error.code === "CLARIFICATION_LIMIT_REACHED"
    );
  }

  return false;
}

export async function getCoachResponse(
  request: CoachRequestContext,
  options: CoachServiceOptions = {},
): Promise<CoachResponse> {
  const env = options.env ?? process.env;
  const mode = getCoachMode(env);
  const runtimeController = new AbortController();
  const runtimeSignal = options.signal
    ? AbortSignal.any([runtimeController.signal, options.signal])
    : runtimeController.signal;
  let runtimeTimedOut = false;
  const runtimeTimeoutId = setTimeout(() => {
    runtimeTimedOut = true;
    runtimeController.abort();
  }, COACH_RUNTIME_TIMEOUT_MS);

  try {
    if (mode === "preset") {
      await (options.sleep ?? wait)(PRESET_LOADING_DELAY_MS, runtimeSignal);
      return acceptCoachResponse(
        getPresetResponse(request),
        request.clarificationCount,
      );
    }

    const provider =
      options.provider ??
      ((context: CoachRequestContext, attempt: CoachProviderAttemptContext) =>
        requestCoachFromProvider(context, {
          env,
          timeoutMs: AI_PROVIDER_ATTEMPT_TIMEOUT_MS,
          signal: attempt.signal,
          forceComplete: attempt.forceComplete,
        }));
    let forceComplete =
      request.clarificationCount >= request.maxClarifications;
    let lastError: unknown;

    for (let attemptIndex = 0; attemptIndex < MAX_PROVIDER_ATTEMPTS; attemptIndex += 1) {
      try {
        const rawResponse = await provider(request, {
          forceComplete,
          signal: runtimeSignal,
        });
        return acceptCoachResponse(rawResponse, request.clarificationCount);
      } catch (error) {
        lastError = error;

        if (
          error instanceof CoachServiceError &&
          error.code === "CLARIFICATION_LIMIT_REACHED"
        ) {
          forceComplete = true;
        }

        const isLastAttempt = attemptIndex === MAX_PROVIDER_ATTEMPTS - 1;

        if (isLastAttempt || !isRetryableCoachError(error)) {
          throw error;
        }
      }
    }

    throw lastError;
  } catch (error) {
    if (runtimeTimedOut) {
      throw new AIProviderError(
        "PROVIDER_TIMEOUT",
        "AI 服务请求超时。",
        true,
      );
    }

    throw error;
  } finally {
    clearTimeout(runtimeTimeoutId);
  }
}
