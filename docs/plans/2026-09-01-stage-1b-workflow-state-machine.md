# 说话有谱 Stage 1B Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 建立后续人物设定、追问、生成与结果页共用的唯一核心流程状态机。

**Architecture:** `types/workflow.ts` 是状态与 action 类型的唯一定义处；`lib/workflow.ts` 保持为无 UI 依赖的纯 reducer 与幕次推导函数。`components/app-shell.tsx` 是最小 Client Component 边界，持有 `useReducer`；`SceneProgress` 只渲染已推导的展示数据，不保存业务状态。

**Tech Stack:** Next.js 16 App Router, React 19 `useReducer`, TypeScript 6, 普通 CSS。

---

### Task 1: 定义唯一 workflow 类型

**Objective:** 用最小类型建模六个 PRD 状态、追问计数、action 和幕次展示数据。

**Files:**
- Create: `types/workflow.ts`

**Steps:**
1. 定义 `AppStatus` 为 `setup | describe | clarifying | generating | results | fallback`。
2. 定义只含 `status` 和 `clarificationCount` 的 `AppState`。
3. 定义 `COMPLETE_SETUP / REQUEST_CLARIFICATION / START_GENERATING / GENERATION_SUCCEEDED / GENERATION_FAILED / RETRY_GENERATION / RESET` action。
4. 定义幕次编号、展示状态和 `SceneProgressItem`。

### Task 2: 实现纯 workflow reducer

**Objective:** 集中实现合法转换与最多两轮追问的应用级硬限制。

**Files:**
- Create: `lib/workflow.ts`
- Modify: `data/scenes.ts`

**Steps:**
1. 定义 `MAX_CLARIFICATION_COUNT = 2` 和初始状态 `{ status: "setup", clarificationCount: 0 }`。
2. 实现规定的8条状态转换，非法 action 保持原状态。
3. `REQUEST_CLARIFICATION` 在计数小于2时进入/保持 `clarifying` 并加1；已达2时强制进入 `generating`。
4. 实现 `getCurrentScene / getCompletedScenes / isSceneUnlocked / getSceneProgress`。

### Task 3: 接入最小 Client Component 边界

**Objective:** 让页面组合层使用正式 reducer，但不实现任何业务交互。

**Files:**
- Create: `components/app-shell.tsx`
- Modify: `app/page.tsx`
- Modify: `components/scene-progress.tsx`
- Modify: `app/globals.css`

**Steps:**
1. 在 `AppShell` 顶部声明 `"use client"`，并用 `useReducer` 持有唯一 `AppState`。
2. 根据 `status` 渲染 PRD 指定的六个简洁占位文案。
3. 将 `getSceneProgress(state.status)` 交给 `SceneProgress`；组件内不使用 state、reducer 或点击跳转。
4. 用 `current / completed / locked` 样式表达幕次状态，不做视觉精修。

### Task 4: 验证 reducer 与产品骨架

**Objective:** 确认转换、追问硬上限、构建和浏览器运行均正常。

**Steps:**
1. 将纯 TypeScript workflow 编译到临时目录，用 Node assertions 验证全部合法转换和第3次追问被强制转为 `generating`。
2. 运行 `npm run typecheck`，预期无类型错误。
3. 运行 `npm run build`，预期生产构建通过。
4. 运行 `npm run dev` 并使用真实浏览器验证首页与 console。
5. 确认没有 AI SDK、API Route、UI 库或新状态管理依赖。
6. 按 Next.js 16 本地文档建议将自动改写的 `next-env.d.ts` 从 Git 跟踪中移除并忽略，本地文件保留。

### Task 5: 创建 Stage 1B 提交

**Objective:** 以独立提交固化本阶段的核心状态机。

**Steps:**
1. 检查 `git diff --check` 和 `git status`。
2. 只添加 Stage 1B 文件。
3. 提交：`feat: add core conversation workflow state machine`。
4. 确认提交后工作树干净。
