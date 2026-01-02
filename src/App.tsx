import { HUD } from "./ui/HUD";
import { GameSketch } from "./scene/GameSketch";

export default function App() {
  return (
    <div className="app">
      <GameSketch />
      <HUD />
    </div>
  );
}
