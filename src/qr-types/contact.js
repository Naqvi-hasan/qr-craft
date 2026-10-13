import { required, validateEmail, validatePhone, validateUrl, cleanPhone, normalizeUrl, collectErrors } from "../lib/validators.js";
import { escapeVCard } from "../lib/escape.js";

export default {
  id: "contact",
  label: "Contact",
  icon: "contact",
  title: "Share a contact card (vCard)",
  description: "A digital business card. One scan saves your details straight into the phone's contacts.",
  fields: [
    { name: "firstName", label: "First name", type: "text", placeholder: "Asha", required: true, half: true },
    { name: "lastName", label: "Last name", type: "text", placeholder: "Sharma", half: true },
    { name: "phone", label: "Mobile", type: "tel", placeholder: "+91 98765 43210", half: true },
    { name: "email", label: "Email", type: "email", placeholder: "asha@example.com", half: true },
    { name: "company", label: "Company", type: "text", placeholder: "Acme Pvt Ltd", half: true },
    { name: "jobTitle", label: "Job title", type: "text", placeholder: "Designer", half: true },
    { name: "website", label: "Website", type: "url", placeholder: "example.com" },
    { name: "address", label: "Address", type: "text", placeholder: "Andheri West, Mumbai" },
  ],
  initialValues: { firstName: "", lastName: "", phone: "", email: "", company: "", jobTitle: "", website: "", address: "" },
  validate: (v) =>
    collectErrors({
      firstName: required(v.firstName, "First name"),
      phone: v.phone ? validatePhone(v.phone, "Mobile") : null,
      email: v.email ? validateEmail(v.email) : null,
      website: v.website ? validateUrl(v.website, "website") : null,
    }),
  // vCard 3.0 is understood by both Android and iPhone.
  buildPayload: (v) => {
    const first = escapeVCard(v.firstName.trim());
    const last = escapeVCard((v.lastName || "").trim());
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${last};${first};;;`,
      `FN:${[first, last].filter(Boolean).join(" ")}`,
    ];
    if (v.company) lines.push(`ORG:${escapeVCard(v.company)}`);
    if (v.jobTitle) lines.push(`TITLE:${escapeVCard(v.jobTitle)}`);
    if (v.phone) lines.push(`TEL;TYPE=CELL:${cleanPhone(v.phone)}`);
    if (v.email) lines.push(`EMAIL:${v.email.trim()}`);
    if (v.website) lines.push(`URL:${normalizeUrl(v.website)}`);
    if (v.address) lines.push(`ADR:;;${escapeVCard(v.address)};;;;`);
    lines.push("END:VCARD");
    return lines.join("\n");
  },
};
