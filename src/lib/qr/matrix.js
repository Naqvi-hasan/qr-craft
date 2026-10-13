// Turns text into a QR "matrix": a square grid where each cell (module) is dark or light.
// We use the small `qrcode-generator` library only for this math; all drawing is ours (render.js).

import qrcode from "qrcode-generator";

// The library's default mode reads each character as one byte, which breaks "₹", Hindi, emoji.
// So we encode to UTF-8 ourselves and hand it a string where every char is one byte.
function toUtf8ByteString(text) {
  const bytes = new TextEncoder().encode(String(text ?? ""));
  let out = "";
  for (const b of bytes) out += String.fromCharCode(b);
  return out;
}

function build(data, ecLevel, version) {
  const qr = qrcode(version, ecLevel);
  qr.addData(data, "Byte");
  qr.make();
  return qr;
}

/**
 * @param {string} payload    text to encode
 * @param {"L"|"M"|"Q"|"H"} ecLevel  error correction
 * @param {number} minVersion  0 = smallest that fits. Higher = more modules (used by picture art
 *                             so the picture has more "pixels"). Falls back to auto if it doesn't fit.
 * @returns {{ size: number, isDark: (row: number, col: number) => boolean, version: number }}
 */
export function createMatrix(payload, ecLevel = "M", minVersion = 0) {
  const data = toUtf8ByteString(payload);
  let qr;
  try {
    qr = build(data, ecLevel, minVersion);
  } catch {
    // Data too long for the requested version: let the library pick the size.
    qr = build(data, ecLevel, 0);
  }
  const size = qr.getModuleCount();
  return {
    size,
    version: (size - 17) / 4,
    isDark: (row, col) => qr.isDark(row, col),
  };
}
