import type { ClarificationTurn } from "../types/workflow";

interface ConversationScriptProps {
  scenario: string;
  clarificationTurns: readonly ClarificationTurn[];
  pendingQuestion?: string | null;
}

interface ScriptLineProps {
  speaker: "你" | "教练";
  children: string;
}

function ScriptLine({ speaker, children }: ScriptLineProps) {
  const speakerKey = speaker === "你" ? "user" : "coach";

  return (
    <div className="script-line" data-speaker={speakerKey}>
      <p className="script-speaker">{speaker}</p>
      <p className="script-copy">{children}</p>
    </div>
  );
}

export function ConversationScript({
  scenario,
  clarificationTurns,
  pendingQuestion = null,
}: ConversationScriptProps) {
  return (
    <section className="conversation-script" aria-label="当前对话剧本">
      <p className="script-heading">对话剧本</p>
      <ScriptLine speaker="你">{scenario.trim()}</ScriptLine>
      {clarificationTurns.map((turn, index) => (
        <div className="script-exchange" key={`${index}-${turn.question}`}>
          <ScriptLine speaker="教练">{turn.question}</ScriptLine>
          <ScriptLine speaker="你">{turn.answer}</ScriptLine>
        </div>
      ))}
      {pendingQuestion ? (
        <ScriptLine speaker="教练">{pendingQuestion}</ScriptLine>
      ) : null}
    </section>
  );
}
