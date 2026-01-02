export type MemoryBox = {
  id: string;
  label: string;
  flag: string;
  pos_w2: [number, number];
  size?: number;
  color?: string;
  prompt?: string;
};

export type Platform = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type LineSurface = {
  id: string;
  p1: [number, number];
  p2: [number, number];
  friction?: number;
};

export type ChallengeGate = {
  id: string;
  label: string;
  flag: string;
  gateX: number;
  gateHeight: number;
  requires?: string[];
  color?: string;
};

export type SceneConfig = {
  id: string;
  title: string;
  location: { city: string; country: string; year: string };
  introText: string;
  completionText: string;
  bounds: { width: number; height: number };
  floorY: number;
  start_w2: [number, number];
  palette: { paper: string; ink: string; accent: string; accent2: string; wash: string };
  platforms: Platform[];
  surfaces?: LineSurface[];
  boxes: MemoryBox[];
  challenges?: ChallengeGate[];
  followers?: ("husband" | "baby")[];
  travelTo?: string | null;
  travelRequires?: string[];
};

const baseBounds = { width: 1500, height: 820 } as const;

export const journey: SceneConfig[] = [
  {
    id: "nashville",
    title: "Vanderbilt Beginnings",
    location: { city: "Nashville", country: "USA", year: "2019" },
    introText: "A sketchy campus quad, a bouncing ball, and that first coffee conversation that started it all.",
    completionText: "We promised to try—coffee, long walks, maybe forever.",
    bounds: baseBounds,
    floorY: 680,
    start_w2: [90, 520],
    palette: { paper: "#fff8ef", ink: "#131212", accent: "#f26f63", accent2: "#4a8fe2", wash: "#ffe9d2" },
    platforms: [
      { id: "ground", x: 0, y: 680, width: 1500, height: 18 },
      { id: "steps-1", x: 260, y: 560, width: 210, height: 18 },
      { id: "steps-2", x: 520, y: 500, width: 170, height: 18 },
      { id: "library-loft", x: 860, y: 440, width: 220, height: 18 },
      { id: "roof", x: 1200, y: 390, width: 150, height: 18 },
    ],
    boxes: [
      { id: "coffee", label: "First Coffee", flag: "coffee_done", pos_w2: [340, 520], size: 60, color: "#f26f63", prompt: "Bounce here to tell that story" },
      { id: "mentor", label: "Mentor", flag: "mentor_note", pos_w2: [620, 470], size: 54, color: "#4a8fe2" },
      { id: "fireflies", label: "Fireflies", flag: "fireflies", pos_w2: [1010, 400], size: 52, color: "#f2c94c" },
    ],
    challenges: [
      { id: "climb", label: "Bounce up the steps", flag: "nashville_climb", gateX: 1320, gateHeight: 360, requires: ["coffee_done"], color: "#f26f63" },
    ],
    travelTo: "oxford",
    travelRequires: ["coffee_done"],
  },
  {
    id: "oxford",
    title: "Pandemic Oxford",
    location: { city: "Oxford", country: "UK", year: "2020" },
    introText: "A quiet sketch of spires and rain. We biked, cooked, and learned each other's corners during lockdown.",
    completionText: "We found rituals in storms: shared tea, Zoom birthdays, tiny triumphs.",
    bounds: baseBounds,
    floorY: 690,
    start_w2: [110, 540],
    palette: { paper: "#f2f7ff", ink: "#0f1a2c", accent: "#3c7adf", accent2: "#7ac9a3", wash: "#dce9ff" },
    platforms: [
      { id: "ground", x: 0, y: 690, width: 1500, height: 18 },
      { id: "canal", x: 260, y: 580, width: 240, height: 14 },
      { id: "college-steps", x: 620, y: 520, width: 180, height: 16 },
      { id: "flat", x: 940, y: 470, width: 200, height: 16 },
      { id: "spire", x: 1240, y: 400, width: 160, height: 16 },
    ],
    boxes: [
      { id: "bike", label: "Bike Rides", flag: "bike_done", pos_w2: [310, 530], size: 56, color: "#3c7adf" },
      { id: "flat", label: "Tiny Flat", flag: "flat_done", pos_w2: [980, 430], size: 60, color: "#7ac9a3", prompt: "Bounce here to cook together" },
      { id: "rain", label: "Rain Walk", flag: "rain_note", pos_w2: [1280, 360], size: 50, color: "#0f1a2c" },
    ],
    challenges: [
      { id: "soak", label: "Glide through rain drops", flag: "oxford_rain", gateX: 1400, gateHeight: 340, requires: ["flat_done"], color: "#3c7adf" },
    ],
    followers: ["husband"],
    travelTo: "mountain-view-1",
    travelRequires: ["flat_done"],
  },
  {
    id: "mountain-view-1",
    title: "Tesla Era",
    location: { city: "Mountain View", country: "USA", year: "2021" },
    introText: "California lines, late-night debug sessions, and shoreline sunsets between recruiter calls.",
    completionText: "We chased possibility together and kept choosing us.",
    bounds: baseBounds,
    floorY: 700,
    start_w2: [120, 560],
    palette: { paper: "#fff7f2", ink: "#17100f", accent: "#e36b5f", accent2: "#8fd0ff", wash: "#ffe1d5" },
    platforms: [
      { id: "ground", x: 0, y: 700, width: 1500, height: 18 },
      { id: "garage", x: 360, y: 590, width: 200, height: 16 },
      { id: "lab", x: 720, y: 530, width: 200, height: 16 },
      { id: "shoreline", x: 1080, y: 470, width: 200, height: 16 },
    ],
    boxes: [
      { id: "tesla", label: "Tesla Badge", flag: "tesla_badge", pos_w2: [420, 550], size: 58, color: "#e36b5f" },
      { id: "shoreline", label: "Shoreline Walk", flag: "shoreline_walk", pos_w2: [1140, 430], size: 56, color: "#8fd0ff" },
    ],
    challenges: [
      { id: "launch", label: "Hit the launch ramp", flag: "mv_launch", gateX: 1320, gateHeight: 420, requires: [], color: "#e36b5f" },
    ],
    followers: ["husband"],
    travelTo: "nyc",
    travelRequires: [],
  },
  {
    id: "nyc",
    title: "Upper East Side",
    location: { city: "New York", country: "USA", year: "2022" },
    introText: "Subway cross-hatching, OR shifts, and stroller daydreams in Central Park.",
    completionText: "We added a tiny blue circle named Alan to our sketch.",
    bounds: baseBounds,
    floorY: 700,
    start_w2: [140, 560],
    palette: { paper: "#f6f6ff", ink: "#0f1322", accent: "#ff8f65", accent2: "#5b7bff", wash: "#e1e6ff" },
    platforms: [
      { id: "ground", x: 0, y: 700, width: 1500, height: 18 },
      { id: "brownstone", x: 320, y: 590, width: 200, height: 18 },
      { id: "hospital", x: 680, y: 520, width: 240, height: 18 },
      { id: "park", x: 1080, y: 470, width: 240, height: 18 },
    ],
    boxes: [
      { id: "residency", label: "Residency", flag: "residency_badge", pos_w2: [720, 480], size: 54, color: "#5b7bff" },
      { id: "apartment", label: "Apartment", flag: "alan", pos_w2: [360, 550], size: 62, color: "#ff8f65", prompt: "Bounce here to welcome Alan" },
      { id: "central-park", label: "Central Park", flag: "park_picnic", pos_w2: [1140, 430], size: 54, color: "#0f1322" },
    ],
    challenges: [
      { id: "subway", label: "Catch the train", flag: "nyc_train", gateX: 1380, gateHeight: 420, requires: ["alan"], color: "#5b7bff" },
    ],
    followers: ["husband", "baby"],
    travelTo: "mountain-view-2",
    travelRequires: ["alan"],
  },
  {
    id: "mountain-view-2",
    title: "Homecoming & 5 Years",
    location: { city: "Mountain View", country: "USA", year: "2024" },
    introText: "Back to sunshine lines and playground loops, now with a toddler orbiting us.",
    completionText: "Five years in, the sketch is a mural.",
    bounds: baseBounds,
    floorY: 700,
    start_w2: [120, 560],
    palette: { paper: "#fff9f0", ink: "#111315", accent: "#ffb167", accent2: "#64c09c", wash: "#ffe9c2" },
    platforms: [
      { id: "ground", x: 0, y: 700, width: 1500, height: 18 },
      { id: "home", x: 340, y: 590, width: 200, height: 18 },
      { id: "playground", x: 720, y: 520, width: 220, height: 18 },
      { id: "hill", x: 1100, y: 470, width: 220, height: 18 },
    ],
    boxes: [
      { id: "home", label: "New Home", flag: "new_home", pos_w2: [380, 550], size: 60, color: "#ffb167" },
      { id: "swing", label: "Playground", flag: "playground", pos_w2: [780, 480], size: 58, color: "#64c09c" },
      { id: "sunset", label: "Sunset Vows", flag: "sunset_vows", pos_w2: [1160, 430], size: 62, color: "#111315" },
    ],
    challenges: [
      { id: "family", label: "Keep everyone bouncing", flag: "family_loop", gateX: 1400, gateHeight: 420, requires: ["new_home", "sunset_vows"], color: "#64c09c" },
    ],
    followers: ["husband", "baby"],
    travelTo: null,
    travelRequires: [],
  },
];
