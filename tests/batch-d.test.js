// Tests for the scanner parser, library model, SEO config and printable cards.

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseQrText } from "../src/lib/scan/parse.js";
import { buildQr } from "../src/qr-types/index.js";
import { createRecord, duplicateRecord, makeBackup, parseBackup, sanitizeRecord, searchRecords, cleanName } from "../src/lib/library/model.js";
import { DEFAULT_STYLE } from "../src/config/qrStyle.js";
import { SEO_PAGES } from "../src/config/seo.js";
import { QR_TYPE_MAP, QR_TYPES } from "../src/qr-types/index.js";
import { CARD_TYPES, sheetLayout, nestSvg } from "../src/lib/cards/cards.js";
import { renderQrSvg } from "../src/lib/qr/render.js";

// Round trip: what the Studio encodes, the scanner understands and can prefill back.
function roundTrip(typeId, values) {
  const { payload, errors } = buildQr(typeId, { ...QR_TYPE_MAP[typeId].initialValues, ...values });
  assert.deepEqual(errors, {});
  const parsed = parseQrText(payload);
  assert.equal(parsed.prefill?.typeId, typeId, `prefill type for ${typeId}`);
  const again = buildQr(typeId, { ...QR_TYPE_MAP[typeId].initialValues, ...parsed.prefill.values });
  assert.equal(again.payload, payload, `${typeId} survives scan -> edit -> encode`);
  return parsed;
}

test("scanner round-trips every editable QR type", () => {
  roundTrip("url", { url: "https://example.com/a?b=1" });
  roundTrip("text", { text: "Hello, दुनिया ✓" });
  roundTrip("phone", { phone: "+91 98765 43210" });
  roundTrip("sms", { phone: "+919876543210", message: "Book: table for 2" });
  roundTrip("whatsapp", { phone: "+919876543210", message: "Hi there & hello" });
  roundTrip("email", { to: "a@b.com", subject: "Hi & bye", body: "Line 1\nLine 2" });
  roundTrip("wifi", { ssid: "Café;Guest", password: "p:a;ss\\word", encryption: "WPA", hidden: true });
  roundTrip("wifi", { ssid: "Open", encryption: "nopass" });
  roundTrip("contact", { firstName: "Asha", lastName: "Sharma", phone: "+919876543210", email: "asha@x.com", company: "Acme, Inc; Ltd", jobTitle: "Lead", website: "https://asha.dev", address: "Andheri, Mumbai" });
  roundTrip("upi", { upiId: "shop@ybl", name: "My Shop", amount: "250", note: "Order 12" });
});

test("scanner shows readable fields and safe actions", () => {
  const wifi = parseQrText("WIFI:T:WPA;S:Home;P:secret;;");
  assert.equal(wifi.kind, "wifi");
  assert.ok(wifi.fields.find((f) => f.label === "Password").secret);
  assert.equal(wifi.action, null, "WiFi has nothing to open");
  const upi = parseQrText("upi://pay?pa=shop%40ybl&pn=My%20Shop&am=10.00&cu=INR");
  assert.equal(upi.fields.find((f) => f.label === "UPI ID").value, "shop@ybl");
  assert.ok(upi.warnings.length > 0);
  const geo = parseQrText("geo:19.07,72.87");
  assert.equal(geo.kind, "location");
  assert.ok(geo.action.href.startsWith("https://www.google.com/maps"));
});

test("scanner warns about risky links and never makes scripts clickable", () => {
  assert.equal(parseQrText("javascript:alert(1)").action, null);
  assert.equal(parseQrText("  data:text/html,<script>x</script>").kind, "unsafe");
  assert.ok(parseQrText("http://example.com").warnings.some((w) => w.includes("Not encrypted")));
  assert.ok(parseQrText("https://bit.ly/abc").warnings.some((w) => w.includes("Short link")));
  assert.ok(parseQrText("https://192.168.1.1/login").warnings.some((w) => w.includes("IP address")));
  assert.ok(parseQrText("https://xn--pple-43d.com").warnings.some((w) => w.includes("imitate")));
  assert.ok(parseQrText("https://google.com@evil.example").warnings.some((w) => w.includes("phishing")));
  assert.deepEqual(parseQrText("https://example.com").warnings, []);
  const app = parseQrText("intent://scan/#Intent;end");
  assert.equal(app.kind, "text");
  assert.equal(app.action, null);
});

test("library records: create, duplicate, search, backup and restore", () => {
  const a = createRecord({ name: "  Café   menu  ", typeId: "url", values: { url: "x.com" }, style: DEFAULT_STYLE, payload: "https://x.com" }, 1000);
  assert.equal(a.name, "Café menu");
  const b = duplicateRecord(a, 2000);
  assert.notEqual(b.id, a.id);
  assert.equal(b.name, "Copy of Café menu");
  assert.deepEqual(searchRecords([a, b], "").map((r) => r.id), [b.id, a.id]);
  assert.equal(searchRecords([a, b], "copy").length, 1);
  const { records, skipped } = parseBackup(makeBackup([a, b, { typeId: "nope" }]));
  assert.equal(records.length, 2);
  assert.equal(skipped, 1);
  assert.throws(() => parseBackup("{}"), /isn't a QR Craft backup/);
  assert.throws(() => parseBackup("not json"), /isn't a QR Craft backup/);
  assert.equal(cleanName(""), "Untitled QR");
});

test("imported records are cleaned", () => {
  const rec = sanitizeRecord({ typeId: "wifi", name: "x".repeat(200), values: { ssid: "Home", password: { evil: true }, extra: "drop me" }, style: { dots: { color: "#000000" } } });
  assert.equal(rec.name.length, 60);
  assert.equal(rec.values.password, "");
  assert.ok(!("extra" in rec.values));
  assert.equal(rec.style.dots.color, "#000000");
  assert.equal(rec.style.eyes.outer, DEFAULT_STYLE.eyes.outer);
  assert.equal(sanitizeRecord(null), null);
});

test("SEO pages: one per QR type, unique slugs, sensible lengths", () => {
  assert.equal(SEO_PAGES.length, QR_TYPES.length);
  const slugs = new Set();
  for (const p of SEO_PAGES) {
    assert.ok(QR_TYPE_MAP[p.typeId], p.slug);
    assert.ok(!slugs.has(p.slug));
    slugs.add(p.slug);
    assert.match(p.slug, /^[a-z-]+-qr-code-generator$/);
    assert.ok(p.metaTitle.length <= 62, `${p.slug} title ${p.metaTitle.length}`);
    assert.ok(p.metaDescription.length <= 160, `${p.slug} description ${p.metaDescription.length}`);
    assert.equal(p.steps.length, 3);
    assert.ok(p.faqs.length >= 3);
  }
});

test("cards render, escape text and fit the print sheet", () => {
  const n = 25;
  const qr = renderQrSvg({ matrix: { size: n, isDark: (r, c) => (r + c) % 3 === 0 }, style: DEFAULT_STYLE, width: 512 }).svg;
  const nested = nestSvg(qr, 10, 20, 30);
  assert.match(nested, /^<svg[^>]* x="10" y="20" width="30" height="30"/);
  for (const card of CARD_TYPES) {
    const values = { ...card.initialValues, ssid: "Home<script>", password: "pw", firstName: "Asha & Co", upiId: "a@ybl", name: "Asha", shop: "Shop" };
    const svg = card.render({ values, qrSvg: qr, accent: "#1d4ed8" });
    assert.ok(svg.startsWith("<svg") && svg.endsWith("</svg>"), card.id);
    assert.ok(!svg.includes("<script>"), `${card.id} escapes text`);
    assert.match(svg, new RegExp(`viewBox="0 0 ${card.sizeMm[0]} ${card.sizeMm[1]}"`));
    const { slots, scale } = sheetLayout(card);
    assert.equal(slots.length, card.sheet.cols * card.sheet.rows);
    for (const s of slots) assert.ok(s.x >= 0 && s.y >= 0 && s.x + s.w <= 210.01 && s.y + s.h <= 297.01, `${card.id} fits A4`);
    assert.ok(scale > 0.85, `${card.id} is not shrunk too much (${scale})`);
  }
  assert.equal(sheetLayout(CARD_TYPES.find((c) => c.id === "business")).scale, 1, "business cards print at true size");
});
