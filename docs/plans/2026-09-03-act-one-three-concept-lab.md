# Act One Three-Concept Lab Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Build three structurally distinct, interactive Act I visual directions so the user can compare and select one before Acts II and III are touched.

**Architecture:** Add an isolated `/concepts/act-one` route and a client-side concept switcher. Reuse the production `SetupStage` and reducer so every sample remains interactive, while a scoped CSS module supplies three different silhouettes without changing the production flow.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Playwright CLI

---

### Task 1: Create the isolated concept route

**Objective:** Expose the comparison lab without modifying the production homepage.

**Files:**
- Create: `app/concepts/act-one/page.tsx`
- Create: `components/act-one-concept-lab.tsx`

**Steps:**
1. Render one real `SetupStage` backed by `workflowReducer`.
2. Add three switch buttons with `aria-pressed`.
3. Keep the concept identifier on `data-concept` for scoped styling.
4. Run `npm run typecheck`; expect no errors.

**Core code:**
```tsx
const [concept, setConcept] = useState<ConceptId>("fragment");
const [state, dispatch] = useReducer(workflowReducer, INITIAL_APP_STATE);
return <main data-concept={concept}><SetupStage state={state} dispatch={dispatch} /></main>;
```

### Task 2: Build three different paper silhouettes

**Objective:** Ensure the three concepts remain distinguishable even in monochrome.

**Files:**
- Create: `components/act-one-concept-lab.module.css`

**Steps:**
1. A / Fragment: one asymmetrical sheet with large missing edge chunks, scorched perimeter, and lifted corner.
2. B / Scroll: a horizontal scroll with cylindrical rolled sides and irregular torn top/bottom.
3. C / Collage: a dark rehearsal board with a pale irregular central sheet and overlapping torn casting slips.
4. Keep all centers pale and all text readable.

### Task 3: Verify comparison fidelity

**Objective:** Make the choice visual and evidence-based.

**Files:**
- Create locally: `output/playwright/act-one-concepts/`

**Steps:**
1. Capture all three concepts at 1440×900.
2. Verify each button and form control is interactive.
3. Verify 1024px and mobile widths have no horizontal overflow.
4. Run `npm run typecheck`, `npm run build`, and `git diff --check`.
5. Do not modify or implement Acts II and III.
