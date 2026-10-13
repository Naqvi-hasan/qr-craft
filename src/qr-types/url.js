import { normalizeUrl, validateUrl, collectErrors } from "../lib/validators.js";

export default {
  id: "url",
  label: "URL",
  icon: "link",
  title: "Link to any website",
  description: "Turn any link into a QR code. Perfect for websites, menus, portfolios and landing pages.",
  tip: "You can paste the link with or without https://, we add it for you.",
  fields: [
    { name: "url", label: "Website URL", type: "url", placeholder: "https://example.com", required: true },
  ],
  initialValues: { url: "" },
  validate: (v) => collectErrors({ url: validateUrl(v.url, "URL") }),
  buildPayload: (v) => normalizeUrl(v.url),
};
