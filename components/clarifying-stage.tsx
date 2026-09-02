import { useRef, useState } from "react";
import type { Dispatch, FormEvent } from "react";

import { requestCoach } from "../lib/coach-client";
import { createCoachRequestContext } from "../lib/coach-request";
import {
  getEffectivePersonality,
  getScenario,
  MAX_SCENARIO_LENGTH,
} from "../lib/workflow";
import type { AppState, WorkflowAction } from "../types/workflow";
import { ConversationScript } from "./conversation-script";
import { DevOfflineBadge } from "./dev-offline-badge";

interface ClarifyingStageProps {
  state: AppState;
  dispatch: Dispatch<WorkflowAction>;
  targetSummary: string | null;
}

export function ClarifyingStage({
  state,
  dispatch,
  targetSummary,
}: ClarifyingStageProps) {
  const [answer, setAnswer] = useState("");
  const submitLock = useRef(false);
  const currentQuestion =
    state.conversation.pendingClarificationQuestion ?? "";
  const answerIsValid = Boolean(answer.trim());

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitLock.current || !answerIsValid || !currentQuestion) {
      return;
    }

    submitLock.current = true;
    const answerText = answer.trim();
    const nextTurns = [
      ...state.conversation.clarificationTurns,
      { question: currentQuestion, answer: answerText },
    ];
    const request = createCoachRequestContext({
      role: state.target.role,
      personality: getEffectivePersonality(state),
      scenario: getScenario(state),
      clarificationTurns: nextTurns,
      clarificationCount: nextTurns.length,
    });

    dispatch({
      type: "ANSWER_CLARIFICATION",
      answer: answerText,
      nextQuestion: null,
    });

    if (!request) {
      dispatch({ type: "GENERATION_FAILED" });
      return;
    }

    try {
      const response = await requestCoach(request);

      if (response.status === "clarify") {
        dispatch({
          type: "REQUEST_CLARIFICATION",
          question: response.clarification_question,
        });
        return;
      }

      dispatch({ type: "GENERATION_SUCCEEDED", result: response });
    } catch {
      dispatch({ type: "GENERATION_FAILED" });
    }
  }

  return (
    <section className="stage-content" aria-labelledby="clarifying-title">
      <p className="stage-kicker">第二幕·起因</p>
      <h2 id="clarifying-title">再确认一个关键细节</h2>
      {targetSummary ? (
        <p className="target-summary">{targetSummary}</p>
      ) : null}
      <div className="clarification-meta">
        <span>追问第 {state.clarificationCount} / 2 轮</span>
        <DevOfflineBadge />
      </div>

      <ConversationScript
        scenario={getScenario(state)}
        clarificationTurns={state.conversation.clarificationTurns}
        pendingQuestion={currentQuestion}
      />

      <form className="clarification-form" onSubmit={handleSubmit}>
        <label htmlFor="clarification-answer">你的回答</label>
        <textarea
          id="clarification-answer"
          value={answer}
          maxLength={MAX_SCENARIO_LENGTH}
          rows={4}
          aria-describedby="answer-limit"
          onChange={(event) => setAnswer(event.target.value)}
        />
        <p id="answer-limit" className="character-limit">
          {answer.length} / {MAX_SCENARIO_LENGTH} 字符
        </p>
        <button
          className="primary-action"
          type="submit"
          disabled={!answerIsValid}
        >
          继续排演
        </button>
      </form>
    </section>
  );
}
