import assert from "node:assert/strict";

import {
  SCENE_A_RESULT,
  SCENE_B_RESULT,
} from "../data/demo-results";
import { buildCoachPrompt } from "../lib/coach-prompt";
import {
  ClarifyCoachResultSchema,
  CoachResponseSchema,
  CoachRequestSchema,
  CompleteCoachResultSchema,
  validateCoachResponseForState,
} from "../lib/coach-schema";
import {
  MAX_COACH_CLARIFICATIONS,
  type CoachRequestContext,
} from "../types/coach-request";

const validClarify = {
  status: "clarify",
  clarification_question: "这次沟通里，你最不能接受的结果是什么？",
  context: {
    real_concern: "担心影响后续合作",
    flexibility: null,
  },
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function assertRejected(value: unknown, message: string): void {
  assert.equal(CoachResponseSchema.safeParse(value).success, false, message);
}

assert.equal(
  ClarifyCoachResultSchema.safeParse(validClarify).success,
  true,
  "合法 clarify 应通过",
);
assert.equal(
  CompleteCoachResultSchema.safeParse(SCENE_A_RESULT).success,
  true,
  "合法 complete 应通过",
);

assertRejected({ ...validClarify, status: "unknown" }, "非法 status 应拒绝");
assertRejected(
  { ...validClarify, clarification_question: "   " },
  "空追问应拒绝",
);

const wrongOptionCount = clone(SCENE_A_RESULT);
wrongOptionCount.options = wrongOptionCount.options.slice(0, 2);
assertRejected(wrongOptionCount, "options 不是三条应拒绝");

const duplicateStyle = clone(SCENE_A_RESULT);
duplicateStyle.options[2].style = "soft";
assertRejected(duplicateStyle, "重复 style 应拒绝");

const invalidReaction: unknown = {
  ...clone(SCENE_A_RESULT),
  options: clone(SCENE_A_RESULT.options).map((option, index) =>
    index === 0 ? { ...option, reaction_category: "surprised" } : option,
  ),
};
assertRejected(invalidReaction, "非法 reaction_category 应拒绝");

const emptyText = clone(SCENE_A_RESULT);
emptyText.options[0].script = "   ";
assertRejected(emptyText, "纯空格必填文本应拒绝");

const clarifyAtLimit = validateCoachResponseForState(validClarify, {
  clarificationCount: MAX_COACH_CLARIFICATIONS,
});
assert.equal(clarifyAtLimit.success, false, "两轮后 clarify 应被应用层拒绝");
if (!clarifyAtLimit.success) {
  assert.equal(
    clarifyAtLimit.code,
    "CLARIFICATION_LIMIT_REACHED",
    "应返回明确的追问上限错误码",
  );
}

const completeAtLimit = validateCoachResponseForState(SCENE_A_RESULT, {
  clarificationCount: MAX_COACH_CLARIFICATIONS,
});
assert.equal(completeAtLimit.success, true, "两轮后 complete 仍应接受");

for (const [name, preset] of [
  ["Scene A", SCENE_A_RESULT],
  ["Scene B", SCENE_B_RESULT],
] as const) {
  assert.equal(
    CompleteCoachResultSchema.safeParse(preset).success,
    true,
    `${name} preset 应符合 complete schema`,
  );
}

const request: CoachRequestContext = {
  target: { role: "leader", personality: "强势" },
  scenario: "我需要表达一个明确边界。",
  clarificationTurns: [],
  clarificationCount: 0,
  maxClarifications: MAX_COACH_CLARIFICATIONS,
};
assert.equal(
  CoachRequestSchema.safeParse({
    ...request,
    target: { role: "peer", personality: "严谨" },
  }).success,
  true,
  "peer 角色请求应通过 schema",
);
const prompt = buildCoachPrompt(request);
const promptPayload = JSON.parse(prompt.contextPayload) as Record<
  string,
  unknown
>;
assert.equal("gender" in promptPayload, false, "Prompt payload 不应包含 gender");
assert.equal(
  prompt.contextPayload.includes('"gender"'),
  false,
  "Prompt payload 的嵌套字段也不应包含 gender",
);
assert.equal(
  prompt.contextPayload.includes("Scene A") ||
    prompt.contextPayload.includes("Scene B"),
  false,
  "Prompt 不应硬编码主演示场景",
);
assert.equal(
  prompt.systemInstruction.includes("每轮只能问一个最关键的问题"),
  true,
  "System instruction 应限制每轮一个问题",
);
assert.equal(
  buildCoachPrompt({
    ...request,
    target: { role: "peer", personality: "严谨" },
  }).systemInstruction.includes("peer=平级同事"),
  true,
  "Prompt 应解释 peer 角色含义",
);
assert.equal(
  prompt.systemInstruction.includes(
    "真实顾虑已经明确，但底线或可接受的折中空间不清楚",
  ),
  true,
  "Prompt 应识别顾虑已明确但底线/弹性未明的情形",
);
assert.equal(
  prompt.systemInstruction.includes("优先追问底线或可接受的折中空间"),
  true,
  "Prompt 应优先追问底线或折中空间",
);
assert.equal(
  prompt.systemInstruction.includes("不要优先追问背景原因"),
  true,
  "Prompt 应降低不影响策略的原因问题优先级",
);
assert.equal(
  prompt.systemInstruction.includes("分阶段交付、部分验收、调整范围"),
  true,
  "Prompt 应给出通用的交付弹性示例",
);
assert.equal(
  prompt.systemInstruction.includes("输出保持简洁"),
  true,
  "Prompt 应明确限制输出简洁",
);
assert.equal(
  prompt.systemInstruction.includes("每版话术保持简洁，不要过长"),
  true,
  "Prompt 应要求三版话术不要过长",
);
assert.equal(
  prompt.systemInstruction.includes("只输出一个 JSON 对象"),
  true,
  "Prompt 应继续要求 JSON-only 输出",
);

console.log("Coach protocol assertions passed.");
