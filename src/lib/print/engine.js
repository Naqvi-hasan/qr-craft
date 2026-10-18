// Print engine: turns a product + the user's choices ("state") into finished SVG pages.
//
// state = {
//   values: {...},                 form values
//   layouts: { front, back },      chosen layout id per side ("none" = side switched off)
//   qrSide: "front" | "back",      products with qrPlacement only
//   accent: null | "#hex",         null = the front layout's own colour
//   font: null | "modern"...,      null = the front layout's own font
//   qrShape: "square" | "rounded" | "dots",
//   lang: "en" | "hi",
//   images: { logo, photo },       data URLs
//   show: { phone: true, ... },    which details are printed (QR always gets everything)
// }

import { createKit } from "./kit.js";
import { makeTheme } from "./theme.js";

export const NO_SIDE = "none";

export const getSize = (product, values = {}) => (product.size ? product.size(values) : product.sizeMm);
export const getSheet = (product, values = {}) => (typeof product.sheet === "function" ? product.sheet(values) : product.sheet ?? null);

export function defaultState(product) {
  const layouts = {};
  for (const side of product.sides) {
    const list = layoutsFor(product, side.id, { qrSide: product.qrPlacement ? "back" : undefined });
    layouts[side.id] = side.optional && side.defaultOff ? NO_SIDE : list[0]?.id ?? NO_SIDE;
  }
  return {
    productId: product.id,
    values: { ...product.initialValues },
    layouts,
    qrSide: product.qrPlacement ? "back" : undefined,
    accent: null,
    font: null,
    qrShape: "rounded",
    lang: "en",
    images: { logo: null, photo: null },
    show: Object.fromEntries((product.showOptions ?? []).map((o) => [o.key, true])),
  };
}

// Layouts available for a side. Products where the user picks the QR side only offer
// layouts that match: QR on front -> fronts with a QR, backs without (and vice versa).
export function layoutsFor(product, sideId, state = {}) {
  const all = product.layouts[sideId] ?? [];
  if (!product.qrPlacement) return all;
  const wantQr = (state.qrSide ?? "back") === sideId;
  return all.filter((l) => Boolean(l.hasQr) === wantQr);
}

export function findLayout(product, sideId, layoutId) {
  return (product.layouts[sideId] ?? []).find((l) => l.id === layoutId) ?? null;
}

// Keeps layout choices valid after the QR side or product changes.
export function normalizeState(product, state) {
  const layouts = { ...state.layouts };
  for (const side of product.sides) {
    const list = layoutsFor(product, side.id, state);
    const current = layouts[side.id];
    const ok = (current === NO_SIDE && side.optional) || list.some((l) => l.id === current);
    if (!ok) layouts[side.id] = list.find((l) => l.id !== NO_SIDE)?.id ?? (side.optional ? NO_SIDE : list[0]?.id);
    // A required QR side can't be switched off.
    if (product.qrPlacement && state.qrSide === side.id && layouts[side.id] === NO_SIDE) layouts[side.id] = list.find((l) => l.hasQr)?.id;
  }
  return { ...state, layouts };
}

export function activeSides(product, state) {
  return product.sides.filter((s) => state.layouts[s.id] && state.layouts[s.id] !== NO_SIDE);
}

const filled = (v) => v !== "" && v !== null && v !== undefined && v !== false;

// The values to draw. Until the form is valid we show the product's sample, overlaid with
// whatever the user has typed so far, so the preview never looks empty.
export function previewValues(product, values, layoutId) {
  const errors = product.validate(values);
  if (Object.keys(errors).length === 0) return { values, qrValues: values, isSample: false, errors };
  const merged = { ...product.sample, ...(product.presets?.[layoutId] ?? {}) };
  for (const [key, v] of Object.entries(values)) if (filled(v)) merged[key] = v;
  const mergedOk = Object.keys(product.validate(merged)).length === 0;
  return { values: merged, qrValues: mergedOk ? merged : product.sample, isSample: true, errors };
}

function displayValues(product, values, state) {
  const out = { ...values };
  for (const o of product.showOptions ?? []) if (state.show?.[o.key] === false) for (const key of o.fields ?? [o.key]) out[key] = "";
  return product.decorate ? product.decorate(out, state) : out;
}

function strings(product, lang) {
  const table = product.strings ?? {};
  return (key) => table[lang]?.[key] ?? table.en?.[key] ?? key;
}

// Draws one side. `values` must already be the values to show (see previewValues).
export function renderSide(product, state, sideId, values, qrValues = values) {
  const layoutId = state.layouts[sideId];
  const layout = findLayout(product, sideId, layoutId);
  if (!layout || layoutId === NO_SIDE) return null;
  const front = findLayout(product, product.sides[0].id, state.layouts[product.sides[0].id]) ?? layout;
  const accent = state.accent ?? front.accent ?? product.accent;
  const [W, H] = getSize(product, values);
  const payload = layout.hasQr ? product.payload(qrValues, state) : null;
  const k = createKit({
    W,
    H,
    theme: makeTheme(accent),
    font: state.font ?? front.font ?? "modern",
    values: displayValues(product, values, state),
    payload,
    qrShape: state.qrShape ?? "rounded",
    images: state.images ?? {},
    L: strings(product, state.lang ?? "en"),
    seed: `${product.id}-${sideId}-${layout.id}`,
  });
  const svg = layout.render(k);
  return { svg, W, H, qrBox: k.qrBox, payload: k.qrBox ? payload : null, layout };
}

// All sides at once, for preview and export.
export function renderItem(product, state, values, qrValues = values) {
  const out = {};
  for (const side of activeSides(product, state)) out[side.id] = renderSide(product, state, side.id, values, qrValues);
  return out;
}

// A4 imposition: where each copy goes on the page.
export function sheetLayout([w, h], { cols, rows, landscape = false, margin = 8, gap = 4 }) {
  const pageW = landscape ? 297 : 210;
  const pageH = landscape ? 210 : 297;
  const cellW = (pageW - 2 * margin - (cols - 1) * gap) / cols;
  const cellH = (pageH - 2 * margin - (rows - 1) * gap) / rows;
  const scale = Math.min(1, cellW / w, cellH / h);
  const cw = w * scale;
  const ch = h * scale;
  const offsetX = (pageW - (cols * cw + (cols - 1) * gap)) / 2;
  const offsetY = (pageH - (rows * ch + (rows - 1) * gap)) / 2;
  const slots = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) slots.push({ x: offsetX + c * (cw + gap), y: offsetY + r * (ch + gap), w: cw, h: ch, col: c, row: r });
  return { pageW, pageH, scale, slots, landscape };
}

// Bulk: one set of values per row. Invalid rows are reported, not printed.
export function bulkItems(product, values, rows) {
  const items = [];
  const problems = [];
  rows.forEach((row, i) => {
    const v = { ...values, ...row };
    const errors = product.validate(v);
    if (Object.keys(errors).length) problems.push({ row: i + 1, message: Object.values(errors)[0] });
    else items.push(v);
  });
  return { items, problems };
}
