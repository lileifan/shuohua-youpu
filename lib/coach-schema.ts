import { z } from "zod";

import { MAX_COACH_CLARIFICATIONS } from "../types/coach-request";
import type { CoachResponse } from "../types/coach-result";

const NonEmptyTextSchema = z.string().trim().min(1, "文本不能为空");
const OptionalContextTextSchema = NonEmptyTextSchema.nullable();

const ClarificationTurnSchema = z
  .object({
    question: NonEmptyTextSchema.max(500),
    answer: NonEmptyTextSchema.max(500),
  })
  .strict();

export const CoachRequestSchema = z
  .object({
    target: z
      .object({
        role: z.enum(["leader", "client", "peer"]),
        personality: NonEmptyTextSchema.max(20),
      })
      .strict(),
    scenario: NonEmptyTextSchema.max(500),
    clarificationTurns: z
      .array(ClarificationTurnSchema)
      .max(MAX_COACH_CLARIFICATIONS),
    clarificationCount: z
      .number()
      .int()
      .min(0)
      .max(MAX_COACH_CLARIFICATIONS),
    maxClarifications: z.literal(MAX_COACH_CLARIFICATIONS),
  })
  .strict()
  .superRefine((request, context) => {
    if (request.clarificationCount !== request.clarificationTurns.length) {
      context.addIssue({
        code: "custom",
        path: ["clarificationCount"],
        message: "追问次数必须与已完成追问记录一致",
      });
    }
  });

export const StrategyStyleSchema = z.enum([
  "soft",
  "direct",
  "indirect",
]);

export const ReactionCategorySchema = z.enum([
  "angry",
  "awkward",
  "smile",
  "doubt",
]);

export const StrategyOptionSchema = z
  .object({
    style: StrategyStyleSchema,
    label: NonEmptyTextSchema,
    strategy: NonEmptyTextSchema,
    script: NonEmptyTextSchema,
    predicted_reaction: NonEmptyTextSchema,
    reaction_category: ReactionCategorySchema,
    follow_up_tip: NonEmptyTextSchema,
  })
  .strict();

export const ClarifyCoachResultSchema = z
  .object({
    status: z.literal("clarify"),
    clarification_question: NonEmptyTextSchema,
    context: z
      .object({
        real_concern: OptionalContextTextSchema,
        flexibility: OptionalContextTextSchema,
      })
      .strict(),
  })
  .strict();

const REQUIRED_STRATEGY_STYLES = ["soft", "direct", "indirect"] as const;

export const CompleteCoachResultSchema = z
  .object({
    status: z.literal("complete"),
    assumptions_notice: OptionalContextTextSchema,
    context_summary: NonEmptyTextSchema,
    options: z.array(StrategyOptionSchema).length(3, "必须返回三条策略"),
  })
  .strict()
  .superRefine((result, context) => {
    for (const style of REQUIRED_STRATEGY_STYLES) {
      const styleCount = result.options.filter(
        (option) => option.style === style,
      ).length;

      if (styleCount !== 1) {
        context.addIssue({
          code: "custom",
          path: ["options"],
          message: `策略 ${style} 必须且只能出现一次`,
        });
      }
    }
  });

export const CoachResponseSchema = z.discriminatedUnion("status", [
  ClarifyCoachResultSchema,
  CompleteCoachResultSchema,
]);

export type CoachResponseValidationErrorCode =
  | "INVALID_RESPONSE"
  | "CLARIFICATION_LIMIT_REACHED";

export type CoachResponseValidationResult =
  | { success: true; data: CoachResponse }
  | {
      success: false;
      code: CoachResponseValidationErrorCode;
      message: string;
      issues?: z.ZodIssue[];
    };

interface CoachResponseStateContext {
  clarificationCount: number;
}

export function validateCoachResponseForState(
  input: unknown,
  state: CoachResponseStateContext,
): CoachResponseValidationResult {
  const parsedResponse = CoachResponseSchema.safeParse(input);

  if (!parsedResponse.success) {
    return {
      success: false,
      code: "INVALID_RESPONSE",
      message: "AI 返回内容不符合教练响应协议。",
      issues: parsedResponse.error.issues,
    };
  }

  if (
    parsedResponse.data.status === "clarify" &&
    state.clarificationCount >= MAX_COACH_CLARIFICATIONS
  ) {
    return {
      success: false,
      code: "CLARIFICATION_LIMIT_REACHED",
      message: "追问已达到 2 轮，应用只接受 complete 响应。",
    };
  }

  return { success: true, data: parsedResponse.data };
}
