// QR type registry.
// To add a new QR type:
//   1. Create a file in this folder (copy url.js as a starting point)
//   2. Import it below and add it to QR_TYPES
// The tabs, form and QR preview pick it up automatically. No other file changes needed.

import { checkCapacity } from "../lib/capacity.js";
import url from "./url.js";
import text from "./text.js";
import pdf from "./pdf.js";
import phone from "./phone.js";
import sms from "./sms.js";
import whatsapp from "./whatsapp.js";
import email from "./email.js";
import contact from "./contact.js";
import wifi from "./wifi.js";
import location from "./location.js";
import event from "./event.js";
import upi from "./upi.js";
import app from "./app.js";
import social from "./social.js";

export const QR_TYPES = [url, text, pdf, phone, sms, whatsapp, email, contact, wifi, location, event, upi, app, social];

export const QR_TYPE_MAP = Object.fromEntries(QR_TYPES.map((t) => [t.id, t]));

export const DEFAULT_TYPE_ID = "url";

export function getQrType(id) {
  return QR_TYPE_MAP[id] ?? QR_TYPE_MAP[DEFAULT_TYPE_ID];
}

// Only checks the fields that are currently visible (respects showIf).
export function isFieldVisible(field, values) {
  return typeof field.showIf === "function" ? field.showIf(values) : true;
}

// One function the UI calls: validates values and builds the QR text.
// Returns { errors, payload }. payload is null when something is invalid.
export function buildQr(typeId, values, ecLevel = "M") {
  const type = getQrType(typeId);
  const errors = type.validate(values);
  if (Object.keys(errors).length > 0) return { errors, payload: null };

  const payload = type.buildPayload(values);
  const capacityError = checkCapacity(payload, ecLevel);
  if (capacityError) return { errors: { _form: capacityError }, payload: null };

  return { errors: {}, payload };
}
