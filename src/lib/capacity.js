// A QR code can only hold a limited amount of data.
// These are the maximum bytes (byte mode, version 40) per error-correction level.
// Higher error correction = stronger QR, but less space for data.
export const QR_BYTE_LIMITS = {
  L: 2953,
  M: 2331,
  Q: 1663,
  H: 1273,
};

export function byteLength(text) {
  return new TextEncoder().encode(String(text ?? "")).length;
}

// Returns null if it fits, otherwise an error message.
export function checkCapacity(payload, ecLevel = "M") {
  const limit = QR_BYTE_LIMITS[ecLevel] ?? QR_BYTE_LIMITS.M;
  const size = byteLength(payload);
  if (size <= limit) return null;
  return `Too much data for one QR (${size}/${limit} bytes at level ${ecLevel}). Shorten the content or lower error correction.`;
}

// Long payloads make dense QR codes that are hard to scan from a distance.
export function isDense(payload) {
  return byteLength(payload) > 300;
}
