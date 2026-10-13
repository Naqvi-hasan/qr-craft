import { required, isValidUrl, normalizeUrl, collectErrors } from "../lib/validators.js";

const STORE_HOSTS = {
  play: ["play.google.com"],
  appstore: ["apps.apple.com", "itunes.apple.com"],
};

// Android package id, e.g. com.whatsapp
const PACKAGE_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*(\.[a-zA-Z][a-zA-Z0-9_]*)+$/;

function validateAppLink(v) {
  const err = required(v.link, "App link");
  if (err) return err;
  const value = v.link.trim();
  if (v.store === "play" && PACKAGE_REGEX.test(value) && !value.includes("/")) return null;
  if (!isValidUrl(value)) return "Enter the full store link";
  const host = new URL(normalizeUrl(value)).hostname;
  if (!STORE_HOSTS[v.store].includes(host)) {
    return v.store === "play" ? "Link should be from play.google.com" : "Link should be from apps.apple.com";
  }
  return null;
}

export default {
  id: "app",
  label: "App",
  icon: "app",
  title: "Download an app",
  description: "Send people straight to your app on the Play Store or App Store.",
  note: "One QR can point to one store. A smart QR that detects Android vs iPhone needs a redirect server (Phase 3).",
  fields: [
    {
      name: "store",
      label: "Store",
      type: "select",
      variant: "segmented",
      options: [
        { value: "play", label: "Play Store", icon: "app" },
        { value: "appstore", label: "App Store", icon: "app" },
      ],
    },
    {
      name: "link",
      label: "Store link or package ID",
      type: "text",
      placeholder: "https://play.google.com/store/apps/details?id=com.example",
      required: true,
      help: "For Play Store you can also type just the package ID, like com.whatsapp",
    },
  ],
  initialValues: { store: "play", link: "" },
  validate: (v) => collectErrors({ link: validateAppLink(v) }),
  buildPayload: (v) => {
    const value = v.link.trim();
    if (v.store === "play" && PACKAGE_REGEX.test(value) && !value.includes("/")) {
      return `https://play.google.com/store/apps/details?id=${value}`;
    }
    return normalizeUrl(value);
  },
};
