// Run with: npm test
// These check that every QR type builds the exact text format phones understand.

import { test } from "node:test";
import assert from "node:assert/strict";
import { buildQr, QR_TYPES, getQrType } from "../src/qr-types/index.js";
import { checkCapacity } from "../src/lib/capacity.js";
import { getColorWarning } from "../src/lib/color.js";
import { getEffectiveEcLevel } from "../src/lib/qr/style.js";
import { DEFAULT_STYLE } from "../src/config/qrStyle.js";

const ok = (typeId, values) => {
  const result = buildQr(typeId, { ...getQrType(typeId).initialValues, ...values });
  assert.deepEqual(result.errors, {}, `expected no errors for ${typeId}`);
  return result.payload;
};
const errs = (typeId, values) => buildQr(typeId, { ...getQrType(typeId).initialValues, ...values }).errors;

test("every type has the required shape and unique id", () => {
  const ids = new Set();
  for (const t of QR_TYPES) {
    for (const key of ["id", "label", "icon", "title", "fields", "initialValues", "validate", "buildPayload"]) {
      assert.ok(t[key] !== undefined, `${t.id} is missing ${key}`);
    }
    assert.ok(!ids.has(t.id), `duplicate id ${t.id}`);
    ids.add(t.id);
    for (const f of t.fields) assert.ok(f.name in t.initialValues, `${t.id}.${f.name} has no initial value`);
  }
});

test("empty forms are invalid and produce no payload", () => {
  for (const t of QR_TYPES) {
    const result = buildQr(t.id, t.initialValues);
    assert.equal(result.payload, null, `${t.id} should need input`);
  }
});

test("url", () => {
  assert.equal(ok("url", { url: "google.com" }), "https://google.com");
  assert.equal(ok("url", { url: "http://example.com/a?b=1" }), "http://example.com/a?b=1");
  assert.ok(errs("url", { url: "not a url" }).url);
  assert.ok(errs("url", { url: "javascript:alert(1)" }).url);
});

test("text", () => {
  assert.equal(ok("text", { text: "Hello\nWorld" }), "Hello\nWorld");
});

test("phone", () => {
  assert.equal(ok("phone", { phone: "+91 98765-43210" }), "tel:+919876543210");
  assert.ok(errs("phone", { phone: "12ab" }).phone);
  assert.ok(errs("phone", { phone: "123" }).phone);
});

test("sms", () => {
  assert.equal(ok("sms", { phone: "+91 98765 43210", message: "Hi: there" }), "SMSTO:+919876543210:Hi: there");
  assert.equal(ok("sms", { phone: "9876543210" }), "SMSTO:9876543210:");
});

test("whatsapp", () => {
  assert.equal(ok("whatsapp", { phone: "+91 98765 43210", message: "Hello there!" }), "https://wa.me/919876543210?text=Hello%20there!");
  assert.equal(ok("whatsapp", { phone: "+919876543210" }), "https://wa.me/919876543210");
});

test("email", () => {
  assert.equal(ok("email", { to: "a@b.com" }), "mailto:a@b.com");
  assert.equal(ok("email", { to: "a@b.com", subject: "Hi & bye", body: "Line 1\nLine 2" }), "mailto:a@b.com?subject=Hi%20%26%20bye&body=Line%201%0ALine%202");
  assert.ok(errs("email", { to: "a@b" }).to);
});

test("contact (vCard)", () => {
  const payload = ok("contact", { firstName: "Asha", lastName: "Sharma", phone: "+91 98765 43210", email: "asha@x.com", company: "Acme, Inc; Ltd", website: "asha.dev" });
  assert.equal(
    payload,
    [
      "BEGIN:VCARD",
      "VERSION:3.0",
      "N:Sharma;Asha;;;",
      "FN:Asha Sharma",
      "ORG:Acme\\, Inc\\; Ltd",
      "TEL;TYPE=CELL:+919876543210",
      "EMAIL:asha@x.com",
      "URL:https://asha.dev",
      "END:VCARD",
    ].join("\n")
  );
  assert.ok(errs("contact", { firstName: "A", email: "bad" }).email);
});

test("wifi", () => {
  assert.equal(ok("wifi", { ssid: "Home", password: "p;a:ss" }), "WIFI:T:WPA;S:Home;P:p\\;a\\:ss;;");
  assert.equal(ok("wifi", { ssid: "Cafe", encryption: "nopass" }), "WIFI:T:nopass;S:Cafe;;");
  assert.equal(ok("wifi", { ssid: "Secret", password: "x", hidden: true }), "WIFI:T:WPA;S:Secret;P:x;H:true;;");
  assert.ok(errs("wifi", { ssid: "Home" }).password);
});

test("location", () => {
  assert.equal(ok("location", { address: "Gateway of India, Mumbai" }), "https://www.google.com/maps/search/?api=1&query=Gateway%20of%20India%2C%20Mumbai");
  assert.equal(ok("location", { mode: "coords", lat: "18.922", lng: "72.8347" }), "https://www.google.com/maps/search/?api=1&query=18.922,72.8347");
  assert.ok(errs("location", { mode: "coords", lat: "100", lng: "0" }).lat);
});

test("upi", () => {
  assert.equal(ok("upi", { upiId: "asha@okhdfcbank", name: "Asha Sharma" }), "upi://pay?pa=asha%40okhdfcbank&pn=Asha%20Sharma&cu=INR");
  assert.equal(
    ok("upi", { upiId: "shop@ybl", name: "My Shop", amount: "250", note: "Order 12" }),
    "upi://pay?pa=shop%40ybl&pn=My%20Shop&am=250.00&cu=INR&tn=Order%2012"
  );
  assert.ok(errs("upi", { upiId: "nope", name: "A" }).upiId);
  assert.ok(errs("upi", { upiId: "a@ybl", name: "A", amount: "10.555" }).amount);
});

test("app", () => {
  assert.equal(ok("app", { link: "com.whatsapp" }), "https://play.google.com/store/apps/details?id=com.whatsapp");
  assert.equal(ok("app", { store: "appstore", link: "https://apps.apple.com/in/app/id310633997" }), "https://apps.apple.com/in/app/id310633997");
  assert.ok(errs("app", { store: "appstore", link: "https://example.com/app" }).link);
});

test("social", () => {
  assert.equal(ok("social", { username: "@asha.dev" }), "https://instagram.com/asha.dev");
  assert.equal(ok("social", { platform: "linkedin", username: "https://www.linkedin.com/in/asha-s/" }), "https://www.linkedin.com/in/asha-s");
  assert.equal(ok("social", { platform: "youtube", username: "asha" }), "https://www.youtube.com/@asha");
});

test("pdf", () => {
  assert.equal(ok("pdf", { url: "https://drive.google.com/file/d/abc/view" }), "https://drive.google.com/file/d/abc/view");
});

test("capacity limit depends on error correction", () => {
  const big = "a".repeat(2000);
  assert.equal(checkCapacity(big, "L"), null);
  assert.ok(checkCapacity(big, "H"));
  assert.ok(buildQr("text", { text: big }, "H").errors._form);
});

test("colour contrast warnings", () => {
  assert.equal(getColorWarning("#000000", "#ffffff"), null);
  assert.ok(getColorWarning("#ffffff", "#000000")); // inverted
  assert.ok(getColorWarning("#bbbbbb", "#ffffff")); // too light
});

test("logo or picture art forces high error correction", () => {
  assert.equal(getEffectiveEcLevel(DEFAULT_STYLE), "M");
  assert.equal(getEffectiveEcLevel({ ...DEFAULT_STYLE, logo: { ...DEFAULT_STYLE.logo, src: "data:image/png;base64,xx" } }), "H");
  assert.equal(getEffectiveEcLevel({ ...DEFAULT_STYLE, art: { ...DEFAULT_STYLE.art, shape: "heart" } }), "H");
  // Monogram with no letters is "off"
  assert.equal(getEffectiveEcLevel({ ...DEFAULT_STYLE, art: { ...DEFAULT_STYLE.art, shape: "monogram", text: " " } }), "M");
});
