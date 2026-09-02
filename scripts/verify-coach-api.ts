import assert from "node:assert/strict";

import {
  AIProviderError,
  requestCoachFromProvider,
  type AIProviderOptions,
} from "../lib/ai-provider";
import { requestCoach, CoachApiError } from "../lib/coach-client";
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
await assertRejectsWithCode(
  () =>
    getCoachResponse(atLimitRequest, {
      env: { COACH_MODE: "real" },
      provider: async () => validClarify,
    }),
  "CLARIFICATION_LIMIT_REACHED",
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

await assertRejectsWithCode(
  () =>
    requestCoach(baseRequest, {
      fetchImpl: async () => Response.json({ status: "complete", options: [] }),
    }),
  "INVALID_API_RESPONSE",
);

  console.log("Coach API assertions passed.");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
