// Event wristband strip, 254 × 25 mm, with a peel-and-stick tab on the right.
// Purposes: numbered ticket (works with the Scanner's Gate check), kids safety (calls a parent), or a link.

import { cleanPhone, normalizeUrl, required, validatePhone, validateUrl, collectErrors } from "../../validators.js";
import { diamonds } from "./common.js";

const TAB_X = 225;

export const ticketCode = (prefix, number, digits) => `${String(prefix ?? "").trim()}${String(Math.max(0, parseInt(number, 10) || 0)).padStart(Math.max(1, Math.min(8, parseInt(digits, 10) || 1)), "0")}`;

function tab(k, color, text) {
  return (
    k.box(TAB_X, 0, k.W - TAB_X, k.H, { fill: color, op: 0.28 }) +
    k.path(`M${TAB_X} 0.8V24.2`, { stroke: text, sw: 0.3, dash: "1.2 1", op: 0.7 }) +
    k.text(239.5, 11.8, k.L("peel1"), { size: 2.6, w: 700, fill: text, anchor: "middle", ls: 0.3, op: 0.75, max: 26 }) +
    k.text(239.5, 15.2, k.L("peel2"), { size: 2.6, w: 700, fill: text, anchor: "middle", ls: 0.3, op: 0.75, max: 26 })
  );
}

const right = (k, top, bottom, { fill, sub, topSize = 3.6 }) =>
  k.text(221, 11.2, top, { size: topSize, w: 800, fill, anchor: "end", ls: 0.2, max: 70 }) + k.text(221, 16.5, bottom, { size: 3.2, fill: sub ?? fill, anchor: "end", max: 70 });

const LAYOUTS = [
  {
    id: "fest",
    name: "Music Fest",
    tag: "Gradient, general entry",
    accent: "#6a4bff",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      let bars = "";
      for (let i = 0; i < 20; i++) {
        const h = 3 + ((i * 37) % 110) / 10;
        bars += k.rect(125 + i * 2.2, 12.5 - h / 2, 1, h, { rx: 0.5 });
      }
      return k.svg(
        k.qrTile(2.5, 2.5, 20, { rx: 1.8, pad: 1.3, color: c.deep }) +
          k.text(26.5, 11.8, v.title, { size: 6.6, w: 800, d: true, fill: "#ffffff", ls: 0.2, max: 95 }) +
          k.text(26.7, 18.2, v.subtitle, { size: 3.4, fill: "#ffffff", op: 0.9, max: 95 }) +
          k.g(bars, { fill: "#ffffff", op: 0.3 }) +
          right(k, v.tag, v.codeLabel, { fill: "#ffffff" }) +
          tab(k, "#ffffff", "#ffffff"),
        { bg: k.grad([c.accent, "#d946ef", "#f97316"], { angle: 90 }) },
      );
    },
  },
  {
    id: "vip",
    name: "VIP Pass",
    tag: "Black & gold",
    accent: "#d4af37",
    font: "elegant",
    hasQr: true,
    render(k) {
      const { c, v, W } = k;
      let d = "";
      for (let x = 150; x < TAB_X; x += 4) d += `M${x} -3L${x - 26} 28`;
      return k.svg(
        k.path(d, { stroke: c.light, sw: 0.6, op: 0.18 }) +
          k.qrTile(2.5, 2.5, 20, { tile: "#f8f3e3", rx: 0.4, pad: 1.3, color: "#141414" }) +
          k.text(27, 12, v.title, { size: 7, d: true, fill: c.light, ls: 1, upper: true, max: 120 }) +
          k.text(27.2, 18.2, v.subtitle, { size: 3.2, fill: "#e7e5e4", ls: 0.1, max: 120 }) +
          right(k, v.tag, v.codeLabel, { fill: c.light, sub: "#d6d3d1", topSize: 5.4 }) +
          k.box(0, 0, W, 0.8, { fill: c.light }) +
          k.box(0, 24.2, W, 0.8, { fill: c.light }) +
          tab(k, c.light, c.light),
        { bg: "#0c0c0c" },
      );
    },
  },
  {
    id: "sangeet",
    name: "Sangeet Night",
    tag: "Wedding guests",
    accent: "#7f1d1d",
    font: "elegant",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      const gold = "#f2c86b";
      const bg = c.isLight ? c.deep : c.accent;
      return k.svg(
        k.qrTile(2.5, 2.5, 20, { tile: "#fff8ee", rx: 1.8, pad: 1.3, color: "#3b0a0a" }) +
          k.text(27, 12.2, v.title, { size: 7.6, d: true, fill: gold, max: 95 }) +
          k.text(27.2, 18.5, v.subtitle, { size: 3.3, fill: "#fde8d0", max: 95 }) +
          diamonds(k, 125, 176, 12.5, 1.2, 4.6, gold, 0.35) +
          right(k, v.tag, v.codeLabel, { fill: gold, sub: "#fde8d0" }) +
          tab(k, gold, gold),
        { bg },
      );
    },
  },
  {
    id: "kids",
    name: "Kids Safety",
    tag: "Fairs, water parks, trips",
    accent: "#facc15",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      const ink = c.isLight ? "#111827" : "#ffffff";
      const star = (cx, cy, r) => {
        let d = "";
        for (let i = 0; i < 10; i++) {
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          const rr = i % 2 ? r * 0.45 : r;
          d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`;
        }
        return `${d}Z`;
      };
      return k.svg(
        k.qrTile(2.5, 2.5, 20, { rx: 1.8, pad: 1.3, color: "#111827" }) +
          k.text(26.5, 11.2, v.title, { size: 6, w: 800, d: true, fill: ink, max: 115 }) +
          k.text(26.7, 18, v.subtitle, { size: 3.6, w: 600, fill: ink, max: 115 }) +
          k.path(star(146, 8, 3.4) + star(155, 16.5, 2.4) + star(164, 9, 1.8), { fill: "#f97316" }) +
          right(k, v.tag, v.codeLabel, { fill: c.isLight ? "#1d4ed8" : "#ffffff", sub: ink, topSize: 4 }) +
          tab(k, "#ffffff", ink),
        { bg: c.accent },
      );
    },
  },
  {
    id: "run",
    name: "Run Bib",
    tag: "Races, sports day",
    accent: "#059669",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      const on = c.on;
      return k.svg(
        k.qrTile(2.5, 2.5, 20, { rx: 1.8, pad: 1.3, color: c.deep }) +
          k.text(26.5, 11.5, v.title, { size: 6.2, w: 800, d: true, fill: on, ls: 0.2, upper: true, max: 120 }) +
          k.text(26.7, 18, v.subtitle, { size: 3.2, fill: on, op: 0.85, max: 120 }) +
          k.text(221, 17, v.bib, { size: 15, w: 900, fill: on, anchor: "end", ls: -0.2, max: 52 }) +
          (v.bib ? k.text(221 - Math.min(52, v.bib.length * 15 * 0.62) - 2, 9.5, k.L("bib"), { size: 2.8, w: 700, fill: on, anchor: "end", ls: 0.4, op: 0.75 }) : "") +
          tab(k, "#ffffff", on),
        { bg: c.accent },
      );
    },
  },
];

export default {
  id: "wristband",
  label: "QR wristband",
  short: "Wristband",
  icon: "ticket",
  description: "Event wristbands with a QR: numbered tickets for the gate, kids safety bands, or a link.",
  sizeMm: [254, 25],
  sizeLabel: "25.4 × 2.5 cm",
  sheet: { cols: 1, rows: 7, landscape: true, gap: 2 },
  lang: true,
  accent: "#6a4bff",
  accents: ["#6a4bff", "#d4af37", "#7f1d1d", "#facc15", "#059669", "#1d4ed8", "#be123c", "#111827"],
  sides: [{ id: "front", label: "Strip" }],
  layouts: { front: LAYOUTS },
  fields: [
    {
      name: "purpose",
      label: "What the QR does",
      type: "select",
      variant: "segmented",
      options: [
        { value: "ticket", label: "Ticket no.", icon: "ticket" },
        { value: "kids", label: "Kids safety", icon: "phone" },
        { value: "link", label: "Link", icon: "link" },
      ],
    },
    { name: "title", label: "Event name", type: "text", placeholder: "Neon Nights Fest 2026", maxLength: 40, showIf: (v) => v.purpose !== "kids" },
    { name: "subtitle", label: "Date, time, place", type: "text", placeholder: "Sat 14 Nov · Gates 5 PM · Mumbai", maxLength: 60, showIf: (v) => v.purpose !== "kids" },
    { name: "tag", label: "Label on the right", type: "text", placeholder: "GENERAL ACCESS", maxLength: 24, half: true },
    { name: "prefix", label: "Ticket prefix", type: "text", placeholder: "NNF26-", maxLength: 12, half: true, showIf: (v) => v.purpose === "ticket" },
    { name: "number", label: "Ticket number", type: "text", placeholder: "1", half: true, maxLength: 7, showIf: (v) => v.purpose === "ticket", help: "For many bands use the Bulk tab" },
    { name: "digits", label: "Digits", type: "text", placeholder: "5", half: true, maxLength: 1, showIf: (v) => v.purpose === "ticket" },
    { name: "childName", label: "Child's name", type: "text", placeholder: "Ayaan", maxLength: 24, half: true, required: true, showIf: (v) => v.purpose === "kids" },
    { name: "parentName", label: "Parent's name", type: "text", placeholder: "Mummy: Sana", maxLength: 24, half: true, showIf: (v) => v.purpose === "kids" },
    { name: "phone", label: "Parent's phone", type: "tel", placeholder: "+91 98765 43210", required: true, showIf: (v) => v.purpose === "kids" },
    { name: "url", label: "Link", type: "url", placeholder: "maps.google.com/?q=Venue", required: true, showIf: (v) => v.purpose === "link" },
  ],
  initialValues: { purpose: "ticket", title: "", subtitle: "", tag: "", prefix: "", number: "1", digits: "5", childName: "", parentName: "", phone: "", url: "" },
  sample: { purpose: "ticket", title: "Neon Nights Fest 2026", subtitle: "Sat 14 Nov · Gates 5 PM · Mumbai", tag: "GENERAL ACCESS", prefix: "NNF26-", number: "127", digits: "5", childName: "Ayaan", parentName: "Mummy: Sana", phone: "+91 98765 43210", url: "https://maps.google.com/?q=Mumbai" },
  // Layout-specific sample text (shown until the form is filled in).
  presets: {
    vip: { title: "VIP All Access", subtitle: "Neon Nights Fest 2026 · Backstage + Lounge", tag: "VIP" },
    sangeet: { title: "Sangeet Night", subtitle: "Riya & Arjun · 21 Nov 2026 · 7 PM onwards", tag: "GUEST PASS" },
    kids: { title: "Funland Water Park", subtitle: "Ayaan · Mummy: +91 98765 43210", tag: "FUNLAND" },
    run: { title: "City Run 10K · 2026", subtitle: "Wave B · Start 6:00 AM · Emergency +91 98765 43210", tag: "" },
  },
  validate(v) {
    if (v.purpose === "kids") return collectErrors({ childName: required(v.childName, "Child's name"), phone: validatePhone(v.phone, "Parent's phone") });
    if (v.purpose === "link") return collectErrors({ title: required(v.title, "Event name"), url: validateUrl(v.url, "Link") });
    return collectErrors({
      title: required(v.title, "Event name"),
      number: /^\d{1,7}$/.test(String(v.number ?? "").trim()) ? null : "Use a whole number, like 1",
      digits: /^[1-8]$/.test(String(v.digits ?? "")) ? null : "1 to 8",
    });
  },
  payload(v) {
    if (v.purpose === "kids") return `tel:${cleanPhone(v.phone)}`;
    if (v.purpose === "link") return normalizeUrl(v.url);
    return ticketCode(v.prefix, v.number, v.digits);
  },
  decorate(v, state) {
    const hi = state?.lang === "hi";
    if (v.purpose === "kids") {
      return {
        ...v,
        title: hi ? "अगर मैं खो जाऊँ, तो स्कैन करें!" : "If I'm lost, please scan me!",
        subtitle: [v.childName, [v.parentName, v.phone].filter(Boolean).join(": ")].filter(Boolean).join(" · "),
        codeLabel: v.phone,
        bib: "",
      };
    }
    const code = v.purpose === "ticket" ? ticketCode(v.prefix, v.number, v.digits) : "";
    return { ...v, codeLabel: code ? `No. ${code}` : "", bib: v.purpose === "ticket" ? String(parseInt(v.number, 10) || "") : "" };
  },
  bulk: {
    kind: "numbers",
    title: "Numbered bands",
    help: "Every band gets its own number and QR. Load the same range in Scanner → Gate check to check people in.",
    max: 1000,
    showIf: (v) => v.purpose === "ticket",
  },
  strings: {
    en: { peel1: "PEEL &", peel2: "STICK", bib: "BIB" },
    hi: { peel1: "यहाँ", peel2: "चिपकाएँ", bib: "नंबर" },
  },
};
