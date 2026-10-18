// Saved Print Studio designs (library) and the per-browser draft. Pure helpers, no storage.
//
// A record: { id, name, productId, state, createdAt, updatedAt, v: 1 }
// `state` is the Print Studio state (see engine.js), cleaned by sanitizeState().

import { isSafeImage } from "../qr/render.js";
import { isHex } from "../color.js";
import { FONTS } from "./fonts.js";
import { NO_SIDE, defaultState, normalizeState } from "./engine.js";
import { PRODUCT_MAP } from "./products/index.js";
import { cleanName, newId } from "../library/model.js";

const SHAPES = ["square", "rounded", "dots"];

// Makes untrusted state (from a backup file or old draft) safe for the current version.
export function sanitizeState(product, raw) {
  const base = defaultState(product);
  if (!raw || typeof raw !== "object") return base;
  const values = { ...base.values };
  for (const key of Object.keys(product.initialValues)) {
    const v = raw.values?.[key];
    if (typeof v === "string") values[key] = v.slice(0, 2000);
    else if (typeof v === "boolean") values[key] = v;
  }
  const layouts = { ...base.layouts };
  for (const side of product.sides) {
    const id = raw.layouts?.[side.id];
    if ((id === NO_SIDE && side.optional) || (product.layouts[side.id] ?? []).some((l) => l.id === id)) layouts[side.id] = id;
  }
  const show = { ...base.show };
  for (const key of Object.keys(show)) if (typeof raw.show?.[key] === "boolean") show[key] = raw.show[key];
  const state = {
    ...base,
    values,
    layouts,
    show,
    qrSide: product.qrPlacement ? (raw.qrSide === "front" ? "front" : "back") : undefined,
    accent: isHex(raw.accent) ? raw.accent.toLowerCase() : null,
    font: FONTS[raw.font] ? raw.font : null,
    qrShape: SHAPES.includes(raw.qrShape) ? raw.qrShape : base.qrShape,
    lang: raw.lang === "hi" && product.lang ? "hi" : "en",
    images: { logo: isSafeImage(raw.images?.logo) ? raw.images.logo : null, photo: isSafeImage(raw.images?.photo) ? raw.images.photo : null },
  };
  return normalizeState(product, state);
}

export function createPrintRecord({ name, product, state }, now = Date.now()) {
  return { id: newId(), name: cleanName(name, product.label), productId: product.id, state: sanitizeState(product, state), createdAt: now, updatedAt: now, v: 1 };
}

export function updatePrintRecord(record, { state, name }, now = Date.now()) {
  const product = PRODUCT_MAP[record.productId];
  return { ...record, name: cleanName(name ?? record.name, product?.label), state: product ? sanitizeState(product, state ?? record.state) : record.state, updatedAt: now };
}

export function duplicatePrintRecord(record, now = Date.now()) {
  return { ...record, id: newId(), name: cleanName(`Copy of ${record.name}`), createdAt: now, updatedAt: now };
}

export function sanitizePrintRecord(raw) {
  if (!raw || typeof raw !== "object") return null;
  const product = PRODUCT_MAP[raw.productId];
  if (!product) return null;
  const now = Date.now();
  return {
    id: typeof raw.id === "string" && raw.id.length <= 64 ? raw.id : newId(),
    name: cleanName(raw.name, product.label),
    productId: product.id,
    state: sanitizeState(product, raw.state),
    createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : now,
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : now,
    v: 1,
  };
}

export function defaultPrintName(product, values) {
  const hint = values.firstName || values.name || values.title || values.shop || values.business || values.place || values.headline || "";
  return cleanName(hint ? `${product.short}: ${hint}` : product.label);
}
