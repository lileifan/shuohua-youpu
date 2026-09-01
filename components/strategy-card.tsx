import { useState } from "react";
import type { KeyboardEvent } from "react";

import type { StrategyOption } from "../types/coach-result";
import type { GenderPresentation, RoleType } from "../types/workflow";
import { ReactionAvatar } from "./reaction-avatar";

interface StrategyCardProps {
  option: StrategyOption;
  role: RoleType;
  gender: GenderPresentation;
  index: number;
}

export function StrategyCard({
  option,
  role,
  gender,
  index,
}: StrategyCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const actionLabel = isFlipped
    ? `返回${option.label}话术`
    : `查看${option.label}的对方可能反应`;

  function toggleCard() {
    setIsFlipped((current) => !current);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleCard();
    }
  }

  return (
    <article
      className="strategy-card"
      data-style={option.style}
      data-flipped={isFlipped}
      role="button"
      tabIndex={0}
      aria-label={actionLabel}
      aria-pressed={isFlipped}
      onClick={toggleCard}
      onKeyDown={handleKeyDown}
    >
      <div className="strategy-card-inner">
        <section
          className="strategy-card-face strategy-card-front"
          aria-hidden={isFlipped}
        >
          <header className="strategy-card-header">
            <span className="strategy-number">0{index + 1}</span>
            <h3>{option.label}</h3>
          </header>
          <p className="strategy-description">{option.strategy}</p>
          <blockquote className="strategy-script">{option.script}</blockquote>
          <p className="flip-hint">点击翻面，看对方可能怎么接</p>
        </section>

        <section
          className="strategy-card-face strategy-card-back"
          aria-hidden={!isFlipped}
        >
          <p className="reaction-object-label">当前沟通对象</p>
          <ReactionAvatar
            role={role}
            gender={gender}
            reactionCategory={option.reaction_category}
          />
          <div className="predicted-reaction">
            <p>可能反应</p>
            <blockquote>{option.predicted_reaction}</blockquote>
          </div>
          <div className="follow-up-tip">
            <p>你可以怎么接</p>
            <span>{option.follow_up_tip}</span>
          </div>
          <p className="flip-hint">点击返回{option.label}话术</p>
        </section>
      </div>
    </article>
  );
}
