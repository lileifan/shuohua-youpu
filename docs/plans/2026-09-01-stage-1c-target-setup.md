# 说话有谱 Stage 1C Implementation Plan

**Goal:** 完整实现“第一幕·定角”，并在 workflow 完整性 guard 通过后进入只显示对象摘要的轻量第二幕。

**Architecture:** 第一幕数据继续存放于唯一 `AppState.target`，选择控件只 dispatch 正式 workflow actions，不建立局部业务 state。完整性、有效性格与对象摘要都由 `lib/workflow.ts` 纯 selector 实时推导；reducer 对 `COMPLETE_SETUP` 保持最终 guard。

**Tech Stack:** Next.js 16 App Router, React 19 `useReducer`, TypeScript 6, 语义化 HTML，普通 CSS。

---

### Task 1: 扩展正式 target 类型和选项数据

**Objective:** 将关系、性别形象、预设性格与 target 定义为唯一稳定类型。

**Files:**
- Modify: `types/workflow.ts`
- Create: `data/target-options.ts`

**Steps:**
1. 定义 `RoleType = leader | client`。
2. 定义 `GenderPresentation = male | female`。
3. 定义 `PersonalityPreset = strong | rigorous | casual | easygoing | suspicious`。
4. 定义 `ConversationTarget`，只保留 role、gender、personalityPreset、customPersonality。
5. 建立严格匹配 PRD 的2个关系、2个性别和5个预设性格展示数据。

### Task 2: 实现 target actions、selectors 和 guard

**Objective:** 在应用级强制 Setup 完整性和自定义性格覆盖/恢复规则。

**Files:**
- Modify: `types/workflow.ts`
- Modify: `lib/workflow.ts`

**Steps:**
1. 为 AppState 增加 `target`，初始 role 为 leader，性别与预设性格为 null，自定义为空。
2. 实现 `SET_ROLE / SET_GENDER / SET_PERSONALITY_PRESET / SET_CUSTOM_PERSONALITY`，只允许在 setup 修改，每个 action 保留其他 target 字段。
3. 在 reducer 层限制自定义文本最长20字符，不因自定义输入清除 preset。
4. 实现 `getEffectivePersonality`：优先返回 trim 后自定义，否则返回最后 preset 的中文标签。
5. 实现 `isSetupComplete`和 `getTargetSummary`，摘要不入库。
6. 仅当 `isSetupComplete(state)` 为 true 时允许 `COMPLETE_SETUP`。

### Task 3: 实现第一幕语义化 UI

**Objective:** 实现可用键盘操作的关系、性别和性格选择，以及完整性驱动的主按钮。

**Files:**
- Create: `components/setup-stage.tsx`
- Create: `components/describe-stage.tsx`
- Modify: `components/app-shell.tsx`
- Modify: `app/globals.css`

**Steps:**
1. 用原生 button + `role=radio` + `aria-checked` 实现选择控件，保留 hover、selected、focus-visible 和非颜色选中标记。
2. 自定义输入使用正式 label、`maxLength=20`与受控值，custom 有效时明示“当前使用自定义描述”。
3. 主按钮由 `isSetupComplete` 推导 disabled，点击只 dispatch `COMPLETE_SETUP`。
4. describe 阶段只显示“第二幕·起因”和 `getTargetSummary(state)`，不添加输入或AI逻辑。
5. 用深酒红背景、暖米色内容区和少量金色完成第一轮产品化布局，不精修纹理或动画。

### Task 4: 验证业务规则和真实交互

**Objective:** 不引入新测试库地覆盖 Stage 1C 的19项验收条件。

**Steps:**
1. 将纯 workflow TypeScript 编译到临时目录，用 Node assertions 验证默认值、四个 actions、保留规则、有效性格、guard、摘要和幕次。
2. 运行 `npm run typecheck` 与 `npm run build`。
3. 使用 Playwright CLI 真实操作 leader/client、male/female、5种 preset、custom 覆盖/恢复、disabled/enabled 和进入第二幕。
4. 验证 Tab 焦点和 Enter/Space 可触发原生选择按钮。
5. 验证浏览器 console 为0 errors / 0 warnings。
6. 搜索确认没有 API Route、AI、Zod schema、localStorage 或禁止依赖。

### Task 5: 创建 Stage 1C 独立提交

**Objective:** 仅提交第一幕目标设定与进入第二幕的最小实现。

**Steps:**
1. 检查 PRD 无修改、`git diff --check` 通过。
2. 运行最终 TypeScript、build 和浏览器验收。
3. 提交：`feat: implement conversation target setup`。
4. 确认提交后工作树干净，停止而不进入 Stage 1D。
