// Small, reusable validation helpers.
// Every helper returns `null` when the value is fine, or an error message string.

export function required(value, label = "This field") {
  if (value === undefined || value === null || String(value).trim() === "") {
    return `${label} is required`;
  }
  return null;
}

// Adds https:// if the user typed something like "google.com".
export function normalizeUrl(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidUrl(value) {
  try {
    const url = new URL(normalizeUrl(value));
    if (!["http:", "https:"].includes(url.protocol)) return false;
    // Must look like a real domain (has a dot) or be localhost.
    return url.hostname.includes(".") || url.hostname === "localhost";
  } catch {
    return false;
  }
}

export function validateUrl(value, label = "URL") {
  return required(value, label) || (isValidUrl(value) ? null : `Enter a valid ${label}`);
}

// Keeps a leading + and digits only: "+91 98765-43210" -> "+919876543210"
export function cleanPhone(value) {
  const trimmed = String(value || "").trim();
  const digits = trimmed.replace(/\D/g, "");
  return trimmed.startsWith("+") ? `+${digits}` : digits;
}

export function validatePhone(value, label = "Phone number") {
  const err = required(value, label);
  if (err) return err;
  if (/[^\d+\s()-]/.test(value)) return `${label} can only contain digits, spaces, +, - and ()`;
  const digits = cleanPhone(value).replace("+", "");
  if (digits.length < 7 || digits.length > 15) return `${label} should have 7 to 15 digits`;
  return null;
}

export function validateEmail(value, label = "Email") {
  const err = required(value, label);
  if (err) return err;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim()) ? null : `Enter a valid ${label}`;
}

export function validateNumberInRange(value, min, max, label) {
  const err = required(value, label);
  if (err) return err;
  const num = Number(value);
  if (Number.isNaN(num)) return `${label} must be a number`;
  if (num < min || num > max) return `${label} must be between ${min} and ${max}`;
  return null;
}

// Collects errors: pass an object like { url: validateUrl(v.url) }.
// Returns only the keys that actually have an error.
export function collectErrors(checks) {
  const errors = {};
  for (const [key, message] of Object.entries(checks)) {
    if (message) errors[key] = message;
  }
  return errors;
}
