import { required, collectErrors } from "../lib/validators.js";

// UPI ID looks like: name@bank, 9876543210@ybl, shop.name@okicici
const UPI_ID_REGEX = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,64}$/;

function validateUpiId(value) {
  return required(value, "UPI ID") || (UPI_ID_REGEX.test(value.trim()) ? null : "Enter a valid UPI ID, like name@okbank");
}

function validateAmount(value) {
  if (!value) return null; // amount is optional: payer types it
  if (!/^\d+(\.\d{1,2})?$/.test(value)) return "Amount can have at most 2 decimal places";
  const num = Number(value);
  if (num <= 0) return "Amount must be more than 0";
  if (num > 100000) return "Amount looks too large for UPI";
  return null;
}

export default {
  id: "upi",
  label: "UPI",
  icon: "rupee",
  title: "Receive a UPI payment",
  description: "Get paid instantly. Works with GPay, PhonePe, Paytm, BHIM and every UPI app.",
  tip: "Always do a test payment of ₹1 with your QR before printing it.",
  fields: [
    { name: "upiId", label: "UPI ID", type: "text", placeholder: "yourname@okhdfcbank", required: true },
    { name: "name", label: "Payee name", type: "text", placeholder: "Asha Sharma", required: true, half: true },
    { name: "amount", label: "Amount (₹, optional)", type: "text", placeholder: "250", half: true, help: "Leave empty to let the payer type the amount" },
    { name: "note", label: "Note (optional)", type: "text", placeholder: "Order #1024", maxLength: 50 },
  ],
  initialValues: { upiId: "", name: "", amount: "", note: "" },
  validate: (v) =>
    collectErrors({
      upiId: validateUpiId(v.upiId),
      name: required(v.name, "Payee name"),
      amount: validateAmount(v.amount),
    }),
  // Format: upi://pay?pa=<id>&pn=<name>&am=<amount>&cu=INR&tn=<note>
  buildPayload: (v) => {
    const params = [`pa=${encodeURIComponent(v.upiId.trim())}`, `pn=${encodeURIComponent(v.name.trim())}`];
    if (v.amount) params.push(`am=${Number(v.amount).toFixed(2)}`);
    params.push("cu=INR");
    if (v.note) params.push(`tn=${encodeURIComponent(v.note.trim())}`);
    return `upi://pay?${params.join("&")}`;
  },
};
