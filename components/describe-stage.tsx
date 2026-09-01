interface DescribeStageProps {
  targetSummary: string | null;
}

export function DescribeStage({ targetSummary }: DescribeStageProps) {
  return (
    <section className="stage-content" aria-labelledby="describe-title">
      <p className="stage-kicker">第二幕·起因</p>
      <h2 id="describe-title">第二幕·起因</h2>
      {targetSummary ? (
        <p className="target-summary">{targetSummary}</p>
      ) : null}
    </section>
  );
}
