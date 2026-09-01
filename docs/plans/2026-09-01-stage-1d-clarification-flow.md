# 说话有谱 Stage 1D Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 完整实现第二幕场景输入、明确标注的离线 Mock Coach、最多两轮追问，以及保留剧本上下文的 generating 停留态。

**Architecture:** `AppState.conversation` 是场景、已完成追问历史和当前待答问题的唯一业务来源。纯 reducer 强制输入有效性、追问上限及 `clarificationCount === clarificationTurns.length + pendingQuestionCount`；组件仅管理未提交的回答草稿和瞬时重复提交锁。`lib/mock-coach.ts` 通过小型判定接口返回 `clarify | generate`，后续真实服务可替换该适配层而无需重写展示组件。

**Tech Stack:** Next.js 16 App Router、React 19 `useReducer`、TypeScript 6、普通 CSS、Node assertions、Playwright CLI。

---

### Task 1: 定义正式 Conversation 数据与 reducer 不变量

**Objective:** 让场景、追问历史和待答问题进入唯一 workflow state，并由 reducer 保证最多两轮。

**Files:**
- Modify: `types/workflow.ts`
- Modify: `lib/workflow.ts`

**Steps:**
1. 增加 `ClarificationTurn` 与 `ConversationState`，只包含 scenario、question/answer 历史和 pending question。
2. 初始 conversation 为空；`SET_SCENARIO` 只在 describe 生效并截断到500字符。
3. 让 `REQUEST_CLARIFICATION` 携带单个 question；无有效 scenario 时不得转换。
4. 让 `ANSWER_CLARIFICATION` 原子写入当前 question + trim 后 answer，并根据可选 nextQuestion 留在 clarifying 或进入 generating。
5. 所有转换强制 `clarificationCount = 已完成 turns + 是否存在 pending question`，达到2轮后忽略任何第三问并进入 generating。
6. `START_GENERATING` 支持 describe / clarifying，清除未回答 pending 并保持历史一致。

### Task 2: 创建可替换的离线 Mock Coach

**Objective:** 以纯函数适配层支持两个主演示、直接生成和专用两轮验证路径。

**Files:**
- Create: `lib/mock-coach.ts`

**Steps:**
1. 定义 `MockCoachDecision = { type: "clarify"; question: string } | { type: "generate" }`。
2. 场景A、B在无历史时返回PRD指定问题，已有一次回答后返回 generate。
3. 普通场景返回一个围绕底线的通用问题；已明确“底线 + 折中”的输入可直接 generate。
4. 提供仅供离线验收使用的两轮场景常量：第一次回答后返回第二个核心问题，第二次回答后 generate。
5. Mock 文件和页面提示明确当前未连接真实AI，不创建网络或 Prompt 逻辑。

### Task 3: 实现第二幕剧本式 UI

**Objective:** 实现场景录入、追问回答、历史台词和保留上下文的 generating 视图。

**Files:**
- Modify: `components/describe-stage.tsx`
- Create: `components/clarifying-stage.tsx`
- Create: `components/generating-stage.tsx`
- Create: `components/conversation-script.tsx`
- Modify: `components/app-shell.tsx`
- Modify: `app/globals.css`

**Steps:**
1. Describe 使用 AppState 控制的 textarea，含 label、500字符提示与 trim 空值 disabled guard。
2. 提交时调用 mock adapter，并只 dispatch 正式 reducer action；`useRef` 仅作为当前组件生命周期内的重复提交锁。
3. Clarifying 展示对象摘要、原始场景、历史台词、当前教练问题和本地未提交回答草稿。
4. 回答提交时先让 mock 判断下一步，再用单个 action 原子保存历史并转换状态。
5. Generating 显示加载文案、对象摘要和全部已产生剧本，不自动进入 results。
6. 使用剧本角色标记、左侧色条和纸张层次区分“你 / 教练”，不使用聊天气泡布局。

### Task 4: 验证状态、回归和真实浏览器流程

**Objective:** 不引入测试框架地覆盖Stage 1D 23项验收，并保证Stage 1C无回归。

**Steps:**
1. 将 workflow 与 mock TypeScript 编译到临时目录，用 Node assertions 覆盖空白输入、长度、A/B、直接生成、两轮上限、历史/计数不变量和三幕映射。
2. 复跑Stage 1C默认值、setup guard、自定义性格覆盖/恢复及对象摘要断言。
3. 用Playwright CLI依次跑场景A、场景B、空输入和直接生成路径，检查剧本内容、按钮状态和 generating 上下文。
4. 检查SceneProgress在describe/clarifying保持第二幕 current，在generating切换第三幕 current。
5. 运行 `npm run typecheck`、`npm run build`、`git diff --check`并确认浏览器console 0 errors / 0 warnings。
6. 搜索确认无API Route、网络请求、API Key、正式Prompt、Zod AI schema、结果卡或禁止依赖。

### Task 5: 创建 Stage 1D 独立提交

**Objective:** 仅提交第二幕离线追问流程，不混入Stage 1E。

**Steps:**
1. 确认PRD未修改，审阅暂存文件范围。
2. 创建提交：`feat: implement scenario clarification flow`。
3. 确认提交后工作树干净，停止开发等待验收。
