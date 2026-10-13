import { cleanPhone, validatePhone, collectErrors } from "../lib/validators.js";

export default {
  id: "phone",
  label: "Phone",
  icon: "phone",
  title: "Call a phone number",
  description: "One scan opens the dialer with your number ready to call. Ideal for cards and shop boards.",
  fields: [
    { name: "phone", label: "Phone number", type: "tel", placeholder: "+91 98765 43210", required: true, help: "Include the country code, e.g. +91" },
  ],
  initialValues: { phone: "" },
  validate: (v) => collectErrors({ phone: validatePhone(v.phone) }),
  buildPayload: (v) => `tel:${cleanPhone(v.phone)}`,
};
