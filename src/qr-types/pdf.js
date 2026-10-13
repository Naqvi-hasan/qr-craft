import { normalizeUrl, validateUrl, collectErrors } from "../lib/validators.js";

// Phase 1: the PDF must already be online (Google Drive, Dropbox, your website).
// Phase 2 will add direct upload to file storage (R2/S3), which then gives us this link.
export default {
  id: "pdf",
  label: "PDF",
  icon: "file",
  title: "Share a PDF",
  description: "Share a brochure, menu, resume or any document with one scan.",
  note: "Direct PDF upload comes in Phase 2. For now, upload to Google Drive, set sharing to 'Anyone with the link', and paste that link here.",
  fields: [
    { name: "url", label: "PDF link", type: "url", placeholder: "https://drive.google.com/file/d/.../view", required: true },
  ],
  initialValues: { url: "" },
  validate: (v) => collectErrors({ url: validateUrl(v.url, "PDF link") }),
  buildPayload: (v) => normalizeUrl(v.url),
};
