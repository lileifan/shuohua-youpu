import { buildCoachPrompt } from "./coach-prompt";
import type { CoachRequestContext } from "../types/coach-request";

export const AI_PROVIDER_TIMEOUT_MS = 20_000;

export type AIProviderErrorCode =
  | "AI_CONFIGURATION_ERROR"
  | "AI_TIMEOUT"
  | "AI_PROVIDER_HTTP_ERROR"
  | "AI_PROVIDER_RESPONSE_ERROR"
  | "AI_REQUEST_ABORTED";

export class AIProviderError extends Error {
  constructor(
    public readonly code: AIProviderErrorCode,
    message: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "AIProviderError";
  }
}

export interface AIProviderEnvironment {
  [key: string]: string | undefined;
  AI_API_KEY?: string;
  AI_BASE_URL?: string;
  AI_MODEL?: string;
}

type FetchLike = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface AIProviderOptions {
  env?: AIProviderEnvironment;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
  signal?: AbortSignal;
  forceComplete?: boolean;
}

function getProviderConfig(env: AIProviderEnvironment) {
  const apiKey = env.AI_API_KEY?.trim();
  const baseUrl = env.AI_BASE_URL?.trim();
  const model = env.AI_MODEL?.trim();

  if (!apiKey || !baseUrl || !model) {
    throw new AIProviderError(
      "AI_CONFIGURATION_ERROR",
      "真实 AI 模式缺少服务端配置。",
    );
  }

  let parsedBaseUrl: URL;

  try {
    parsedBaseUrl = new URL(baseUrl);
  } catch {
    throw new AIProviderError(
      "AI_CONFIGURATION_ERROR",
      "AI_BASE_URL 不是有效地址。",
    );
  }

  if (!["http:", "https:"].includes(parsedBaseUrl.protocol)) {
    throw new AIProviderError(
      "AI_CONFIGURATION_ERROR",
      "AI_BASE_URL 必须使用 HTTP 或 HTTPS。",
    );
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const endpoint = normalizedBaseUrl.endsWith("/chat/completions")
    ? normalizedBaseUrl
    : `${normalizedBaseUrl}/chat/completions`;

  return { apiKey, endpoint, model };
}

function getAssistantContent(envelope: unknown): unknown {
  if (!envelope || typeof envelope !== "object") {
    throw new AIProviderError(
      "AI_PROVIDER_RESPONSE_ERROR",
      "AI 服务返回了无法识别的响应。",
      true,
    );
  }

  const choices = (envelope as { choices?: unknown }).choices;

  if (!Array.isArray(choices) || choices.length === 0) {
    throw new AIProviderError(
      "AI_PROVIDER_RESPONSE_ERROR",
      "AI 服务响应缺少 choices。",
      true,
    );
  }

  const firstChoice = choices[0] as
    | { message?: { content?: unknown } }
    | undefined;
  const content = firstChoice?.message?.content;

  if (typeof content !== "string" && typeof content !== "object") {
    throw new AIProviderError(
      "AI_PROVIDER_RESPONSE_ERROR",
      "AI 服务响应缺少有效内容。",
      true,
    );
  }

  return content;
}

export async function requestCoachFromProvider(
  request: CoachRequestContext,
  options: AIProviderOptions = {},
): Promise<unknown> {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const timeoutMs = options.timeoutMs ?? AI_PROVIDER_TIMEOUT_MS;
  const { apiKey, endpoint, model } = getProviderConfig(env);
  const prompt = buildCoachPrompt(request, {
    forceComplete: options.forceComplete,
  });
  const controller = new AbortController();
  const requestSignal = options.signal
    ? AbortSignal.any([controller.signal, options.signal])
    : controller.signal;
  let didTimeout = false;
  const timeoutId = setTimeout(() => {
    didTimeout = true;
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetchImpl(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: prompt.systemInstruction },
          { role: "user", content: prompt.contextPayload },
        ],
        response_format: { type: "json_object" },
      }),
      cache: "no-store",
      signal: requestSignal,
    });

    if (!response.ok) {
      throw new AIProviderError(
        "AI_PROVIDER_HTTP_ERROR",
        `AI 服务请求失败（HTTP ${response.status}）。`,
        response.status >= 500 || response.status === 429,
      );
    }

    let envelope: unknown;

    try {
      envelope = await response.json();
    } catch {
      throw new AIProviderError(
        "AI_PROVIDER_RESPONSE_ERROR",
        "AI 服务没有返回有效 JSON 响应。",
        true,
      );
    }

    return getAssistantContent(envelope);
  } catch (error) {
    if (error instanceof AIProviderError) {
      throw error;
    }

    if (didTimeout) {
      throw new AIProviderError("AI_TIMEOUT", "AI 服务请求超时。", true);
    }

    if (options.signal?.aborted) {
      throw new AIProviderError(
        "AI_REQUEST_ABORTED",
        "AI 服务请求已取消。",
      );
    }

    throw new AIProviderError(
      "AI_PROVIDER_HTTP_ERROR",
      "AI 服务暂时无法连接。",
      true,
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
