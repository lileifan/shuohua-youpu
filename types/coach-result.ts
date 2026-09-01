export type StrategyStyle = "soft" | "direct" | "indirect";

export type ReactionCategory = "angry" | "awkward" | "smile" | "doubt";

export interface StrategyOption {
  style: StrategyStyle;
  label: string;
  strategy: string;
  script: string;
  predicted_reaction: string;
  reaction_category: ReactionCategory;
  follow_up_tip: string;
}

export interface CompleteCoachResult {
  status: "complete";
  assumptions_notice: string | null;
  context_summary: string;
  options: StrategyOption[];
}
