import type { ReactionCategory } from "../types/coach-result";

export interface ReactionPresentation {
  label: string;
  meaning: string;
  glyph: string;
}

export const REACTION_PRESENTATIONS: Record<
  ReactionCategory,
  ReactionPresentation
> = {
  angry: {
    label: "生气",
    meaning: "强硬拒绝 / 不悦",
    glyph: "怒",
  },
  awkward: {
    label: "为难",
    meaning: "勉强 / 纠结",
    glyph: "难",
  },
  smile: {
    label: "认可",
    meaning: "满意 / 答应",
    glyph: "悦",
  },
  doubt: {
    label: "怀疑",
    meaning: "追问 / 意外",
    glyph: "疑",
  },
};
