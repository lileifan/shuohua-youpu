import type { SceneProgressItem } from "../types/workflow";

interface SceneProgressProps {
  items: readonly SceneProgressItem[];
}

export function SceneProgress({ items }: SceneProgressProps) {
  return (
    <ol className="scene-progress" aria-label="对话预演的三个幕次">
      {items.map((item) => (
        <li
          key={item.number}
          data-progress={item.progressStatus}
          aria-current={item.progressStatus === "current" ? "step" : undefined}
          aria-disabled={!item.isUnlocked}
        >
          {item.label}
        </li>
      ))}
    </ol>
  );
}
