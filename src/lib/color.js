// Colour helpers. Scanners need dark dots on a light background with strong contrast,
// so most of this file is about measuring and protecting that contrast.

export function isHex(value) {
  return /^#[0-9a-f]{6}$/i.test(String(value || ""));
}

export function hexToRgb(hex) {
  let value = String(hex || "").replace("#", "").trim();
  if (value.length === 3) value = value.split("").map((c) => c + c).join("");
  if (!/^[0-9a-f]{6}$/i.test(value)) return null;
  const num = parseInt(value, 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

export function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("")}`;
}

// Blend two colours: t = 0 gives `a`, t = 1 gives `b`.
export function mixColors(a, b, t) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  if (!A || !B) return a;
  return rgbToHex(A.map((v, i) => v + (B[i] - v) * t));
}

// Relative luminance as defined by WCAG (0 = black, 1 = white).
export function luminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const [r, g, b] = rgb.map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(hexA, hexB) {
  const a = luminance(hexA);
  const b = luminance(hexB);
  if (a === null || b === null) return null;
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

// Picks white or near-black text, whichever reads better on `background`.
export function readableTextOn(background) {
  const white = contrastRatio("#ffffff", background) ?? 21;
  const black = contrastRatio("#111827", background) ?? 1;
  return white >= black ? "#ffffff" : "#111827";
}

// Returns a warning string, or null if the colours are safe.
export function getColorWarning(foreground, background) {
  const ratio = contrastRatio(foreground, background);
  if (ratio === null) return null;
  if (luminance(foreground) > luminance(background)) {
    return "Dots are lighter than the background. Many scanners can't read inverted QR codes.";
  }
  if (ratio < 4) {
    return `Low contrast (${ratio.toFixed(1)}:1). Use darker dots or a lighter background so it scans reliably.`;
  }
  return null;
}

// Picture art paints a shape into the QR: dark dots inside the shape use a deep shade of the
// chosen colour, light dots inside it get a tint. These limits keep both readable by scanners.
const ART_MAX_DARK_LUMINANCE = 0.08;
const ART_MIN_LIGHT_LUMINANCE = 0.45;

export function deriveArtColors(shapeColor, background = "#ffffff", strength = 0.45) {
  const base = isHex(shapeColor) ? shapeColor : "#be123c";
  const bg = isHex(background) && luminance(background) > 0.6 ? background : "#ffffff";

  let dark = base;
  for (let i = 0; i < 40 && luminance(dark) > ART_MAX_DARK_LUMINANCE; i++) dark = mixColors(dark, "#000000", 0.08);

  let light = mixColors(bg, base, Math.max(0, Math.min(1, strength)));
  for (let i = 0; i < 40 && luminance(light) < ART_MIN_LIGHT_LUMINANCE; i++) light = mixColors(light, "#ffffff", 0.08);

  return { dark, light };
}
