// Scan check: draws the finished design to pixels and tries to read it back with a real
// QR decoder (jsQR). If the decoded text matches what we encoded, the design is "scan-tested".
// jsQR is stricter than most phone cameras, so a failure means "risky", not "definitely broken".

import { svgToCanvas } from "./raster.js";

const CHECK_WIDTH = 720;
let decoderPromise = null;

function loadDecoder() {
  if (!decoderPromise) decoderPromise = import("jsqr").then((mod) => mod.default ?? mod);
  return decoderPromise;
}

function sameBytes(a, b) {
  if (!a || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** @returns {Promise<"pass"|"fail">} */
export async function scanCheck({ svg, aspect, payload }) {
  const decode = await loadDecoder();
  const width = CHECK_WIDTH;
  const height = Math.round(width * aspect);
  // White behind everything, like a QR printed on paper.
  const canvas = await svgToCanvas(svg, width, height, { background: "#ffffff" });
  const pixels = canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, width, height);
  const result = await decode(pixels.data, width, height, { inversionAttempts: "dontInvert" });
  if (!result) return "fail";
  const expected = new TextEncoder().encode(payload);
  const decoded = result.binaryData ? Uint8Array.from(result.binaryData) : new TextEncoder().encode(result.data ?? "");
  return sameBytes(decoded, expected) ? "pass" : "fail";
}
