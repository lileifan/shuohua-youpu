# Peer Role and Demo Loader Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add a peer-colleague conversation target and a one-click loader for the two competition demo scenarios without changing the existing three-act workflow.

**Architecture:** Extend the existing `RoleType` union and shared target metadata so the new role automatically flows through setup, summaries, prompts, schemas, avatars, and result cards. Add a small setup-only demo preset control that dispatches existing reducer actions, keeping demo loading deterministic and avoiding a second workflow path.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, plain CSS.

---

### Task 1: Extend the role contract

**Objective:** Add `peer` as a valid role everywhere the request and response pipeline validates role values.

**Files:**
- Modify: `types/workflow.ts`
- Modify: `data/target-options.ts`
- Modify: `lib/coach-schema.ts`

**Verification:** `npm run typecheck` and `npm run test:coach-protocol`.

### Task 2: Add peer setup and avatar metadata

**Objective:** Render “同事 / 平级协作” as a third casting slip and give the inline avatar a peer-specific visual detail.

**Files:**
- Modify: `components/setup-stage.tsx`
- Modify: `components/reaction-avatar.tsx`
- Modify: `app/globals.css`

**Verification:** Setup snapshot shows three role choices and peer selection updates the target summary.

### Task 3: Make prompts and offline fallback peer-aware

**Objective:** Ensure real AI receives the new role and ordinary peer scenarios still produce a safe three-strategy offline result.

**Files:**
- Modify: `lib/coach-prompt.ts`
- Modify: `data/demo-results.ts`
- Modify: `lib/preset-coach.ts`

**Verification:** Peer request schema accepts `peer`; preset mode returns a valid `complete` result for a peer scenario.

### Task 4: Add one-click competition demo loading

**Objective:** Let a presenter load Scene A or Scene B from setup with one click, including all target fields and scenario text.

**Files:**
- Modify: `types/workflow.ts`
- Modify: `lib/workflow.ts`
- Modify: `components/setup-stage.tsx`
- Modify: `app/globals.css`

**Verification:** Clicking each demo button fills the correct role, gender, personality, and scenario; the normal “进入下一幕” path remains unchanged.

### Task 5: Regression and production verification

**Objective:** Prove the original leader/client demos and the new peer target remain stable.

**Files:**
- Modify: `scripts/verify-coach-protocol.ts`
- Modify: `scripts/verify-coach-api.ts`

**Verification:** Run `npm run typecheck`, `npm run test:coach-protocol`, `npm run build`, and the 390px/1440px browser smoke flows.
