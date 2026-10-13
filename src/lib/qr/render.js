// Draws a QR matrix as an SVG string, applying the full style:
// dot shape, eye shape, colours/gradient, background, logo, picture art and frame + CTA.
// Pure function (no DOM), so it runs the same in the browser, in tests and for exports.

import { DOT_SHAPES, eyeInnerPath, eyeOuterPath, roundedRectPath } from "./shapes.js";
import { deriveArtColors, isHex, readableTextOn } from "../color.js";
import { hasArt } from "./style.js";

const fmt = (n) => Math.round(n * 1000) / 1000;

export function escapeXml(value) {
  return String(value ?? "").replace(/[<>&"']/g, (ch) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" })[ch]);
}

// Only images the user picked in this browser (data URLs) are allowed inside the SVG.
const SAFE_IMAGE = /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[a-z0-9+/=\s]+$/i;
export const isSafeImage = (src) => typeof src === "string" && SAFE_IMAGE.test(src);

const color = (value, fallback) => (isHex(value) ? value : fallback);

const MAX_LOGO_AREA = 0.16;

// Same design -> same id, so server and browser render identical SVG (no hydration warnings).
function stableId(n, style) {
  let h = 2166136261;
  const text = `${n}|${JSON.stringify(style.dots)}|${style.quietZone}|${style.frame?.style}`;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return `qr${(h >>> 0).toString(36)}`;
}

/**
 * @param {object} args
 * @param {{size:number,isDark:(r:number,c:number)=>boolean}} args.matrix
 * @param {object} args.style  full style (see config/qrStyle.js)
 * @param {Uint8Array|null} [args.mask]  n×n, 1 = module is inside the picture-art shape
 * @param {number} [args.width]  output width in px (height follows the frame's aspect ratio)
 * @returns {{ svg: string, width: number, height: number, aspect: number }}
 */
export function renderQrSvg({ matrix, style, mask = null, width = 512 }) {
  const n = matrix.size;
  const id = stableId(n, style);
  const q = Math.max(0, Math.min(8, Number(style.quietZone) || 0));
  const S = n + 2 * q; // tile span (code + quiet zone), in modules

  // ----- Frame layout -----
  const frameStyle = style.frame?.style ?? "none";
  const frameColor = color(style.frame?.color, "#111827");
  const label = String(style.frame?.text ?? "").trim().slice(0, 28);
  let W = S;
  let H = S;
  let tileX = 0;
  let tileY = 0;
  let frameSvg = "";

  const textSvg = (cx, cy, maxWidth, maxHeight, fill) => {
    if (!label) return "";
    const size = Math.min(maxHeight * 0.52, maxWidth / Math.max(4, label.length * 0.62));
    return `<text x="${fmt(cx)}" y="${fmt(cy)}" fill="${fill}" font-family="Inter, 'Segoe UI', Roboto, Arial, Helvetica, sans-serif" font-weight="700" font-size="${fmt(size)}" text-anchor="middle" dominant-baseline="central" letter-spacing="${fmt(size * 0.02)}">${escapeXml(label)}</text>`;
  };

  if (frameStyle === "bottom" || frameStyle === "top") {
    const b = Math.max(1, S * 0.045);
    const L = S * 0.2;
    W = S + 2 * b;
    H = S + b + L;
    tileX = b;
    tileY = frameStyle === "top" ? L : b;
    const textY = frameStyle === "top" ? L / 2 : b + S + L / 2 - b * 0.15;
    frameSvg =
      `<path d="${roundedRectPath(0, 0, W, H, Array(4).fill(S * 0.07))}" fill="${frameColor}"/>` +
      textSvg(W / 2, textY, W * 0.86, L, readableTextOn(frameColor));
  } else if (frameStyle === "pill") {
    const gap = S * 0.05;
    const P = S * 0.15;
    const pillW = Math.min(S, Math.max(S * 0.5, label.length * P * 0.36 + P * 1.2));
    H = S + gap + P;
    frameSvg =
      `<path d="${roundedRectPath((S - pillW) / 2, S + gap, pillW, P, Array(4).fill(P / 2))}" fill="${frameColor}"/>` +
      textSvg(S / 2, S + gap + P / 2, pillW * 0.86, P, readableTextOn(frameColor));
  }

  // ----- Colours -----
  const bgColor = color(style.background?.color, "#ffffff");
  const framedTile = frameStyle === "bottom" || frameStyle === "top";
  const tileTransparent = Boolean(style.background?.transparent) && !framedTile;
  const tileRadius = style.background?.rounded ? S * (framedTile ? 0.035 : 0.05) : 0;
  const ox = tileX + q; // code origin
  const oy = tileY + q;

  const grad = style.dots?.gradient;
  let defs = "";
  let dotFill = color(style.dots?.color, "#111827");
  if (grad?.enabled && isHex(grad.from) && isHex(grad.to)) {
    const gid = `${id}-g`;
    if (grad.type === "radial") {
      defs += `<radialGradient id="${gid}" gradientUnits="userSpaceOnUse" cx="${fmt(ox + n / 2)}" cy="${fmt(oy + n / 2)}" r="${fmt(n * 0.72)}"><stop offset="0" stop-color="${grad.from}"/><stop offset="1" stop-color="${grad.to}"/></radialGradient>`;
    } else {
      const a = ((Number(grad.rotation) || 0) * Math.PI) / 180;
      const half = (n / 2) * (Math.abs(Math.cos(a)) + Math.abs(Math.sin(a)));
      const cx = ox + n / 2;
      const cy = oy + n / 2;
      defs += `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="${fmt(cx - Math.cos(a) * half)}" y1="${fmt(cy - Math.sin(a) * half)}" x2="${fmt(cx + Math.cos(a) * half)}" y2="${fmt(cy + Math.sin(a) * half)}"><stop offset="0" stop-color="${grad.from}"/><stop offset="1" stop-color="${grad.to}"/></linearGradient>`;
    }
    dotFill = `url(#${gid})`;
  }
  const eyeOuterFill = style.eyes?.matchDots ? dotFill : color(style.eyes?.outerColor, "#111827");
  const eyeInnerFill = style.eyes?.matchDots ? dotFill : color(style.eyes?.innerColor, "#111827");

  // ----- Zones that are not normal data dots -----
  const inEyeZone = (r, c) => (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8);

  const logoSrc = isSafeImage(style.logo?.src) ? style.logo.src : null;
  let logoSvg = "";
  let inLogoZone = () => false;
  if (logoSrc) {
    const ratio = Math.max(0.1, Math.min(0.32, Number(style.logo.size) || 0.22));
    let span = Math.round(n * ratio);
    if ((n - span) % 2 !== 0) span += 1; // keep the logo centred on the module grid
    let pad = Math.max(0, Math.min(3, Math.round(Number(style.logo.padding) || 0)));
    // Even High error correction can't recover too much missing data. Keep the cleared
    // square under ~16% of the code: shrink the padding first, then the logo.
    const tooBig = () => ((span + 2 * pad) / n) ** 2 > MAX_LOGO_AREA;
    while (tooBig() && pad > 0) pad -= 1;
    while (tooBig() && span > 3) span -= 2;
    const clear = span + 2 * pad;
    const start = (n - clear) / 2;
    inLogoZone = (r, c) => r >= start && r < start + clear && c >= start && c < start + clear;
    const behind = tileTransparent ? "#ffffff" : bgColor;
    logoSvg =
      `<path d="${roundedRectPath(ox + start + 0.15, oy + start + 0.15, clear - 0.3, clear - 0.3, Array(4).fill(clear * 0.18))}" fill="${behind}"/>` +
      `<image x="${fmt(ox + start + pad)}" y="${fmt(oy + start + pad)}" width="${span}" height="${span}" preserveAspectRatio="xMidYMid meet" href="${logoSrc}" xlink:href="${logoSrc}"/>`;
  }

  const artOn = hasArt(style) && mask && mask.length === n * n;
  const art = artOn ? deriveArtColors(style.art.color, bgColor, style.art.strength) : null;
  const inArt = (r, c) => artOn && mask[r * n + c] === 1 && !inEyeZone(r, c) && !inLogoZone(r, c);

  // ----- Modules -----
  const drawShape = DOT_SHAPES[style.dots?.shape] ?? DOT_SHAPES.square;
  const drawable = (r, c) => r >= 0 && c >= 0 && r < n && c < n && matrix.isDark(r, c) && !inEyeZone(r, c) && !inLogoZone(r, c);

  let normalPath = "";
  let artPath = "";
  let tintPath = "";
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (inEyeZone(r, c) || inLogoZone(r, c)) continue;
      const x = ox + c;
      const y = oy + r;
      if (!matrix.isDark(r, c)) {
        if (inArt(r, c)) tintPath += roundedRectPath(x - 0.01, y - 0.01, 1.02, 1.02, [0, 0, 0, 0]);
        continue;
      }
      const d = drawShape(x, y, (dr, dc) => drawable(r + dr, c + dc));
      if (inArt(r, c)) artPath += d;
      else normalPath += d;
    }
  }

  let eyesPath = "";
  let eyesInner = "";
  for (const [er, ec] of [[0, 0], [0, n - 7], [n - 7, 0]]) {
    eyesPath += eyeOuterPath(ox + ec, oy + er, style.eyes?.outer);
    eyesInner += eyeInnerPath(ox + ec, oy + er, style.eyes?.inner);
  }

  // ----- Assemble -----
  const height = Math.round((width * H) / W);
  const body =
    frameSvg +
    (tileTransparent ? "" : `<path d="${roundedRectPath(tileX, tileY, S, S, Array(4).fill(tileRadius))}" fill="${bgColor}"/>`) +
    (tintPath ? `<path d="${tintPath}" fill="${art.light}"/>` : "") +
    (normalPath ? `<path d="${normalPath}" fill="${dotFill}"/>` : "") +
    (artPath ? `<path d="${artPath}" fill="${art.dark}"/>` : "") +
    `<path d="${eyesPath}" fill="${eyeOuterFill}" fill-rule="evenodd"/>` +
    `<path d="${eyesInner}" fill="${eyeInnerFill}"/>` +
    logoSvg;

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${fmt(W)} ${fmt(H)}" width="${width}" height="${height}">` +
    (defs ? `<defs>${defs}</defs>` : "") +
    body +
    `</svg>`;

  return { svg, width, height, aspect: H / W };
}
