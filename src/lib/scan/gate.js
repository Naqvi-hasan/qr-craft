// Gate check: an offline ticket list on one phone. Each ticket code can be checked in once.
// Pure helpers (no storage), so they can be unit-tested.
//
// gate = { event, codes: string[], used: { [code]: timestamp }, log: [{ code, status, at }] }

export const MAX_TICKETS = 20000;
const LOG_SIZE = 60;

export const emptyGate = () => ({ event: "", codes: [], used: {}, log: [] });

export const normalizeCode = (text) =>
  String(text ?? "")
    .trim()
    .replace(/^TICKET:\s*/i, "")
    .toUpperCase();

// Reads pasted text or a CSV: one code per line, or the first column of each row.
export function parseTicketList(text) {
  const seen = new Set();
  for (const line of String(text ?? "").split(/\r?\n/)) {
    const first = line.split(/[,;\t]/)[0];
    const code = normalizeCode(first.replace(/^"|"$/g, ""));
    if (!code || /^(code|ticket|tickets|id)$/i.test(code)) continue;
    seen.add(code);
    if (seen.size >= MAX_TICKETS) break;
  }
  return [...seen];
}

// A scanned QR may hold the bare code, "TICKET:code" or a link ending in the code.
function candidates(scanned) {
  const raw = String(scanned ?? "").trim();
  const out = [normalizeCode(raw)];
  try {
    const url = new URL(raw);
    const last = url.pathname.split("/").filter(Boolean).pop();
    if (last) out.push(normalizeCode(decodeURIComponent(last)));
    for (const key of ["t", "ticket", "code", "id"]) if (url.searchParams.get(key)) out.push(normalizeCode(url.searchParams.get(key)));
  } catch {
    // Not a link.
  }
  return out;
}

/** @returns {{ status: "valid"|"used"|"unknown"|"empty", code: string, usedAt?: number, gate }} */
export function checkTicket(gate, scanned, now = Date.now()) {
  if (!gate.codes.length) return { status: "empty", code: normalizeCode(scanned), gate };
  const list = new Set(gate.codes);
  const code = candidates(scanned).find((c) => list.has(c));
  const entry = (status, c) => ({ code: c, status, at: now });
  if (!code) {
    const shown = normalizeCode(scanned).slice(0, 60);
    return { status: "unknown", code: shown, gate: { ...gate, log: [entry("unknown", shown), ...gate.log].slice(0, LOG_SIZE) } };
  }
  if (gate.used[code]) {
    return { status: "used", code, usedAt: gate.used[code], gate: { ...gate, log: [entry("used", code), ...gate.log].slice(0, LOG_SIZE) } };
  }
  return { status: "valid", code, gate: { ...gate, used: { ...gate.used, [code]: now }, log: [entry("valid", code), ...gate.log].slice(0, LOG_SIZE) } };
}

export function gateStats(gate) {
  const list = new Set(gate.codes);
  return { total: gate.codes.length, checkedIn: Object.keys(gate.used).filter((c) => list.has(c)).length };
}

export function gateCsv(gate) {
  const time = (t) => (t ? new Date(t).toISOString() : "");
  return ["code,checked_in,checked_in_at", ...gate.codes.map((c) => `${c},${gate.used[c] ? "yes" : "no"},${time(gate.used[c])}`)].join("\n");
}

// Makes stored data safe to use (it lives in localStorage and could be anything).
export function sanitizeGate(raw) {
  if (!raw || typeof raw !== "object") return emptyGate();
  const codes = Array.isArray(raw.codes) ? parseTicketList(raw.codes.filter((c) => typeof c === "string").join("\n")) : [];
  const used = {};
  if (raw.used && typeof raw.used === "object") for (const [c, t] of Object.entries(raw.used)) if (Number.isFinite(t)) used[normalizeCode(c)] = t;
  const log = Array.isArray(raw.log) ? raw.log.filter((l) => l && typeof l.code === "string" && ["valid", "used", "unknown"].includes(l.status) && Number.isFinite(l.at)).slice(0, LOG_SIZE) : [];
  return { event: typeof raw.event === "string" ? raw.event.slice(0, 60) : "", codes, used, log };
}
