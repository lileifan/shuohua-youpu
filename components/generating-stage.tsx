import { getScenario } from "../lib/workflow";
import type { AppState } from "../types/workflow";
import { ConversationScript } from "./conversation-script";
import { DevOfflineBadge } from "./dev-offline-badge";

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
