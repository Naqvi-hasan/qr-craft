// One-click looks. A theme changes colours and shapes but keeps the user's
// content, logo, frame choice and picture-art shape. All themes keep a light code area,
// because scanners need dark dots on a light background.

export const THEMES = [
  {
    id: "classic",
    name: "Classic",
    swatch: ["#111827", "#ffffff"],
    style: {
      dots: { shape: "square", color: "#111827", gradient: { enabled: false } },
      eyes: { outer: "square", inner: "square", matchDots: true },
      background: { color: "#ffffff", rounded: true },
      frame: { color: "#111827" },
    },
  },
  {
    id: "dark",
    name: "Dark",
    swatch: ["#0b1020", "#38bdf8"],
    style: {
      dots: { shape: "rounded", color: "#0b1020", gradient: { enabled: false } },
      eyes: { outer: "rounded", inner: "rounded", matchDots: false, outerColor: "#0b1020", innerColor: "#0e7490" },
      background: { color: "#ffffff", rounded: true },
      frame: { color: "#0b1020" },
    },
  },
  {
    id: "firefly",
    name: "Firefly",
    swatch: ["#6d28d9", "#c2410c"],
    style: {
      dots: { shape: "dots", gradient: { enabled: true, type: "linear", from: "#6d28d9", to: "#c2410c", rotation: 45 } },
      eyes: { outer: "rounded", inner: "circle", matchDots: false, outerColor: "#0e7490", innerColor: "#6d28d9" },
      background: { color: "#ffffff", rounded: true },
      frame: { color: "#0b1020" },
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    swatch: ["#374151", "#f3f4f6"],
    style: {
      dots: { shape: "pixel", color: "#374151", gradient: { enabled: false } },
      eyes: { outer: "rounded", inner: "rounded", matchDots: true },
      background: { color: "#ffffff", rounded: true },
      frame: { color: "#374151" },
    },
  },
  {
    id: "business",
    name: "Business",
    swatch: ["#1e3a8a", "#92400e"],
    style: {
      dots: { shape: "square", color: "#1e3a8a", gradient: { enabled: false } },
      eyes: { outer: "square", inner: "square", matchDots: false, outerColor: "#1e3a8a", innerColor: "#92400e" },
      background: { color: "#ffffff", rounded: false },
      frame: { color: "#1e3a8a" },
    },
  },
  {
    id: "playful",
    name: "Playful",
    swatch: ["#db2777", "#7c3aed"],
    style: {
      dots: { shape: "rounded", gradient: { enabled: true, type: "radial", from: "#db2777", to: "#7c3aed", rotation: 0 } },
      eyes: { outer: "circle", inner: "circle", matchDots: false, outerColor: "#be185d", innerColor: "#7c3aed" },
      background: { color: "#ffffff", rounded: true },
      frame: { color: "#db2777" },
    },
  },
];

export const THEME_MAP = Object.fromEntries(THEMES.map((t) => [t.id, t]));
