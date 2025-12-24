import { useState } from "react";
import { GameCanvas } from "./scene/SceneManager";
import { HUD } from "./ui/HUD";
import { PerfStats } from "./ui/PerfStats";

export default function App() {
  const [showStats, setShowStats] = useState(false);

  return (
    <div className="app">
      <GameCanvas />
      <HUD statsVisible={showStats} onToggleStats={() => setShowStats((v) => !v)} />
      <PerfStats visible={showStats} />
    </div>
  );
}
