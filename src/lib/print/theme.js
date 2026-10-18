// Turns one accent colour into the small palette every printed layout uses.
// Layouts never hard-code "text on accent" colours, so any colour the user picks stays readable.

import { contrastRatio, deriveArtColors, isHex, luminance, mixColors, readableTextOn } from "../color.js";

function until(color, toward, test, step = 0.08) {
  let c = color;
  for (let i = 0; i < 40 && !test(c); i++) c = mixColors(c, toward, step);
  return c;
}

export function makeTheme(accent) {
  const a = isHex(accent) ? accent.toLowerCase() : "#1d4ed8";
  return {
    accent: a,
    // Text or icons placed ON the accent colour.
    on: readableTextOn(a),
    // Accent used as text on a white card (darkened until it reads well).
    strong: until(a, "#000000", (c) => contrastRatio(c, "#ffffff") >= 4),
    // Accent used as text on a near-black card (lightened until it reads well).
    light: until(a, "#ffffff", (c) => contrastRatio(c, "#0c0c0c") >= 5.5),
    // Very dark shade: QR dots and deep panels.
    deep: deriveArtColors(a).dark,
    // Pale tints for chips, boxes and backgrounds.
    tint: mixColors(a, "#ffffff", 0.9),
    soft: mixColors(a, "#ffffff", 0.72),
    // Second colour for gradients.
    accent2: mixColors(a, "#f0875e", 0.6),
    ink: "#111827",
    muted: "#4b5563",
    faint: "#9ca3af",
    isLight: luminance(a) > 0.45,
  };
}
