// Helpers for working with the style object from config/qrStyle.js.

import { DEFAULT_STYLE, ART_DETAIL_VERSION } from "../../config/qrStyle.js";
import { getColorWarning, isHex, luminance } from "../color.js";

const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// Merges `patch` into `base` without mutating either. Used for themes and templates.
export function deepMerge(base, patch) {
  if (!isPlainObject(patch)) return base;
  const out = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    out[key] = isPlainObject(value) && isPlainObject(base?.[key]) ? deepMerge(base[key], value) : value;
  }
  return out;
}

// setIn(style, "dots.gradient.from", "#fff") returns a new object with only that value changed.
export function setIn(obj, path, value) {
  const [head, ...rest] = path.split(".");
  return { ...obj, [head]: rest.length ? setIn(obj?.[head] ?? {}, rest.join("."), value) : value };
}

export function getIn(obj, path) {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);
}

// Applies a theme/template on a clean default, keeping the user's own logo.
export function applyPreset(currentStyle, presetStyle) {
  const next = deepMerge(DEFAULT_STYLE, presetStyle);
  return { ...next, logo: { ...next.logo, src: currentStyle?.logo?.src ?? null } };
}

// Themes only restyle: content, logo, frame type/text and picture-art shape stay as they are.
export function applyTheme(currentStyle, themeStyle) {
  return deepMerge(currentStyle, themeStyle);
}

export function hasArt(style) {
  const art = style?.art;
  if (!art || art.shape === "none") return false;
  if (art.shape === "custom") return Boolean(art.custom);
  if (art.shape === "monogram") return Boolean(String(art.text || "").trim());
  return true;
}

// A logo covers part of the code and picture art lowers contrast inside the shape,
// so both get the strongest error correction.
export function getEffectiveEcLevel(style) {
  return style?.logo?.src || hasArt(style) ? "H" : style?.ecLevel ?? "M";
}

export function getMinVersion(style) {
  return hasArt(style) ? ART_DETAIL_VERSION[style.art.detail] ?? 0 : 0;
}

// Plain-language warnings shown under the preview.
export function getStyleWarnings(style) {
  const warnings = [];
  const bg = style.background.transparent ? "#ffffff" : style.background.color;
  const dotColors = style.dots.gradient.enabled ? [style.dots.gradient.from, style.dots.gradient.to] : [style.dots.color];
  const eyeColors = style.eyes.matchDots ? [] : [style.eyes.outerColor, style.eyes.innerColor];

  for (const color of [...dotColors, ...eyeColors]) {
    const warning = getColorWarning(color, bg);
    if (warning) {
      warnings.push(warning);
      break;
    }
  }
  if (style.background.transparent) {
    warnings.push("Transparent background: place the QR on a light surface, or it may not scan.");
  }
  if (style.quietZone < 2) {
    warnings.push("Very thin border. Keep at least 2 modules of empty space around the code.");
  }
  if (!style.background.transparent && isHex(style.background.color) && luminance(style.background.color) < 0.5) {
    warnings.push("Dark backgrounds make QR codes hard to scan. Use a light background.");
  }
  return [...new Set(warnings)];
}
