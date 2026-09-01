import { SceneProgress } from "@/components/scene-progress";

export default function Home() {
  return (
    <main className="home-shell">
      <section className="hero" aria-labelledby="product-title">
        <h1 id="product-title">说话有谱</h1>
        <p className="tagline">让每句话出口前，心里都有谱。</p>
        <SceneProgress />
      </section>
    </main>
  );
}
