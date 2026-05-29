export const FRAME_COUNT = 106;
export const FRAME_BASE = "/frames/frame_";
export const FRAME_EXT = ".jpg";

export const framePath = (n: number): string => {
  const padded = String(n + 1).padStart(4, "0");
  return `${FRAME_BASE}${padded}${FRAME_EXT}`;
};

export type Beat = {
  id: string;
  show: number;
  hide: number;
  label: string;
  quote: string;
  source: string;
};

export const BEATS: Beat[] = [
  {
    id: "ignition",
    show: 0.08,
    hide: 0.32,
    label: "01 — Ignition",
    quote: "The trick is almost never WebGL. It's a pre-rendered image sequence.",
    source: "SKILL.md, line 18",
  },
  {
    id: "sync",
    show: 0.38,
    hide: 0.62,
    label: "02 — Sync",
    quote: "One scroll progress drives every animation in the section.",
    source: "Iron Man — CinematicReveal.tsx",
  },
  {
    id: "aftermath",
    show: 0.7,
    hide: 0.92,
    label: "03 — Aftermath",
    quote: "Direct DOM via refs for hot updates. State only for the visible-card set.",
    source: "SKILL.md, performance non-negotiables",
  },
];
