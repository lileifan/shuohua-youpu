import type { Dispatch } from "react";

import type {
  CompleteCoachResult,
  StrategyOption,
  StrategyStyle,
} from "../types/coach-result";
import type { AppState, WorkflowAction } from "../types/workflow";
import { DevOfflineBadge } from "./dev-offline-badge";
import { StrategyCard } from "./strategy-card";

interface ResultsStageProps {
  state: AppState;
  result: CompleteCoachResult;
  dispatch: Dispatch<WorkflowAction>;
  targetSummary: string | null;
}

const STYLE_ORDER: readonly StrategyStyle[] = [
  "soft",
  "direct",
  "indirect",
];

function getOrderedOptions(result: CompleteCoachResult): StrategyOption[] {
  return STYLE_ORDER.flatMap((style) => {
    const option = result.options.find((item) => item.style === style);
    return option ? [option] : [];
  });
}

export function ResultsStage({
  state,
  result,
  dispatch,
  targetSummary,
}: ResultsStageProps) {
  const { role, gender } = state.target;

  if (!role || !gender) {
    return (
      <p className="workflow-placeholder">当前对话对象信息不完整。</p>
    );
  }

  const options = getOrderedOptions(result);

  return (
    <section
      className="stage-content results-stage"
      aria-labelledby="results-title"
    >
      <div className="results-heading-row">
        <div>
          <p className="stage-kicker">第三幕·排演</p>
          <h2 id="results-title">三种说法，三条不同的路</h2>
        </div>
        <DevOfflineBadge />
      </div>

      {targetSummary ? (
        <p className="target-summary">{targetSummary}</p>
      ) : null}

      {result.assumptions_notice ? (
        <p className="assumptions-notice">{result.assumptions_notice}</p>
      ) : null}

      <section className="context-summary" aria-label="这场对话的关键">
        <p>这场对话的关键</p>
        <strong>{result.context_summary}</strong>
      </section>

      <div className="strategy-grid">
        {options.map((option, index) => (
          <StrategyCard
            key={option.style}
            option={option}
            role={role}
            gender={gender}
            index={index}
          />
        ))}
      </div>

      <div className="results-actions">
        <button
          className="primary-action"
          type="button"
          onClick={() => dispatch({ type: "REHEARSE_ANOTHER" })}
        >
          排演另一场对话
        </button>
        <button
          className="secondary-action"
          type="button"
          onClick={() => dispatch({ type: "RESET" })}
        >
          更换对话对象
        </button>
      </div>
    </section>
  );
}
