// Reads QR codes from pixels using jsQR. Loaded only when needed to keep pages light.
// Used by the scan check (validate.js) and by the Scanner page.

let decoderPromise = null;

function loadDecoder() {
  if (!decoderPromise) decoderPromise = import("jsqr").then((mod) => mod.default ?? mod);
  return decoderPromise;
}

/**
 * @param {ImageData} imageData
 * @param {{ invert?: boolean }} [options]  invert: also try light-on-dark codes (slower)
 * @returns {Promise<{ text: string, bytes: Uint8Array } | null>}
 */
export async function decodeImageData(imageData, { invert = false } = {}) {
  const decode = await loadDecoder();
  const result = await decode(imageData.data, imageData.width, imageData.height, {
    inversionAttempts: invert ? "attemptBoth" : "dontInvert",
  });
  if (!result) return null;
  const bytes = result.binaryData ? Uint8Array.from(result.binaryData) : new TextEncoder().encode(result.data ?? "");
  // QR text is UTF-8 in practice; fall back to what jsQR decoded if the bytes aren't valid UTF-8.
  let text;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    text = result.data ?? "";
  }
  return { text, bytes };
}

// Draws an image (or video frame) onto a canvas no wider/taller than `maxSide` and reads its pixels.
export function imageDataFrom(source, sourceWidth, sourceHeight, maxSide = 1200) {
  const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}
