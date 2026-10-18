// "Rate us on Google" review card for counters and tables, A6.

import { normalizeUrl, required, validateUrl, collectErrors } from "../../validators.js";

const STAR = "#fbbc04";

function stars(k, cx, y, size, gap, color = STAR) {
  let out = "";
  const total = 5 * size + 4 * gap;
  for (let i = 0; i < 5; i++) out += starShape(k, cx - total / 2 + i * (size + gap) + size / 2, y, size / 2, color);
  return out;
}
function starShape(k, cx, cy, r, fill) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    d += `${i ? "L" : "M"}${(cx + rr * Math.cos(a)).toFixed(2)} ${(cy + rr * Math.sin(a)).toFixed(2)}`;
  }
  return k.path(`${d}Z`, { fill });
}

const LAYOUTS = [
  {
    id: "stars",
    name: "Five Stars",
    tag: "Clean and friendly",
    accent: "#1a56db",
    hasQr: true,
    render(k) {
      const { c, v, W, L } = k;
      const cx = W / 2;
      return k.svg(
        stars(k, cx, 18, 9, 2.4) +
          k.text(cx, 36, v.heading || L("rateUs"), { size: 7, w: 800, d: true, anchor: "middle", max: 94 }) +
          k.text(cx, 43.5, v.business, { size: 4, fill: c.muted, anchor: "middle", max: 94 }) +
          k.qr(22.5, 50, 60) +
          k.text(cx, 121, L("takes"), { size: 3.8, w: 700, fill: c.strong, anchor: "middle", max: 94 }) +
          k.text(cx, 128, L("scan"), { size: 3.2, fill: c.muted, anchor: "middle", max: 94 }) +
          k.box(0, 139, W, 9, { fill: c.accent }) +
          k.text(cx, 145, v.note || L("thanks"), { size: 3, w: 700, fill: c.on, anchor: "middle", max: 96 }),
      );
    },
  },
  {
    id: "bold",
    name: "Bold Dark",
    tag: "Stands out on a counter",
    accent: "#111827",
    hasQr: true,
    render(k) {
      const { c, v, W, L } = k;
      const cx = W / 2;
      const bg = c.isLight ? c.deep : c.accent;
      return k.svg(
        k.text(cx, 24, v.heading || L("loved"), { size: 8, w: 800, d: true, fill: "#ffffff", anchor: "middle", max: 92 }) +
          k.text(cx, 32, L("review"), { size: 4.2, fill: "#ffffff", anchor: "middle", op: 0.8, max: 92 }) +
          stars(k, cx, 42, 7, 2) +
          k.qrTile(20.5, 52, 64, { rx: 4, pad: 4 }) +
          k.text(cx, 129, v.business, { size: 4.6, w: 700, fill: "#ffffff", anchor: "middle", max: 94 }) +
          k.text(cx, 137, v.note || L("thanks"), { size: 3.2, fill: "#ffffff", anchor: "middle", op: 0.75, max: 94 }),
        { bg },
      );
    },
  },
  {
    id: "warm",
    name: "Warm Note",
    tag: "Soft colours, rounded panel",
    accent: "#f59e0b",
    font: "friendly",
    hasQr: true,
    render(k) {
      const { c, v, W, L } = k;
      const cx = W / 2;
      return k.svg(
        k.circle(14, 14, 26, { fill: c.soft, op: 0.6 }) +
          k.circle(98, 140, 30, { fill: c.soft, op: 0.5 }) +
          k.rect(9, 16, 87, 118, { fill: "#ffffff", rx: 8 }) +
          k.text(cx, 32, v.heading || L("review"), { size: 6.6, w: 800, d: true, fill: c.strong, anchor: "middle", max: 80 }) +
          stars(k, cx, 40, 5.4, 1.6) +
          k.qr(25.5, 47, 54) +
          k.text(cx, 111, v.business, { size: 4.2, w: 700, anchor: "middle", max: 80 }) +
          k.text(cx, 118, L("takes"), { size: 3.2, fill: c.muted, anchor: "middle", max: 80 }) +
          k.text(cx, 126, v.note || L("thanks"), { size: 3, w: 700, fill: c.strong, anchor: "middle", max: 80 }),
        { bg: c.tint },
      );
    },
  },
];

export default {
  id: "review",
  label: "Review card",
  short: "Review",
  icon: "star",
  description: "Ask happy customers for a Google review. One scan opens your review page.",
  sizeMm: [105, 148],
  sizeLabel: "A6 (10.5 × 14.8 cm)",
  sheet: { cols: 2, rows: 2 },
  tent: true,
  lang: true,
  accent: "#1a56db",
  accents: ["#1a56db", "#111827", "#f59e0b", "#15803d", "#be123c", "#6d28d9", "#0f766e", "#c2410c"],
  sides: [{ id: "front", label: "Card" }],
  layouts: { front: LAYOUTS },
  fields: [
    { name: "business", label: "Business name", type: "text", placeholder: "Chai Point Café", required: true, maxLength: 40 },
    {
      name: "link",
      label: "Your Google review link",
      type: "url",
      placeholder: "https://g.page/r/...",
      required: true,
      help: "Google Business Profile → Ask for reviews → Copy link",
    },
    { name: "heading", label: "Heading (optional)", type: "text", placeholder: "Rate us on Google", maxLength: 32, half: true },
    { name: "note", label: "Bottom line (optional)", type: "text", placeholder: "Thank you for your support!", maxLength: 40, half: true },
  ],
  initialValues: { business: "", link: "", heading: "", note: "" },
  sample: { business: "Chai Point Café", link: "https://g.page/r/example/review", heading: "", note: "" },
  validate: (v) => collectErrors({ business: required(v.business, "Business name"), link: validateUrl(v.link, "Review link") }),
  payload: (v) => normalizeUrl(v.link),
  strings: {
    en: {
      rateUs: "Rate us on Google",
      loved: "Loved your visit?",
      review: "Leave us a review",
      takes: "It takes just 30 seconds",
      scan: "Scan with your phone camera",
      thanks: "Thank you for your support!",
    },
    hi: {
      rateUs: "Google पर हमें रेटिंग दें",
      loved: "आपको हमारी सेवा कैसी लगी?",
      review: "हमें रिव्यू दें",
      takes: "बस 30 सेकंड लगेंगे",
      scan: "फ़ोन कैमरा से स्कैन करें",
      thanks: "आपके साथ के लिए धन्यवाद!",
    },
  },
};
