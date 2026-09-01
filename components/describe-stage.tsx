import { useRef } from "react";
import type { Dispatch, FormEvent } from "react";

import { diagnoseWithMockCoach } from "../lib/mock-coach";
import {
  getScenario,
  hasValidScenario,
  MAX_SCENARIO_LENGTH,
} from "../lib/workflow";
import type { AppState, WorkflowAction } from "../types/workflow";

interface DescribeStageProps {
  state: AppState;
  dispatch: Dispatch<WorkflowAction>;
  targetSummary: string | null;
}

export function DescribeStage({
  state,
  dispatch,
  targetSummary,
}: DescribeStageProps) {
  const submitLock = useRef(false);
  const scenarioIsValid = hasValidScenario(state);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitLock.current || !scenarioIsValid) {
      return;
    }

    submitLock.current = true;
    const decision = diagnoseWithMockCoach({
      scenario: getScenario(state),
      clarificationTurns: state.conversation.clarificationTurns,
    });

    if (decision.type === "clarify") {
      dispatch({
        type: "REQUEST_CLARIFICATION",
        question: decision.question,
      });
      return;
    }

    dispatch({ type: "START_GENERATING" });
  }

  return (
    <section className="stage-content" aria-labelledby="describe-title">
      <p className="stage-kicker">第二幕·起因</p>
      <h2 id="describe-title">
        最近有什么话不知道怎么说？说给我听听。
      </h2>
      {targetSummary ? (
        <p className="target-summary">{targetSummary}</p>
      ) : null}
      <p className="mock-coach-note" role="note">
        <strong>Mock Coach</strong>
        离线流程演示，当前未连接真实 AI。
      </p>

      <form className="scenario-form" onSubmit={handleSubmit}>
        <label htmlFor="scenario">你的沟通困境</label>
        <textarea
          id="scenario"
          value={state.conversation.scenario}
          maxLength={MAX_SCENARIO_LENGTH}
          rows={7}
          aria-describedby="scenario-limit"
          onChange={(event) =>
            dispatch({ type: "SET_SCENARIO", value: event.target.value })
          }
        />
        <p id="scenario-limit" className="character-limit">
          {state.conversation.scenario.length} / {MAX_SCENARIO_LENGTH} 字符
        </p>
        <button
          className="primary-action"
          type="submit"
          disabled={!scenarioIsValid}
        >
          开始排演
        </button>
      </form>
    </section>
  );
}
