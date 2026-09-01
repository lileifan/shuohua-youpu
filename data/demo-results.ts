import type { CompleteCoachResult } from "../types/coach-result";

export const SCENE_A_SCENARIO =
  "领导让我周末加班，我不想去，但怕拒绝了影响年底评价。";

export const SCENE_B_SCENARIO =
  "项目最终交付想延后三天，但客户一直觉得我们在拖，我怕他不信任我们。";

export const SCENE_A_RESULT: CompleteCoachResult = {
  status: "complete",
  assumptions_notice: null,
  context_summary:
    "你需要拒绝强势领导的周末加班安排。你的底线是周末无法到场，同时担心拒绝会影响年底评价；你可以今晚提前整理工作并完成交接。",
  options: [
    {
      style: "soft",
      label: "委婉版",
      strategy: "先认可任务紧急性，再明确周末边界，最后主动给出今晚交接方案。",
      script:
        "我知道这个任务现在比较急，也理解您希望周末继续往前推进。不过我这周末家里已经有安排，确实没法到场。今晚我可以先把目前的进度、材料和需要交接的部分都整理好，能提前处理的我先做掉，周一一早我再继续跟进，尽量把影响降到最低。",
      predicted_reaction:
        "周末真的一点时间都抽不出来吗？这个事情现在挺急的。",
      reaction_category: "doubt",
      follow_up_tip:
        "不要重新解释一大段理由，重复边界，再把今晚能完成的交接内容说具体。",
    },
    {
      style: "direct",
      label: "直接版",
      strategy: "明确拒绝周末到场，同时说明自己会承担的后续工作。",
      script:
        "这周末我无法到场加班，家里已经有不能调整的安排。我今晚会把当前进度、风险点和交接清单整理好，需要提前完成的部分我今天处理，周一上班后第一时间继续推进。",
      predicted_reaction:
        "现在项目这么紧，你这个时候不能来，那进度谁来负责？",
      reaction_category: "angry",
      follow_up_tip:
        "不要和情绪对抗，先确认项目风险，再明确你今晚负责什么、周末需要谁协同。",
    },
    {
      style: "indirect",
      label: "迂回版",
      strategy: "将拒绝转化为任务拆分、交接和资源安排。",
      script:
        "这个周末我确实无法到场。为了不让任务停住，我今晚可以先把工作拆开：能提前完成的我今天做完，需要周末推进的部分我整理成交接清单，剩余内容周一我再接回来。我们看一下这样安排，能不能把周末缺人的影响压到最低？",
      predicted_reaction:
        "那你先把交接内容发我，我看看周末这部分还能安排谁接。",
      reaction_category: "awkward",
      follow_up_tip:
        "马上确认交接时间、具体任务和接手人，让替代方案真正落地。",
    },
  ],
};

export const SCENE_B_RESULT: CompleteCoachResult = {
  status: "complete",
  assumptions_notice: null,
  context_summary:
    "完整版需要延期三天，你担心进一步损害客户信任；但可以按原计划先交付并验收核心流程，再补齐完整版本。",
  options: [
    {
      style: "soft",
      label: "委婉版",
      strategy: "先承担延期沟通，再主动给出可以验证的阶段性交付物。",
      script:
        "这次完整版本需要比原计划晚三天，这点我先和您说明清楚。为了尽量不影响您的验收安排，我们可以按原时间先交核心流程和当前可验收部分，同时把剩余项、负责人和三天后的完整交付计划一起给您。您可以先验核心部分，我们按计划把剩余内容补齐。",
      predicted_reaction:
        "为什么现在才说？三天以后你们真的能全部交完吗？",
      reaction_category: "doubt",
      follow_up_tip:
        "不要只口头保证，把剩余事项、负责人和时间节点直接列成可检查的计划。",
    },
    {
      style: "direct",
      label: "直接版",
      strategy: "直接说明延期，并明确新的交付边界和书面节点。",
      script:
        "我先同步明确结果：完整版需要延后三天。原定时间我们会先交付可验收的核心流程，不让整体进度完全停住；剩余部分会按照新的三天计划补齐。我会把延期原因、剩余清单和新的交付节点今天一起书面同步给您。",
      predicted_reaction:
        "这和我们之前确认的时间不一样，我需要知道为什么延期，以及新的日期凭什么可信。",
      reaction_category: "angry",
      follow_up_tip:
        "不要回避延期责任，用事实说明原因，并提供可验证的阶段节点，而不是再次只给承诺。",
    },
    {
      style: "indirect",
      label: "迂回版",
      strategy: "把要求客户接受延期，转化为可以立即开始的两阶段验收方案。",
      script:
        "如果完整版本统一等三天后再交，对您的验收影响会比较大。我们想把交付拆成两个节点：原时间先交核心流程，您可以先验；剩余部分按照清单继续完成，三天后合并成交付完整版。这样您现在就能看到实际进度，也不用完全等到三天以后才开始验收。",
      predicted_reaction:
        "可以先看核心流程，但剩余清单和最终时间你们要正式发给我。",
      reaction_category: "smile",
      follow_up_tip:
        "立即把两阶段验收节点书面化，并让客户确认验收范围和最终截止时间。",
    },
  ],
};

export const GENERIC_OFFLINE_RESULT: CompleteCoachResult = {
  status: "complete",
  assumptions_notice: "基于目前了解到的情况，以下为离线预设示范。",
  context_summary:
    "你需要在表达自己边界的同时，给对方一个清楚、可继续讨论的下一步。",
  options: [
    {
      style: "soft",
      label: "委婉版",
      strategy: "先承接对方的需要，再说明当前边界和可以配合的部分。",
      script:
        "我理解这件事对你很重要，也希望能一起推进。不过目前这个安排我确实没办法直接答应。我可以先把现在能做的部分整理出来，我们再确认一个双方都能执行的办法。",
      predicted_reaction: "那你现在具体能做到哪一步？",
      reaction_category: "doubt",
      follow_up_tip: "把你能做和不能做的部分分别说具体，避免继续使用模糊表达。",
    },
    {
      style: "direct",
      label: "直接版",
      strategy: "明确给出结论和边界，再说明下一步。",
      script:
        "这个安排我目前不能接受。我能承担的部分是把现有信息和可执行事项整理清楚，接下来我们需要重新确认时间和分工。",
      predicted_reaction: "如果不能按这个安排，那你准备怎么解决？",
      reaction_category: "angry",
      follow_up_tip: "保持结论不变，直接提出你准备好的替代步骤。",
    },
    {
      style: "indirect",
      label: "迂回版",
      strategy: "把正面冲突改写为任务拆分和替代方案讨论。",
      script:
        "我们先不把选择限定在答应或拒绝上，可以把事情拆开看看：哪些必须现在完成，哪些可以调整，哪些需要其他资源支持。这样更容易找到一个真正能落地的方案。",
      predicted_reaction: "可以，你先把需要调整的部分列出来。",
      reaction_category: "smile",
      follow_up_tip: "立刻把任务、负责人和时间点列成清单，推动对方确认。",
    },
  ],
};
