// Bulk printing: turns the Bulk tab's input into one set of values per printed item.
//   numbers -> wristbands 1..N    list -> one guest name per line    csv -> one person per row

const MAX_DEFAULT = 500;

// Small CSV parser: commas or semicolons, quoted fields with "" escapes, Excel-style line endings.
export function parseCsv(text) {
  const src = String(text ?? "").replace(/^﻿/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const sep = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === sep) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  row.push(field);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows.map((r) => r.map((c) => c.trim()));
}

const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");

// Matches CSV headers to field names: "First name", "first_name" and "firstName" all work.
function headerMap(header, product) {
  const known = new Map();
  for (const f of product.fields) {
    if (!f.name || f.type === "heading") continue;
    known.set(norm(f.name), f.name);
    if (f.label) known.set(norm(f.label.replace(/\(.*?\)/g, "")), f.name);
  }
  return header.map((h) => known.get(norm(h)) ?? null);
}

export function csvRows(product, text, max = product.bulk?.max ?? MAX_DEFAULT) {
  const table = parseCsv(text);
  if (table.length < 2) return { rows: [], error: "Add a header row and at least one person." };
  const map = headerMap(table[0], product);
  if (!map.some(Boolean)) return { rows: [], error: `The first row should be column names, like: ${product.bulk.columns.join(", ")}` };
  const rows = table.slice(1, max + 1).map((cells) => {
    const out = {};
    map.forEach((field, i) => {
      // A column that exists always wins, even when the cell is empty for this person.
      if (field) out[field] = cells[i] ?? "";
    });
    return out;
  });
  return { rows, ignored: map.map((m, i) => (m ? null : table[0][i])).filter(Boolean), truncated: table.length - 1 > max };
}

export function listRows(text, field, max = MAX_DEFAULT) {
  const names = String(text ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  return { rows: names.slice(0, max).map((name) => ({ [field]: name })), truncated: names.length > max };
}

export function numberRows(start, count, max = MAX_DEFAULT) {
  const s = Math.max(0, parseInt(start, 10) || 0);
  const n = Math.max(0, Math.min(max, parseInt(count, 10) || 0));
  return { rows: Array.from({ length: n }, (_, i) => ({ number: String(s + i) })), truncated: (parseInt(count, 10) || 0) > max };
}

// One entry point for the UI: bulk = { text, start, count } depending on the product's kind.
export function bulkRows(product, bulk = {}) {
  const cfg = product.bulk;
  if (!cfg) return { rows: [] };
  if (cfg.kind === "numbers") return numberRows(bulk.start, bulk.count, cfg.max);
  if (cfg.kind === "list") return listRows(bulk.text, cfg.field, cfg.max);
  return csvRows(product, bulk.text, cfg.max);
}

// The ticket codes a numbered run will print (for Gate check).
export function codesForRange(prefix, start, count, digits) {
  const pad = Math.max(1, Math.min(8, parseInt(digits, 10) || 1));
  return numberRows(start, count, 5000).rows.map((r) => `${String(prefix ?? "").trim()}${r.number.padStart(pad, "0")}`);
}
