// Special characters have meaning inside some QR formats, so they must be escaped.

// WiFi format: \ ; , : " must be escaped with a backslash.
export function escapeWifi(value) {
  return String(value ?? "").replace(/([\\;,:"])/g, "\\$1");
}

// vCard format: \ , ; must be escaped, and new lines become \n.
export function escapeVCard(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;")
    .replace(/\r?\n/g, "\\n");
}

// SMSTO format uses ":" as a separator, so it cannot appear in the number.
// The message part is taken as-is (everything after the second colon).
export function escapeSmsNumber(value) {
  return String(value ?? "").replace(/:/g, "");
}
