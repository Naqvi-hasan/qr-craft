// Printable cards: a QR code plus readable details, laid out at real paper size.
// Each card is drawn as an SVG in millimetres (viewBox = width × height in mm).
// The QR inside comes from the normal renderer, nested as an <svg>.

import wifiType from "../../qr-types/wifi.js";
import contactType from "../../qr-types/contact.js";
import upiType from "../../qr-types/upi.js";
import { escapeXml } from "../qr/render.js";
import { readableTextOn, isHex } from "../color.js";

const FONT = "Arial, Helvetica, sans-serif";
const INK = "#111827";
const MUTED = "#4b5563";

// Approximate width of Arial text in mm, to shrink text that would overflow.
const textWidth = (text, size, bold = false) => String(text).length * size * (bold ? 0.6 : 0.53);

function fitSize(text, maxSize, maxWidth, bold) {
  const w = textWidth(text, maxSize, bold);
  return w > maxWidth ? Math.max(maxSize * 0.55, (maxSize * maxWidth) / w) : maxSize;
}

function truncate(text, size, maxWidth, bold) {
  let t = String(text);
  while (t.length > 3 && textWidth(t, size, bold) > maxWidth) t = t.slice(0, -1);
  return t === String(text) ? t : `${t.slice(0, -1)}…`;
}

function text(x, y, value, { size, weight = 400, fill = INK, anchor = "start", maxWidth = null, shrink = false, opacity = 1 }) {
  if (!value) return "";
  const bold = weight >= 600;
  let s = size;
  let v = String(value);
  if (maxWidth) {
    if (shrink) s = fitSize(v, size, maxWidth, bold);
    v = truncate(v, s, maxWidth, bold);
  }
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${s.toFixed(2)}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${opacity < 1 ? ` fill-opacity="${opacity}"` : ""}>${escapeXml(v)}</text>`;
}

// Places a rendered QR SVG at (x, y) with the given size, inside the card.
export function nestSvg(svg, x, y, size) {
  return svg.replace(/^<svg([^>]*?) width="\d+" height="\d+"/, `<svg$1 x="${x}" y="${y}" width="${size}" height="${size}"`);
}

function wifiIcon(cx, cy, color) {
  const arc = (r) => `M${cx - r * 0.87} ${cy - r * 0.5}A${r} ${r} 0 0 1 ${cx + r * 0.87} ${cy - r * 0.5}`;
  return `<g fill="none" stroke="${color}" stroke-width="1.3" stroke-linecap="round"><path d="${arc(7)}"/><path d="${arc(4.6)}"/><path d="${arc(2.2)}"/></g><circle cx="${cx}" cy="${cy + 0.6}" r="0.95" fill="${color}"/>`;
}

const shell = (w, h, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${w} ${h}" width="${Math.round(w * 10)}" height="${Math.round(h * 10)}"><rect width="${w}" height="${h}" fill="#ffffff"/>${body}</svg>`;

export const CARD_TYPES = [
  {
    id: "wifi",
    label: "WiFi card",
    icon: "wifi",
    title: "WiFi card for guests",
    description: "A table or wall card that lets guests join your WiFi with one scan.",
    sizeMm: [105, 148],
    sizeLabel: "A6 (10.5 × 14.8 cm)",
    sheet: { cols: 2, rows: 2 },
    fields: [
      { name: "title", label: "Heading", type: "text", placeholder: "Free WiFi", maxLength: 24, half: true },
      { name: "place", label: "Place name (optional)", type: "text", placeholder: "Chai Point Café", maxLength: 32, half: true },
      ...wifiType.fields.filter((f) => f.name !== "hidden"),
      { name: "showPassword", label: "Print the password on the card", type: "checkbox" },
    ],
    initialValues: { title: "Free WiFi", place: "", ssid: "", encryption: "WPA", password: "", showPassword: true },
    validate: (v) => wifiType.validate({ ...v, hidden: false }),
    buildPayload: (v) => wifiType.buildPayload({ ...v, hidden: false }),
    render({ values: v, qrSvg, accent }) {
      const [w, h] = this.sizeMm;
      const on = readableTextOn(accent);
      let body = `<rect width="${w}" height="40" fill="${accent}"/>` + wifiIcon(w / 2, 14, on);
      body += text(w / 2, 27, v.title || "Free WiFi", { size: 8.5, weight: 700, fill: on, anchor: "middle", maxWidth: w - 16, shrink: true });
      body += text(w / 2, 34.5, v.place, { size: 4.2, fill: on, anchor: "middle", maxWidth: w - 16, opacity: 0.85 });
      body += nestSvg(qrSvg, (w - 62) / 2, 45, 62);
      body += text(w / 2, 115, "NETWORK", { size: 3, weight: 700, fill: MUTED, anchor: "middle" });
      body += text(w / 2, 121.5, v.ssid, { size: 5.4, weight: 700, anchor: "middle", maxWidth: w - 14, shrink: true });
      if (v.encryption !== "nopass" && v.showPassword) {
        body += text(w / 2, 129.5, "PASSWORD", { size: 3, weight: 700, fill: MUTED, anchor: "middle" });
        body += text(w / 2, 136, v.password, { size: 5.4, weight: 700, anchor: "middle", maxWidth: w - 14, shrink: true });
      }
      body += text(w / 2, 144, "Point your phone camera at the code to connect", { size: 2.9, fill: MUTED, anchor: "middle" });
      return shell(w, h, body);
    },
  },
  {
    id: "business",
    label: "Business card",
    icon: "contact",
    title: "Business card with QR",
    description: "Standard visiting card size. The QR saves your details straight into the phone's contacts.",
    sizeMm: [89, 51],
    sizeLabel: "Visiting card (8.9 × 5.1 cm)",
    sheet: { cols: 2, rows: 5 },
    fields: contactType.fields,
    initialValues: { ...contactType.initialValues },
    validate: contactType.validate,
    buildPayload: contactType.buildPayload,
    render({ values: v, qrSvg, accent }) {
      const [w, h] = this.sizeMm;
      const qrSize = 33;
      const qrX = w - qrSize - 4;
      const maxText = qrX - 8 - 3;
      const name = [v.firstName, v.lastName].filter(Boolean).join(" ");
      const role = [v.jobTitle, v.company].filter(Boolean).join(" · ");
      let body = `<rect width="3" height="${h}" fill="${accent}"/>`;
      body += text(8, 13, name, { size: 5.4, weight: 700, maxWidth: maxText, shrink: true });
      body += text(8, 18.5, role, { size: 2.8, weight: 700, fill: accent, maxWidth: maxText, shrink: true });
      body += `<rect x="8" y="22" width="12" height="0.5" fill="${accent}"/>`;
      const lines = [
        ["Phone", v.phone],
        ["Email", v.email],
        ["Web", v.website],
        ["Address", v.address],
      ].filter(([, value]) => value);
      lines.forEach(([label, value], i) => {
        const y = 28.5 + i * 5;
        body += text(8, y, label.toUpperCase(), { size: 1.9, weight: 700, fill: accent });
        body += text(18, y, value, { size: 2.55, fill: INK, maxWidth: maxText - 10 });
      });
      body += nestSvg(qrSvg, qrX, 6, qrSize);
      body += text(qrX + qrSize / 2, 44, "Scan to save contact", { size: 2.1, fill: MUTED, anchor: "middle" });
      return shell(w, h, body);
    },
  },
  {
    id: "payment",
    label: "Payment stand",
    icon: "rupee",
    title: "UPI payment stand",
    description: "A counter card for your shop. Works with GPay, PhonePe, Paytm, BHIM and every UPI app.",
    sizeMm: [105, 148],
    sizeLabel: "A6 (10.5 × 14.8 cm)",
    sheet: { cols: 2, rows: 2 },
    fields: [{ name: "shop", label: "Shop or business name", type: "text", placeholder: "Sharma General Store", maxLength: 36 }, ...upiType.fields],
    initialValues: { shop: "", ...upiType.initialValues },
    validate: upiType.validate,
    buildPayload: upiType.buildPayload,
    render({ values: v, qrSvg, accent }) {
      const [w, h] = this.sizeMm;
      const on = readableTextOn(accent);
      let body = `<rect width="${w}" height="34" fill="${accent}"/>`;
      body += text(w / 2, 17, "SCAN & PAY", { size: 9, weight: 700, fill: on, anchor: "middle" });
      body += text(w / 2, 27, v.shop || v.name, { size: 4.6, weight: 700, fill: on, anchor: "middle", maxWidth: w - 16, shrink: true, opacity: 0.9 });
      const qrY = v.amount ? 40 : 42;
      body += nestSvg(qrSvg, (w - 64) / 2, qrY, 64);
      let y = qrY + 64 + 8;
      if (v.amount) {
        body += text(w / 2, y + 1, `₹${Number(v.amount).toFixed(2).replace(/\.00$/, "")}`, { size: 8, weight: 700, anchor: "middle" });
        y += 9;
      }
      body += text(w / 2, y, `UPI ID: ${v.upiId}`, { size: 3.6, weight: 700, anchor: "middle", maxWidth: w - 14, shrink: true });
      body += text(w / 2, y + 5.5, `Pays to ${v.name}`, { size: 3.2, fill: MUTED, anchor: "middle", maxWidth: w - 14 });
      body += text(w / 2, h - 5, "Accepted on all UPI apps", { size: 3, weight: 700, fill: accent, anchor: "middle" });
      return shell(w, h, body);
    },
  },
];

export const CARD_TYPE_MAP = Object.fromEntries(CARD_TYPES.map((c) => [c.id, c]));

export const CARD_ACCENTS = ["#1d4ed8", "#6d28d9", "#be123c", "#c2410c", "#15803d", "#0f766e", "#111827"];

export function safeAccent(color) {
  return isHex(color) ? color : CARD_ACCENTS[0];
}

// Copies per A4 page and the scale needed to fit them, for the print sheet.
export function sheetLayout(card, { pageW = 210, pageH = 297, margin = 8, gap = 4 } = {}) {
  const [w, h] = card.sizeMm;
  const { cols, rows } = card.sheet;
  const cellW = (pageW - 2 * margin - (cols - 1) * gap) / cols;
  const cellH = (pageH - 2 * margin - (rows - 1) * gap) / rows;
  const scale = Math.min(1, cellW / w, cellH / h);
  const cw = w * scale;
  const ch = h * scale;
  const offsetX = (pageW - (cols * cw + (cols - 1) * gap)) / 2;
  const offsetY = (pageH - (rows * ch + (rows - 1) * gap)) / 2;
  const slots = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) slots.push({ x: offsetX + c * (cw + gap), y: offsetY + r * (ch + gap), w: cw, h: ch });
  return { scale, slots };
}
