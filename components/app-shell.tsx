"use client";

import { useReducer } from "react";

import {
  getSceneProgress,
  INITIAL_APP_STATE,
  workflowReducer,
} from "../lib/workflow";
import type { AppStatus } from "../types/workflow";
import { SceneProgress } from "./scene-progress";

const STATUS_CONTENT: Record<AppStatus, string> = {
  setup: "第一幕·定角",
  describe: "第二幕·起因",
  clarifying: "第二幕·起因",
  generating: "正在为这场对话排戏……",
  results: "第三幕·排演",
  fallback: "剧场暂时断线了",
};

export function AppShell() {
  const [state] = useReducer(workflowReducer, INITIAL_APP_STATE);
  const progressItems = getSceneProgress(state.status);

  return (
    <main className="home-shell">
      <section className="hero" aria-labelledby="product-title">
        <h1 id="product-title">说话有谱</h1>
        <p className="tagline">让每句话出口前，心里都有谱。</p>
        <SceneProgress items={progressItems} />
        <p className="status-placeholder" aria-live="polite">
          {STATUS_CONTENT[state.status]}
        </p>
      </section>
    </main>
  );
}
