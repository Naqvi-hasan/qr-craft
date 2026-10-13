import { required, collectErrors } from "../lib/validators.js";

export default {
  id: "text",
  label: "Plain Text",
  icon: "text",
  title: "Share plain text",
  description: "Share a note, a code or a short message. Works offline, no internet needed to read it.",
  fields: [
    { name: "text", label: "Your text", type: "textarea", placeholder: "Type anything here...", required: true, maxLength: 1000 },
  ],
  initialValues: { text: "" },
  validate: (v) => collectErrors({ text: required(v.text, "Text") }),
  buildPayload: (v) => v.text,
};
