import assert from "node:assert/strict";

import {
  AIProviderError,
  requestCoachFromProvider,
  type AIProviderOptions,
} from "../lib/ai-provider";
import { requestCoach, CoachApiError } from "../lib/coach-client";
import { buildCoachPrompt } from "../lib/coach-prompt";
import { createCoachRequestContext } from "../lib/coach-request";
import { CoachRequestSchema } from "../lib/coach-schema";
import {
  acceptCoachResponse,
  CoachServiceError,
  getCoachResponse,
} from "../lib/coach-service";
import {
  MOCK_SCENE_A_QUESTION,
  MOCK_SCENE_B_QUESTION,
} from "../lib/mock-coach";
import {
  SCENE_A_RESULT,
  SCENE_A_SCENARIO,
  SCENE_B_SCENARIO,
} from "../data/demo-results";
import {
  MAX_COACH_CLARIFICATIONS,
  type CoachRequestContext,
} from "../types/coach-request";
import type { AppState } from "../types/workflow";
import {
  INITIAL_APP_STATE,
  workflowReducer,
} from "../lib/workflow";

const validClarify = {
  status: "clarify",
  clarification_question: "你最不能接受的结果是什么？",
  context: { real_concern: null, flexibility: null },
} as const;

const baseRequest: CoachRequestContext = {
  target: { role: "leader", personality: "强势" },
  scenario: SCENE_A_SCENARIO,
  clarificationTurns: [],
  clarificationCount: 0,
  maxClarifications: MAX_COACH_CLARIFICATIONS,
};

async function assertRejectsWithCode(
  operation: () => Promise<unknown>,
  expectedCode: string,
): Promise<void> {
  await assert.rejects(operation, (error: unknown) => {
    return (
      (error instanceof CoachServiceError ||
        error instanceof AIProviderError ||
        error instanceof CoachApiError) &&
      error.code === expectedCode
    );
  });
}

async function main(): Promise<void> {
assert.equal(
  CoachRequestSchema.safeParse(baseRequest).success,
  true,
  "合法 AI request 应通过",
);
assert.equal(
  CoachRequestSchema.safeParse({ ...baseRequest, clarificationCount: 1 })
    .success,
  false,
  "追问次数与历史不一致应拒绝",
);

const narrowedRequest = createCoachRequestContext({
  role: "leader",
  personality: " 强势 ",
  scenario: ` ${SCENE_A_SCENARIO} `,
  clarificationTurns: [],
  clarificationCount: 0,
});
assert.ok(narrowedRequest, "应能建立窄化请求上下文");
assert.equal("gender" in narrowedRequest.target, false, "请求不应包含 gender");

const presetSceneAQuestion = await getCoachResponse(baseRequest, {
  env: { COACH_MODE: "preset" },
  sleep: async () => undefined,
});
assert.equal(presetSceneAQuestion.status, "clarify");
if (presetSceneAQuestion.status === "clarify") {
  assert.equal(
    presetSceneAQuestion.clarification_question,
    MOCK_SCENE_A_QUESTION,
    "Scene A preset 应保留指定追问",
  );
}

const sceneACompleteRequest: CoachRequestContext = {
  ...baseRequest,
  clarificationTurns: [
    {
      question: MOCK_SCENE_A_QUESTION,
      answer: "周末确实无法到场，但今晚可以先整理交接。",
    },
  ],
  clarificationCount: 1,
};
const presetSceneAComplete = await getCoachResponse(sceneACompleteRequest, {
  env: { COACH_MODE: "preset" },
  sleep: async () => undefined,
});
assert.equal(presetSceneAComplete.status, "complete");

const sceneBRequest: CoachRequestContext = {
  ...baseRequest,
  target: { role: "client", personality: "多疑" },
  scenario: SCENE_B_SCENARIO,
};
const presetSceneBQuestion = await getCoachResponse(sceneBRequest, {
  env: { COACH_MODE: "preset" },
  sleep: async () => undefined,
});
assert.equal(presetSceneBQuestion.status, "clarify");
if (presetSceneBQuestion.status === "clarify") {
  assert.equal(
    presetSceneBQuestion.clarification_question,
    MOCK_SCENE_B_QUESTION,
    "Scene B preset 应保留指定追问",
  );
}

const realClarify = await getCoachResponse(baseRequest, {
  env: { COACH_MODE: "real" },
  provider: async () => JSON.stringify(validClarify),
});
assert.equal(realClarify.status, "clarify", "合法真实 clarify 应接受");

const realComplete = await getCoachResponse(baseRequest, {
  env: { COACH_MODE: "real" },
  provider: async () => JSON.stringify(SCENE_A_RESULT),
});
assert.equal(realComplete.status, "complete", "合法真实 complete 应接受");

let retrySuccessAttempts = 0;
const retrySuccess = await getCoachResponse(baseRequest, {
  env: { COACH_MODE: "real" },
  provider: async () => {
    retrySuccessAttempts += 1;

    if (retrySuccessAttempts === 1) {
      throw new AIProviderError(
        "AI_PROVIDER_HTTP_ERROR",
        "temporary 5xx",
        true,
      );
    }

    return SCENE_A_RESULT;
  },
});
assert.equal(retrySuccess.status, "complete", "一次重试后应能成功");
assert.equal(retrySuccessAttempts, 2, "重试成功路径必须恰好调用两次");

let retryFailureAttempts = 0;
await assertRejectsWithCode(
  () =>
    getCoachResponse(baseRequest, {
      env: { COACH_MODE: "real" },
      provider: async () => {
        retryFailureAttempts += 1;
        return "not-json";
      },
    }),
  "INVALID_AI_JSON",
);
assert.equal(retryFailureAttempts, 2, "重试失败后必须停止在第二次");

let timeoutRetryAttempts = 0;
const timeoutRetrySuccess = await getCoachResponse(baseRequest, {
  env: { COACH_MODE: "real" },
  provider: async () => {
    timeoutRetryAttempts += 1;

    if (timeoutRetryAttempts === 1) {
      throw new AIProviderError("AI_TIMEOUT", "temporary timeout", true);
    }

    return SCENE_A_RESULT;
  },
});
assert.equal(timeoutRetrySuccess.status, "complete");
assert.equal(timeoutRetryAttempts, 2, "timeout 应允许一次内部重试");

await assertRejectsWithCode(
  () =>
    getCoachResponse(baseRequest, {
      env: { COACH_MODE: "real" },
      provider: async () => "not-json",
    }),
  "INVALID_AI_JSON",
);
await assertRejectsWithCode(
  () =>
    getCoachResponse(baseRequest, {
      env: { COACH_MODE: "real" },
      provider: async () => ({ status: "complete", options: [] }),
    }),
  "INVALID_AI_RESPONSE",
);

const atLimitRequest: CoachRequestContext = {
  ...baseRequest,
  clarificationTurns: [
    { question: "问题一？", answer: "回答一" },
    { question: "问题二？", answer: "回答二" },
  ],
  clarificationCount: 2,
};
const forceCompleteFlags: boolean[] = [];
await assertRejectsWithCode(
  () =>
    getCoachResponse(atLimitRequest, {
      env: { COACH_MODE: "real" },
      provider: async (_request, attempt) => {
        forceCompleteFlags.push(attempt.forceComplete);
        return validClarify;
      },
    }),
  "CLARIFICATION_LIMIT_REACHED",
);
assert.deepEqual(
  forceCompleteFlags,
  [true, true],
  "第三轮 clarify 应只重试一次且两次都强制 complete",
);
assert.equal(
  buildCoachPrompt(atLimitRequest, { forceComplete: true })
    .systemInstruction.includes("禁止返回 clarify"),
  true,
  "达到上限时 Prompt 必须明确禁止 clarify",
);

assert.throws(
  () => acceptCoachResponse("not-json", 0),
  (error: unknown) =>
    error instanceof CoachServiceError && error.code === "INVALID_AI_JSON",
  "非法 JSON 应被解析层拒绝",
);

let capturedAuthorization = "";
const providerOptions: AIProviderOptions = {
  env: {
    AI_API_KEY: "server-secret-sentinel",
    AI_BASE_URL: "https://provider.example/v1",
    AI_MODEL: "coach-model",
  },
  fetchImpl: async (_input, init) => {
    capturedAuthorization = new Headers(init?.headers).get("Authorization") ?? "";
    return Response.json({
      choices: [{ message: { content: JSON.stringify(validClarify) } }],
    });
  },
};
const providerRaw = await requestCoachFromProvider(baseRequest, providerOptions);
assert.equal(
  capturedAuthorization,
  "Bearer server-secret-sentinel",
  "Provider 应使用服务端 Bearer token",
);
assert.equal(
  typeof providerRaw,
  "string",
  "Provider adapter 应返回 raw assistant content",
);

const abortingFetch: NonNullable<AIProviderOptions["fetchImpl"]> = (
  _input,
  init,
) =>
  new Promise((_resolve, reject) => {
    init?.signal?.addEventListener("abort", () => {
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
await assertRejectsWithCode(
  () =>
    requestCoachFromProvider(baseRequest, {
      ...providerOptions,
      fetchImpl: abortingFetch,
      timeoutMs: 5,
    }),
  "AI_TIMEOUT",
);

await assertRejectsWithCode(
  () =>
    requestCoach(baseRequest, {
      fetchImpl: abortingFetch,
      timeoutMs: 5,
    }),
  "COACH_REQUEST_TIMEOUT",
);

const externalAbortController = new AbortController();
const externallyAbortedRequest = requestCoach(baseRequest, {
  fetchImpl: abortingFetch,
  timeoutMs: 1_000,
  signal: externalAbortController.signal,
});
externalAbortController.abort();
await assertRejectsWithCode(
  () => externallyAbortedRequest,
  "COACH_REQUEST_ABORTED",
);

await assertRejectsWithCode(
  () =>
    requestCoach(baseRequest, {
      fetchImpl: async () => Response.json({ status: "complete", options: [] }),
    }),
  "INVALID_API_RESPONSE",
);

const fallbackState: AppState = {
  ...INITIAL_APP_STATE,
  status: "fallback",
  clarificationCount: 1,
  target: {
    role: "leader",
    gender: "male",
    personalityPreset: "strong",
    customPersonality: "",
  },
  conversation: {
    scenario: SCENE_A_SCENARIO,
    clarificationTurns: [
      {
        question: MOCK_SCENE_A_QUESTION,
        answer: "周末无法到场，但今晚可以交接。",
      },
    ],
    pendingClarificationQuestion: null,
  },
  result: null,
};
const retriedState = workflowReducer(fallbackState, {
  type: "RETRY_GENERATION",
});
assert.equal(retriedState.status, "generating", "fallback 应可重新尝试");
assert.equal(
  retriedState.conversation.scenario,
  SCENE_A_SCENARIO,
  "重试必须保留场景上下文",
);
const offlineRecoveredState = workflowReducer(fallbackState, {
  type: "USE_PRESET_RESULT",
  result: SCENE_A_RESULT,
});
assert.equal(
  offlineRecoveredState.status,
  "results",
  "fallback 应可直接使用离线结果",
);
assert.equal(
  offlineRecoveredState.result?.status,
  "complete",
  "离线恢复必须写入合法 complete result",
);

  console.log("Coach API assertions passed.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
