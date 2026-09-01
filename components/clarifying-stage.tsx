import { useRef, useState } from "react";
import type { Dispatch, FormEvent } from "react";

import { diagnoseWithMockCoach } from "../lib/mock-coach";
import { getScenario, MAX_SCENARIO_LENGTH } from "../lib/workflow";
import type { AppState, WorkflowAction } from "../types/workflow";
import { ConversationScript } from "./conversation-script";

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

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
    const decision = diagnoseWithMockCoach({
      scenario: getScenario(state),
      clarificationTurns: nextTurns,
    });

    dispatch({
      type: "ANSWER_CLARIFICATION",
      answer: answerText,
      nextQuestion: decision.type === "clarify" ? decision.question : null,
    });
  }

  return (
    <section className="stage-content" aria-labelledby="clarifying-title">
      <p className="stage-kicker">第二幕·起因</p>
      <h2 id="clarifying-title">再确认一个关键细节</h2>
      {targetSummary ? (
        <p className="target-summary">{targetSummary}</p>
      ) : null}
      <p className="mock-coach-note" role="note">
        <strong>Mock Coach</strong>
        离线追问第 {state.clarificationCount} / 2 轮
      </p>

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
