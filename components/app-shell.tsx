"use client";

import { useEffect, useReducer } from "react";
import type { Dispatch } from "react";

import {
  getSceneProgress,
  getTargetSummary,
  INITIAL_APP_STATE,
  workflowReducer,
} from "../lib/workflow";
import type { AppState, WorkflowAction } from "../types/workflow";
import { ClarifyingStage } from "./clarifying-stage";
import { DescribeStage } from "./describe-stage";
import { GeneratingStage } from "./generating-stage";
import { ResultsStage } from "./results-stage";
import { SceneProgress } from "./scene-progress";
import { SetupStage } from "./setup-stage";

function renderStage(state: AppState, dispatch: Dispatch<WorkflowAction>) {
  const targetSummary = getTargetSummary(state);

  switch (state.status) {
    case "setup":
      return <SetupStage state={state} dispatch={dispatch} />;
    case "describe":
      return (
        <DescribeStage
          state={state}
          dispatch={dispatch}
          targetSummary={targetSummary}
        />
      );
    case "clarifying":
      return (
        <ClarifyingStage
          key={`${state.clarificationCount}:${state.conversation.pendingClarificationQuestion}`}
          state={state}
          dispatch={dispatch}
          targetSummary={targetSummary}
        />
      );
    case "generating":
      return (
        <GeneratingStage
          state={state}
          dispatch={dispatch}
          targetSummary={targetSummary}
        />
      );
    case "results":
      return state.result ? (
        <ResultsStage
          state={state}
          result={state.result}
          dispatch={dispatch}
          targetSummary={targetSummary}
        />
      ) : (
        <p className="workflow-placeholder">排演结果暂时不可用。</p>
      );
    case "fallback":
      return <p className="workflow-placeholder">剧场暂时断线了</p>;
  }
}

export function AppShell() {
  const [state, dispatch] = useReducer(workflowReducer, INITIAL_APP_STATE);
  const progressItems = getSceneProgress(state.status);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [state.status]);

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
