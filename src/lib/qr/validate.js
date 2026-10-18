// Scan check: draws the finished design to pixels and tries to read it back with a real
// QR decoder (jsQR). If the decoded text matches what we encoded, the design is "scan-tested".
// jsQR is stricter than most phone cameras, so a failure means "risky", not "definitely broken".

import { svgToCanvas } from "./raster.js";
import { decodeImageData } from "./decoder.js";

const CHECK_WIDTH = 720;

function sameBytes(a, b) {
  if (!a || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** @returns {Promise<"pass"|"fail">} */
export async function scanCheck({ svg, aspect, payload, width: wanted }) {
  // Printed items can be very wide (wristbands), so callers may ask for a bigger canvas.
  const width = Math.round(Math.min(3200, Math.max(CHECK_WIDTH, wanted || 0)));
  const height = Math.round(width * aspect);
  // White behind everything, like a QR printed on paper.
  const canvas = await svgToCanvas(svg, width, height, { background: "#ffffff" });
  const pixels = canvas.getContext("2d", { willReadFrequently: true }).getImageData(0, 0, width, height);
  const result = await decodeImageData(pixels);
  if (!result) return "fail";
  return sameBytes(result.bytes, new TextEncoder().encode(payload)) ? "pass" : "fail";
}
