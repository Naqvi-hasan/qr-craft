import { required, validateNumberInRange, collectErrors } from "../lib/validators.js";

// We use a Google Maps link instead of "geo:" because iPhones don't open geo: links reliably.
const MAPS_BASE = "https://www.google.com/maps/search/?api=1&query=";

export default {
  id: "location",
  label: "Location",
  icon: "pin",
  title: "Open a place on the map",
  description: "Share a place, address or coordinates with a single scan. Great for shops, events, venues and travel.",
  fields: [
    {
      name: "mode",
      label: "Find by",
      type: "select",
      variant: "segmented",
      options: [
        { value: "address", label: "Address / place", icon: "pin" },
        { value: "coords", label: "Coordinates", icon: "crosshair" },
      ],
    },
    { name: "address", label: "Address or place name", type: "text", placeholder: "e.g. Gateway of India, Mumbai", required: true, showIf: (v) => v.mode === "address" },
    { name: "lat", label: "Latitude", type: "number", placeholder: "19.0760", required: true, half: true, showIf: (v) => v.mode === "coords" },
    { name: "lng", label: "Longitude", type: "number", placeholder: "72.8777", required: true, half: true, showIf: (v) => v.mode === "coords" },
  ],
  initialValues: { mode: "address", address: "", lat: "", lng: "" },
  // Optional card under the form with a button. `href` gets the current values.
  helper: {
    icon: "map",
    title: "Check it on the map",
    text: "Open Google Maps to confirm the exact spot. To use coordinates, long-press a point on the map and copy the numbers.",
    actionLabel: "Open map",
    href: (v) => {
      if (v.mode === "coords" && v.lat && v.lng) return `${MAPS_BASE}${v.lat},${v.lng}`;
      if (v.mode === "address" && v.address) return `${MAPS_BASE}${encodeURIComponent(v.address.trim())}`;
      return "https://www.google.com/maps";
    },
  },
  tip: "Coordinates are the most precise option, e.g. 19.0760, 72.8777.",
  validate: (v) =>
    v.mode === "coords"
      ? collectErrors({
          lat: validateNumberInRange(v.lat, -90, 90, "Latitude"),
          lng: validateNumberInRange(v.lng, -180, 180, "Longitude"),
        })
      : collectErrors({ address: required(v.address, "Address") }),
  buildPayload: (v) =>
    v.mode === "coords"
      ? `${MAPS_BASE}${Number(v.lat)},${Number(v.lng)}`
      : `${MAPS_BASE}${encodeURIComponent(v.address.trim())}`,
};
