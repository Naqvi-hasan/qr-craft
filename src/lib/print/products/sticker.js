// QR stickers: a sheet of small square or round stickers (25 to 63 mm).

import { escapeXml } from "../../qr/render.js";
import { CONTENT_FIELDS, CONTENT_INITIAL, contentPayload, validateContent } from "./common.js";

const SIZES = [25, 38, 50, 63];
const sizeOf = (v) => (SIZES.includes(Number(v.size)) ? Number(v.size) : 38);

const LAYOUTS = [
  {
    id: "plain",
    name: "Square",
    tag: "Just the QR, optional label",
    accent: "#111827",
    hasQr: true,
    render(k) {
      const { v, W } = k;
      const label = v.label ? W * 0.16 : 0;
      const q = W - 2 * W * 0.04 - label;
      return k.svg(k.qr((W - q) / 2, W * 0.04, q) + (label ? k.text(W / 2, W - W * 0.07, v.label, { size: W * 0.09, w: 800, anchor: "middle", max: W * 0.92 }) : ""));
    },
  },
  {
    id: "round",
    name: "Round",
    tag: "Circle with a ring label",
    accent: "#be123c",
    hasQr: true,
    render(k) {
      const { c, v, W } = k;
      const r = W / 2;
      const ringR = r * 0.89;
      const pid = k.id();
      k.def(`<path id="${pid}" d="M${r - ringR} ${r}A${ringR} ${ringR} 0 0 0 ${r + ringR} ${r}"/>`);
      const ring = v.label
        ? `<text font-family="${k.display.family}" font-size="${(W * 0.085).toFixed(2)}" font-weight="800" fill="${c.on}" letter-spacing="${(W * 0.01).toFixed(2)}"><textPath href="#${pid}" startOffset="50%" text-anchor="middle">${escapeXml(v.label.toUpperCase())}</textPath></text>`
        : "";
      const q = W * 0.48;
      return k.svg(k.circle(r, r, r, { fill: c.accent }) + k.circle(r, r, r * 0.72, { fill: "#ffffff" }) + k.qr(r - q / 2, r - q / 2, q) + ring, { bg: "#ffffff" });
    },
  },
  {
    id: "tag",
    name: "Label Tag",
    tag: "Colour strip on top",
    accent: "#1d4ed8",
    hasQr: true,
    render(k) {
      const { c, v, W } = k;
      const strip = W * 0.2;
      const q = W - strip - W * 0.08;
      return k.svg(
        k.rect(0.3, 0.3, W - 0.6, W - 0.6, { fill: "#ffffff", stroke: c.accent, sw: W * 0.02, rx: W * 0.1 }) +
          k.rect(0.3, 0.3, W - 0.6, strip, { fill: c.accent, rx: W * 0.1 }) +
          k.rect(0.3, strip * 0.5, W - 0.6, strip * 0.5, { fill: c.accent }) +
          k.text(W / 2, strip * 0.68, v.label || "SCAN ME", { size: W * 0.1, w: 800, fill: c.on, anchor: "middle", max: W * 0.86 }) +
          k.qr((W - q) / 2, strip + W * 0.02, q),
        { bg: "#ffffff" },
      );
    },
  },
];

export default {
  id: "sticker",
  label: "QR stickers",
  short: "Stickers",
  icon: "sticker",
  description: "A sheet of QR stickers for products, packaging, laptops or school bags.",
  size: (v) => [sizeOf(v), sizeOf(v)],
  sizeMm: [38, 38],
  sizeLabel: "25 to 63 mm",
  sheet: (v) => {
    const s = sizeOf(v);
    return { cols: Math.floor((194 + 4) / (s + 4)), rows: Math.floor((281 + 4) / (s + 4)), gap: 4 };
  },
  accent: "#111827",
  accents: ["#111827", "#be123c", "#1d4ed8", "#15803d", "#f59e0b", "#6d28d9", "#0f766e", "#c2410c"],
  sides: [{ id: "front", label: "Sticker" }],
  layouts: { front: LAYOUTS },
  fields: [
    ...CONTENT_FIELDS,
    { name: "label", label: "Label (optional)", type: "text", placeholder: "Scan for menu", maxLength: 20, half: true },
    {
      name: "size",
      label: "Sticker size",
      type: "select",
      half: true,
      options: SIZES.map((s) => ({ value: String(s), label: `${s} mm${s === 38 ? " (popular)" : ""}` })),
    },
  ],
  initialValues: { ...CONTENT_INITIAL, label: "", size: "38" },
  sample: { kind: "link", url: "https://example.com/menu", phone: "+91 98765 43210", message: "", text: "Hello", label: "Scan for menu", size: "38" },
  validate: validateContent,
  payload: contentPayload,
};
