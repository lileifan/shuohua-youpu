import { scenes } from "@/data/scenes";

export function SceneProgress() {
  return (
    <ol className="scene-progress" aria-label="对话预演的三个幕次">
      {scenes.map((scene) => (
        <li key={scene}>{scene}</li>
      ))}
    </ol>
  );
}
