import { REACTION_PRESENTATIONS } from "../data/reactions";
import { GENDER_LABELS, ROLE_LABELS } from "../data/target-options";
import type { ReactionCategory } from "../types/coach-result";
import type { GenderPresentation, RoleType } from "../types/workflow";

interface ReactionAvatarProps {
  role: RoleType;
  gender: GenderPresentation;
  reactionCategory: ReactionCategory;
}

function CharacterExpression({
  reactionCategory,
}: Pick<ReactionAvatarProps, "reactionCategory">) {
  switch (reactionCategory) {
    case "angry":
      return (
        <g className="avatar-expression avatar-expression-angry">
          <path d="M51 72 68 78" />
          <path d="m109 72-17 6" />
          <path d="M55 87h12" />
          <path d="M93 87h12" />
          <path d="M65 114q15-12 30 0" />
          <path
            className="avatar-expression-cue"
            d="m40 62-9-8m6 17-12-2m95-7 9-8m-6 17 12-2"
          />
        </g>
      );
    case "awkward":
      return (
        <g className="avatar-expression avatar-expression-awkward">
          <path d="M52 74q8-5 16 1" />
          <path d="M92 72q8-2 15 4" />
          <circle cx="62" cy="87" r="3.4" />
          <circle cx="98" cy="87" r="3.4" />
          <path d="M64 111q8-5 15 0t16 0" />
          <path
            className="avatar-sweat"
            d="M118 70c8 10 8 16 0 16s-8-6 0-16Z"
          />
        </g>
      );
    case "smile":
      return (
        <g className="avatar-expression avatar-expression-smile">
          <path d="M52 77q8-7 16 0" />
          <path d="M92 77q8-7 16 0" />
          <path d="M61 104q19 22 38 0" />
          <circle className="avatar-cheek" cx="52" cy="99" r="5" />
          <circle className="avatar-cheek" cx="108" cy="99" r="5" />
          <path
            className="avatar-expression-cue"
            d="m122 58 3-8 3 8 8 3-8 3-3 8-3-8-8-3Z"
          />
        </g>
      );
    case "doubt":
      return (
        <g className="avatar-expression avatar-expression-doubt">
          <path d="M51 77q8-8 17-3" />
          <path d="M92 70q9-5 17 2" />
          <circle cx="62" cy="87" r="3.4" />
          <path d="M93 87q7-5 14 0" />
          <path d="M66 111q15-7 29 2" />
          <path
            className="avatar-expression-cue"
            d="M124 68q11-9 11 1 0 6-7 8v5m0 7v1"
          />
        </g>
      );
  }
}

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
        <svg
          className="reaction-character"
          viewBox="0 0 160 160"
          focusable="false"
        >
          <circle className="avatar-halo" cx="80" cy="78" r="67" />
          <path
            className="avatar-shoulders"
            d="M22 160c3-28 24-43 58-43s55 15 58 43Z"
          />
          <path
            className="avatar-shirt"
            d="m58 123 22 30 22-30c-6-4-13-6-22-6s-16 2-22 6Z"
          />
          {role === "leader" ? (
            <g className="avatar-role-detail avatar-role-leader">
              <path d="m38 139 26-17 16 31-28-8Z" />
              <path d="m122 139-26-17-16 31 28-8Z" />
              <circle cx="80" cy="145" r="2.5" />
              <circle cx="80" cy="154" r="2.5" />
            </g>
          ) : (
            <g className="avatar-role-detail avatar-role-client">
              <path d="m43 140 22-17 15 30-27-7Z" />
              <path d="m117 140-22-17-15 30 27-7Z" />
              <path d="m69 124 11 9 11-9-4 21H73Z" />
            </g>
          )}
          <path className="avatar-neck" d="M68 108h24v25H68z" />
          <circle className="avatar-ear" cx="43" cy="84" r="9" />
          <circle className="avatar-ear" cx="117" cy="84" r="9" />
          <path
            className="avatar-face"
            d="M44 69c0-28 15-43 36-43s36 15 36 43v17c0 25-16 41-36 41S44 111 44 86Z"
          />
          {gender === "male" ? (
            <path
              className="avatar-hair"
              d="M43 71c-2-30 15-51 40-51 18 0 33 12 36 33-12-7-26-11-41-10-10 1-21 8-35 28Z"
            />
          ) : (
            <g className="avatar-hair avatar-hair-long">
              <path d="M41 76c-5-33 12-57 40-57 27 0 43 23 39 57l-8 43-15-2 3-53c-10-6-21-11-34-15-4 11-11 21-22 29l3 39-15 2Z" />
              <path
                className="avatar-hair-highlight"
                d="M54 39q27-21 52 5"
              />
            </g>
          )}
          <path className="avatar-nose" d="m80 87-4 12 7 1" />
          <CharacterExpression reactionCategory={reactionCategory} />
        </svg>
      </div>
      <figcaption>
        <span className="avatar-identity">{identityLabel}</span>
        <strong>{reaction.label}</strong>
        <span>{reaction.meaning}</span>
      </figcaption>
    </figure>
  );
}
