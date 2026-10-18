// WiFi card for guests, A6 (105 × 148 mm).

import wifiType from "../../../qr-types/wifi.js";
import { wifiArcs } from "./common.js";

const A6 = [105, 148];

const showPass = (v) => v.encryption !== "nopass" && v.showPassword !== false;

const LAYOUTS = [
  {
    id: "classic",
    name: "Classic",
    tag: "Colour header",
    accent: "#1d4ed8",
    hasQr: true,
    render(k) {
      const { c, v, W, L } = k;
      const cx = W / 2;
      return k.svg(
        k.box(0, 0, W, 40, { fill: c.accent }) +
          wifiArcs(k, cx, 15, 8, c.on, 1.3) +
          k.text(cx, 28.5, v.title || L("freeWifi"), { size: 8.6, w: 800, d: true, fill: c.on, anchor: "middle", max: 92 }) +
          k.text(cx, 35, v.place, { size: 4, fill: c.on, anchor: "middle", op: 0.85, max: 92 }) +
          k.qr(21.5, 45, 62) +
          k.text(cx, 116, L("network"), { size: 2.8, w: 700, fill: c.muted, anchor: "middle", ls: 0.3 }) +
          k.text(cx, 122.2, v.ssid, { size: 5.2, w: 700, anchor: "middle", max: 92 }) +
          (showPass(v) ? k.text(cx, 130, L("password"), { size: 2.8, w: 700, fill: c.muted, anchor: "middle", ls: 0.3 }) + k.text(cx, 136.2, v.password, { size: 5.2, w: 700, anchor: "middle", max: 92 }) : "") +
          k.text(cx, 144, L("footer"), { size: 2.8, fill: c.muted, anchor: "middle", max: 96 }),
      );
    },
  },
  {
    id: "cafe",
    name: "Café Warm",
    tag: "Cream and brown, serif",
    accent: "#6b3f1d",
    font: "elegant",
    hasQr: true,
    render(k) {
      const { c, v, W, H, L } = k;
      const cx = W / 2;
      return k.svg(
        k.rect(4, 4, W - 8, H - 8, { fill: "none", stroke: c.accent, sw: 0.4, rx: 3 }) +
          k.rect(5.6, 5.6, W - 11.2, H - 11.2, { fill: "none", stroke: c.accent, sw: 0.15, rx: 2.2, op: 0.5 }) +
          k.text(cx, 23, v.title || L("freeWifi"), { size: 11, d: true, fill: c.strong, anchor: "middle", max: 88 }) +
          k.text(cx, 30, v.place, { size: 3.4, w: 700, fill: c.strong, anchor: "middle", ls: 0.6, upper: true, max: 88, op: 0.85 }) +
          k.path(`M${cx - 12} 34.5h9M${cx + 3} 34.5h9`, { stroke: c.strong, sw: 0.2 }) +
          k.circle(cx, 34.5, 0.8, { fill: c.strong }) +
          k.qrTile(21.5, 39.5, 62, { rx: 3.6, pad: 4 }) +
          k.text(cx, 112.5, `${L("networkL")}: ${v.ssid}`, { size: 4, d: true, fill: c.strong, anchor: "middle", max: 90 }) +
          (showPass(v) ? k.text(cx, 119, `${L("passwordL")}: ${v.password}`, { size: 4, d: true, fill: c.strong, anchor: "middle", max: 90 }) : "") +
          k.text(cx, 135.5, L("scanCam"), { size: 3, fill: c.strong, anchor: "middle", max: 88, op: 0.85 }),
        { bg: "#fbf5ec" },
      );
    },
  },
  {
    id: "minimal",
    name: "Minimal Bold",
    tag: "Big title, boxed details",
    accent: "#2563eb",
    hasQr: true,
    render(k) {
      const { c, v, L } = k;
      const box = (y, label, value) =>
        k.rect(9, y, 87, 15, { fill: c.tint, rx: 2.6 }) + k.text(13, y + 5.2, label, { size: 2.6, w: 700, fill: c.muted, ls: 0.3 }) + k.text(13, y + 11.5, value, { size: 5, w: 700, max: 80 });
      return k.svg(
        k.text(8.5, 25, v.title || L("wifiWord"), { size: 19, w: 800, d: true, ls: -0.4, max: 66 }) +
          wifiArcs(k, 86, 19, 11, c.accent, 1.8) +
          k.text(9.5, 32, v.place || L("join"), { size: 3.8, fill: c.muted, max: 88 }) +
          k.qr(24.5, 38, 56) +
          box(100, L("network"), v.ssid) +
          (showPass(v) ? box(118, L("password"), v.password) : ""),
      );
    },
  },
  {
    id: "neon",
    name: "Dark Neon",
    tag: "Lounges, gaming, co-working",
    accent: "#7b5cff",
    hasQr: true,
    render(k) {
      const { c, v, W, L } = k;
      const cx = W / 2;
      const pill = (y, label, value) =>
        k.rect(15, y, 75, 8.6, { fill: "#18223f", rx: 4.3 }) + k.text(20, y + 5.5, label, { size: 3, w: 700, fill: c.light, max: 24 }) + k.text(86, y + 5.5, value, { size: 3.4, w: 700, fill: "#ffffff", anchor: "end", max: 46 });
      return k.svg(
        wifiArcs(k, cx, 21, 13, k.grad([c.light, c.accent2]), 2.2) +
          k.text(cx, 38, v.title || L("connect"), { size: 7.2, w: 800, d: true, fill: "#ffffff", anchor: "middle", max: 92 }) +
          k.text(cx, 44, v.place, { size: 3.6, fill: "#a6b0c9", anchor: "middle", max: 92 }) +
          k.qrTile(21.5, 49.5, 62, { rx: 4, pad: 4, color: "#0b1020" }) +
          pill(117.5, L("networkL"), v.ssid) +
          (showPass(v) ? pill(128.5, L("passwordL"), v.password) : "") +
          k.text(cx, 143.5, L("point"), { size: 2.8, fill: "#6d7898", anchor: "middle", max: 92 }),
        { bg: "#0b1020" },
      );
    },
  },
];

export default {
  id: "wifi",
  label: "WiFi card",
  short: "WiFi",
  icon: "wifi",
  description: "A table or wall card that lets guests join your WiFi with one scan.",
  sizeMm: A6,
  sizeLabel: "A6 (10.5 × 14.8 cm)",
  sheet: { cols: 2, rows: 2 },
  tent: true,
  lang: true,
  accent: "#1d4ed8",
  accents: ["#1d4ed8", "#6b3f1d", "#2563eb", "#7b5cff", "#15803d", "#be123c", "#0f766e", "#111827"],
  sides: [{ id: "front", label: "Card" }],
  layouts: { front: LAYOUTS },
  fields: [
    { name: "title", label: "Heading (optional)", type: "text", placeholder: "Free WiFi", maxLength: 24, half: true },
    { name: "place", label: "Place name (optional)", type: "text", placeholder: "Chai Point Café", maxLength: 32, half: true },
    ...wifiType.fields.filter((f) => f.name !== "hidden"),
    { name: "showPassword", label: "Print the password on the card", type: "checkbox", showIf: (v) => v.encryption !== "nopass" },
  ],
  initialValues: { title: "", place: "", ssid: "", encryption: "WPA", password: "", showPassword: true },
  sample: { title: "", place: "Chai Point Café", ssid: "ChaiPoint_Guest", encryption: "WPA", password: "chai@2026", showPassword: true },
  validate: (v) => wifiType.validate({ ...v, hidden: false }),
  payload: (v) => wifiType.buildPayload({ ...v, hidden: false }),
  strings: {
    en: {
      freeWifi: "Free WiFi",
      wifiWord: "WiFi",
      connect: "Connect to WiFi",
      network: "NETWORK",
      password: "PASSWORD",
      networkL: "Network",
      passwordL: "Password",
      footer: "Point your phone camera at the code to connect",
      scanCam: "Scan with your camera to connect",
      join: "Scan and join in one tap",
      point: "Point camera · Tap join",
    },
    hi: {
      freeWifi: "फ्री वाई-फ़ाई",
      wifiWord: "वाई-फ़ाई",
      connect: "वाई-फ़ाई से जुड़ें",
      network: "नेटवर्क",
      password: "पासवर्ड",
      networkL: "नेटवर्क",
      passwordL: "पासवर्ड",
      footer: "फ़ोन कैमरा से स्कैन करें, वाई-फ़ाई अपने आप जुड़ जाएगा",
      scanCam: "कैमरा से स्कैन करके जुड़ें",
      join: "स्कैन करें और जुड़ जाएँ",
      point: "कैमरा दिखाएँ · जुड़ें",
    },
  },
};
