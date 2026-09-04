"use client";

import { useReducer, useState } from "react";

import { INITIAL_APP_STATE, workflowReducer } from "../lib/workflow";
import { SetupStage } from "./setup-stage";
import styles from "./act-one-concept-lab.module.css";

type ConceptId = "fragment" | "scroll" | "collage";

const CONCEPTS: readonly {
  id: ConceptId;
  label: string;
  subtitle: string;
}[] = [
  {
    id: "fragment",
    label: "A · 烧焦残页",
    subtitle: "大片撕缺、焦边与卷角",
  },
  {
    id: "scroll",
    label: "B · 舞台卷轴",
    subtitle: "横向展开、卷边与聚光",
  },
  {
    id: "collage",
    label: "C · 拼贴手稿",
    subtitle: "多层纸片、手工排演板",
  },
] as const;

export function ActOneConceptLab() {
  const [concept, setConcept] = useState<ConceptId>("fragment");
  const [state, dispatch] = useReducer(workflowReducer, INITIAL_APP_STATE);
  const activeConcept = CONCEPTS.find((item) => item.id === concept)!;

  return (
    <main className={styles.lab} data-concept={concept}>
      <nav className={styles.switcher} aria-label="第一幕视觉方案">
        <div>
          <strong>第一幕视觉实验</strong>
          <span>只比较外观，控件可以真实点击</span>
        </div>
        <div className={styles.switchButtons}>
          {CONCEPTS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={concept === item.id}
              onClick={() => setConcept(item.id)}
            >
              <strong>{item.label}</strong>
              <small>{item.subtitle}</small>
            </button>
          ))}
        </div>
      </nav>

      <section className={styles.viewport} aria-label={activeConcept.label}>
        <header className={styles.brand}>
          <h1>说话有谱</h1>
          <p>让每句话出口前，心里都有谱。</p>
        </header>

        <ol className={styles.progress} aria-label="对话预演的三个幕次">
          <li data-current="true">第一幕 · 定角</li>
          <li>第二幕 · 起因</li>
          <li>第三幕 · 排演</li>
        </ol>

        <div className={styles.paperFrame}>
          <div className={styles.stage}>
            <SetupStage state={state} dispatch={dispatch} />
          </div>
        </div>
      </section>
    </main>
  );
}
