import { cleanPhone, validatePhone, collectErrors } from "../lib/validators.js";
import { escapeSmsNumber } from "../lib/escape.js";

export default {
  id: "sms",
  label: "SMS",
  icon: "sms",
  title: "Send a text message",
  description: "Open the SMS app with the number and message already filled in.",
  fields: [
    { name: "phone", label: "Phone number", type: "tel", placeholder: "+91 98765 43210", required: true },
    { name: "message", label: "Message", type: "textarea", placeholder: "Hi! I'd like to know more...", maxLength: 300 },
  ],
  initialValues: { phone: "", message: "" },
  validate: (v) => collectErrors({ phone: validatePhone(v.phone) }),
  // Format: SMSTO:<number>:<message>
  buildPayload: (v) => `SMSTO:${escapeSmsNumber(cleanPhone(v.phone))}:${v.message || ""}`,
};
