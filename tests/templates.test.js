// Checks every theme and template: valid QR type, and colours dark enough to scan.

import { test } from "node:test";
import assert from "node:assert/strict";
import { TEMPLATES, TEMPLATE_CATEGORIES } from "../src/config/templates.js";
import { THEMES } from "../src/config/themes.js";
import { DEFAULT_STYLE } from "../src/config/qrStyle.js";
import { applyPreset, applyTheme, deepMerge, getStyleWarnings, setIn, getIn } from "../src/lib/qr/style.js";
import { QR_TYPE_MAP } from "../src/qr-types/index.js";

test("templates have unique ids, known categories and real QR types", () => {
  const ids = new Set();
  const categories = new Set(TEMPLATE_CATEGORIES.map((c) => c.id));
  for (const t of TEMPLATES) {
    assert.ok(!ids.has(t.id), `duplicate ${t.id}`);
    ids.add(t.id);
    assert.ok(categories.has(t.category), `${t.id} category`);
    assert.ok(QR_TYPE_MAP[t.typeId], `${t.id} type`);
    assert.ok(t.name && t.description, `${t.id} text`);
  }
});

test("every template and theme passes the colour checks", () => {
  for (const t of TEMPLATES) {
    assert.deepEqual(getStyleWarnings(applyPreset(DEFAULT_STYLE, t.style)), [], `template ${t.id}`);
  }
  for (const th of THEMES) {
    assert.deepEqual(getStyleWarnings(applyTheme(DEFAULT_STYLE, th.style)), [], `theme ${th.id}`);
  }
});

test("applyPreset keeps the user's logo, applyTheme keeps frame text and art shape", () => {
  const mine = setIn(setIn(setIn(DEFAULT_STYLE, "logo.src", "data:image/png;base64,AA=="), "frame.text", "Hello"), "art.shape", "star");
  assert.equal(applyPreset(mine, TEMPLATES[0].style).logo.src, "data:image/png;base64,AA==");
  const themed = applyTheme(mine, THEMES[2].style);
  assert.equal(themed.frame.text, "Hello");
  assert.equal(themed.art.shape, "star");
});

test("setIn / getIn / deepMerge do not mutate", () => {
  const next = setIn(DEFAULT_STYLE, "dots.gradient.from", "#000000");
  assert.equal(getIn(next, "dots.gradient.from"), "#000000");
  assert.equal(DEFAULT_STYLE.dots.gradient.from, "#4f46e5");
  const merged = deepMerge(DEFAULT_STYLE, { dots: { color: "#123456" } });
  assert.equal(merged.dots.shape, DEFAULT_STYLE.dots.shape);
  assert.equal(DEFAULT_STYLE.dots.color, "#111827");
});

test("warnings catch risky designs", () => {
  assert.ok(getStyleWarnings(setIn(DEFAULT_STYLE, "dots.color", "#dddddd")).length > 0);
  assert.ok(getStyleWarnings(setIn(DEFAULT_STYLE, "background.transparent", true)).length > 0);
  assert.ok(getStyleWarnings(setIn(DEFAULT_STYLE, "quietZone", 1)).length > 0);
  assert.ok(getStyleWarnings(setIn(DEFAULT_STYLE, "background.color", "#000000")).length > 0);
});
