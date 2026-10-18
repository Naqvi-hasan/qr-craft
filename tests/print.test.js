// Tests for the Print Studio: products, layouts, sheets, bulk, records, plus Event QR and Gate check.

import { test } from "node:test";
import assert from "node:assert/strict";
import { PRODUCTS, PRODUCT_MAP } from "../src/lib/print/products/index.js";
import { activeSides, bulkItems, defaultState, getSheet, getSize, layoutsFor, normalizeState, previewValues, renderItem, renderSide, sheetLayout, NO_SIDE } from "../src/lib/print/engine.js";
import { makeTheme } from "../src/lib/print/theme.js";
import { createKit, withBleed, wrapText } from "../src/lib/print/kit.js";
import { codesForRange, csvRows, listRows, numberRows, parseCsv } from "../src/lib/print/bulk.js";
import { createPrintRecord, sanitizePrintRecord, sanitizeState } from "../src/lib/print/record.js";
import { ticketCode } from "../src/lib/print/products/wristband.js";
import { contrastRatio } from "../src/lib/color.js";
import eventType from "../src/qr-types/event.js";
import { parseQrText } from "../src/lib/scan/parse.js";
import { checkTicket, emptyGate, gateCsv, gateStats, parseTicketList, sanitizeGate } from "../src/lib/scan/gate.js";
import { makeBackup, parseBackup } from "../src/lib/library/model.js";

const isSvg = (s) => typeof s === "string" && s.startsWith("<svg") && s.endsWith("</svg>");

test("every product: sample is valid, every layout renders, QR layouts carry the payload", () => {
  for (const p of PRODUCTS) {
    assert.deepEqual(p.validate(p.sample), {}, `${p.id} sample should be valid`);
    for (const key of Object.keys(p.initialValues)) assert.ok(key in p.sample, `${p.id} sample has ${key}`);
    const { values, qrValues, isSample } = previewValues(p, p.initialValues);
    assert.equal(isSample, true, `${p.id} starts with sample values`);
    for (const side of p.sides) {
      for (const layout of p.layouts[side.id] ?? []) {
        const state = { ...defaultState(p), qrSide: layout.hasQr ? side.id : side.id === "front" ? "back" : "front" };
        state.layouts = { ...state.layouts, [side.id]: layout.id };
        const r = renderSide(p, state, side.id, values, qrValues);
        assert.ok(isSvg(r.svg), `${p.id}/${layout.id} is an SVG`);
        const [w, h] = getSize(p, values);
        assert.match(r.svg, new RegExp(`viewBox="0 0 ${w} ${h}"`), `${p.id}/${layout.id} uses paper size`);
        if (layout.hasQr) {
          assert.ok(r.payload, `${p.id}/${layout.id} has a payload`);
          assert.ok(r.qrBox && r.qrBox.size >= 15, `${p.id}/${layout.id} QR is at least 15 mm (${r.qrBox?.size})`);
          assert.ok((r.svg.match(/<svg/g) ?? []).length === 2, `${p.id}/${layout.id} nests one QR`);
        } else {
          assert.equal(r.payload, null);
        }
      }
    }
  }
});

test("user text is escaped in every layout", () => {
  const evil = '<script>alert("x")</script>';
  for (const p of PRODUCTS) {
    const values = { ...p.sample };
    for (const f of p.fields) if (f.type === "text" && !["number", "digits", "date", "time"].includes(f.name)) values[f.name] = evil;
    for (const side of p.sides) {
      for (const layout of p.layouts[side.id] ?? []) {
        const state = { ...defaultState(p), qrSide: layout.hasQr ? side.id : "back" };
        state.layouts = { ...state.layouts, [side.id]: layout.id };
        const svg = renderSide(p, state, side.id, values, p.sample).svg;
        assert.ok(!svg.includes("<script>"), `${p.id}/${layout.id} escapes text`);
      }
    }
  }
});

test("Hindi strings cover every English string", () => {
  for (const p of PRODUCTS.filter((x) => x.lang)) {
    for (const key of Object.keys(p.strings.en)) assert.ok(p.strings.hi[key], `${p.id} has Hindi for ${key}`);
  }
});

test("business card: QR placement filters layouts and keeps a QR side", () => {
  const p = PRODUCT_MAP.business;
  const fronts = layoutsFor(p, "front", { qrSide: "front" });
  assert.ok(fronts.length >= 6 && fronts.every((l) => l.hasQr));
  assert.ok(layoutsFor(p, "back", { qrSide: "front" }).every((l) => !l.hasQr));
  assert.ok(layoutsFor(p, "front", { qrSide: "back" }).every((l) => !l.hasQr));
  let state = normalizeState(p, { ...defaultState(p), qrSide: "front" });
  assert.ok(p.layouts.front.find((l) => l.id === state.layouts.front).hasQr);
  // QR on the back: the back can't be switched off.
  state = normalizeState(p, { ...defaultState(p), qrSide: "back", layouts: { front: "classic", back: NO_SIDE } });
  assert.notEqual(state.layouts.back, NO_SIDE);
  // QR on the front: a one-sided card is fine.
  state = normalizeState(p, { ...defaultState(p), qrSide: "front", layouts: { front: "qr-classic", back: NO_SIDE } });
  assert.equal(state.layouts.back, NO_SIDE);
  assert.deepEqual(activeSides(p, state).map((s) => s.id), ["front"]);
  const both = renderItem(p, normalizeState(p, { ...defaultState(p), qrSide: "back" }), p.sample);
  assert.ok(isSvg(both.front.svg) && isSvg(both.back.svg) && both.back.payload.startsWith("BEGIN:VCARD"));
});

test("hidden details are not printed but stay in the QR", () => {
  const p = PRODUCT_MAP.business;
  const state = { ...defaultState(p), show: { phone: false, email: true, website: true, address: true } };
  const r = renderSide(p, { ...state, qrSide: "front", layouts: { front: "qr-classic", back: NO_SIDE } }, "front", p.sample, p.sample);
  assert.ok(!r.svg.includes("98765 43210"));
  assert.match(r.payload, /TEL;TYPE=CELL:\+919876543210/);
});

test("print sheets fit on A4", () => {
  for (const p of PRODUCTS) {
    const sheet = getSheet(p, p.sample);
    if (!sheet) continue;
    const size = getSize(p, p.sample);
    const { slots, scale, pageW, pageH } = sheetLayout(size, sheet);
    assert.ok(slots.length >= 1, p.id);
    for (const s of slots) assert.ok(s.x >= 0 && s.y >= 0 && s.x + s.w <= pageW + 0.01 && s.y + s.h <= pageH + 0.01, `${p.id} fits A4`);
    assert.ok(scale > 0.85, `${p.id} isn't shrunk too much (${scale})`);
  }
  for (const id of ["business", "wristband", "invitation", "badge"]) assert.equal(sheetLayout(getSize(PRODUCT_MAP[id], {}), PRODUCT_MAP[id].sheet).scale, 1, `${id} prints at true size`);
  const sticker = PRODUCT_MAP.sticker;
  assert.equal(sheetLayout(getSize(sticker, { size: "25" }), getSheet(sticker, { size: "25" })).slots.length, 54);
});

test("theme keeps text readable for any accent", () => {
  for (const accent of ["#ffffff", "#facc15", "#1d4ed8", "#000000", "#c9a227", "#99f6e4", "#be123c"]) {
    const t = makeTheme(accent);
    assert.ok(contrastRatio(t.on, t.accent) >= 3.5, `on ${accent}`);
    assert.ok(contrastRatio(t.strong, "#ffffff") >= 4, `strong ${accent}`);
    assert.ok(contrastRatio(t.light, "#0c0c0c") >= 5.5, `light ${accent}`);
  }
  assert.equal(makeTheme("not a colour").accent, "#1d4ed8");
});

test("kit: wrapping, bleed and unsafe images", () => {
  assert.deepEqual(wrapText("one two three four", 17, 3), ["one two", "three four"]);
  assert.equal(wrapText("a b c d e f g h i j", 2, 3, undefined, false, 2).length, 2);
  const k = createKit({ W: 89, H: 51, theme: makeTheme("#1d4ed8"), font: "modern", images: { logo: "javascript:alert(1)" } });
  assert.equal(k.logo, null);
  assert.match(k.box(0, 0, 10, 51, { fill: "red" }), /x="-3" y="-3" width="13" height="57"/);
  const svg = k.svg(k.text(5, 5, "Hi"));
  assert.match(withBleed(svg, 89, 51), /viewBox="-3 -3 95 57" width="950" height="570"/);
});

test("bulk: CSV, lists and numbers", () => {
  assert.deepEqual(parseCsv('a,b\n"x, y","say ""hi"""\n\n1,2'), [["a", "b"], ["x, y", 'say "hi"'], ["1", "2"]]);
  assert.deepEqual(parseCsv("a;b\n1;2"), [["a", "b"], ["1", "2"]]);
  const biz = PRODUCT_MAP.business;
  const { rows, ignored } = csvRows(biz, "First name,Last name,Mobile,Shoe size\nAsha,Sharma,+91 98765 43210,7\nRavi,,9123456789,8");
  assert.deepEqual(rows[0], { firstName: "Asha", lastName: "Sharma", phone: "+91 98765 43210" });
  assert.equal(rows[1].lastName, "");
  assert.deepEqual(ignored, ["Shoe size"]);
  const { items, problems } = bulkItems(biz, biz.sample, [...rows, { firstName: "" }]);
  assert.equal(items.length, 2);
  assert.equal(problems[0].row, 3);
  assert.equal(listRows("A\n\n B \nC", "guest").rows.length, 3);
  assert.deepEqual(numberRows("98", "3").rows.map((r) => r.number), ["98", "99", "100"]);
  assert.equal(numberRows("1", "5000", 1000).rows.length, 1000);
  assert.deepEqual(codesForRange("NN-", 9, 2, 3), ["NN-009", "NN-010"]);
  assert.equal(ticketCode("NN-", "7", "5"), "NN-00007");
});

test("wristband: ticket, kids and link payloads", () => {
  const p = PRODUCT_MAP.wristband;
  assert.equal(p.payload({ ...p.sample, purpose: "ticket", prefix: "NN-", number: "12", digits: "4" }), "NN-0012");
  assert.equal(p.payload({ ...p.sample, purpose: "kids", phone: "+91 98765 43210" }), "tel:+919876543210");
  assert.equal(p.payload({ ...p.sample, purpose: "link", url: "example.com/x" }), "https://example.com/x");
  assert.ok(p.validate({ ...p.sample, purpose: "ticket", number: "abc" }).number);
});

test("invitation: QR modes", () => {
  const p = PRODUCT_MAP.invitation;
  assert.equal(p.payload({ ...p.sample, qrMode: "location" }), "https://maps.google.com/?q=Taj%20Lands%20End%2C%20Mumbai");
  assert.match(p.payload({ ...p.sample, qrMode: "rsvp" }), /^https:\/\/wa\.me\/919876543210\?text=/);
  const cal = p.payload({ ...p.sample, qrMode: "calendar" });
  assert.match(cal, /DTSTART:20261121T190000/);
  assert.match(cal, /LOCATION:Taj Lands End\\, Mumbai/);
});

test("event QR type", () => {
  const timed = eventType.buildPayload({ title: "Launch; party", startDate: "2026-12-03", startTime: "18:30", endDate: "", endTime: "", location: "BKC, Mumbai", description: "" });
  assert.match(timed, /^BEGIN:VEVENT\nSUMMARY:Launch\\; party\nDTSTART:20261203T183000\nDTEND:20261203T193000\nLOCATION:BKC\\, Mumbai\nEND:VEVENT$/);
  const allDay = eventType.buildPayload({ title: "Holi", startDate: "2026-03-04", startTime: "" });
  assert.match(allDay, /DTSTART;VALUE=DATE:20260304\nDTEND;VALUE=DATE:20260305/);
  const late = eventType.buildPayload({ title: "x", startDate: "2026-12-31", startTime: "23:30" });
  assert.match(late, /DTEND:20270101T003000/);
  assert.ok(eventType.validate({ title: "x", startDate: "2026-12-03", startTime: "18:00", endTime: "17:00" }).endTime);
  assert.ok(eventType.validate({ title: "", startDate: "" }).title);
  const scanned = parseQrText(timed);
  assert.equal(scanned.kind, "event");
  assert.equal(scanned.prefill.values.startTime, "18:30");
  assert.equal(scanned.fields[0].value, "Launch; party");
});

test("gate check", () => {
  let gate = { ...emptyGate(), codes: parseTicketList("code\nnn-001\nNN-002, extra\n\nNN-001\n\"NN-003\"") };
  assert.deepEqual(gate.codes, ["NN-001", "NN-002", "NN-003"]);
  let r = checkTicket(gate, "nn-001", 1000);
  assert.equal(r.status, "valid");
  gate = r.gate;
  r = checkTicket(gate, "TICKET:NN-001", 2000);
  assert.equal(r.status, "used");
  assert.equal(r.usedAt, 1000);
  assert.equal(checkTicket(gate, "https://example.com/t/NN-002").status, "valid");
  assert.equal(checkTicket(gate, "NN-999").status, "unknown");
  assert.equal(checkTicket(emptyGate(), "x").status, "empty");
  assert.deepEqual(gateStats(gate), { total: 3, checkedIn: 1 });
  assert.match(gateCsv(gate), /^code,checked_in,checked_in_at\nNN-001,yes,1970/);
  assert.deepEqual(sanitizeGate({ codes: ["a", 5], used: { a: "x", b: 5 }, log: [{ code: "a", status: "bad", at: 1 }] }), { event: "", codes: ["A"], used: { B: 5 }, log: [] });
});

test("saved print designs are cleaned and back up with QR designs", () => {
  const p = PRODUCT_MAP.wifi;
  const state = sanitizeState(p, { values: { ssid: "Home", evil: "x", password: 5 }, layouts: { front: "nope" }, accent: "red", font: "comic", qrShape: "dots", lang: "hi", images: { logo: "javascript:x" } });
  assert.equal(state.values.ssid, "Home");
  assert.ok(!("evil" in state.values));
  assert.equal(state.values.password, "");
  assert.equal(state.layouts.front, p.layouts.front[0].id);
  assert.equal(state.accent, null);
  assert.equal(state.font, null);
  assert.equal(state.qrShape, "dots");
  assert.equal(state.lang, "hi");
  assert.equal(state.images.logo, null);
  const record = createPrintRecord({ name: "  My   card ", product: p, state });
  assert.equal(record.name, "My card");
  const { prints } = parseBackup(makeBackup([], [record, { productId: "nope" }]));
  const clean = prints.map(sanitizePrintRecord).filter(Boolean);
  assert.equal(clean.length, 1);
  assert.equal(clean[0].state.values.ssid, "Home");
  // Old (version 1) backups still restore.
  assert.deepEqual(parseBackup(JSON.stringify({ kind: "qrcraft-library", version: 1, designs: [] })).prints, []);
});
