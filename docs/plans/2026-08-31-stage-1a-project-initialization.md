# 说话有谱 Stage 1A Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** 在保留现有 `docs/` 文档的前提下，建立可运行的 Next.js + TypeScript 比赛项目最小骨架。

**Architecture:** 使用 Next.js App Router 和 React 服务端组件渲染单页首屏。首页仅组合一个静态幕次组件和全局 CSS，不建立 AI、数据库、状态库或未被需求使用的抽象。

**Tech Stack:** Node.js 22.22.2, npm 10.9.7, Next.js 16.3.4, React 19.2.8, TypeScript 6.0.3, Zod 4.5.4, CSS Modules/普通 CSS。

---

### Task 1: 建立工程配置

**Objective:** 在非空项目目录中手动建立最小 Next.js 配置。

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next-env.d.ts`
- Create: `next.config.ts`
- Create: `.gitignore`

**Steps:**
1. 写入精确依赖版本和 `dev/build/start/typecheck/lint` 脚本。
2. 启用 TypeScript strict 模式和 App Router 所需配置。
3. 运行 `npm install`，预期生成 `package-lock.json` 且退出码为 0。

### Task 2: 建立最小首页

**Objective:** 只呈现品牌名、副标题和三幕名称。

**Files:**
- Create: `app/layout.tsx`
- Create: `app/page.tsx`
- Create: `app/globals.css`
- Create: `components/scene-progress.tsx`
- Create: `data/scenes.ts`

**Steps:**
1. 建立 `zh-CN` 根布局和页面 metadata。
2. 建立静态幕次数据：第一幕·定角、第二幕·起因、第三幕·排演。
3. 建立最小首页与基础响应式 CSS，不实现产品交互。
4. 运行 `npm run typecheck`，预期无 error。

### Task 3: 保存原型参考

**Objective:** 将两份原型复制到项目内，不改动 Downloads 原件。

**Files:**
- Create: `reference/demo-juben.html`
- Create: `reference/demo-roles-pixel-v2.html`

**Steps:**
1. 创建 `reference/` 目录。
2. 复制两份 HTML。
3. 使用 `shasum -a 256` 对比源文件与副本，预期哈希一致。

### Task 4: Git 与构建验证

**Objective:** 初始化版本库并验证工程可构建。

**Files:**
- Create: `.git/`
- Generated: `.next/`

**Steps:**
1. 运行 `git init -b main`。
2. 运行 `npm run build`，预期 Next.js 构建成功且 TypeScript 无报错。
3. 运行 `git status --short --branch` 记录未提交状态；本阶段不自动提交。

### Task 5: 开发服务器与浏览器验收

**Objective:** 确认首页可在浏览器正常打开。

**Steps:**
1. 运行 `npm run dev`，预期监听 `http://localhost:3000`。
2. 请求首页，预期 HTTP 200，且 HTML 包含产品名、副标题和三幕名称。
3. 停止临时开发服务器，汇报运行结果。
