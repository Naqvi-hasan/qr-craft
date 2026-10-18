// Shape of a saved design, plus helpers that don't touch storage (so they can be unit-tested).
//
// A record looks like:
// { id, name, typeId, values, style, payload, createdAt, updatedAt, v: 1 }

import { DEFAULT_STYLE } from "../../config/qrStyle.js";
import { QR_TYPE_MAP } from "../../qr-types/index.js";
import { deepMerge } from "../qr/style.js";

export const BACKUP_KIND = "qrcraft-library";
const MAX_NAME = 60;

export function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function cleanName(name, fallback = "Untitled QR") {
  const trimmed = String(name ?? "").replace(/\s+/g, " ").trim().slice(0, MAX_NAME);
  return trimmed || fallback;
}

export function defaultName(typeLabel, date = new Date()) {
  const when = date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  return `${typeLabel} QR, ${when}`;
}

export function createRecord({ name, typeId, values, style, payload }, now = Date.now()) {
  return { id: newId(), name: cleanName(name), typeId, values: { ...values }, style, payload, createdAt: now, updatedAt: now, v: 1 };
}

export function updateRecord(record, changes, now = Date.now()) {
  return { ...record, ...changes, name: cleanName(changes.name ?? record.name), updatedAt: now };
}

export function duplicateRecord(record, now = Date.now()) {
  return { ...record, id: newId(), name: cleanName(`Copy of ${record.name}`), createdAt: now, updatedAt: now };
}

// Makes an untrusted record (e.g. from an imported backup file) safe to use.
// Returns null if it can't be used at all.
export function sanitizeRecord(raw) {
  if (!raw || typeof raw !== "object") return null;
  const type = QR_TYPE_MAP[raw.typeId];
  if (!type) return null;
  const values = {};
  for (const key of Object.keys(type.initialValues)) {
    const v = raw.values?.[key];
    values[key] = typeof v === "string" || typeof v === "boolean" ? v : type.initialValues[key];
  }
  const style = deepMerge(DEFAULT_STYLE, raw.style && typeof raw.style === "object" ? raw.style : {});
  const now = Date.now();
  return {
    id: typeof raw.id === "string" && raw.id.length <= 64 ? raw.id : newId(),
    name: cleanName(raw.name),
    typeId: type.id,
    values,
    style,
    payload: typeof raw.payload === "string" ? raw.payload : "",
    createdAt: Number.isFinite(raw.createdAt) ? raw.createdAt : now,
    updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : now,
    v: 1,
  };
}

// Version 2 adds `prints` (Print Studio designs). Version 1 files still restore.
export function makeBackup(records, prints = []) {
  return JSON.stringify({ kind: BACKUP_KIND, version: 2, exportedAt: new Date().toISOString(), designs: records, prints }, null, 2);
}

// Returns { records, skipped, prints } or throws with a readable message.
// `prints` is the raw list; the caller cleans it with sanitizePrintRecord (lib/print/record.js).
export function parseBackup(text) {
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file isn't a QR Craft backup.");
  }
  if (data?.kind !== BACKUP_KIND || !Array.isArray(data.designs)) throw new Error("That file isn't a QR Craft backup.");
  const records = [];
  let skipped = 0;
  for (const raw of data.designs) {
    const rec = sanitizeRecord(raw);
    if (rec) records.push(rec);
    else skipped++;
  }
  return { records, skipped, prints: Array.isArray(data.prints) ? data.prints : [] };
}

export function searchRecords(records, query) {
  const q = String(query || "").trim().toLowerCase();
  const sorted = [...records].sort((a, b) => b.updatedAt - a.updatedAt);
  if (!q) return sorted;
  return sorted.filter((r) => r.name.toLowerCase().includes(q) || r.typeId.includes(q) || (r.payload || "").toLowerCase().includes(q));
}
