import { create } from "zustand";
import { journey } from "../data/journey";

type GameState = {
  activeSceneId: string;
  flags: Record<string, boolean>;
  setScene: (id: string) => void;
  setFlag: (flag: string) => void;
  canTravel: (sceneId: string) => boolean;
};

const defaultSceneId = journey[0]?.id ?? "nashville";

export const useGameStore = create<GameState>((set, get) => ({
  activeSceneId: defaultSceneId,
  flags: {},
  setScene: (id) => set({ activeSceneId: id }),
  setFlag: (flag) => set((s) => ({ flags: { ...s.flags, [flag]: true } })),
  canTravel: (sceneId) => {
    const scene = journey.find((cfg) => cfg.id === sceneId);
    if (!scene || !scene.travelTo) return false;
    const required = scene.travelRequires ?? [];
    return required.every((req) => get().flags[req]);
  },
}));
