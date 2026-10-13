// Tests for the SVG renderer, using a fake QR matrix (no QR library needed).

import { test } from "node:test";
import assert from "node:assert/strict";
import { renderQrSvg, escapeXml, isSafeImage } from "../src/lib/qr/render.js";
import { DOT_SHAPES, eyeInnerPath, eyeOuterPath } from "../src/lib/qr/shapes.js";
import { DEFAULT_STYLE } from "../src/config/qrStyle.js";
import { deepMerge } from "../src/lib/qr/style.js";
import { deriveArtColors, luminance, readableTextOn } from "../src/lib/color.js";

// 25×25 checkerboard-ish matrix
function fakeMatrix(n = 25) {
  return { size: n, isDark: (r, c) => (r * 7 + c * 3) % 5 < 2 };
}
const style = (patch = {}) => deepMerge(DEFAULT_STYLE, patch);
const render = (patch, extra = {}) => renderQrSvg({ matrix: fakeMatrix(), style: style(patch), ...extra });

test("renders a well-formed square SVG by default", () => {
  const { svg, width, height, aspect } = render({});
  assert.ok(svg.startsWith("<svg") && svg.endsWith("</svg>"));
  assert.equal(width, 512);
  assert.equal(height, 512);
  assert.equal(aspect, 1);
  assert.match(svg, /viewBox="0 0 31 31"/); // 25 + 2 × quiet zone 3
});

test("every dot shape and eye shape produces path data", () => {
  for (const [name, fn] of Object.entries(DOT_SHAPES)) {
    const d = fn(0, 0, () => false);
    assert.match(d, /^M[\d.\- ]/, name);
    assert.ok(!d.includes("NaN"), name);
  }
  for (const s of ["square", "rounded", "circle", "leaf"]) assert.ok(!eyeOuterPath(0, 0, s).includes("NaN"));
  for (const s of ["square", "rounded", "circle", "diamond", "leaf"]) assert.ok(!eyeInnerPath(0, 0, s).includes("NaN"));
});

test("gradient adds a definition and uses it", () => {
  const { svg } = render({ dots: { gradient: { enabled: true, from: "#111111", to: "#222222" } } });
  const id = svg.match(/<linearGradient id="(qr[a-z0-9]+-g)"/)?.[1];
  assert.ok(id, "gradient defined");
  assert.ok(svg.includes(`fill="url(#${id})"`), "gradient used");
  // Same design renders the same SVG every time (server and browser match).
  assert.equal(render({ dots: { gradient: { enabled: true, from: "#111111", to: "#222222" } } }).svg, svg);
  const radial = render({ dots: { gradient: { enabled: true, type: "radial", from: "#111111", to: "#222222" } } }).svg;
  assert.match(radial, /<radialGradient/);
});

test("frames change the aspect ratio and show the label", () => {
  const bottom = render({ frame: { style: "bottom", text: "View menu" } });
  assert.ok(bottom.aspect > 1);
  assert.match(bottom.svg, />View menu<\/text>/);
  const pill = render({ frame: { style: "pill", text: "Pay now" } });
  assert.ok(pill.aspect > 1);
  assert.match(pill.svg, />Pay now<\/text>/);
  const none = render({ frame: { style: "none", text: "Hidden" } });
  assert.ok(!none.svg.includes("Hidden"));
});

test("label text is escaped (no HTML/script injection)", () => {
  const { svg } = render({ frame: { style: "bottom", text: '<script>alert("x")</script>' } });
  assert.ok(!svg.includes("<script>"));
  assert.ok(svg.includes("&lt;script&gt;"));
  assert.equal(escapeXml(`a&b"c'`), "a&amp;b&quot;c&#39;");
});

test("only local image data URLs are embedded as a logo", () => {
  assert.ok(isSafeImage("data:image/png;base64,iVBORw0KGgo="));
  assert.ok(!isSafeImage("https://evil.example/logo.png"));
  assert.ok(!isSafeImage('data:image/png;base64,AAA" onload="alert(1)'));
  const withLogo = render({ logo: { src: "data:image/png;base64,iVBORw0KGgo=" } }).svg;
  assert.match(withLogo, /<image /);
  const bad = render({ logo: { src: "javascript:alert(1)" } }).svg;
  assert.ok(!bad.includes("<image"));
});

test("transparent background removes the tile, but not inside a label frame", () => {
  const plain = render({}).svg;
  const transparent = render({ background: { transparent: true } }).svg;
  assert.ok(plain.length > transparent.length);
  assert.ok(!transparent.includes('fill="#ffffff"'));
  const framed = render({ background: { transparent: true }, frame: { style: "bottom" } }).svg;
  assert.ok(framed.includes('fill="#ffffff"'), "framed tile keeps its background so it can scan");
});

test("picture art colours the masked modules with safe colours", () => {
  const n = 25;
  const mask = new Uint8Array(n * n).fill(1);
  const { svg } = renderQrSvg({ matrix: fakeMatrix(n), style: style({ art: { shape: "heart", color: "#e11d48" } }), mask });
  const { dark, light } = deriveArtColors("#e11d48");
  assert.ok(svg.includes(`fill="${dark}"`));
  assert.ok(svg.includes(`fill="${light}"`));
  // A mask with the wrong size is ignored instead of crashing.
  const wrong = renderQrSvg({ matrix: fakeMatrix(n), style: style({ art: { shape: "heart" } }), mask: new Uint8Array(4) }).svg;
  assert.ok(!wrong.includes(`fill="${light}"`));
});

test("art colours stay scannable for any chosen colour", () => {
  for (const c of ["#ffff00", "#ffffff", "#00ff00", "#000000", "#e11d48", "#38bdf8"]) {
    for (const strength of [0.2, 0.5, 0.8]) {
      const { dark, light } = deriveArtColors(c, "#ffffff", strength);
      assert.ok(luminance(dark) <= 0.08, `dark too light for ${c}`);
      assert.ok(luminance(light) >= 0.45, `light too dark for ${c}`);
    }
  }
});

test("frame text colour is readable", () => {
  assert.equal(readableTextOn("#111827"), "#ffffff");
  assert.equal(readableTextOn("#fde68a"), "#111827");
});

test("invalid colours fall back instead of breaking the SVG", () => {
  const { svg } = render({ dots: { color: "red; stroke: url(x)" }, background: { color: "not-a-colour" } });
  assert.ok(!svg.includes("red;"));
  assert.ok(svg.includes('fill="#111827"'));
});
