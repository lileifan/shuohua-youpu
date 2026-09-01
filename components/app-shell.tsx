"use client";

import { useReducer } from "react";
import type { Dispatch } from "react";

import {
  getSceneProgress,
  getTargetSummary,
  INITIAL_APP_STATE,
  workflowReducer,
} from "../lib/workflow";
import type { AppState, WorkflowAction } from "../types/workflow";
import { DescribeStage } from "./describe-stage";
import { SceneProgress } from "./scene-progress";
import { SetupStage } from "./setup-stage";

function renderStage(state: AppState, dispatch: Dispatch<WorkflowAction>) {
  switch (state.status) {
    case "setup":
      return <SetupStage state={state} dispatch={dispatch} />;
    case "describe":
      return <DescribeStage targetSummary={getTargetSummary(state)} />;
    case "clarifying":
      return <p className="workflow-placeholder">第二幕·起因</p>;
    case "generating":
      return (
        <p className="workflow-placeholder">正在为这场对话排戏……</p>
      );
    case "results":
      return <p className="workflow-placeholder">第三幕·排演</p>;
    case "fallback":
      return <p className="workflow-placeholder">剧场暂时断线了</p>;
  }
}

export function AppShell() {
  const [state, dispatch] = useReducer(workflowReducer, INITIAL_APP_STATE);
  const progressItems = getSceneProgress(state.status);

  return (
    <main className="home-shell">
      <section className="app-frame" aria-labelledby="product-title">
        <header className="brand-header">
          <h1 id="product-title">说话有谱</h1>
          <p className="tagline">让每句话出口前，心里都有谱。</p>
        </header>
        <SceneProgress items={progressItems} />
        <div className="stage-panel">{renderStage(state, dispatch)}</div>
      </section>
    </main>
  );
}
