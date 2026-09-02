import { CoachResponseSchema } from "./coach-schema";
import type { CoachRequestContext } from "../types/coach-request";
import type { CoachResponse } from "../types/coach-result";

export const COACH_CLIENT_TIMEOUT_MS = 43_000;

export class CoachApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CoachApiError";
  }
}

type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

interface CoachClientOptions {
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  signal?: AbortSignal;
}

function readPublicError(body: unknown): { code: string; message: string } {
  if (!body || typeof body !== "object") {
    return { code: "COACH_API_ERROR", message: "排演服务暂时不可用。" };
  }

  const error = (body as { error?: unknown }).error;

  if (!error || typeof error !== "object") {
    return { code: "COACH_API_ERROR", message: "排演服务暂时不可用。" };
  }

  const code = (error as { code?: unknown }).code;
  const message = (error as { message?: unknown }).message;

  return {
    code: typeof code === "string" ? code : "COACH_API_ERROR",
    message:
      typeof message === "string" ? message : "排演服务暂时不可用。",
  };
}

export async function requestCoach(
  request: CoachRequestContext,
  options: CoachClientOptions = {},
): Promise<CoachResponse> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const controller = new AbortController();
  const requestSignal = options.signal
    ? AbortSignal.any([controller.signal, options.signal])
    : controller.signal;
  let didTimeout = false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, options.timeoutMs ?? COACH_CLIENT_TIMEOUT_MS);

  try {
    const response = await fetchImpl("/api/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
      cache: "no-store",
      signal: requestSignal,
    });

    let body: unknown;

    try {
      body = await response.json();
    } catch {
      throw new CoachApiError(
        "INVALID_API_RESPONSE",
        "排演服务返回了无法识别的内容。",
      );
    }

    if (!response.ok) {
      const publicError = readPublicError(body);
      throw new CoachApiError(publicError.code, publicError.message);
    }

    const parsedResponse = CoachResponseSchema.safeParse(body);

    if (!parsedResponse.success) {
      throw new CoachApiError(
        "INVALID_API_RESPONSE",
        "排演服务返回内容不完整。",
      );
    }

    return parsedResponse.data;
  } catch (error) {
    if (error instanceof CoachApiError) {
      throw error;
    }

    if (didTimeout) {
      throw new CoachApiError("COACH_REQUEST_TIMEOUT", "排演请求超时。");
    }

    if (options.signal?.aborted) {
      throw new CoachApiError("COACH_REQUEST_ABORTED", "排演请求已取消。");
    }

    throw new CoachApiError("COACH_NETWORK_ERROR", "排演服务暂时无法连接。");
  } finally {
    clearTimeout(timeoutId);
  }
}
