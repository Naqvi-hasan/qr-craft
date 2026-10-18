// A4 poster: "Scan for menu", "Follow us", "Order on WhatsApp"...

import { CONTENT_FIELDS, CONTENT_INITIAL, contentPayload, validateContent } from "./common.js";
import { required, collectErrors } from "../../validators.js";

const LAYOUTS = [
  {
    id: "bold",
    name: "Bold Top",
    tag: "Big headline band",
    accent: "#1d4ed8",
    hasQr: true,
    render(k) {
      const { c, v, W } = k;
      const cx = W / 2;
      const head = k.para(cx, 46, v.headline, { size: 19, w: 800, d: true, fill: c.on, anchor: "middle", max: 186, lines: 2, lh: 1.08 });
      return k.svg(
        k.box(0, 0, W, 100, { fill: c.accent }) +
          head.svg +
          k.text(cx, 46 + head.height + 4, v.subline, { size: 7.5, fill: c.on, anchor: "middle", op: 0.9, max: 186 }) +
          k.qrTile(45, 112, 120, { rx: 6, pad: 5, tile: c.tint }) +
          k.text(cx, 254, v.business, { size: 9, w: 800, anchor: "middle", max: 186 }) +
          k.text(cx, 270, v.note, { size: 6, fill: c.muted, anchor: "middle", max: 190 }),
      );
    },
  },
  {
    id: "frame",
    name: "Frame",
    tag: "Thick border, Scan Me pill",
    accent: "#111827",
    hasQr: true,
    render(k) {
      const { c, v, W, H } = k;
      const cx = W / 2;
      const head = k.para(cx, 44, v.headline, { size: 17, w: 900, d: true, anchor: "middle", max: 170, lines: 2, lh: 1.08 });
      return k.svg(
        k.rect(5, 5, W - 10, H - 10, { fill: "none", stroke: c.accent, sw: 6, rx: 8 }) +
          head.svg +
          k.text(cx, 44 + head.height + 2, v.subline, { size: 7, fill: c.muted, anchor: "middle", max: 170 }) +
          k.rect(45, 92, 120, 120, { fill: "none", stroke: c.soft, sw: 0.8, rx: 8, dash: "4 3" }) +
          k.qr(52, 99, 106) +
          k.rect(cx - 32, 220, 64, 15, { fill: c.accent, rx: 7.5 }) +
          k.text(cx, 230.5, "SCAN ME", { size: 7, w: 800, fill: c.on, anchor: "middle", ls: 1 }) +
          k.text(cx, 254, v.business, { size: 9, w: 800, d: true, anchor: "middle", max: 176 }) +
          k.text(cx, 268, v.note, { size: 6, fill: c.muted, anchor: "middle", max: 176 }),
      );
    },
  },
  {
    id: "split",
    name: "Side by Side",
    tag: "Headline left, QR below",
    accent: "#0f766e",
    hasQr: true,
    render(k) {
      const { c, v, W, H } = k;
      const head = k.para(16, 48, v.headline, { size: 18, w: 800, d: true, fill: c.strong, max: 180, lines: 3, lh: 1.08 });
      return k.svg(
        k.circle(W - 10, 20, 60, { fill: c.soft, op: 0.5 }) +
          head.svg +
          k.text(16, 48 + head.height + 2, v.subline, { size: 7, fill: c.muted, max: 180 }) +
          k.qrTile(16, 112, 112, { rx: 6, pad: 5 }) +
          k.path("M140 168h34m-10-10 10 10-10 10", { stroke: c.strong, sw: 2.4, fill: "none", cap: "round", join: "round", tf: "rotate(180 157 168)" }) +
          k.para(140, 192, k.L("scan"), { size: 6, w: 700, fill: c.strong, max: 58, lines: 3 }).svg +
          k.box(0, H - 38, W, 38, { fill: c.accent }) +
          k.text(16, H - 21, v.business, { size: 9, w: 800, d: true, fill: c.on, max: 178 }) +
          k.text(16, H - 11, v.note, { size: 5.5, fill: c.on, op: 0.85, max: 178 }),
        { bg: c.tint },
      );
    },
  },
];

export default {
  id: "poster",
  label: "A4 poster",
  short: "Poster",
  icon: "file",
  description: "A wall or counter poster: Scan for menu, Follow us, Order on WhatsApp.",
  sizeMm: [210, 297],
  sizeLabel: "A4 (21 × 29.7 cm)",
  sheet: null,
  lang: true,
  accent: "#1d4ed8",
  accents: ["#1d4ed8", "#111827", "#0f766e", "#be123c", "#f59e0b", "#6d28d9", "#15803d", "#c2410c"],
  sides: [{ id: "front", label: "Poster" }],
  layouts: { front: LAYOUTS },
  fields: [
    { name: "headline", label: "Headline", type: "text", placeholder: "Scan for our menu", required: true, maxLength: 40 },
    { name: "subline", label: "Line under it (optional)", type: "text", placeholder: "No app needed, just your camera", maxLength: 60 },
    ...CONTENT_FIELDS,
    { name: "business", label: "Business name (optional)", type: "text", placeholder: "Chai Point Café", maxLength: 40, half: true },
    { name: "note", label: "Bottom line (optional)", type: "text", placeholder: "Open 8 AM to 11 PM", maxLength: 50, half: true },
  ],
  initialValues: { headline: "", subline: "", ...CONTENT_INITIAL, business: "", note: "" },
  sample: { headline: "Scan for our menu", subline: "No app needed, just your phone camera", kind: "link", url: "https://example.com/menu", phone: "", message: "", text: "", business: "Chai Point Café", note: "Open 8 AM to 11 PM" },
  validate: (v) => ({ ...collectErrors({ headline: required(v.headline, "Headline") }), ...validateContent(v) }),
  payload: contentPayload,
  strings: {
    en: { scan: "Point your phone camera at the code" },
    hi: { scan: "फ़ोन कैमरा कोड पर रखें" },
  },
};
