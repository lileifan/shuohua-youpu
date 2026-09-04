import type { Dispatch } from "react";

import {
  GENDER_OPTIONS,
  PERSONALITY_OPTIONS,
  ROLE_OPTIONS,
} from "../data/target-options";
import { SCENE_A_SCENARIO, SCENE_B_SCENARIO } from "../data/demo-results";
import {
  getEffectivePersonality,
  isSetupComplete,
  MAX_CUSTOM_PERSONALITY_LENGTH,
} from "../lib/workflow";
import type { AppState, WorkflowAction } from "../types/workflow";

interface SetupStageProps {
  state: AppState;
  dispatch: Dispatch<WorkflowAction>;
}

export function SetupStage({ state, dispatch }: SetupStageProps) {
  const setupComplete = isSetupComplete(state);
  const effectivePersonality = getEffectivePersonality(state);
  const customPersonalityIsActive = Boolean(
    state.target.customPersonality.trim(),
  );

  return (
    <section className="stage-content" aria-labelledby="setup-title">
      <p className="stage-kicker">第一幕·定角</p>
      <h2 id="setup-title">这场对话，你要面对谁？</h2>

      <details className="demo-loader">
        <summary>演示模式：一键载入主演示场景</summary>
        <div className="demo-loader-options">
          <button
            className="demo-loader-button"
            type="button"
            onClick={() =>
              dispatch({
                type: "LOAD_DEMO_SCENARIO",
                role: "leader",
                gender: "male",
                personality: "strong",
                scenario: SCENE_A_SCENARIO,
              })
            }
          >
            场景 A · 周末加班
          </button>
          <button
            className="demo-loader-button"
            type="button"
            onClick={() =>
              dispatch({
                type: "LOAD_DEMO_SCENARIO",
                role: "client",
                gender: "female",
                personality: "suspicious",
                scenario: SCENE_B_SCENARIO,
              })
            }
          >
            场景 B · 客户延期
          </button>
        </div>
      </details>

      <fieldset className="setup-fieldset">
        <legend id="role-legend">对方是谁</legend>
        <div
          className="role-options"
          role="radiogroup"
          aria-labelledby="role-legend"
        >
          {ROLE_OPTIONS.map((option) => {
            const selected = state.target.role === option.value;

            return (
              <button
                key={option.value}
                className="role-option"
                type="button"
                role="radio"
                aria-checked={selected}
                data-selected={selected}
                onClick={() =>
                  dispatch({ type: "SET_ROLE", role: option.value })
                }
              >
                <span className="role-avatar" aria-hidden="true">
                  {option.avatarLabel}
                </span>
                <span className="role-copy">
                  <strong>{option.label}</strong>
                  <small>{option.description}</small>
                </span>
                <span className="selection-mark" aria-hidden="true">
                  {selected ? "✓ 已选择" : "选择"}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="setup-fieldset">
        <legend id="gender-legend">性别形象</legend>
        <div
          className="compact-options"
          role="radiogroup"
          aria-labelledby="gender-legend"
        >
          {GENDER_OPTIONS.map((option) => {
            const selected = state.target.gender === option.value;

            return (
              <button
                key={option.value}
                className="choice-pill"
                type="button"
                role="radio"
                aria-checked={selected}
                data-selected={selected}
                onClick={() =>
                  dispatch({ type: "SET_GENDER", gender: option.value })
                }
              >
                <span aria-hidden="true">{selected ? "✓" : "○"}</span>
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="setup-fieldset">
        <legend id="personality-legend">这个人性格怎么样</legend>
        <div
          className="personality-options"
          role="radiogroup"
          aria-labelledby="personality-legend"
        >
          {PERSONALITY_OPTIONS.map((option) => {
            const selected = state.target.personalityPreset === option.value;

            return (
              <button
                key={option.value}
                className="choice-pill"
                type="button"
                role="radio"
                aria-checked={selected}
                data-selected={selected}
                onClick={() =>
                  dispatch({
                    type: "SET_PERSONALITY_PRESET",
                    preset: option.value,
                  })
                }
              >
                <span aria-hidden="true">{selected ? "✓" : "○"}</span>
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="custom-personality">
          <label htmlFor="custom-personality">
            或者自己描述一下，例如：急性子、嘴硬心软
          </label>
          <input
            id="custom-personality"
            type="text"
            value={state.target.customPersonality}
            maxLength={MAX_CUSTOM_PERSONALITY_LENGTH}
            aria-describedby="effective-personality"
            onChange={(event) =>
              dispatch({
                type: "SET_CUSTOM_PERSONALITY",
                value: event.target.value,
              })
            }
          />
          <p
            id="effective-personality"
            className="effective-personality"
            data-custom-active={customPersonalityIsActive}
            aria-live="polite"
          >
            {customPersonalityIsActive && effectivePersonality
              ? `当前使用：自定义描述「${effectivePersonality}」`
              : effectivePersonality
                ? `当前使用：${effectivePersonality}`
                : "请选择预设性格，或填写自定义描述。"}
          </p>
        </div>
      </fieldset>

      <button
        className="primary-action"
        type="button"
        disabled={!setupComplete}
        onClick={() => dispatch({ type: "COMPLETE_SETUP" })}
      >
        进入下一幕
      </button>
    </section>
  );
}
