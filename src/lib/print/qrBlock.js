// The QR inside a printed item: rendered by the normal QR engine, then nested into the card SVG.
// Print rules: dark dots only, light tile only, 2-module quiet zone, no logo inside the code.

import { createMatrix } from "../qr/matrix.js";
import { renderQrSvg } from "../qr/render.js";
import { deepMerge } from "../qr/style.js";
import { DEFAULT_STYLE } from "../../config/qrStyle.js";
import { deriveArtColors, isHex, luminance } from "../color.js";

export const QR_DOT_OPTIONS = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Fluid" },
  { value: "dots", label: "Dots" },
];

const EYES = {
  square: { outer: "square", inner: "square" },
  rounded: { outer: "rounded", inner: "rounded" },
  dots: { outer: "rounded", inner: "circle" },
};

// Long payloads (contact cards) get M so the code stays coarse enough to print small.
export const ecFor = (payload) => (new TextEncoder().encode(payload).length > 110 ? "M" : "Q");

const cache = new Map();
function matrixFor(payload, ec) {
  const key = `${ec}|${payload}`;
  if (!cache.has(key)) {
    if (cache.size > 80) cache.clear();
    cache.set(key, createMatrix(payload, ec));
  }
  return cache.get(key);
}

// Any colour the layout asks for is pushed dark enough to scan; the tile is forced light.
export function safeQrColors(color, bg) {
  const dark = isHex(color) && luminance(color) <= 0.08 ? color : deriveArtColors(isHex(color) ? color : "#111827").dark;
  const light = isHex(bg) && luminance(bg) >= 0.6 ? bg : "#ffffff";
  return { dark, light };
}

export function qrSvg(payload, { color = "#111827", bg = "#ffffff", shape = "square", quietZone = 2 } = {}) {
  const ec = ecFor(payload);
  const { dark, light } = safeQrColors(color, bg);
  const eyes = EYES[shape] ?? EYES.square;
  const style = deepMerge(DEFAULT_STYLE, {
    dots: { shape: EYES[shape] ? shape : "square", color: dark },
    eyes: { ...eyes, matchDots: true },
    background: { color: light, transparent: false, rounded: false },
    quietZone,
    ecLevel: ec,
  });
  return { svg: renderQrSvg({ matrix: matrixFor(payload, ec), style, width: 512 }).svg, modules: matrixFor(payload, ec).size + 2 * quietZone };
}

// Places an SVG (with width/height attributes) at x, y with the given size inside another SVG.
export function nestSvg(svg, x, y, size) {
  return svg.replace(/^<svg([^>]*?) width="\d+" height="\d+"/, `<svg$1 x="${x}" y="${y}" width="${size}" height="${size}"`);
}
