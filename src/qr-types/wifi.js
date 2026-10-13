import { required, collectErrors } from "../lib/validators.js";
import { escapeWifi } from "../lib/escape.js";

export default {
  id: "wifi",
  label: "WiFi",
  icon: "wifi",
  title: "Connect to WiFi",
  description: "Guests scan once and join your network. No spelling out passwords.",
  tip: "The password is stored inside the QR itself. Anyone with the QR can join, so share it only with people you trust.",
  fields: [
    { name: "ssid", label: "Network name (SSID)", type: "text", placeholder: "Home_WiFi", required: true },
    {
      name: "encryption",
      label: "Security",
      type: "select",
      variant: "segmented",
      options: [
        { value: "WPA", label: "WPA / WPA2", icon: "lock" },
        { value: "WEP", label: "WEP", icon: "lock" },
        { value: "nopass", label: "No password", icon: "wifi" },
      ],
    },
    { name: "password", label: "Password", type: "password", placeholder: "Network password", showIf: (v) => v.encryption !== "nopass" },
    { name: "hidden", label: "This is a hidden network", type: "checkbox" },
  ],
  initialValues: { ssid: "", encryption: "WPA", password: "", hidden: false },
  validate: (v) =>
    collectErrors({
      ssid: required(v.ssid, "Network name"),
      password: v.encryption !== "nopass" ? required(v.password, "Password") : null,
    }),
  // Format: WIFI:T:WPA;S:name;P:password;H:true;;
  buildPayload: (v) => {
    let payload = `WIFI:T:${v.encryption};S:${escapeWifi(v.ssid)};`;
    if (v.encryption !== "nopass") payload += `P:${escapeWifi(v.password)};`;
    if (v.hidden) payload += "H:true;";
    return `${payload};`;
  },
};
