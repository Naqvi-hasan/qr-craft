// Drawing kit for printed layouts. Units are millimetres (the SVG viewBox is the paper size).
//
// A layout gets a kit `k` and returns SVG markup:
//   render(k) { return k.text(8, 12, k.v.name, { size: 5, w: 700, d: true }) + k.qr(60, 6, 24) }
//
// Edge-aware boxes: anything drawn with k.box() that touches the paper edge is extended 3 mm past
// it. That extra strip is invisible on screen but gives print shops the "bleed" they need.

import { escapeXml, isSafeImage } from "../qr/render.js";
import { BODY_FONT, getFont } from "./fonts.js";
import { nestSvg, qrSvg } from "./qrBlock.js";

export const BLEED = 3;
const r = (n) => Math.round(n * 100) / 100;

function hash(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

const ATTR = { sw: "stroke-width", op: "opacity", dash: "stroke-dasharray", fop: "fill-opacity", cap: "stroke-linecap", join: "stroke-linejoin", tf: "transform" };
function attrs(o = {}) {
  let out = "";
  for (const [key, value] of Object.entries(o)) {
    if (value === undefined || value === null || value === false) continue;
    out += ` ${ATTR[key] ?? key}="${typeof value === "number" ? r(value) : value}"`;
  }
  return out;
}

// Approximate rendered width of a line of text (mm).
export function textWidth(text, size, font = BODY_FONT, bold = false, ls = 0) {
  const s = String(text ?? "");
  return s.length * size * (bold ? font.kb : font.k) + Math.max(0, s.length - 1) * ls;
}

// Simple line-wrapping for short paragraphs (addresses, notes).
export function wrapText(text, maxWidth, size, font = BODY_FONT, bold = false, maxLines = 3) {
  const words = String(text ?? "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(next, size, font, bold) <= maxWidth || !line) line = next;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1].replace(/\s+\S*$/, "")}…`;
    return kept;
  }
  return lines;
}

const ICONS = {
  phone: `<path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2"/>`,
  mail: `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>`,
  web: `<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>`,
  pin: `<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/>`,
  user: `<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>`,
  calendar: `<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>`,
  at: `<circle cx="12" cy="12" r="4"/><path d="M16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1"/>`,
  star: `<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"/>`,
  wifi: `<path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19.5" r="0.8"/>`,
};
export const ICON_NAMES = Object.keys(ICONS);

/**
 * @param {object} o
 * @param {number} o.W  paper width (mm)
 * @param {number} o.H  paper height (mm)
 * @param {object} o.theme  from makeTheme()
 * @param {string} o.font  display font id
 * @param {object} o.values  display values (already filtered for "show on card")
 * @param {string|null} o.payload  QR content (null = draw a placeholder)
 * @param {string} o.qrShape  square | rounded | dots
 * @param {object} o.images  { logo, photo } data URLs
 * @param {(key:string)=>string} o.L  translated fixed strings
 * @param {string} o.seed  makes gradient/clip ids unique per layout
 */
export function createKit({ W, H, theme, font, values = {}, payload = null, qrShape = "square", images = {}, L = (k) => k, seed = "x" }) {
  const display = getFont(font);
  const prefix = `p${hash(`${seed}|${theme.accent}|${font}`)}`;
  let defs = "";
  let n = 0;
  const id = () => `${prefix}${(n++).toString(36)}`;
  const k = { W, H, c: theme, v: values, L, display, qrBox: null, id };
  k.logo = isSafeImage(images.logo) ? images.logo : null;
  k.photo = isSafeImage(images.photo) ? images.photo : null;

  k.text = (x, y, value, o = {}) => {
    if (value === undefined || value === null || String(value).trim() === "") return "";
    const f = o.d ? display : o.font ?? BODY_FONT;
    const weight = o.w ?? 400;
    const bold = weight >= 600;
    let size = o.size ?? 3;
    let s = String(value);
    if (o.upper) s = s.toUpperCase();
    const ls = o.ls ?? 0;
    if (o.max) {
      const width = textWidth(s, size, f, bold, ls);
      if (width > o.max && o.shrink !== false) size = Math.max(size * (o.minScale ?? 0.6), (size * o.max) / width);
      while (s.length > 2 && textWidth(s, size, f, bold, ls) > o.max) s = s.slice(0, -2) + "…";
    }
    const fw = f.weight && bold ? f.weight : weight;
    return `<text x="${r(x)}" y="${r(y)}" font-family="${f.family}" font-size="${r(size)}" font-weight="${fw}"${o.italic ? ' font-style="italic"' : ""} fill="${o.fill ?? theme.ink}" text-anchor="${o.anchor ?? "start"}"${ls ? ` letter-spacing="${r(ls)}"` : ""}${o.op !== undefined && o.op < 1 ? ` opacity="${o.op}"` : ""}>${escapeXml(s)}</text>`;
  };

  // Several lines, top-aligned at y (first baseline). Returns { svg, height }.
  k.para = (x, y, value, o = {}) => {
    const f = o.d ? display : BODY_FONT;
    const lines = wrapText(value, o.max ?? W, o.size ?? 3, f, (o.w ?? 400) >= 600, o.lines ?? 3);
    const lh = (o.size ?? 3) * (o.lh ?? 1.35);
    return { svg: lines.map((line, i) => k.text(x, y + i * lh, line, { ...o, max: undefined })).join(""), height: lines.length * lh, lines: lines.length };
  };

  k.rect = (x, y, w, h, o = {}) => `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}"${attrs(o)}/>`;
  k.box = (x, y, w, h, o = {}) => {
    const e = 0.01;
    let x0 = x;
    let y0 = y;
    let x1 = x + w;
    let y1 = y + h;
    if (x0 <= e) x0 = -BLEED;
    if (y0 <= e) y0 = -BLEED;
    if (x1 >= W - e) x1 = W + BLEED;
    if (y1 >= H - e) y1 = H + BLEED;
    return k.rect(x0, y0, x1 - x0, y1 - y0, o);
  };
  k.circle = (cx, cy, radius, o = {}) => `<circle cx="${r(cx)}" cy="${r(cy)}" r="${r(radius)}"${attrs(o)}/>`;
  k.ellipse = (cx, cy, rx, ry, o = {}) => `<ellipse cx="${r(cx)}" cy="${r(cy)}" rx="${r(rx)}" ry="${r(ry)}"${attrs(o)}/>`;
  k.path = (d, o = {}) => `<path d="${d}"${attrs(o)}/>`;
  k.line = (x1, y1, x2, y2, o = {}) => `<path d="M${r(x1)} ${r(y1)}L${r(x2)} ${r(y2)}"${attrs({ stroke: theme.ink, sw: 0.3, ...o })}/>`;
  k.g = (content, o = {}) => `<g${attrs(o)}>${content}</g>`;
  k.def = (markup) => {
    defs += markup;
  };

  // Linear gradient, returns the fill value: k.grad([c1, c2], { angle: 135 })
  k.grad = (stops, { angle = 90, radial = false } = {}) => {
    const gid = id();
    const st = stops.map((c, i) => (typeof c === "string" ? `<stop offset="${i / (stops.length - 1)}" stop-color="${c}"/>` : `<stop offset="${c[0]}" stop-color="${c[1]}"${c[2] !== undefined ? ` stop-opacity="${c[2]}"` : ""}/>`)).join("");
    if (radial) defs += `<radialGradient id="${gid}" cx="${radial[0]}" cy="${radial[1]}" r="${radial[2]}">${st}</radialGradient>`;
    else {
      const a = ((angle - 90) * Math.PI) / 180;
      const x = Math.cos(a) / 2;
      const y = Math.sin(a) / 2;
      defs += `<linearGradient id="${gid}" x1="${r(0.5 - x)}" y1="${r(0.5 - y)}" x2="${r(0.5 + x)}" y2="${r(0.5 + y)}">${st}</linearGradient>`;
    }
    return `url(#${gid})`;
  };

  k.icon = (name, x, y, size, color, sw = 2) =>
    ICONS[name] ? `<g transform="translate(${r(x)} ${r(y)}) scale(${r(size / 24)})" fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</g>` : "";

  // Image clipped to a circle or rounded rectangle. fit: "slice" (fill) or "meet" (contain).
  k.image = (src, x, y, w, h, { circle = false, rx = 0, fit = "slice" } = {}) => {
    if (!isSafeImage(src)) return "";
    const cid = id();
    const shape = circle ? `<circle cx="${r(x + w / 2)}" cy="${r(y + h / 2)}" r="${r(Math.min(w, h) / 2)}"/>` : `<rect x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" rx="${r(rx)}"/>`;
    defs += `<clipPath id="${cid}">${shape}</clipPath>`;
    return `<image href="${src}" x="${r(x)}" y="${r(y)}" width="${r(w)}" height="${r(h)}" preserveAspectRatio="xMidYMid ${fit}" clip-path="url(#${cid})"/>`;
  };

  // The QR code. Remembers where it was drawn (the scan check needs its size).
  k.qr = (x, y, size, { color = theme.deep, bg = "#ffffff", quietZone = 2 } = {}) => {
    k.qrBox = { x, y, size };
    if (!payload) {
      return k.rect(x, y, size, size, { fill: "#f3f4f6", stroke: "#d1d5db", sw: 0.3, dash: "1 1" }) + k.text(x + size / 2, y + size / 2 + 1, "QR", { size: size / 5, w: 700, fill: "#9ca3af", anchor: "middle" });
    }
    return nestSvg(qrSvg(payload, { color, bg, shape: qrShape, quietZone }).svg, r(x), r(y), r(size));
  };
  // QR on a light tile with padding. The QR's own background matches the tile.
  k.qrTile = (x, y, size, { tile = "#ffffff", rx = size * 0.08, pad = size * 0.06, color } = {}) =>
    k.rect(x, y, size, size, { fill: tile, rx }) + k.qr(x + pad, y + pad, size - 2 * pad, { color, bg: tile, quietZone: 1 });

  // Logo if uploaded, otherwise a rounded square with initials.
  k.mark = (x, y, size, { bg = theme.accent, fg = theme.on, text } = {}) => {
    if (k.logo) return k.image(k.logo, x, y, size, size, { fit: "meet" });
    const letters = initials(text || values.company || values.name || values.title || "");
    return k.rect(x, y, size, size, { fill: bg, rx: size * 0.24 }) + k.text(x + size / 2, y + size * 0.66, letters, { size: size * (letters.length > 1 ? 0.42 : 0.55), w: 700, fill: fg, anchor: "middle" });
  };
  // Round photo if uploaded, otherwise initials in a circle.
  k.avatar = (cx, cy, radius, { bg = theme.accent, fg = theme.on, text } = {}) => {
    if (k.photo) return k.image(k.photo, cx - radius, cy - radius, radius * 2, radius * 2, { circle: true });
    const letters = initials(text || values.name || values.title || "");
    return k.circle(cx, cy, radius, { fill: bg }) + k.text(cx, cy + radius * 0.3, letters, { size: radius * 0.85, w: 700, fill: fg, anchor: "middle" });
  };

  k.svg = (body, { bg = "#ffffff" } = {}) =>
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${Math.round(W * 10)}" height="${Math.round(H * 10)}">${defs ? `<defs>${defs}</defs>` : ""}<rect x="${-BLEED}" y="${-BLEED}" width="${W + 2 * BLEED}" height="${H + 2 * BLEED}" fill="${bg}"/>${body}</svg>`;

  return k;
}

export function initials(text) {
  const words = String(text ?? "").replace(/[^\p{L}\p{N}\s]/gu, " ").trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  return (words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0]).toUpperCase();
}

// Same SVG with the bleed area included (for print-shop PDFs).
export function withBleed(svg, W, H, bleed = BLEED) {
  return svg.replace(/viewBox="0 0 [\d.]+ [\d.]+" width="\d+" height="\d+"/, `viewBox="${-bleed} ${-bleed} ${W + 2 * bleed} ${H + 2 * bleed}" width="${Math.round((W + 2 * bleed) * 10)}" height="${Math.round((H + 2 * bleed) * 10)}"`);
}
