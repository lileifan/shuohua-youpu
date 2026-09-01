import type { SceneDefinition } from "../types/workflow";

export const scenes = [
  { number: 1, label: "第一幕·定角" },
  { number: 2, label: "第二幕·起因" },
  { number: 3, label: "第三幕·排演" },
] as const satisfies readonly SceneDefinition[];
