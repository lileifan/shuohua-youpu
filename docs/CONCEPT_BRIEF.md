# CONCEPT_BRIEF — 说话有谱

- **Codename:** `shuohua-youpu`
- **Mode:** refinement
- **Last updated / current state:** 2026-08-31；两个原型已审查，完整PRD V1.0已完成；产品概念与比赛范围已锁定，可进入实施规划。
- **Confidence verdict:** 7/10 — 演示概念强；若能证明用户愿意为“沟通预演”而非单次文案付费，可提升至 8/10。

## The concept

- **One-line promise:** 在重要的职场对话发生前，先帮用户排练对方可能的反应，让人从不敢说变成心里有谱。
- **Problem + who feels it:** 职场人在拒绝、汇报、请假、争取资源等高压场景中，焦虑的不只是“这句话怎么写”，而是“说了以后会发生什么”。
- **Beachhead persona:** 初入职场至工作 5 年内、对上级或客户沟通缺少把握的上班族（待用户验证）。
- **The wedge / differentiator:** 不是一次性生成话术，而是“诊断顾虑 → 提供三种策略 → 预演对方反应”的结构化沟通排练。
- **Monetization / sustainability model:** B2C 免费体验 + 个人付费是比赛的商业主线；B2B 职场沟通培训仅作为远期扩展，不进入比赛 MVP。

## The gate

- **Success metric:** 待用户确认。候选：比赛现场一次完整演示内，观众能准确复述“它不只帮你写，还帮你预演对方反应”；产品验证指标另行确定。
- **Aha / activation moment:** 用户翻开话术卡，看到“对方可能这样回”及表情，第一次感到这是在排练对话，而不是另一个文案工具。
- **Kill criterion / smallest proof:** 待用户确认。候选：若核心流程无法在决赛前稳定地于 2–3 分钟内完成，立即切换为双场景预设数据演示，不继续扩充角色或功能。

## Scope & roadmap

- **Scope IN (competition v1):** 领导、甲方/客户；男女形象；4 类表情；最多 2 轮场景挖掘；三版话术；翻卡预演；现场演示兜底。
- **Scope OUT / deferred:** 平级同事、下属、跨部门协作方放入 P2；话术微调、更多长尾场景、动画表情继续延后。
- **Locked decisions:**
  - LOCKED: 比赛版仅精修“领导”和“甲方/客户”两类角色 — 确保一人开发能把演示做完整。
  - LOCKED: 其他角色和扩展功能进入 P2 — 有余力再增加。
  - LOCKED: 保留复古羊皮纸的剧本剧场风格 — 比赛属性下，识别度与趣味性是核心体验的一部分。
  - LOCKED: AI 输出采用结构化格式，并为两个主演示场景准备确定性兜底 — 降低现场失败风险。
  - LOCKED: 商业主线为 B2C 个人产品，B2B 培训仅作远期故事 — 与当前个人使用流程一致，避免分散比赛表达。
- **Open decision-forks:** 比赛现场是“真实 AI 主演示 + 失败自动兜底”，还是“预设结果主演示 + 额外展示 AI 能力”；需在联调后按稳定性决定。
- **Risks + mitigations:** 最大风险是“与通用 AI 的差异不够持久”，而不是功能数量。比赛版用完整预演体验证明差异；P2 再用沟通对象记忆、实际反应回填和个性化学习积累长期价值。

## Tech & constraints

- **Tech approach:** 已审查两个原生HTML/CSS/JS原型；正式技术栈、AI服务和部署方式留待实施规划锁定。前端必须由统一状态机和结构化AI数据驱动，密钥不得暴露。
- **Design load-bearing?** 是。目标是“复古羊皮纸剧本 + 职场对话排练”；用舞台幕次、台词纸、火漆/印章感标签和翻卡形成记忆点。验收标准：汉字正文清晰，纹理不影响对比度，三种策略一眼可区分，翻面的“预演”是全流程最强的视觉时刻。
- **Hard constraints:** 一人开发；2026-09-06 14:00 决赛；需优先保障可演示性和现场稳定性。

## Refinement-only

- **Parity contract:** 保留需求文档已确立的主流程：选角色/性格 → 最多两轮挖掘 → 三版话术 → 翻卡预演 + 表情。任何收缩不得删掉“预演”这一 Aha 时刻。
- **Current state — done vs not-done:** 已有完整PRD、商业主线、两个已审查原型和演示测试用例；正式技术栈、system prompt、视觉资产和可演示产品尚未完成。
- **Pre-mortem:** 最可能的失败是视觉细节消耗全部时间，或 AI 输出不稳定导致现场冷场。用范围冻结、固定演示用例和预设兜底检测。

## Validated facts vs assumptions

- **Verified:** 比赛时间、一人开发、现有需求文档中的功能原型描述，以及本轮已锁定的 MVP 与视觉取舍。
- **Still a bet:** 目标用户是否会频繁使用；是否愿意为沟通预演付费；预演体验是否足以抵抗通用 AI 的替代。

## Naming

- Codename: `shuohua-youpu` · Display name: `说话有谱` · Slug/domain/bundle-id: TBD

## Handoff

> 概念与比赛版范围已锁定。下一步：以 `docs/说话有谱-完整PRD.md` 为主规格，进入技术决策与分阶段实施计划。
