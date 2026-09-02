import { useRef } from "react";
import type { Dispatch } from "react";

import { createCoachRequestContext } from "../lib/coach-request";
import { getPresetCoachResult } from "../lib/preset-coach";
import { getEffectivePersonality, getScenario } from "../lib/workflow";
import type { CoachRequestContext } from "../types/coach-request";
import type { AppState, WorkflowAction } from "../types/workflow";

interface FallbackStageProps {
  state: AppState;
  dispatch: Dispatch<WorkflowAction>;
  submitCoachRequest: (request: CoachRequestContext) => void;
}

export function FallbackStage({
  state,
  dispatch,
  submitCoachRequest,
}: FallbackStageProps) {
  const actionLock = useRef(false);

  function handleRetry() {
    if (actionLock.current) {
      return;
    }

    actionLock.current = true;
    const request = createCoachRequestContext({
      role: state.target.role,
      personality: getEffectivePersonality(state),
      scenario: getScenario(state),
      clarificationTurns: state.conversation.clarificationTurns,
      clarificationCount: state.conversation.clarificationTurns.length,
    });
    dispatch({ type: "RETRY_GENERATION" });

    if (!request) {
      dispatch({ type: "GENERATION_FAILED" });
      return;
    }

    submitCoachRequest(request);
  }

  function handleOfflineRehearsal() {
    if (actionLock.current) {
      return;
    }

    actionLock.current = true;
    dispatch({
      type: "USE_PRESET_RESULT",
      result: getPresetCoachResult(state),
    });
  }

  return (
    <section className="stage-content" aria-labelledby="fallback-title">
      <p className="stage-kicker">第三幕·排演</p>
      <h2 id="fallback-title">剧场暂时断线了</h2>
      <p className="workflow-placeholder">
        可以重新连接教练，或使用离线预设继续完成这场排演。
      </p>
      <div className="results-actions">
        <button
          className="primary-action"
          type="button"
          onClick={handleRetry}
        >
          重新尝试
        </button>
        <button
          className="secondary-action"
          type="button"
          onClick={handleOfflineRehearsal}
        >
          使用离线排演
        </button>
      </div>
    </section>
  );
}
