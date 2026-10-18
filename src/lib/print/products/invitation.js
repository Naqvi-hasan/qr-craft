// Invitation card, 5 × 7 inch (127 × 178 mm). The QR can open the venue on a map, send an RSVP on
// WhatsApp, open a link, or add the event to the phone's calendar. Optional back side with the programme.

import whatsappType from "../../../qr-types/whatsapp.js";
import { buildEventPayload } from "../../../qr-types/event.js";
import { normalizeUrl, required, validatePhone, validateUrl, collectErrors } from "../../validators.js";
import { lines } from "./common.js";

const GOLD = "#e9c46a";
const CREAM = "#fde8d0";

export function formatDate(date, lang = "en") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "")) return "";
  const d = new Date(`${date}T12:00:00`);
  return d.toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function formatTime(time) {
  const m = /^(\d{2}):(\d{2})$/.exec(time || "");
  if (!m) return "";
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
}

function rosette(k, cx, cy, r, color) {
  let petals = "";
  for (let i = 0; i < 12; i++) petals += k.ellipse(cx, cy - r * 0.6, r * 0.18, r * 0.42, { tf: `rotate(${i * 30} ${cx} ${cy})` });
  return k.g(petals + k.circle(cx, cy, r * 0.16) + k.circle(cx, cy, r * 1.08, { dash: "0.4 1" }), { fill: "none", stroke: color, sw: 0.3 });
}

function balloon(k, x, y, r, color) {
  return (
    k.path(`M${x} ${y + r}q-1.4 6 .8 12t-.6 12`, { stroke: "#94a3b8", sw: 0.3, fill: "none" }) +
    k.ellipse(x, y, r * 0.85, r, { fill: color }) +
    k.ellipse(x - r * 0.3, y - r * 0.35, r * 0.14, r * 0.24, { fill: "#ffffff", op: 0.5 })
  );
}

const FRONTS = [
  {
    id: "royal",
    name: "Royal Wedding",
    tag: "Maroon and gold",
    accent: "#6b0f1a",
    font: "elegant",
    hasQr: true,
    render(k) {
      const { c, v, W, H } = k;
      const cx = W / 2;
      const g = v.guest ? 4 : 0;
      const [a, b] = v.names;
      return k.svg(
        k.rect(4.5, 4.5, W - 9, H - 9, { fill: "none", stroke: GOLD, sw: 0.5, rx: 2.6 }) +
          k.rect(6.8, 6.8, W - 13.6, H - 13.6, { fill: "none", stroke: GOLD, sw: 0.2, rx: 1.8, op: 0.6 }) +
          rosette(k, cx, 24, 10, GOLD) +
          (v.guest ? k.text(cx, 41, `Dear ${v.guest},`, { size: 3.6, d: true, italic: true, fill: CREAM, anchor: "middle", max: 100 }) : "") +
          k.text(cx, 43 + g, v.intro, { size: 4, d: true, fill: CREAM, anchor: "middle", max: 104 }) +
          (b
            ? k.text(cx, 59 + g, a, { size: 15, d: true, fill: GOLD, anchor: "middle", max: 104 }) + k.text(cx, 68 + g, "&", { size: 7, d: true, fill: CREAM, anchor: "middle" }) + k.text(cx, 82 + g, b, { size: 15, d: true, fill: GOLD, anchor: "middle", max: 104 })
            : k.text(cx, 72 + g, a, { size: 13, d: true, fill: GOLD, anchor: "middle", max: 108 })) +
          k.text(cx, 90.5 + g, v.subtitle, { size: 3.8, d: true, fill: CREAM, anchor: "middle", max: 108 }) +
          k.path(`M${cx - 22} ${96 + g}h15M${cx + 7} ${96 + g}h15`, { stroke: GOLD, sw: 0.2 }) +
          k.path(`M${cx} ${94.8 + g}l1.2 1.2-1.2 1.2-1.2-1.2z`, { fill: GOLD }) +
          k.text(cx, 104.5 + g, v.dateLine, { size: 4.6, w: 700, fill: "#ffffff", anchor: "middle", max: 112 }) +
          k.text(cx, 110.5 + g, [v.timeLine, v.venue].filter(Boolean).join(" · "), { size: 3.6, fill: CREAM, anchor: "middle", max: 112 }) +
          k.text(cx, 116 + g, v.note, { size: 3.2, fill: CREAM, anchor: "middle", op: 0.85, max: 110 }) +
          k.qrTile(48.5, 120 + g, 30, { tile: "#fff8ee", rx: 1.4, pad: 2, color: "#4a0d12" }) +
          k.text(cx, 156.5 + g, v.cta, { size: 2.8, fill: GOLD, anchor: "middle", ls: 0.5, upper: true, max: 110 }),
        { bg: c.isLight ? c.deep : c.accent },
      );
    },
  },
  {
    id: "birthday",
    name: "Kids Birthday",
    tag: "Balloons and confetti",
    accent: "#f97316",
    hasQr: true,
    render(k) {
      const { c, v, W } = k;
      const cx = W / 2;
      const cols = ["#f97316", "#22c55e", "#3b82f6", "#ec4899", "#eab308"];
      let conf = "";
      for (let i = 0; i < 36; i++) {
        const x = (i % 2 ? 115 : 4) + ((i * 53) % 80) / 10;
        const y = 42 + ((i * 137) % 1250) / 10;
        conf += k.rect(x, y, 1.8, 0.8, { rx: 0.3, fill: cols[i % 5], tf: `rotate(${(i * 47) % 180} ${x + 0.9} ${y + 0.4})`, op: 0.75 });
      }
      return k.svg(
        conf +
          balloon(k, 17, 21, 9.5, c.accent) +
          balloon(k, 30, 15, 8, "#3b82f6") +
          balloon(k, 109, 20, 9.5, "#ec4899") +
          balloon(k, 96.5, 14, 7.5, "#22c55e") +
          (v.guest ? k.text(cx, 22, `Dear ${v.guest},`, { size: 3.6, w: 700, fill: "#0f172a", anchor: "middle", max: 50 }) : "") +
          k.text(cx, 30, v.intro, { size: 6.4, w: 800, d: true, fill: "#1d4ed8", anchor: "middle", max: 70 }) +
          k.text(cx, 52, v.title, { size: 21, w: 900, d: true, fill: c.strong, anchor: "middle", ls: 0.6, upper: true, max: 112 }) +
          k.text(cx, 64, v.subtitle, { size: 8.6, w: 800, d: true, fill: "#0f172a", anchor: "middle", max: 112 }) +
          k.rect(16, 72, 95, 19, { fill: "#ffffff", rx: 4 }) +
          k.text(cx, 80, [v.dateShort, v.timeLine].filter(Boolean).join(" · "), { size: 5, w: 700, fill: "#0f172a", anchor: "middle", max: 90 }) +
          k.text(cx, 86.8, v.venue, { size: 4, fill: "#475569", anchor: "middle", max: 90 }) +
          k.qrTile(47.5, 99, 32, { rx: 3, pad: 2.2, color: "#0f172a" }) +
          k.text(cx, 138.5, v.cta, { size: 4, w: 700, fill: "#1d4ed8", anchor: "middle", max: 110 }) +
          k.text(cx, 164, v.note, { size: 4.4, w: 700, fill: "#db2777", anchor: "middle", max: 110 }),
        { bg: "#e0f2fe" },
      );
    },
  },
  {
    id: "launch",
    name: "Launch Event",
    tag: "Dark, modern",
    accent: "#7b5cff",
    hasQr: true,
    render(k) {
      const { c, v, W, H } = k;
      const title = k.para(9.5, 61, v.title, { size: 15, w: 800, d: true, fill: "#ffffff", max: 108, lines: 2, lh: 1.02 });
      const y = 61 + title.height - 15 * 1.02;
      return k.svg(
        k.box(0, 0, W, H, { fill: k.grad([[0, c.accent, 0.55], [1, "#0b1020", 0]], { radial: [0.8, 0.15, 0.8] }) }) +
          k.mark(10, 11, 9, { bg: "#ffffff", fg: c.accent, text: v.host || v.title }) +
          k.text(21.5, 17.2, v.host, { size: 4.6, w: 700, fill: "#ffffff", max: 95 }) +
          (v.guest ? k.text(10, 38, `Dear ${v.guest},`, { size: 3.6, fill: "#a6b0c9", max: 108 }) : "") +
          k.text(10, 47, v.intro, { size: 3.6, w: 700, fill: "#a6b0c9", ls: 0.8, upper: true, max: 108 }) +
          title.svg +
          k.text(10, y + 11, v.subtitle, { size: 7, w: 800, fill: k.grad([c.light, c.accent2], { angle: 90 }), max: 108 }) +
          k.rect(10, y + 19, 12, 0.6, { fill: c.accent2, rx: 0.3 }) +
          k.text(10, y + 30, v.dateLine, { size: 4.6, w: 700, fill: "#ffffff", max: 108 }) +
          k.text(10, y + 36, [v.timeLine, v.venue].filter(Boolean).join(" · "), { size: 3.8, fill: "#a6b0c9", max: 108 }) +
          k.text(10, y + 42, v.note, { size: 3.4, fill: "#6d7898", max: 108 }) +
          k.qrTile(10, 130, 33, { rx: 2.6, pad: 2.2, color: "#0b1020" }) +
          k.text(48, 144, v.cta, { size: 4.6, w: 800, fill: "#ffffff", max: 70 }) +
          k.text(48, 150, k.L("point"), { size: 3.4, fill: c.accent2, max: 70 }),
        { bg: "#0b1020" },
      );
    },
  },
  {
    id: "griha",
    name: "Griha Pravesh",
    tag: "Marigold toran",
    accent: "#c2410c",
    font: "elegant",
    hasQr: true,
    render(k) {
      const { c, v, W } = k;
      const cx = W / 2;
      const flowers = ["#f97316", "#facc15", "#ea580c", "#fbbf24"];
      let toran = k.path("M-3 6Q63.5 18 130 6", { stroke: "#15803d", sw: 0.8, fill: "none" });
      for (let i = 0; i < 15; i++) {
        const x = 4.5 + i * 8.4;
        const y = 6 + Math.sin((i / 14) * Math.PI) * 6;
        const len = 7 + (i % 2) * 5;
        toran += k.line(x, y, x, y + len, { stroke: "#15803d", sw: 0.3 });
        for (let j = 0; j < 3; j++) toran += k.circle(x, y + 2 + j * (len / 3), 1.7, { fill: flowers[(i + j) % 4] });
        toran += k.path(`M${x - 1.6} ${y + len}q1.6 4 3.2 0z`, { fill: "#16a34a" });
      }
      const sub = k.para(cx, 64, v.subtitle, { size: 4.2, d: true, fill: "#7c2d12", anchor: "middle", max: 100, lines: 2 });
      return k.svg(
        toran +
          (v.guest ? k.text(cx, 36, `Dear ${v.guest},`, { size: 3.6, d: true, italic: true, fill: c.strong, anchor: "middle", max: 100 }) : "") +
          k.text(cx, 47, v.title, { size: 13, d: true, fill: c.strong, anchor: "middle", max: 112 }) +
          k.text(cx, 54.5, v.host, { size: 5.2, w: 700, fill: c.strong, anchor: "middle", ls: 0.4, max: 108, op: 0.85 }) +
          sub.svg +
          k.rect(17, 77, 93, 20, { fill: c.tint, rx: 3 }) +
          k.text(cx, 85, [v.dateLine, v.timeLine].filter(Boolean).join(" · "), { size: 4.2, w: 700, fill: c.strong, anchor: "middle", max: 88 }) +
          k.text(cx, 91.5, v.venue, { size: 4, fill: c.strong, anchor: "middle", op: 0.9, max: 88 }) +
          k.qrTile(46, 104, 35, { rx: 2.4, pad: 2.2, color: "#431407" }) +
          k.text(cx, 146, v.cta, { size: 4, w: 700, fill: c.strong, anchor: "middle", max: 112 }) +
          k.text(cx, 164, v.note, { size: 3.8, fill: "#7c2d12", anchor: "middle", max: 112 }),
        { bg: "#fff7ed" },
      );
    },
  },
];

const BACKS = [
  {
    id: "programme",
    name: "Programme",
    tag: "List of functions",
    render(k) {
      const { c, v, W, L } = k;
      const cx = W / 2;
      const rows = v.programmeRows;
      const step = rows.length > 5 ? 14 : 17;
      const top = 52 + Math.max(0, (100 - rows.length * step) / 2);
      return k.svg(
        k.box(0, 0, W, 6, { fill: c.accent }) +
          k.text(cx, 28, L("programme"), { size: 9, d: true, fill: c.strong, anchor: "middle" }) +
          k.path(`M${cx - 18} 34h13M${cx + 5} 34h13`, { stroke: c.accent, sw: 0.3 }) +
          k.circle(cx, 34, 1, { fill: c.accent }) +
          rows
            .map(([what, when], i) => {
              const y = top + i * step;
              return (
                k.text(cx, y, what, { size: 5.4, w: 700, d: true, anchor: "middle", max: 108 }) +
                k.text(cx, y + 6, when, { size: 3.8, fill: c.muted, anchor: "middle", max: 108 }) +
                (i < rows.length - 1 ? k.line(cx - 8, y + 10, cx + 8, y + 10, { stroke: c.soft, sw: 0.3 }) : "")
              );
            })
            .join("") +
          k.text(cx, 166, v.host || v.title, { size: 3.6, fill: c.muted, anchor: "middle", ls: 0.3, max: 110 }) +
          k.box(0, 172, W, 6, { fill: c.accent }),
        { bg: "#fffdf8" },
      );
    },
  },
  {
    id: "map",
    name: "How to reach",
    tag: "Big QR + venue",
    hasQr: true,
    render(k) {
      const { c, v, W, L } = k;
      const cx = W / 2;
      const venue = k.para(cx, 46, v.venue, { size: 5, w: 700, anchor: "middle", max: 104, lines: 2 });
      return k.svg(
        k.box(0, 0, W, 6, { fill: c.accent }) +
          k.text(cx, 30, L("reach"), { size: 8.5, d: true, fill: c.strong, anchor: "middle", max: 110 }) +
          venue.svg +
          k.text(cx, 48 + venue.height, [v.dateLine, v.timeLine].filter(Boolean).join(" · "), { size: 3.8, fill: c.muted, anchor: "middle", max: 110 }) +
          k.qrTile(28.5, 66, 70, { rx: 4, pad: 4, tile: c.tint }) +
          k.text(cx, 148, v.cta, { size: 4.2, w: 700, fill: c.strong, anchor: "middle", max: 112 }) +
          k.box(0, 172, W, 6, { fill: c.accent }),
        { bg: "#fffdf8" },
      );
    },
  },
];

const MODES = {
  location: "scanLocation",
  rsvp: "scanRsvp",
  link: "scanLink",
  calendar: "scanCalendar",
};

export default {
  id: "invitation",
  label: "Invitation",
  short: "Invitation",
  icon: "mail",
  description: "Wedding, birthday, launch or griha pravesh invitations with a QR for the map, RSVP or calendar.",
  sizeMm: [127, 178],
  sizeLabel: "5 × 7 inch (12.7 × 17.8 cm)",
  sheet: { cols: 2, rows: 1, landscape: true },
  lang: true,
  einvite: true,
  accent: "#6b0f1a",
  accents: ["#6b0f1a", "#f97316", "#7b5cff", "#c2410c", "#1d4ed8", "#0f766e", "#be123c", "#111827"],
  sides: [
    { id: "front", label: "Front" },
    { id: "back", label: "Back", optional: true, defaultOff: true },
  ],
  layouts: { front: FRONTS, back: BACKS },
  images: { logo: true },
  fields: [
    {
      name: "qrMode",
      label: "When guests scan the QR",
      type: "select",
      variant: "segmented",
      options: [
        { value: "location", label: "Map", icon: "pin" },
        { value: "rsvp", label: "RSVP", icon: "whatsapp" },
        { value: "calendar", label: "Calendar", icon: "calendar" },
        { value: "link", label: "Link", icon: "link" },
      ],
    },
    { name: "intro", label: "Top line", type: "text", placeholder: "Together with their families", maxLength: 48 },
    { name: "title", label: "Names or event", type: "text", placeholder: "Riya & Arjun", required: true, maxLength: 40, help: "Use & between two names for a wedding layout" },
    { name: "subtitle", label: "Line under it", type: "text", placeholder: "request the pleasure of your company", maxLength: 70 },
    { name: "host", label: "Host / family / company (optional)", type: "text", placeholder: "Sharma Family", maxLength: 40 },
    { name: "date", label: "Date", type: "date", required: true, half: true },
    { name: "time", label: "Time", type: "time", half: true },
    { name: "venue", label: "Venue", type: "text", placeholder: "Taj Lands End, Mumbai", required: true, maxLength: 80 },
    { name: "note", label: "Extra line (optional)", type: "text", placeholder: "Dinner from 8:30 PM", maxLength: 60 },
    { name: "mapLink", label: "Google Maps link (optional)", type: "url", placeholder: "https://maps.app.goo.gl/...", help: "Empty = we search the venue name", showIf: (v) => v.qrMode === "location" },
    { name: "rsvpPhone", label: "WhatsApp number for RSVP", type: "tel", placeholder: "+91 98765 43210", required: true, half: true, showIf: (v) => v.qrMode === "rsvp" },
    { name: "rsvpMessage", label: "Ready-made reply", type: "text", placeholder: "Hum aa rahe hain!", half: true, maxLength: 80, showIf: (v) => v.qrMode === "rsvp" },
    { name: "link", label: "Link", type: "url", placeholder: "forms.gle/...", required: true, showIf: (v) => v.qrMode === "link" },
    { name: "guest", label: "Guest name (optional)", type: "text", placeholder: "Sharma ji", maxLength: 30, help: "Adds “Dear …”. For a whole guest list use the Bulk tab" },
    { name: "programme", label: "Programme for the back (one per line)", type: "textarea", placeholder: "Mehendi | Thu 19 Nov, 4 PM\nSangeet | Fri 20 Nov, 7 PM\nWedding | Sat 21 Nov, 7 PM", maxLength: 400 },
  ],
  initialValues: { qrMode: "location", intro: "", title: "", subtitle: "", host: "", date: "", time: "", venue: "", note: "", mapLink: "", rsvpPhone: "", rsvpMessage: "", link: "", guest: "", programme: "" },
  sample: {
    qrMode: "location",
    intro: "Together with their families",
    title: "Riya & Arjun",
    subtitle: "request the pleasure of your company",
    host: "Sharma & Mehta Families",
    date: "2026-11-21",
    time: "19:00",
    venue: "Taj Lands End, Mumbai",
    note: "",
    mapLink: "",
    rsvpPhone: "+91 98765 43210",
    rsvpMessage: "Hum aa rahe hain!",
    link: "https://example.com",
    guest: "",
    programme: "Mehendi | Thu 19 Nov, 4 PM\nSangeet | Fri 20 Nov, 7 PM\nWedding | Sat 21 Nov, 7 PM",
  },
  // Layout-specific starting text, used when the user picks a layout with an empty form.
  presets: {
    birthday: { intro: "You're invited!", title: "Ayaan", subtitle: "is turning 5!", venue: "Funland Party Hall, Andheri", note: "Cake, games & lots of fun!" },
    launch: { intro: "You're invited to", title: "Product Launch", subtitle: "Version 2.0", host: "Studio Asha", venue: "The Hub, BKC, Mumbai", note: "Dress code: Smart casual" },
    griha: { title: "Griha Pravesh", host: "Sharma Family", subtitle: "aapko hamare naye ghar mein ashirwad dene ke liye bulati hai", venue: "B-204, Green Park, Pune", note: "Bhojan: 12:30 PM se" },
  },
  validate(v) {
    return collectErrors({
      title: required(v.title, "Names or event"),
      date: required(v.date, "Date") || (/^\d{4}-\d{2}-\d{2}$/.test(v.date) ? null : "Pick a date"),
      time: v.time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(v.time) ? "Use a time like 19:00" : null,
      venue: required(v.venue, "Venue"),
      mapLink: v.qrMode === "location" && v.mapLink ? validateUrl(v.mapLink, "Maps link") : null,
      rsvpPhone: v.qrMode === "rsvp" ? validatePhone(v.rsvpPhone, "WhatsApp number") : null,
      link: v.qrMode === "link" ? validateUrl(v.link, "Link") : null,
    });
  },
  payload(v) {
    if (v.qrMode === "rsvp") return whatsappType.buildPayload({ phone: v.rsvpPhone, message: v.rsvpMessage || `RSVP: ${v.title}` });
    if (v.qrMode === "link") return normalizeUrl(v.link);
    if (v.qrMode === "calendar") return buildEventPayload({ title: [v.title, v.host].filter(Boolean).join(" – "), startDate: v.date, startTime: v.time, location: v.venue, description: v.note });
    return v.mapLink ? normalizeUrl(v.mapLink) : `https://maps.google.com/?q=${encodeURIComponent(v.venue.trim())}`;
  },
  decorate(v, state) {
    const lang = state?.lang ?? "en";
    const S = this.strings[lang] ?? this.strings.en;
    const [a, b] = String(v.title || "").split(/\s*&\s*/);
    const dateLine = formatDate(v.date, lang);
    return {
      ...v,
      names: b ? [a, b] : [v.title],
      dateLine,
      dateShort: dateLine.replace(/^(\w+),/, (m, day) => `${day.slice(0, 3)},`),
      timeLine: formatTime(v.time),
      cta: S[MODES[v.qrMode]] ?? S.scanLocation,
      programmeRows: lines(v.programme, 7).map((line) => {
        const [what, ...when] = line.split(/\s*[|–-]\s+|\s+[|–-]\s*/);
        return [what, when.join(" · ")];
      }),
    };
  },
  bulk: {
    kind: "list",
    field: "guest",
    title: "Guest names",
    help: "One name per line. Each card gets its own “Dear …” line.",
    placeholder: "Sharma ji\nMehta Family\nDr. Rao",
    max: 500,
  },
  strings: {
    en: {
      scanLocation: "Scan for location",
      scanRsvp: "Scan to RSVP on WhatsApp",
      scanLink: "Scan for details",
      scanCalendar: "Scan to add to calendar",
      programme: "Programme",
      reach: "How to reach",
      point: "Point your phone camera",
    },
    hi: {
      scanLocation: "लोकेशन के लिए स्कैन करें",
      scanRsvp: "WhatsApp पर जवाब देने के लिए स्कैन करें",
      scanLink: "जानकारी के लिए स्कैन करें",
      scanCalendar: "कैलेंडर में जोड़ने के लिए स्कैन करें",
      programme: "कार्यक्रम",
      reach: "कैसे पहुँचें",
      point: "फ़ोन कैमरा से स्कैन करें",
    },
  },
};
