import { getScenario } from "../lib/workflow";
import type { AppState } from "../types/workflow";
import { ConversationScript } from "./conversation-script";

interface GeneratingStageProps {
  state: AppState;
  targetSummary: string | null;
}

export function GeneratingStage({
  state,
  targetSummary,
}: GeneratingStageProps) {
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
          <p>Mock Coach 已完成离线诊断，正在整理这场排演。</p>
        </div>
      </div>
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
