export type Landmark = {
  id: string;
  label: string;
  pos_w3: [number, number, number];
  model?: string;
  interaction?: { prompt: string; onCompleteFlag: string };
  notes?: string;
};

export type SceneConfig = {
  id: string;
  title: string;
  location: { city: string; country: string; year: string };
  skybox?: string;
  terrain?: string;
  music?: string;
  introText: string;
  completionText: string;
  landmarks: Landmark[];
  sprites?: SpriteBillboard[];
  colliders?: BoxCollider[];
  followers?: string[];
  travelTo?: string | null;
  travelRequires?: string[];
};

export type SpriteBillboard = {
  id: string;
  label: string;
  emoji?: string;
  color?: string;
  pos_w3: [number, number, number];
  bobAmp?: number;
  bobFreq?: number;
  spin?: boolean;
};

export type BoxCollider = {
  id: string;
  min_w3: [number, number, number];
  max_w3: [number, number, number];
  bounciness?: number;
};

export const journey: SceneConfig[] = [
  {
    id: "nashville",
    title: "Vanderbilt Beginnings",
    location: { city: "Nashville", country: "USA", year: "2019" },
    introText: "TODO: memory of med school start",
    completionText: "TODO: wrap-up",
    landmarks: [
      {
        id: "vanderbilt-hall",
        label: "VUMC",
        pos_w3: [5, 0, -3],
        notes: "TODO: lecture anecdote",
      },
      {
        id: "coffee",
        label: "Coffee Spot",
        pos_w3: [-2, 0, 4],
        interaction: { prompt: "Share first-date story", onCompleteFlag: "coffee_done" },
      },
    ],
    travelTo: "oxford",
    travelRequires: ["coffee_done"],
    sprites: [
      { id: "fireflies", label: "Fireflies", emoji: "✨", color: "#ffd166", pos_w3: [1, 1.5, -1], bobAmp: 0.2, bobFreq: 1.5, spin: true },
      { id: "mentor", label: "Mentor Spirit", emoji: "🎓", color: "#8fb6ff", pos_w3: [-3, 1.2, 2], bobAmp: 0.35, bobFreq: 1.1 },
    ],
    colliders: [
      { id: "ground", min_w3: [-30, -0.2, -30], max_w3: [30, 0, 30] },
      { id: "low-wall", min_w3: [2, 0, -6], max_w3: [8, 1.2, -5] },
      { id: "stairs-1", min_w3: [-6, 0, 1], max_w3: [-4, 0.4, 3] },
      { id: "stairs-2", min_w3: [-6, 0.4, 3], max_w3: [-4, 0.8, 5] },
      { id: "stairs-3", min_w3: [-6, 0.8, 5], max_w3: [-4, 1.2, 7] },
    ],
  },
  {
    id: "oxford",
    title: "Pandemic Oxford",
    location: { city: "Oxford", country: "UK", year: "2020" },
    introText: "TODO: MPH + lockdown vibe",
    completionText: "TODO",
    landmarks: [
      { id: "radcliffe", label: "Radcliffe Camera", pos_w3: [3, 0, -6], notes: "TODO: study walks" },
      {
        id: "flat",
        label: "Tiny Flat",
        pos_w3: [-4, 0, 2],
        interaction: { prompt: "Cook together memory", onCompleteFlag: "flat_done" },
      },
    ],
    travelTo: "mountain-view-1",
    travelRequires: ["flat_done"],
    sprites: [
      { id: "bike", label: "Bike Rides", emoji: "🚲", color: "#9ae6b4", pos_w3: [2, 1.4, -4], bobAmp: 0.3, bobFreq: 1.4 },
      { id: "rain", label: "Rain Memory", emoji: "🌧️", color: "#a7c7e7", pos_w3: [-2, 1.1, 3], bobAmp: 0.2, bobFreq: 0.9 },
    ],
    colliders: [
      { id: "ground", min_w3: [-30, -0.2, -30], max_w3: [30, 0, 30] },
      { id: "college-steps", min_w3: [4, 0, -8], max_w3: [8, 0.6, -4] },
    ],
    followers: ["husband"],
  },
  {
    id: "mountain-view-1",
    title: "Tesla Era",
    location: { city: "Mountain View", country: "USA", year: "2021" },
    introText: "TODO: Tesla start + interviews",
    completionText: "TODO",
    landmarks: [
      { id: "tesla", label: "Tesla HQ", pos_w3: [6, 0, 1] },
      { id: "trail", label: "Shoreline Walks", pos_w3: [-3, 0, -2], notes: "TODO: weekend strolls" },
    ],
    travelTo: "nyc",
    travelRequires: [],
    sprites: [
      { id: "car", label: "Tesla Dreams", emoji: "🚗", color: "#f2b8c6", pos_w3: [0, 1.3, -3], bobAmp: 0.25, bobFreq: 1.2 },
    ],
    colliders: [
      { id: "ground", min_w3: [-30, -0.2, -30], max_w3: [30, 0, 30] },
      { id: "garage-wall", min_w3: [2, 0, -2], max_w3: [7, 2.2, -1] },
    ],
    followers: ["husband"],
  },
  {
    id: "nyc",
    title: "Upper East Side",
    location: { city: "New York", country: "USA", year: "2022" },
    introText: "TODO: residency grind + robotics research",
    completionText: "TODO",
    landmarks: [
      { id: "mount-sinai", label: "Mount Sinai", pos_w3: [5, 0, -1] },
      {
        id: "apartment",
        label: "Apartment",
        pos_w3: [-4, 0, 3],
        interaction: { prompt: "Baby Alan arrives!", onCompleteFlag: "alan" },
      },
      { id: "central-park", label: "Central Park", pos_w3: [1, 0, 6] },
    ],
    travelTo: "mountain-view-2",
    travelRequires: ["alan"],
    sprites: [
      { id: "robot", label: "Robotics Lab", emoji: "🤖", color: "#c7a5ff", pos_w3: [2, 1.6, 1], spin: true },
      { id: "city", label: "City Lights", emoji: "🌆", color: "#ffdd99", pos_w3: [-1.5, 1.2, -2.5], bobAmp: 0.2, bobFreq: 1.3 },
    ],
    colliders: [
      { id: "ground", min_w3: [-30, -0.2, -30], max_w3: [30, 0, 30] },
      { id: "hospital-wall", min_w3: [3, 0, -3], max_w3: [6, 2.5, -2] },
    ],
    followers: ["husband", "baby"],
  },
  {
    id: "mountain-view-2",
    title: "Homecoming & 5 Years",
    location: { city: "Mountain View", country: "USA", year: "2024" },
    introText: "TODO: life with Alan + anniversary",
    completionText: "TODO: closing vows",
    landmarks: [
      { id: "home", label: "New Home", pos_w3: [0, 0, 0], notes: "TODO: cozy detail" },
      { id: "park", label: "Playground", pos_w3: [3, 0, -4] },
    ],
    travelTo: null,
    travelRequires: [],
    sprites: [
      { id: "family", label: "Family Joy", emoji: "👨‍👩‍👦", color: "#9ae6b4", pos_w3: [0.5, 1.2, 1], bobAmp: 0.35, bobFreq: 1.0 },
      { id: "sunset", label: "Mountain Sunset", emoji: "🌅", color: "#ffb570", pos_w3: [-2, 1.1, -1], bobAmp: 0.25, bobFreq: 1.6 },
    ],
    colliders: [
      { id: "ground", min_w3: [-30, -0.2, -30], max_w3: [30, 0, 30] },
      { id: "courtyard-wall", min_w3: [-4, 0, -6], max_w3: [-1, 2.8, -5] },
      { id: "garden-steps-1", min_w3: [1, 0, 2], max_w3: [3, 0.4, 4] },
      { id: "garden-steps-2", min_w3: [1, 0.4, 4], max_w3: [3, 0.8, 6] },
    ],
    followers: ["husband", "baby"],
  },
];
