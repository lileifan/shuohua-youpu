# 说话有谱 Stage 1E Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 在断网状态下完整跑通两个主演示场景的 generating、正式三策略结果、独立翻卡反应和重新排演流程。

**Architecture:** `CompleteCoachResult` 是静态 preset 与未来真实 AI 共用的唯一结果协议，`AppState.result` 只在 generating 状态通过 payload 写入。`lib/preset-coach.ts` 将正式 conversation context 映射为 Scene A、Scene B 或通用离线结果；`GeneratingStage` 用可清理的短 timer 调 adapter。结果页只消费统一 result，翻卡状态局部存在每个 `StrategyCard`，人物与反应视觉由 `ReactionAvatar` 独立解析。

**Tech Stack:** Next.js 16 App Router、React 19、TypeScript 6、普通 CSS、Node assertions、Playwright CLI。

---

### Task 1: 建立正式结果协议与离线数据

**Objective:** 用PRD 8.2一致的数据结构承载所有结果来源。

**Files:**
- Create: `types/coach-result.ts`
- Create: `data/demo-results.ts`

**Steps:**
1. 定义 `StrategyStyle`、`ReactionCategory`、`StrategyOption` 与 `CompleteCoachResult`，保留PRD字段名和枚举。
2. 按固定 soft/direct/indirect 顺序录入Scene A完整结果，三版均坚守周末无法到场。
3. 录入Scene B完整结果，三版均承认延期并包含阶段验收或新节点。
4. 增加一套明确标记假设说明的generic offline result，普通输入不崩溃但不伪装智能诊断。

### Task 2: 扩展 reducer 结果与重排演语义

**Objective:** 只允许 generating 携带正式结果进入 results，并区分保留与重置人物。

**Files:**
- Modify: `types/workflow.ts`
- Modify: `lib/workflow.ts`

**Steps:**
1. `AppState` 增加 `result: CompleteCoachResult | null`，initial为null。
2. `GENERATION_SUCCEEDED` 必须携带result，且只有generating接受。
3. 进入新的generating、failure和retry时显式清空旧result。
4. `REHEARSE_ANOTHER` 仅在results生效：保留target，清空conversation/count/result并回到describe。
5. `RESET` 仅在results生效：恢复完整initial state并回到setup。

### Task 3: 建立可替换的 preset adapter 与短加载交接

**Objective:** 让generating在可见短延迟后通过统一action进入结果页。

**Files:**
- Create: `lib/preset-coach.ts`
- Modify: `components/generating-stage.tsx`
- Modify: `components/app-shell.tsx`

**Steps:**
1. adapter基于正式scenario做Scene A/B最小匹配，否则返回generic result，并返回新的result副本。
2. GeneratingStage用`useEffect`创建750ms timer，回调dispatch `GENERATION_SUCCEEDED`。
3. effect cleanup始终clear timer，兼容开发Strict Mode；reducer guard继续阻止重复success。
4. 将Stage 1D大段mock提示替换为仅development可见的小型`DEV · 离线预设` badge。

### Task 4: 构建正式结果页、策略卡与角色反应适配层

**Objective:** 实现三卡正反面、独立键盘翻转和可替换角色表现。

**Files:**
- Create: `components/results-stage.tsx`
- Create: `components/strategy-card.tsx`
- Create: `components/reaction-avatar.tsx`
- Modify: `components/app-shell.tsx`
- Modify: `app/globals.css`

**Steps:**
1. ResultsStage显示context summary、可选assumptions notice、固定顺序三卡和两种重新开始操作。
2. StrategyCard用局部`useState`独立翻面，Enter/Space可切换，动态aria-label描述当前操作。
3. 正面突出script，辅助显示label、strategy和翻面提示；背面突出具体reaction、ReactionAvatar和follow-up tip。
4. 使用grid叠层让正反面共同决定卡高，避免长文本裁切或塌陷；backface hidden避免透字。
5. `prefers-reduced-motion: reduce`下取消3D transition，通过visibility切换两面但保留功能。
6. ReactionAvatar只接role、gender、reactionCategory，统一映射身份底图占位、四类表情和文本标签，不接personality。

### Task 5: 验证数据、状态、完整Demo和回归

**Objective:** 不引入测试框架地完成结构断言、Stage 1回归及Scene A/B真实浏览器验收。

**Steps:**
1. 编译纯TypeScript到临时目录，用Node assertions检查两个preset的status、三条option、顺序、唯一style、合法reaction与非空字段。
2. 断言success guard、results缺result不可成立、rehearse/reset区别及fallback retry不残留result。
3. 复跑Stage 1A–1D setup、custom、scenario、追问上限、A/B问题、context与幕次断言。
4. Playwright完整跑Scene A：确认loading可见、三卡内容、三卡独立翻回、reaction和重新排演保留target。
5. Playwright完整跑Scene B：确认延期不隐瞒、两阶段验收、三种具体reaction与无刻板描述。
6. 验证Tab、Enter、Space、reduced-motion功能、卡片视觉截图及console 0 errors / 0 warnings。
7. 运行`npm run typecheck`、`npm run build`、`git diff --check`和禁止项扫描。

### Task 6: 创建 Stage 1E 独立提交

**Objective:** 只提交完整离线结果流程，不启动Stage 2。

**Steps:**
1. 确认PRD、依赖文件未修改，审阅暂存范围。
2. 创建提交：`feat: complete offline rehearsal results flow`。
3. 确认工作树干净并停止开发等待验收。
