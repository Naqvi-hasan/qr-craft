import { validateEmail, collectErrors } from "../lib/validators.js";

export default {
  id: "email",
  label: "Email",
  icon: "mail",
  title: "Send an email",
  description: "Open a new email with the address, subject and message already filled in.",
  fields: [
    { name: "to", label: "Email address", type: "email", placeholder: "hello@example.com", required: true },
    { name: "subject", label: "Subject", type: "text", placeholder: "Enquiry" },
    { name: "body", label: "Message", type: "textarea", placeholder: "Write your message...", maxLength: 500 },
  ],
  initialValues: { to: "", subject: "", body: "" },
  validate: (v) => collectErrors({ to: validateEmail(v.to) }),
  buildPayload: (v) => {
    const params = [];
    if (v.subject) params.push(`subject=${encodeURIComponent(v.subject)}`);
    if (v.body) params.push(`body=${encodeURIComponent(v.body)}`);
    return `mailto:${v.to.trim()}${params.length ? `?${params.join("&")}` : ""}`;
  },
};
