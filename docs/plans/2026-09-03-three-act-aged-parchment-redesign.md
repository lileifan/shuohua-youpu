# Three-Act Aged Parchment Redesign Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Redesign all three acts around a light-center, yellowed and visibly torn parchment sheet framed by a restrained theatrical stage.

**Architecture:** Preserve the existing reducer, forms, AI request flow, accessibility semantics, and card-flip behavior. Add a status hook to the app shell and replace the unfinished visual override layer with one shared visual system plus small state-specific layout rules.

**Tech Stack:** Next.js 16, React 19, TypeScript, plain CSS, Playwright CLI

---

### Task 1: Add the act styling hook

**Objective:** Expose the current workflow status to CSS without altering behavior.

**Files:**
- Modify: `components/app-shell.tsx`

**Steps:**
1. Add `data-status={state.status}` to `.app-frame`.
2. Run `npm run typecheck` and expect no errors.

**Complete code:**
```tsx
<section
  className="app-frame"
  data-status={state.status}
  aria-labelledby="product-title"
>
```

### Task 2: Rebuild the shared theatre and parchment shell

**Objective:** Establish restrained burgundy curtains, warm stage lighting, torn paper edges, aged perimeter, and a pale readable center.

**Files:**
- Modify: `app/globals.css`

**Steps:**
1. Replace the unfinished `Approved weathered storybook visual system` override block.
2. Use dark walnut behind the page and narrow side curtains; keep the theatre subordinate to the content.
3. Use the local clean texture at `public/assets/parchment-texture.jpg` under a strong ivory center wash.
4. Use dedicated SVG alpha masks with turbulence-displaced curves for a fibrous torn silhouette; add dark edge wear with inset gradients.
5. Keep the content center at approximately `#f3dfb2` or lighter and body text at WCAG-readable contrast.

**Core token example:**
```css
:root {
  --paper-center: #f4e4bd;
  --paper-edge: #b77538;
  --theatre-wine: #6f111f;
  --manuscript-ink: #392217;
}
```

### Task 3: Design Act I as a casting page

**Objective:** Present roles and traits as neat paper casting slips with wax-seal selected states.

**Files:**
- Modify: `app/globals.css`

**Steps:**
1. Center the act heading and keep the form within a calm 820px reading column.
2. Use clean light scraps for role cards and compact traits; avoid excessive rotation.
3. Use burgundy wax seals only for selected states and the main action.
4. Preserve visible focus rings, disabled styling, and mobile stacking.

### Task 4: Design Act II as a rehearsal manuscript

**Objective:** Make scenario entry and clarification read like annotations on a script while keeping writing space bright and spacious.

**Files:**
- Modify: `app/globals.css`

**Steps:**
1. Style target summary as a small manuscript note.
2. Give textarea fields a nearly ivory paper surface and subtle ruled-line texture.
3. Style conversation history as screenplay dialogue with speaker accents.
4. Fit the main state at 1440×900 without horizontal overflow.

### Task 5: Design Act III as three discovered script inserts

**Objective:** Present the three strategies as distinct light parchment sheets while preserving the dark-burgundy reaction reveal.

**Files:**
- Modify: `app/globals.css`

**Steps:**
1. Keep the context summary compact and centered.
2. Use three equal readable cards with restrained torn edges and slightly different warm paper tones.
3. Keep the flipped face theatrical and high contrast, with portrait and predicted reply as the focal point.
4. Preserve independent click and keyboard flips and the existing reduced-motion behavior.

### Task 6: Verify all three acts

**Objective:** Prove the redesign matches the reference qualities and does not regress behavior.

**Files:**
- Create locally: `output/playwright/three-act-redesign/`

**Steps:**
1. Run `npm run typecheck`, `npm run test:coach-protocol`, `npm run build`, and `git diff --check`.
2. Use Playwright to capture Act I, Act II, clarification, Act III front, and one flipped card at 1440×900.
3. Verify 1024×768 and a mobile viewport have no horizontal overflow.
4. Confirm the middle of every main paper surface remains light while aging is concentrated at the perimeter.
5. Keep changes uncommitted until user visual approval.
