// Business card, 89 × 51 mm. QR on the front or the back (user's choice).

import contactType from "../../../qr-types/contact.js";
import { normalizeUrl, validateUrl, collectErrors } from "../../validators.js";
import { chipRow, contactRows, lines, shortUrl } from "./common.js";

const NAVY = "#0f172a";
const LUXE_BG = "#0c0c0c";

function roleLine(v) {
  return [v.jobTitle, v.company].filter(Boolean).join(" · ");
}

// ---------- Fronts without a QR ----------
const FRONTS = [
  {
    id: "classic",
    name: "Classic Clean",
    tag: "Safe for any work",
    accent: "#1d4ed8",
    render(k) {
      const { c, v } = k;
      return k.svg(
        k.box(0, 0, 1.6, k.H, { fill: c.accent }) +
          k.mark(77, 5, 6.6) +
          k.text(7, 12.5, v.name, { size: 5.2, w: 700, d: true, max: 66 }) +
          k.text(7.2, 16.4, roleLine(v), { size: 1.9, w: 700, fill: c.strong, ls: 0.22, upper: true, max: 68 }) +
          k.rect(7.2, 18.8, 7, 0.4, { fill: c.accent, rx: 0.2 }) +
          contactRows(k, 7.2, 26.4, 5.1, { max: 72 }),
      );
    },
  },
  {
    id: "split",
    name: "Split Bold",
    tag: "Monogram + clean details",
    accent: "#f59e0b",
    render(k) {
      const { c, v } = k;
      const logo = k.logo
        ? k.image(k.logo, 8.5, 12, 16, 16, { fit: "meet" })
        : k.circle(16.5, 20.5, 9.2, { fill: "none", stroke: c.light, sw: 0.4 }) + k.text(16.5, 23.6, v.initials, { size: 8, w: 800, fill: c.light, anchor: "middle" });
      const two = v.firstName && v.lastName;
      return k.svg(
        k.box(0, 0, 33, k.H, { fill: NAVY }) +
          logo +
          k.text(16.5, 38, v.company, { size: 1.8, w: 700, fill: "#ffffff", anchor: "middle", ls: 0.35, upper: true, max: 28, op: 0.85 }) +
          (two
            ? k.text(38, 11.5, v.firstName, { size: 4.6, w: 300, d: true, fill: NAVY, max: 47 }) + k.text(38, 16.6, v.lastName, { size: 4.6, w: 800, d: true, fill: NAVY, max: 47 })
            : k.text(38, 15.5, v.name, { size: 4.6, w: 800, d: true, fill: NAVY, max: 47 })) +
          k.text(38.2, 20.8, v.jobTitle, { size: 2, w: 600, fill: c.strong, max: 47 }) +
          contactRows(k, 38.2, 28, 5, { ic: NAVY, max: 47 }),
      );
    },
  },
  {
    id: "gradient",
    name: "Gradient Pop",
    tag: "Creators and startups",
    accent: "#6a4bff",
    render(k) {
      const { c, v } = k;
      const on = c.on;
      return k.svg(
        k.circle(80, 7, 17, { fill: "#ffffff", op: 0.1 }) +
          k.circle(86, 42, 11, { fill: "#ffffff", op: 0.08 }) +
          k.mark(6, 5.5, 5.8, { bg: "#ffffff", fg: c.accent }) +
          k.text(13.4, 9.6, v.company, { size: 2.4, w: 700, fill: on, max: 60 }) +
          k.text(6, 25, v.name, { size: 5.8, w: 800, d: true, fill: on, max: 77 }) +
          k.text(6.2, 29.2, v.jobTitle, { size: 2.2, fill: on, op: 0.9, max: 77 }) +
          k.text(6.2, 42, v.phone, { size: 2, w: 600, fill: on, max: 40 }) +
          k.text(6.2, 45.5, v.email, { size: 2, fill: on, op: 0.9, max: 44 }) +
          k.text(83, 45.5, v.webShort, { size: 2, w: 600, fill: on, anchor: "end", max: 30 }),
        { bg: k.grad([c.accent, c.accent2], { angle: 135 }) },
      );
    },
  },
  {
    id: "luxe",
    name: "Luxe Black & Gold",
    tag: "Premium look",
    accent: "#c9a227",
    font: "elegant",
    render(k) {
      const { c, v, W } = k;
      return k.svg(
        k.rect(2.2, 2.2, W - 4.4, k.H - 4.4, { fill: "none", stroke: c.light, sw: 0.16 }) +
          k.text(W / 2, 20.5, v.name, { size: 5, d: true, fill: c.light, anchor: "middle", ls: 0.8, upper: true, max: 76 }) +
          k.text(W / 2, 25, v.jobTitle, { size: 1.6, fill: "#e7e5e4", anchor: "middle", ls: 0.5, upper: true, max: 70 }) +
          k.path(`M${W / 2 - 12} 30h10M${W / 2 + 2} 30h10`, { stroke: c.light, sw: 0.14 }) +
          k.path(`M${W / 2} 29l1 1-1 1-1-1z`, { fill: c.light }) +
          k.text(W / 2, 36.5, [v.phone, v.email].filter(Boolean).join("   ·   "), { size: 1.8, fill: "#d6d3d1", anchor: "middle", max: 76 }) +
          k.text(W / 2, 40, v.webShort, { size: 1.8, fill: c.light, anchor: "middle", ls: 0.2, max: 70 }),
        { bg: LUXE_BG },
      );
    },
  },
  {
    id: "wave",
    name: "Fresh Wave",
    tag: "Clinics, cafés, friendly brands",
    accent: "#0f766e",
    render(k) {
      const { c, v } = k;
      return k.svg(
        k.path("M-3 38C22 32 42 45 92 35V54H-3Z", { fill: c.soft, op: 0.7 }) +
          k.path("M-3 42C26 36 52 50 92 40V54H-3Z", { fill: c.accent }) +
          k.mark(78, 4.8, 6) +
          k.text(6, 11, v.name, { size: 5, w: 800, d: true, fill: c.deep, max: 68 }) +
          k.text(6.2, 14.8, roleLine(v), { size: 2.1, fill: c.strong, max: 68 }) +
          contactRows(k, 6.2, 22.5, 4.6, { keys: ["phone", "email", "address"], max: 74 }) +
          k.text(83, 48, v.webShort, { size: 2, w: 700, fill: c.on, anchor: "end", max: 50 }),
      );
    },
  },
  {
    id: "profile",
    name: "Profile Card",
    tag: "Photo or initials",
    accent: "#be123c",
    render(k) {
      const { c, v } = k;
      return k.svg(
        k.avatar(15, 17, 8.8) +
          k.circle(15, 17, 9.8, { fill: "none", stroke: c.accent, sw: 0.3, op: 0.3 }) +
          k.text(28, 15, v.name, { size: 4.8, w: 800, d: true, max: 57 }) +
          k.text(28.2, 19, roleLine(v), { size: 2.1, fill: c.muted, max: 57 }) +
          k.text(28.2, 22.8, v.handle, { size: 2, w: 700, fill: c.strong, max: 57 }) +
          chipRow(k, 5, 37.5, [
            ["phone", v.phone],
            ["mail", v.email],
            ["web", v.webShort],
          ]),
        { bg: "#f8fafc" },
      );
    },
  },
];

// ---------- Fronts with the QR ----------
const QR_FRONTS = [
  {
    id: "qr-classic",
    name: "Classic + QR",
    tag: "Details left, QR right",
    accent: "#1d4ed8",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      return k.svg(
        k.box(0, 0, 1.6, k.H, { fill: c.accent }) +
          k.text(7, 13, v.name, { size: 4.6, w: 700, d: true, max: 50 }) +
          k.text(7.2, 16.6, v.jobTitle, { size: 1.7, w: 700, fill: c.strong, ls: 0.22, upper: true, max: 50 }) +
          k.rect(7.2, 18.8, 6, 0.4, { fill: c.accent, rx: 0.2 }) +
          contactRows(k, 7.2, 26.2, 5, { size: 1.9, iconSize: 2, max: 50 }) +
          k.qr(61, 10.5, 22) +
          k.text(72, 37.5, v.ctaShort, { size: 1.6, fill: "#64748b", anchor: "middle", max: 24 }),
      );
    },
  },
  {
    id: "qr-panel",
    name: "QR Panel",
    tag: "QR in a coloured strip",
    accent: "#f59e0b",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      const two = v.firstName && v.lastName;
      return k.svg(
        k.box(0, 0, 33, k.H, { fill: NAVY }) +
          k.qrTile(4.5, 7, 24, { rx: 1.8, pad: 1.5, color: NAVY }) +
          k.text(16.5, 37.2, "SCAN ME", { size: 2.2, w: 800, fill: c.light, anchor: "middle", ls: 0.4 }) +
          k.text(16.5, 41, v.ctaTail, { size: 1.6, fill: "#cbd5e1", anchor: "middle", max: 28 }) +
          (two
            ? k.text(38.5, 12, v.firstName, { size: 4.2, w: 300, d: true, fill: NAVY, max: 46 }) + k.text(38.5, 16.8, v.lastName, { size: 4.2, w: 800, d: true, fill: NAVY, max: 46 })
            : k.text(38.5, 15.5, v.name, { size: 4.2, w: 800, d: true, fill: NAVY, max: 46 })) +
          k.text(38.7, 20.5, v.jobTitle, { size: 1.9, w: 600, fill: c.strong, max: 46 }) +
          contactRows(k, 38.7, 28, 4.8, { size: 1.8, ic: NAVY, max: 46 }),
      );
    },
  },
  {
    id: "qr-gradient",
    name: "Gradient Corner",
    tag: "QR bottom right",
    accent: "#6a4bff",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      const on = c.on;
      return k.svg(
        k.circle(82, 4, 15, { fill: "#ffffff", op: 0.1 }) +
          k.mark(6, 5.2, 5.4, { bg: "#ffffff", fg: c.accent }) +
          k.text(12.8, 8.9, v.company, { size: 2.2, w: 700, fill: on, max: 44 }) +
          k.text(6, 22.8, v.name, { size: 5, w: 800, d: true, fill: on, max: 52 }) +
          k.text(6.2, 26.8, v.jobTitle, { size: 2, fill: on, op: 0.9, max: 52 }) +
          k.text(6.2, 40.5, v.phone, { size: 1.9, w: 600, fill: on, max: 52 }) +
          k.text(6.2, 44, v.email || v.webShort, { size: 1.9, fill: on, op: 0.9, max: 52 }) +
          k.rect(61.5, 20, 23, 27, { fill: "#ffffff", rx: 2 }) +
          k.qr(63.2, 21.7, 19.6, { color: c.deep }) +
          k.text(73, 44.8, "SCAN ME", { size: 1.8, w: 800, fill: c.strong, anchor: "middle", ls: 0.3 }),
        { bg: k.grad([c.accent, c.accent2], { angle: 135 }) },
      );
    },
  },
  {
    id: "qr-luxe",
    name: "Luxe + QR",
    tag: "Black & gold, QR on cream",
    accent: "#c9a227",
    font: "elegant",
    hasQr: true,
    render(k) {
      const { c, v, W } = k;
      return k.svg(
        k.rect(2.2, 2.2, W - 4.4, k.H - 4.4, { fill: "none", stroke: c.light, sw: 0.16 }) +
          k.text(7, 17.5, v.name, { size: 4, d: true, fill: c.light, ls: 0.5, upper: true, max: 46 }) +
          k.text(7.2, 21.5, v.jobTitle, { size: 1.4, fill: "#e7e5e4", ls: 0.4, upper: true, max: 46 }) +
          k.line(7.2, 25.5, 19.2, 25.5, { stroke: c.light, sw: 0.14 }) +
          k.text(7.2, 31.5, v.phone, { size: 1.8, fill: "#d6d3d1", max: 46 }) +
          k.text(7.2, 35, v.email, { size: 1.8, fill: "#d6d3d1", max: 46 }) +
          k.text(7.2, 38.5, v.webShort, { size: 1.8, fill: c.light, ls: 0.15, max: 46 }) +
          k.line(56, 11, 56, 40, { stroke: c.light, sw: 0.1 }) +
          k.qrTile(60, 11.5, 23, { tile: "#f8f3e3", rx: 0, pad: 1.4, color: "#141414" }) +
          k.text(71.5, 40, "SCAN TO CONNECT", { size: 1.5, d: true, fill: c.light, anchor: "middle", ls: 0.4 }),
        { bg: LUXE_BG },
      );
    },
  },
  {
    id: "qr-band",
    name: "Top Band",
    tag: "Name in a colour band",
    accent: "#0f766e",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      return k.svg(
        k.box(0, 0, k.W, 15, { fill: c.accent }) +
          k.text(6, 8.2, v.name, { size: 4.4, w: 800, d: true, fill: c.on, max: 66 }) +
          k.text(6.2, 12, roleLine(v), { size: 2, fill: c.on, op: 0.85, max: 66 }) +
          k.mark(77, 4.5, 6, { bg: c.on, fg: c.accent }) +
          contactRows(k, 6.2, 23.5, 4.8, { max: 52 }) +
          k.qr(63, 19, 21.5),
      );
    },
  },
  {
    id: "qr-profile",
    name: "Profile + QR",
    tag: "Photo or initials + QR",
    accent: "#be123c",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      return k.svg(
        k.avatar(12, 12.5, 6.2) +
          k.text(20.5, 11.2, v.name, { size: 3.8, w: 800, d: true, max: 37 }) +
          k.text(20.7, 14.6, v.jobTitle, { size: 1.8, fill: c.muted, max: 37 }) +
          k.text(20.7, 17.8, v.handle, { size: 1.8, w: 700, fill: c.strong, max: 37 }) +
          contactRows(k, 6.2, 29, 5, { keys: ["phone", "email", "web"], size: 1.9, max: 50 }) +
          k.rect(60.5, 12.5, 24, 29.5, { fill: "#ffffff", stroke: "#e2e8f0", sw: 0.12, rx: 2.2 }) +
          k.qr(62.5, 14.5, 20) +
          k.text(72.5, 39.2, v.ctaShort, { size: 1.6, w: 600, fill: c.strong, anchor: "middle", max: 22 }),
        { bg: "#f8fafc" },
      );
    },
  },
];

// ---------- Backs ----------
const BACKS = [
  {
    id: "big-qr",
    name: "Big QR",
    tag: "Simple and bold",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      return k.svg(
        k.qrTile(29.5, 5.6, 30, { rx: 2.6, pad: 2.4 }) +
          k.text(44.5, 42, v.cta, { size: 2.6, w: 600, fill: c.on, anchor: "middle", max: 80 }) +
          k.text(44.5, 45.8, v.webShort || v.company, { size: 1.9, fill: c.on, anchor: "middle", op: 0.75, max: 80 }),
        { bg: c.accent },
      );
    },
  },
  {
    id: "tagline",
    name: "QR + Tagline",
    tag: "A line about you",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      const [first, ...rest] = String(v.tagline || "Let's connect.").trim().split(/\s+/);
      return k.svg(
        k.qrTile(7, 9.5, 32, { rx: 2.2, pad: 2.2, color: NAVY }) +
          k.text(45, rest.length ? 21 : 26, first, { size: 5.8, w: rest.length ? 300 : 800, d: true, fill: rest.length ? "#ffffff" : c.light, max: 40 }) +
          (rest.length ? k.text(45, 27.5, rest.join(" "), { size: 5.8, w: 800, d: true, fill: c.light, max: 40 }) : "") +
          k.rect(45.2, 30.5, 6, 0.4, { fill: c.light, rx: 0.2 }) +
          k.text(45.2, 35.5, "Scan with your phone camera", { size: 1.8, fill: "#cbd5e1", max: 40 }) +
          k.text(45.2, 38.3, v.ctaTail, { size: 1.8, fill: "#cbd5e1", max: 40 }),
        { bg: NAVY },
      );
    },
  },
  {
    id: "social",
    name: "QR + Social",
    tag: "Your handles listed",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      const rows = v.socials.slice(0, 3);
      return k.svg(
        k.qr(6, 10, 31) +
          k.text(44, 15, rows.length ? "Follow & connect" : v.name, { size: 3.4, w: 800, d: true, max: 40 }) +
          rows
            .map(([label, value], i) => k.rect(44, 19.5 + i * 7.2, 38, 5.6, { fill: c.tint, rx: 1.4 }) + k.text(46.2, 23.1 + i * 7.2, label, { size: 1.7, w: 700, fill: c.strong, max: 14 }) + k.text(80, 23.1 + i * 7.2, value, { size: 1.7, fill: "#334155", anchor: "end", max: 21 }))
            .join(""),
      );
    },
  },
  {
    id: "services",
    name: "Services + QR",
    tag: "What you do",
    hasQr: true,
    render(k) {
      const { c, v } = k;
      const items = v.servicesList.length ? v.servicesList : [v.jobTitle, v.company, v.webShort].filter(Boolean);
      return k.svg(
        k.text(7, 12, v.servicesTitle, { size: 3.6, w: 800, d: true, max: 50 }) +
          k.rect(7.2, 14, 5, 0.4, { fill: c.accent, rx: 0.2 }) +
          items
            .slice(0, 4)
            .map((s, i) => k.circle(8.2, 20.7 + i * 5.2, 0.7, { fill: c.accent }) + k.text(10.4, 21.4 + i * 5.2, s, { size: 2.1, fill: "#334155", max: 48 }))
            .join("") +
          k.qr(62.5, 12, 20) +
          k.text(72.5, 36.5, v.ctaShort, { size: 1.7, w: 700, fill: c.strong, anchor: "middle", max: 24 }),
      );
    },
  },
  {
    id: "luxe-back",
    name: "Luxe Frame",
    tag: "Black & gold",
    hasQr: true,
    render(k) {
      const { c, v, W } = k;
      return k.svg(
        k.rect(2.2, 2.2, W - 4.4, k.H - 4.4, { fill: "none", stroke: c.light, sw: 0.16 }) +
          k.qrTile(W / 2 - 14.5, 5.8, 29, { tile: "#f8f3e3", rx: 0, pad: 2, color: "#141414" }) +
          k.text(W / 2, 41, "SCAN TO CONNECT", { size: 2, d: true, fill: c.light, anchor: "middle", ls: 0.7 }) +
          k.text(W / 2, 44.8, v.company || v.name, { size: 1.4, fill: "#a8a29e", anchor: "middle", ls: 0.5, upper: true, max: 70 }),
        { bg: LUXE_BG },
      );
    },
  },
  {
    id: "logo",
    name: "Logo Only",
    tag: "No QR (QR is on the front)",
    render(k) {
      const { c, v, W } = k;
      return k.svg(
        k.mark(W / 2 - 6, 11, 12, { bg: "#ffffff", fg: c.accent }) +
          k.text(W / 2, 32, v.company || v.name, { size: 4.6, w: 800, d: true, fill: c.on, anchor: "middle", max: 80 }) +
          k.text(W / 2, 36.5, v.tagline, { size: 2, fill: c.on, anchor: "middle", op: 0.85, max: 80 }),
        { bg: k.grad([c.accent, c.accent2], { angle: 135 }) },
      );
    },
  },
  {
    id: "pattern",
    name: "Pattern + Website",
    tag: "No QR (QR is on the front)",
    render(k) {
      const { c, v, W, H } = k;
      let d = "";
      for (let x = -55; x < W + 3; x += 3.6) d += `M${x.toFixed(1)} -3L${(x + 57).toFixed(1)} ${H + 3}`;
      return k.svg(
        k.path(d, { stroke: c.light, sw: 0.2, op: 0.12 }) +
          k.rect(21.5, 15, 46, 21, { fill: NAVY, stroke: c.light, sw: 0.1, rx: 2 }) +
          k.mark(40.5, 17.6, 8, { bg: c.light, fg: NAVY }) +
          k.text(W / 2, 31.5, v.webShort || v.email || v.company, { size: 3, w: 700, fill: c.light, anchor: "middle", ls: 0.1, max: 42 }),
        { bg: NAVY },
      );
    },
  },
];

const SOCIAL_LABELS = [
  ["instagram", "Instagram"],
  ["linkedin", "LinkedIn"],
  ["youtube", "YouTube"],
];

export default {
  id: "business",
  label: "Business card",
  short: "Business",
  icon: "contact",
  description: "Visiting card with your details. Put the QR on the front or the back.",
  sizeMm: [89, 51],
  sizeLabel: "8.9 × 5.1 cm",
  sheet: { cols: 2, rows: 5 },
  accent: "#1d4ed8",
  accents: ["#1d4ed8", "#f59e0b", "#6a4bff", "#c9a227", "#0f766e", "#be123c", "#111827", "#15803d"],
  sides: [
    { id: "front", label: "Front" },
    { id: "back", label: "Back", optional: true },
  ],
  qrPlacement: true,
  images: { logo: true, photo: true },
  layouts: { front: [...FRONTS, ...QR_FRONTS], back: BACKS },
  showOptions: [
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "website", label: "Website" },
    { key: "address", label: "Address" },
  ],
  fields: [
    {
      name: "qrContent",
      label: "When someone scans the QR",
      type: "select",
      variant: "segmented",
      options: [
        { value: "contact", label: "Save my contact", icon: "contact" },
        { value: "website", label: "Open my website", icon: "link" },
      ],
    },
    ...contactType.fields,
    { name: "_extra", type: "heading", label: "Extra (optional)" },
    { name: "handle", label: "Social handle", type: "text", placeholder: "@yourname", half: true, maxLength: 30 },
    { name: "tagline", label: "Tagline", type: "text", placeholder: "Let's connect.", half: true, maxLength: 36 },
    { name: "services", label: "Services (one per line, up to 4)", type: "textarea", placeholder: "Web apps\nMobile apps\nUI / UX design", maxLength: 160 },
    { name: "instagram", label: "Instagram", type: "text", placeholder: "@yourname", half: true, maxLength: 40 },
    { name: "linkedin", label: "LinkedIn", type: "text", placeholder: "/in/yourname", half: true, maxLength: 40 },
    { name: "youtube", label: "YouTube", type: "text", placeholder: "@channel", half: true, maxLength: 40 },
  ],
  initialValues: { qrContent: "contact", ...contactType.initialValues, handle: "", tagline: "", services: "", instagram: "", linkedin: "", youtube: "" },
  sample: {
    qrContent: "contact",
    firstName: "Asha",
    lastName: "Sharma",
    jobTitle: "Product Designer",
    company: "Studio Asha",
    phone: "+91 98765 43210",
    email: "asha@example.com",
    website: "example.com",
    address: "Andheri West, Mumbai",
    handle: "@asha.designs",
    tagline: "Let's connect.",
    services: "Brand identity\nWebsite design\nPackaging",
    instagram: "@asha.designs",
    linkedin: "/in/ashasharma",
    youtube: "",
  },
  validate(v) {
    return {
      ...contactType.validate(v),
      ...collectErrors({ website: v.qrContent === "website" ? validateUrl(v.website || "", "Website") : null }),
    };
  },
  payload(v) {
    return v.qrContent === "website" ? normalizeUrl(v.website) : contactType.buildPayload(v);
  },
  decorate(v) {
    const site = v.qrContent === "website";
    const socials = SOCIAL_LABELS.filter(([key]) => v[key]).map(([key, label]) => [label, v[key]]);
    if (socials.length < 3) {
      if (v.website) socials.push(["Website", shortUrl(v.website)]);
      if (v.email && socials.length < 3) socials.push(["Email", v.email]);
      if (v.phone && socials.length < 3) socials.push(["Phone", v.phone]);
    }
    return {
      ...v,
      name: [v.firstName, v.lastName].filter(Boolean).join(" "),
      initials: [v.firstName, v.lastName].filter(Boolean).map((s) => s[0]).join("").toUpperCase() || "QR",
      webShort: shortUrl(v.website),
      cta: site ? "Scan to visit my website" : "Scan to save my contact",
      ctaShort: site ? "Scan to visit" : "Scan to save contact",
      ctaTail: site ? "to visit my website" : "to save my contact",
      servicesList: lines(v.services, 4),
      servicesTitle: "What I do",
      socials,
    };
  },
  bulk: {
    kind: "csv",
    title: "Team cards",
    help: "One row per person. Columns: firstName, lastName, jobTitle, phone, email. Company, website, address and design stay the same for everyone.",
    columns: ["firstName", "lastName", "jobTitle", "phone", "email"],
    sampleCsv: "firstName,lastName,jobTitle,phone,email\nAsha,Sharma,Product Designer,+91 98765 43210,asha@example.com\nRavi,Kumar,Sales Lead,+91 91234 56789,ravi@example.com",
    max: 200,
  },
};
