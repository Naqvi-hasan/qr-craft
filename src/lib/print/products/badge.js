// Event badge / ID card, CR80 portrait (54 × 86 mm, the size of an ATM card).

import contactType from "../../../qr-types/contact.js";
import { normalizeUrl, required, validateEmail, validatePhone, validateUrl, collectErrors } from "../../validators.js";

function slot(k) {
  return k.rect(k.W / 2 - 6, 3.2, 12, 2.4, { fill: "#ffffff", stroke: "#cbd5e1", sw: 0.15, rx: 1.2 });
}

const LAYOUTS = [
  {
    id: "band",
    name: "Colour Band",
    tag: "Photo in the middle",
    accent: "#1d4ed8",
    hasQr: true,
    render(k) {
      const { c, v, W } = k;
      const cx = W / 2;
      return k.svg(
        k.box(0, 0, W, 24, { fill: c.accent }) +
          slot(k) +
          k.text(cx, 13.5, v.event, { size: 3.4, w: 800, fill: c.on, anchor: "middle", max: 48 }) +
          k.text(cx, 18, v.org, { size: 2.2, fill: c.on, anchor: "middle", op: 0.85, max: 48 }) +
          k.circle(cx, 33.5, 10.3, { fill: "#ffffff" }) +
          k.avatar(cx, 33.5, 9.5, { text: v.name }) +
          k.text(cx, 50, v.name, { size: 4.2, w: 800, d: true, anchor: "middle", max: 48 }) +
          k.text(cx, 54.5, v.role, { size: 2.5, w: 600, fill: c.strong, anchor: "middle", max: 48 }) +
          k.qr(cx - 10.5, 57, 21) +
          k.text(cx, 82.2, v.idNo, { size: 2.2, w: 700, fill: c.muted, anchor: "middle", ls: 0.3, max: 48 }),
      );
    },
  },
  {
    id: "side",
    name: "Side Stripe",
    tag: "Square photo, stripe",
    accent: "#be123c",
    hasQr: true,
    render(k) {
      const { c, v, H } = k;
      return k.svg(
        k.box(0, 0, 8, H, { fill: c.accent }) +
          k.g(k.text(4, H / 2, v.event, { size: 2.6, w: 800, fill: c.on, anchor: "middle", ls: 0.5, upper: true, max: 76 }), { tf: `rotate(-90 4 ${H / 2})` }) +
          slot(k) +
          (k.photo ? k.image(k.photo, 13, 10, 28, 28, { rx: 3 }) : k.rect(13, 10, 28, 28, { fill: c.tint, rx: 3 }) + k.text(27, 28, v.initials, { size: 10, w: 800, fill: c.strong, anchor: "middle" })) +
          k.text(13, 46, v.name, { size: 4, w: 800, d: true, max: 38 }) +
          k.text(13, 50.5, v.role, { size: 2.4, w: 600, fill: c.strong, max: 38 }) +
          k.text(13, 54.5, v.org, { size: 2.2, fill: c.muted, max: 38 }) +
          k.qr(29, 59, 21) +
          k.text(13, 79, v.idNo, { size: 2, w: 700, fill: c.muted, ls: 0.2, max: 15 }),
      );
    },
  },
  {
    id: "minimal",
    name: "Minimal",
    tag: "Big name, no photo",
    accent: "#111827",
    hasQr: true,
    render(k) {
      const { c, v, W, H } = k;
      const cx = W / 2;
      const name = k.para(cx, 22, v.name, { size: 6, w: 800, d: true, anchor: "middle", max: 48, lines: 2, lh: 1.05 });
      const y = 22 + name.height - 6.3;
      return k.svg(
        slot(k) +
          k.text(cx, 12, v.event, { size: 2.4, w: 700, fill: c.muted, anchor: "middle", ls: 0.4, upper: true, max: 48 }) +
          name.svg +
          k.text(cx, y + 6, v.role, { size: 2.8, w: 600, fill: c.strong, anchor: "middle", max: 48 }) +
          k.qr(cx - 13, y + 10, 26) +
          k.text(cx, y + 40, v.idNo, { size: 2.2, w: 700, fill: c.muted, anchor: "middle", ls: 0.3, max: 48 }) +
          k.box(0, H - 6, W, 6, { fill: c.accent }) +
          k.text(cx, H - 2.2, v.org, { size: 2.2, w: 700, fill: c.on, anchor: "middle", max: 48 }),
      );
    },
  },
];

export default {
  id: "badge",
  label: "Event badge / ID",
  short: "Badge",
  icon: "badge",
  description: "Name badges for events, staff ID cards and visitor passes, with photo and QR.",
  sizeMm: [54, 86],
  sizeLabel: "5.4 × 8.6 cm (card size)",
  sheet: { cols: 3, rows: 3 },
  accent: "#1d4ed8",
  accents: ["#1d4ed8", "#be123c", "#111827", "#15803d", "#6d28d9", "#f59e0b", "#0f766e", "#c2410c"],
  sides: [{ id: "front", label: "Badge" }],
  layouts: { front: LAYOUTS },
  images: { photo: true, logo: false },
  fields: [
    {
      name: "qrMode",
      label: "When someone scans",
      type: "select",
      variant: "segmented",
      options: [
        { value: "id", label: "ID number", icon: "badge" },
        { value: "contact", label: "Save contact", icon: "contact" },
        { value: "link", label: "Link", icon: "link" },
      ],
    },
    { name: "event", label: "Event or company", type: "text", placeholder: "TechConf 2026", maxLength: 32, half: true },
    { name: "org", label: "Organisation (optional)", type: "text", placeholder: "Studio Asha", maxLength: 32, half: true },
    { name: "name", label: "Name", type: "text", placeholder: "Asha Sharma", required: true, maxLength: 40, half: true },
    { name: "role", label: "Role", type: "text", placeholder: "Speaker", maxLength: 32, half: true },
    { name: "idNo", label: "ID number", type: "text", placeholder: "TC26-0042", maxLength: 24, required: true, showIf: (v) => v.qrMode === "id" },
    { name: "phone", label: "Phone", type: "tel", placeholder: "+91 98765 43210", half: true, showIf: (v) => v.qrMode === "contact" },
    { name: "email", label: "Email", type: "email", placeholder: "asha@example.com", half: true, showIf: (v) => v.qrMode === "contact" },
    { name: "url", label: "Link", type: "url", placeholder: "example.com/asha", required: true, showIf: (v) => v.qrMode === "link" },
  ],
  initialValues: { qrMode: "id", event: "", org: "", name: "", role: "", idNo: "", phone: "", email: "", url: "" },
  sample: { qrMode: "id", event: "TechConf 2026", org: "Studio Asha", name: "Asha Sharma", role: "Speaker", idNo: "TC26-0042", phone: "+91 98765 43210", email: "asha@example.com", url: "https://example.com" },
  validate(v) {
    return collectErrors({
      name: required(v.name, "Name"),
      idNo: v.qrMode === "id" ? required(v.idNo, "ID number") : null,
      phone: v.qrMode === "contact" && v.phone ? validatePhone(v.phone, "Phone") : null,
      email: v.qrMode === "contact" && v.email ? validateEmail(v.email) : null,
      url: v.qrMode === "link" ? validateUrl(v.url, "Link") : null,
    });
  },
  payload(v) {
    if (v.qrMode === "contact") return contactType.buildPayload({ firstName: v.name, lastName: "", company: v.org, jobTitle: v.role, phone: v.phone, email: v.email, website: "", address: "" });
    if (v.qrMode === "link") return normalizeUrl(v.url);
    return String(v.idNo).trim();
  },
  decorate(v) {
    const words = String(v.name || "").trim().split(/\s+/).filter(Boolean);
    return { ...v, initials: (words.length > 1 ? words[0][0] + words[words.length - 1][0] : (words[0] || "").slice(0, 2)).toUpperCase() };
  },
  bulk: {
    kind: "csv",
    title: "Badges for everyone",
    help: "One row per person. Columns: name, role, idNo (and phone, email for “Save contact”). Event and design stay the same.",
    columns: ["name", "role", "idNo", "phone", "email"],
    sampleCsv: "name,role,idNo\nAsha Sharma,Speaker,TC26-0001\nRavi Kumar,Volunteer,TC26-0002",
    max: 300,
  },
};
