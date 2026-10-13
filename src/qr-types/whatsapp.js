import { cleanPhone, validatePhone, collectErrors } from "../lib/validators.js";

export default {
  id: "whatsapp",
  label: "WhatsApp",
  icon: "whatsapp",
  title: "Start a WhatsApp chat",
  description: "Start a WhatsApp chat instantly, with an optional ready-made message.",
  fields: [
    { name: "phone", label: "WhatsApp number", type: "tel", placeholder: "+91 98765 43210", required: true, help: "Country code is required, e.g. +91" },
    { name: "message", label: "Pre-filled message", type: "textarea", placeholder: "Hello!", maxLength: 300 },
  ],
  initialValues: { phone: "", message: "" },
  validate: (v) => collectErrors({ phone: validatePhone(v.phone, "WhatsApp number") }),
  // wa.me needs digits only, no + sign.
  buildPayload: (v) => {
    const number = cleanPhone(v.phone).replace("+", "");
    const text = v.message ? `?text=${encodeURIComponent(v.message)}` : "";
    return `https://wa.me/${number}${text}`;
  },
};
