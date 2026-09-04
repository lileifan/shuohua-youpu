"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { Dispatch } from "react";

import { requestCoach } from "../lib/coach-client";
import {
  getSceneProgress,
  getTargetSummary,
  INITIAL_APP_STATE,
  workflowReducer,
} from "../lib/workflow";
import type { AppState, WorkflowAction } from "../types/workflow";
import type { CoachRequestContext } from "../types/coach-request";
import { ClarifyingStage } from "./clarifying-stage";
import { DescribeStage } from "./describe-stage";
import { GeneratingStage } from "./generating-stage";
import { FallbackStage } from "./fallback-stage";
import { ResultsStage } from "./results-stage";
import { SceneProgress } from "./scene-progress";
import { SetupStage } from "./setup-stage";

function renderStage(
  state: AppState,
  dispatch: Dispatch<WorkflowAction>,
  submitCoachRequest: (request: CoachRequestContext) => void,
) {
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
          submitCoachRequest={submitCoachRequest}
        />
      );
    case "clarifying":
      return (
        <ClarifyingStage
          key={`${state.clarificationCount}:${state.conversation.pendingClarificationQuestion}`}
          state={state}
          dispatch={dispatch}
          targetSummary={targetSummary}
          submitCoachRequest={submitCoachRequest}
        />
      );
    case "generating":
      return (
        <GeneratingStage
          state={state}
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
      return (
        <FallbackStage
          state={state}
          dispatch={dispatch}
          submitCoachRequest={submitCoachRequest}
        />
      );
  }
}

export function AppShell() {
  const [state, dispatch] = useReducer(workflowReducer, INITIAL_APP_STATE);
  const progressItems = getSceneProgress(state.status);
  const requestSequence = useRef(0);
  const activeRequest = useRef<AbortController | null>(null);

  const submitCoachRequest = useCallback(
    (request: CoachRequestContext) => {
      const requestId = requestSequence.current + 1;
      requestSequence.current = requestId;
      activeRequest.current?.abort();
      const controller = new AbortController();
      activeRequest.current = controller;

      void requestCoach(request, { signal: controller.signal })
        .then((response) => {
          if (requestSequence.current !== requestId) {
            return;
          }

          if (response.status === "clarify") {
            dispatch({
              type: "REQUEST_CLARIFICATION",
              question: response.clarification_question,
            });
            return;
          }

          dispatch({ type: "GENERATION_SUCCEEDED", result: response });
        })
        .catch(() => {
          if (
            requestSequence.current === requestId &&
            !controller.signal.aborted
          ) {
            dispatch({ type: "GENERATION_FAILED" });
          }
        })
        .finally(() => {
          if (requestSequence.current === requestId) {
            activeRequest.current = null;
          }
        });
    },
    [dispatch],
  );

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [state.status]);

  useEffect(() => {
    return () => {
      requestSequence.current += 1;
      activeRequest.current?.abort();
      activeRequest.current = null;
    };
  }, []);

  return (
    <main className="home-shell">
      <section
        className="app-frame"
        data-status={state.status}
        aria-labelledby="product-title"
      >
        <header className="brand-header">
          <h1 id="product-title">说话有谱</h1>
          <p className="tagline">让每句话出口前，心里都有谱。</p>
        </header>
        <SceneProgress items={progressItems} />
        <div className="stage-panel">
          {renderStage(state, dispatch, submitCoachRequest)}
        </div>
      </section>
    </main>
  );
}
