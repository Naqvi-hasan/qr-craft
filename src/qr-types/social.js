import { required, collectErrors } from "../lib/validators.js";

// Add a new platform here and it shows up in the dropdown automatically.
export const SOCIAL_PLATFORMS = {
  instagram: { label: "Instagram", url: (u) => `https://instagram.com/${u}` },
  x: { label: "X (Twitter)", url: (u) => `https://x.com/${u}` },
  linkedin: { label: "LinkedIn", url: (u) => `https://www.linkedin.com/in/${u}` },
  youtube: { label: "YouTube", url: (u) => `https://www.youtube.com/@${u}` },
  facebook: { label: "Facebook", url: (u) => `https://facebook.com/${u}` },
  github: { label: "GitHub", url: (u) => `https://github.com/${u}` },
};

// Accepts "@asha", "asha" or a full profile link and returns just "asha".
export function cleanUsername(value) {
  let username = String(value || "").trim();
  username = username.replace(/^https?:\/\/[^/]+\/(in\/)?/i, "").replace(/^@/, "");
  return username.split(/[/?#]/)[0];
}

function validateUsername(value) {
  const err = required(value, "Username");
  if (err) return err;
  return /^[a-zA-Z0-9._-]{1,100}$/.test(cleanUsername(value)) ? null : "Username can have letters, numbers, . _ and - only";
}

export default {
  id: "social",
  label: "Social",
  icon: "share",
  title: "Open a social profile",
  description: "Grow your followers. One scan opens your profile on the platform you pick.",
  fields: [
    {
      name: "platform",
      label: "Platform",
      type: "select",
      options: Object.entries(SOCIAL_PLATFORMS).map(([value, p]) => ({ value, label: p.label })),
    },
    { name: "username", label: "Username", type: "text", placeholder: "@yourname", required: true },
  ],
  initialValues: { platform: "instagram", username: "" },
  validate: (v) => collectErrors({ username: validateUsername(v.username) }),
  buildPayload: (v) => SOCIAL_PLATFORMS[v.platform].url(cleanUsername(v.username)),
};
