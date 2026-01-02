import { journey } from "../data/journey";
import { useGameStore } from "../store/gameStore";

export const HUD = () => {
  const { activeSceneId, setScene, flags, canTravel } = useGameStore();
  const scene = journey.find((j) => j.id === activeSceneId);
  if (!scene) return null;

  const travelUnlocked = canTravel(scene.id);
  const nextScene = journey.find((j) => j.id === scene.travelTo);
  const unlocked = Object.keys(flags).length;
  const required = scene.travelRequires ?? [];
  const pending = required.filter((r) => !flags[r]);

  return (
    <div className="hud">
      <div className="hud-header">
        <h2>{scene.title}</h2>
        <span className="hud-location">
          {scene.location.city}, {scene.location.country} · {scene.location.year}
        </span>
      </div>
      <p>{scene.introText}</p>
      <p className="hud-progress">
        Memories unlocked: {unlocked} · Required to travel: {pending.length === 0 ? "none" : pending.join(", ")}
      </p>
      {scene.travelTo && (
        <button className="hud-button" disabled={!travelUnlocked} onClick={() => setScene(scene.travelTo!)}>
          {travelUnlocked ? `Travel to ${nextScene?.title ?? scene.travelTo}` : "Complete memories to travel"}
        </button>
      )}
      <div className="hud-controls">Controls: A/D to roll · Bounce onto memories to trigger them · Reach the line gate to finish</div>
    </div>
  );
};
