// UPI payment stand for a shop counter, A6 (105 × 148 mm).

import upiType from "../../../qr-types/upi.js";
import { mixColors } from "../../color.js";
import { diamonds } from "./common.js";

const money = (amount) => `₹${Number(amount).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

const LAYOUTS = [
  {
    id: "classic",
    name: "Classic",
    tag: "Scan & Pay header",
    accent: "#15803d",
    hasQr: true,
    render(k) {
      const { c, v, W, L } = k;
      const cx = W / 2;
      const y = v.amount ? 120 : 114.5;
      return k.svg(
        k.box(0, 0, W, 34, { fill: c.accent }) +
          k.text(cx, 17.5, L("scanPay"), { size: 9.2, w: 800, d: true, fill: c.on, anchor: "middle", max: 94 }) +
          k.text(cx, 27, v.shop || v.name, { size: 4.6, w: 700, fill: c.on, anchor: "middle", op: 0.9, max: 92 }) +
          k.qr(20.5, 39, 64) +
          (v.amount ? k.text(cx, 112, money(v.amount), { size: 8, w: 800, anchor: "middle" }) : "") +
          k.text(cx, y, `${L("upiId")}: ${v.upiId}`, { size: 3.6, w: 700, anchor: "middle", max: 94 }) +
          k.text(cx, y + 5.5, `${L("paysTo")} ${v.name}`, { size: 3.2, fill: c.muted, anchor: "middle", max: 94 }) +
          k.text(cx, 142.5, L("allApps"), { size: 3.2, w: 700, fill: c.strong, anchor: "middle", max: 94 }),
      );
    },
  },
  {
    id: "board",
    name: "Shop Board",
    tag: "Big shop name",
    accent: "#1d4ed8",
    hasQr: true,
    render(k) {
      const { c, v, W, L } = k;
      const cx = W / 2;
      const apps = ["GPay", "PhonePe", "Paytm", "BHIM"];
      return k.svg(
        k.box(0, 0, W, 26, { fill: c.accent }) +
          k.text(cx, 12.8, v.shop || v.name, { size: 6, w: 800, d: true, fill: c.on, anchor: "middle", max: 94 }) +
          k.text(cx, 19.5, v.shopTag, { size: 3.4, fill: c.on, anchor: "middle", op: 0.8, max: 94 }) +
          k.text(cx, 34.5, v.amount ? `${L("pay")} ${money(v.amount)}` : L("scanPay2"), { size: 5, w: 800, fill: c.strong, anchor: "middle", max: 96 }) +
          k.rect(21.5, 38.5, 62, 62, { fill: "#ffffff", stroke: c.accent, sw: 0.6, rx: 3 }) +
          k.qr(24.5, 41.5, 56) +
          k.text(cx, 109, v.upiId, { size: 3.8, w: 700, anchor: "middle", max: 96 }) +
          apps.map((s, i) => k.rect(9.5 + i * 22, 115, 20, 7, { fill: c.tint, rx: 3.5 }) + k.text(19.5 + i * 22, 119.6, s, { size: 3, w: 700, fill: c.strong, anchor: "middle" })).join("") +
          k.text(cx, 139.5, L("showScreen"), { size: 3.2, fill: c.muted, anchor: "middle", max: 96 }),
      );
    },
  },
  {
    id: "amount",
    name: "Fixed Amount",
    tag: "Bill amount already filled",
    accent: "#be123c",
    hasQr: true,
    render(k) {
      const { c, v, W, L } = k;
      const cx = W / 2;
      return k.svg(
        k.text(cx, 16.5, v.note || L("bill"), { size: 4, fill: c.muted, anchor: "middle", max: 94 }) +
          k.text(cx, 30, v.amount ? `${L("pay")} ${money(v.amount)}` : L("payNow"), { size: 12, w: 800, d: true, anchor: "middle", max: 94 }) +
          k.qr(22.5, 37, 60) +
          k.text(cx, 107, v.upiId, { size: 3.6, w: 700, anchor: "middle", max: 96 }) +
          k.text(cx, 113, v.amount ? L("amountFilled") : L("amountType"), { size: 3.2, fill: c.muted, anchor: "middle", max: 96 }) +
          k.path("M12 126H93", { stroke: "#e2e8f0", sw: 0.3, dash: "1.4 1.2" }) +
          k.text(cx, 138, L("thanks"), { size: 4.4, w: 800, fill: c.strong, anchor: "middle", max: 94 }),
      );
    },
  },
  {
    id: "festive",
    name: "Festive",
    tag: "Festivals, sweet shops",
    accent: "#f97316",
    font: "elegant",
    hasQr: true,
    render(k) {
      const { c, v, W, L } = k;
      const cx = W / 2;
      const bottom = c.isLight ? mixColors(c.accent, "#9f1239", 0.65) : mixColors(c.accent, "#000000", 0.35);
      const on = "#ffffff";
      return k.svg(
        k.text(cx, 15, v.shop || v.name, { size: 5.8, w: 800, fill: on, anchor: "middle", max: 94 }) +
          k.text(cx, 22, L("anyApp"), { size: 3.6, fill: on, anchor: "middle", op: 0.92, max: 94 }) +
          diamonds(k, 9.5, 96, 28.8, 1.2, 6, "#fde68a", 0.9) +
          k.rect(7, 34, 91, 98, { fill: "#fff8ee", rx: 4.4 }) +
          k.qr(22.5, 39, 60, { bg: "#fff8ee" }) +
          k.text(cx, 109, v.upiId, { size: 3.8, w: 700, fill: c.strong, anchor: "middle", max: 86 }) +
          k.text(cx, 115, v.name, { size: 3.2, fill: c.strong, anchor: "middle", op: 0.8, max: 86 }) +
          (v.amount ? k.text(cx, 125, money(v.amount), { size: 6, w: 800, fill: c.strong, anchor: "middle" }) : "") +
          k.text(cx, 142, L("dhanyavaad"), { size: 5.6, d: true, fill: on, anchor: "middle", max: 94 }),
        { bg: k.grad([c.isLight ? mixColors(c.accent, "#000000", 0.05) : c.accent, bottom], { angle: 180 }) },
      );
    },
  },
];

export default {
  id: "upi",
  label: "UPI payment stand",
  short: "UPI stand",
  icon: "rupee",
  description: "A counter card for your shop. Works with GPay, PhonePe, Paytm, BHIM and every UPI app.",
  sizeMm: [105, 148],
  sizeLabel: "A6 (10.5 × 14.8 cm)",
  sheet: { cols: 2, rows: 2 },
  tent: true,
  lang: true,
  accent: "#15803d",
  accents: ["#15803d", "#1d4ed8", "#be123c", "#f97316", "#6d28d9", "#0f766e", "#111827", "#c2410c"],
  sides: [{ id: "front", label: "Card" }],
  layouts: { front: LAYOUTS },
  fields: [
    { name: "shop", label: "Shop or business name", type: "text", placeholder: "Sharma General Store", maxLength: 36, half: true },
    { name: "shopTag", label: "What you sell (optional)", type: "text", placeholder: "Kirana · Dairy · Snacks", maxLength: 40, half: true },
    ...upiType.fields,
  ],
  initialValues: { shop: "", shopTag: "", ...upiType.initialValues },
  sample: { shop: "Sharma General Store", shopTag: "Kirana · Dairy · Snacks", upiId: "sharmastore@okhdfcbank", name: "Sharma General Store", amount: "", note: "" },
  validate: upiType.validate,
  payload: upiType.buildPayload,
  strings: {
    en: {
      scanPay: "SCAN & PAY",
      upiId: "UPI ID",
      paysTo: "Pays to",
      allApps: "Accepted on all UPI apps",
      scanPay2: "Scan & pay with any UPI app",
      pay: "Pay",
      showScreen: "Please show the payment screen",
      bill: "Your bill",
      payNow: "Scan to pay",
      amountFilled: "Amount is already filled, just enter your PIN",
      amountType: "Enter the amount in your UPI app",
      thanks: "Thank you! Visit again",
      anyApp: "Pay with any UPI app",
      dhanyavaad: "Thank you!",
    },
    hi: {
      scanPay: "स्कैन करें, पे करें",
      upiId: "UPI ID",
      paysTo: "पेमेंट जाएगा:",
      allApps: "सभी UPI ऐप से पेमेंट करें",
      scanPay2: "स्कैन करें, पेमेंट करें",
      pay: "पे करें",
      showScreen: "पेमेंट के बाद स्क्रीन दिखाएँ",
      bill: "आपका बिल",
      payNow: "स्कैन करके पे करें",
      amountFilled: "रकम पहले से भरी है, बस PIN डालें",
      amountType: "UPI ऐप में रकम डालें",
      thanks: "धन्यवाद! फिर आइए",
      anyApp: "किसी भी UPI ऐप से पे करें",
      dhanyavaad: "धन्यवाद!",
    },
  },
};
