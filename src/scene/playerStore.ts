import { create } from "zustand";

type PlayerState = {
  pos_w3: [number, number, number];
  yaw_rad: number;
  pitch_rad: number;
  speed: number;
  ground_y: number;
  setPos: (pos_w3: [number, number, number]) => void;
  setYaw: (yaw_rad: number) => void;
  setPitch: (pitch_rad: number) => void;
  setSpeed: (speed: number) => void;
  setGroundY: (ground_y: number) => void;
};

export const usePlayerStore = create<PlayerState>((set) => ({
  pos_w3: [0, 0.6, 5],
  yaw_rad: 0,
  pitch_rad: 0,
  speed: 0,
  ground_y: 0,
  setPos: (pos_w3) => set({ pos_w3 }),
  setYaw: (yaw_rad) => set({ yaw_rad }),
  setPitch: (pitch_rad) => set({ pitch_rad }),
  setSpeed: (speed) => set({ speed }),
  setGroundY: (ground_y) => set({ ground_y }),
}));
