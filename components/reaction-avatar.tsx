import { REACTION_PRESENTATIONS } from "../data/reactions";
import { GENDER_LABELS, ROLE_LABELS } from "../data/target-options";
import type { ReactionCategory } from "../types/coach-result";
import type { GenderPresentation, RoleType } from "../types/workflow";

interface ReactionAvatarProps {
  role: RoleType;
  gender: GenderPresentation;
  reactionCategory: ReactionCategory;
}

const ROLE_MARKS: Record<RoleType, string> = {
  leader: "领",
  client: "甲",
};

const GENDER_MARKS: Record<GenderPresentation, string> = {
  male: "男",
  female: "女",
};

export function ReactionAvatar({
  role,
  gender,
  reactionCategory,
}: ReactionAvatarProps) {
  const reaction = REACTION_PRESENTATIONS[reactionCategory];
  const identityLabel = `${GENDER_LABELS[gender]}${ROLE_LABELS[role]}`;

  return (
    <figure
      className="reaction-avatar"
      data-role={role}
      data-gender={gender}
      data-reaction={reactionCategory}
      aria-label={`${identityLabel}，反应：${reaction.label}`}
    >
      <div className="reaction-portrait" aria-hidden="true">
        <span className="identity-mark">
          {ROLE_MARKS[role]}
          <small>{GENDER_MARKS[gender]}</small>
        </span>
        <span className="reaction-glyph">{reaction.glyph}</span>
      </div>
      <figcaption>
        <strong>{reaction.label}</strong>
        <span>{reaction.meaning}</span>
      </figcaption>
    </figure>
  );
}
