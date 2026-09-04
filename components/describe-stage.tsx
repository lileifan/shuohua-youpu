import { useRef } from "react";
import type { Dispatch, FormEvent } from "react";

import { createCoachRequestContext } from "../lib/coach-request";
import {
  getEffectivePersonality,
  getScenario,
  hasValidScenario,
  MAX_SCENARIO_LENGTH,
  SKIPPED_SCENARIO,
} from "../lib/workflow";
import type { AppState, WorkflowAction } from "../types/workflow";
import type { CoachRequestContext } from "../types/coach-request";
import { DevOfflineBadge } from "./dev-offline-badge";

interface DescribeStageProps {
  state: AppState;
  dispatch: Dispatch<WorkflowAction>;
  targetSummary: string | null;
  submitCoachRequest: (request: CoachRequestContext) => void;
}

export function DescribeStage({
  state,
  dispatch,
  targetSummary,
  submitCoachRequest,
}: DescribeStageProps) {
  const submitLock = useRef(false);
  const scenarioIsValid = hasValidScenario(state);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitLock.current || !scenarioIsValid) {
      return;
    }

    submitLock.current = true;
    const scenario = getScenario(state);
    const request = createCoachRequestContext({
      role: state.target.role,
      personality: getEffectivePersonality(state),
      scenario,
      clarificationTurns: state.conversation.clarificationTurns,
      clarificationCount: state.conversation.clarificationTurns.length,
    });
    dispatch({ type: "START_GENERATING" });

    if (!request) {
      dispatch({ type: "GENERATION_FAILED" });
      return;
    }

    submitCoachRequest(request);
  }

  function handleSkip() {
    if (submitLock.current) {
      return;
    }

    submitLock.current = true;
    const request = createCoachRequestContext({
      role: state.target.role,
      personality: getEffectivePersonality(state),
      scenario: SKIPPED_SCENARIO,
      clarificationTurns: state.conversation.clarificationTurns,
      clarificationCount: state.conversation.clarificationTurns.length,
    });
    dispatch({ type: "SET_SCENARIO", value: SKIPPED_SCENARIO });
    dispatch({ type: "START_GENERATING" });

    if (!request) {
      dispatch({ type: "GENERATION_FAILED" });
      return;
    }

    submitCoachRequest(request);
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
      <DevOfflineBadge />

      <form className="scenario-form" onSubmit={handleSubmit}>
        <label htmlFor="scenario">你的沟通困境（可选）</label>
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
        <div className="scenario-actions">
          <button
            className="primary-action"
            type="submit"
            disabled={!scenarioIsValid || submitLock.current}
          >
            开始排演
          </button>
          <button
            className="secondary-action scenario-skip"
            type="button"
            onClick={handleSkip}
            disabled={submitLock.current}
          >
            跳过情境，直接排演
          </button>
        </div>
      </form>
    </section>
  );
}
