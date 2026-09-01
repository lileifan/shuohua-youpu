import { useEffect } from "react";
import type { Dispatch } from "react";

import {
  getPresetCoachResult,
  PRESET_LOADING_DELAY_MS,
} from "../lib/preset-coach";
import { getScenario } from "../lib/workflow";
import type { AppState, WorkflowAction } from "../types/workflow";
import { ConversationScript } from "./conversation-script";
import { DevOfflineBadge } from "./dev-offline-badge";

interface GeneratingStageProps {
  state: AppState;
  dispatch: Dispatch<WorkflowAction>;
  targetSummary: string | null;
}

export function GeneratingStage({
  state,
  dispatch,
  targetSummary,
}: GeneratingStageProps) {
  useEffect(() => {
    const timerId = window.setTimeout(() => {
      dispatch({
        type: "GENERATION_SUCCEEDED",
        result: getPresetCoachResult(state),
      });
    }, PRESET_LOADING_DELAY_MS);

    return () => window.clearTimeout(timerId);
  }, [dispatch, state]);

  return (
    <section
      className="stage-content"
      aria-labelledby="generating-title"
      aria-busy="true"
    >
      <p className="stage-kicker">第三幕·排演</p>
      <div className="generating-heading" aria-live="polite">
        <span className="generating-mark" aria-hidden="true">
          幕
        </span>
        <div>
          <h2 id="generating-title">正在为这场对话排戏……</h2>
          <p>正在整理这场对话的边界、策略和下一步。</p>
        </div>
      </div>
      <DevOfflineBadge />
      {targetSummary ? (
        <p className="target-summary">{targetSummary}</p>
      ) : null}
      <ConversationScript
        scenario={getScenario(state)}
        clarificationTurns={state.conversation.clarificationTurns}
      />
    </section>
  );
}
