import { journey } from "../data/journey";
import { useGameStore } from "../store/gameStore";

type HudProps = {
  statsVisible: boolean;
  onToggleStats: () => void;
};

export const HUD = ({ statsVisible, onToggleStats }: HudProps) => {
  const { activeSceneId, setScene, flags, canTravel } = useGameStore();
  const scene = journey.find((j) => j.id === activeSceneId);
  if (!scene) return null;

  const travelUnlocked = canTravel(scene.id);
  const nextScene = journey.find((j) => j.id === scene.travelTo);

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
        Memories unlocked: {Object.keys(flags).length} · Required to travel:{" "}
        {(scene.travelRequires ?? []).join(", ") || "none"}
      </p>
      {scene.travelTo && (
        <button className="hud-button" disabled={!travelUnlocked} onClick={() => setScene(scene.travelTo!)}>
          {travelUnlocked ? `Travel to ${nextScene?.title ?? scene.travelTo}` : "Complete memories to travel"}
        </button>
      )}
      <button className="hud-link" type="button" onClick={onToggleStats}>
        {statsVisible ? "Hide stats" : "Show stats"}
      </button>
      <div className="hud-controls">Controls: W/A/S/D roll · Gravity bounce; press F near memories to interact</div>
    </div>
  );
};
