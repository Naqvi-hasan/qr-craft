// Small drawing helpers shared by several products.

import { textWidth } from "../kit.js";
import { cleanPhone, normalizeUrl, required, validatePhone, validateUrl, collectErrors } from "../../validators.js";

export const shortUrl = (url) => String(url ?? "").trim().replace(/^https?:\/\//i, "").replace(/^www\./i, "").replace(/\/$/, "");

const CONTACT_ROWS = {
  phone: ["phone", (v) => v.phone],
  email: ["mail", (v) => v.email],
  web: ["web", (v) => v.webShort],
  address: ["pin", (v) => v.address],
  handle: ["at", (v) => v.handle],
};

// Icon + text rows (phone, email, website...). Empty values are skipped.
export function contactRows(k, x, y, gap, { keys = ["phone", "email", "web", "address"], color = "#334155", ic = k.c.strong, size = 2, iconSize = 2.1, max = 50 } = {}) {
  let out = "";
  let i = 0;
  for (const key of keys) {
    const [icon, get] = CONTACT_ROWS[key];
    const value = get(k.v);
    if (!value) continue;
    const yy = y + i * gap;
    out += k.icon(icon, x, yy - iconSize + 0.35, iconSize, ic, 2) + k.text(x + iconSize + 1.3, yy, value, { size, fill: color, max: max - iconSize - 1.3 });
    i++;
  }
  return out;
}

// Rounded "chips" in a row; drops chips that don't fit.
export function chipRow(k, x, y, items, { h = 5.4, size = 1.7, gap = 1.2, maxX = k.W - 4, fill = "#ffffff", stroke = "#e2e8f0", ic = k.c.strong, color = "#334155" } = {}) {
  let out = "";
  let cx = x;
  for (const [icon, value] of items) {
    if (!value) continue;
    const w = textWidth(value, size, undefined, true) + h + 2.4;
    if (cx + w > maxX) break;
    out += k.rect(cx, y, w, h, { fill, stroke, sw: 0.12, rx: h / 2 }) + k.icon(icon, cx + 1.6, y + (h - 2.1) / 2, 2.1, ic, 2) + k.text(cx + 4.4, y + h / 2 + size * 0.36, value, { size, w: 600, fill: color });
    cx += w + gap;
  }
  return out;
}

// Diamond row decoration.
export function diamonds(k, x1, x2, y, size, step, fill, op = 1) {
  let d = "";
  for (let x = x1; x <= x2; x += step) d += `M${x.toFixed(2)} ${y - size}l${size} ${size}-${size} ${size}-${size}-${size}z`;
  return k.path(d, { fill, op });
}

// WiFi arcs.
export function wifiArcs(k, cx, cy, radius, color, sw) {
  const arc = (r) => `M${(cx - r * 0.87).toFixed(2)} ${(cy - r * 0.5).toFixed(2)}A${r} ${r} 0 0 1 ${(cx + r * 0.87).toFixed(2)} ${(cy - r * 0.5).toFixed(2)}`;
  return k.path(`${arc(radius)}${arc(radius * 0.66)}${arc(radius * 0.32)}`, { fill: "none", stroke: color, sw, cap: "round" }) + k.circle(cx, cy + sw * 0.4, sw * 0.75, { fill: color });
}

export const lines = (text, max = 6) =>
  String(text ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);

// ---------- Shared "what the QR opens" fields (stickers, posters) ----------

export const CONTENT_FIELDS = [
  {
    name: "kind",
    label: "When someone scans",
    type: "select",
    variant: "segmented",
    options: [
      { value: "link", label: "Link", icon: "link" },
      { value: "whatsapp", label: "WhatsApp", icon: "whatsapp" },
      { value: "phone", label: "Call", icon: "phone" },
      { value: "text", label: "Text", icon: "text" },
    ],
  },
  { name: "url", label: "Link", type: "url", placeholder: "example.com/menu", required: true, showIf: (v) => v.kind === "link" },
  { name: "phone", label: "Phone number", type: "tel", placeholder: "+91 98765 43210", required: true, showIf: (v) => v.kind === "whatsapp" || v.kind === "phone" },
  { name: "message", label: "Ready-made message (optional)", type: "text", placeholder: "Hi! I saw your poster", maxLength: 120, showIf: (v) => v.kind === "whatsapp" },
  { name: "text", label: "Text", type: "textarea", placeholder: "Returned items: call 98765 43210", required: true, maxLength: 300, showIf: (v) => v.kind === "text" },
];

export const CONTENT_INITIAL = { kind: "link", url: "", phone: "", message: "", text: "" };

export function validateContent(v) {
  if (v.kind === "whatsapp" || v.kind === "phone") return collectErrors({ phone: validatePhone(v.phone, "Phone number") });
  if (v.kind === "text") return collectErrors({ text: required(v.text, "Text") });
  return collectErrors({ url: validateUrl(v.url, "Link") });
}

export function contentPayload(v) {
  if (v.kind === "whatsapp") return `https://wa.me/${cleanPhone(v.phone).replace("+", "")}${v.message ? `?text=${encodeURIComponent(v.message)}` : ""}`;
  if (v.kind === "phone") return `tel:${cleanPhone(v.phone)}`;
  if (v.kind === "text") return String(v.text).trim();
  return normalizeUrl(v.url);
}
