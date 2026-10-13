// The full "design" of a QR code lives in one plain object.
// Themes and templates are just partial versions of this object merged on top of DEFAULT_STYLE.

export const DEFAULT_STYLE = {
  dots: {
    shape: "square", // see DOT_SHAPE_OPTIONS
    color: "#111827",
    gradient: { enabled: false, type: "linear", from: "#4f46e5", to: "#db2777", rotation: 45 },
  },
  eyes: {
    outer: "square",
    inner: "square",
    matchDots: true, // use the dots colour/gradient
    outerColor: "#111827",
    innerColor: "#111827",
  },
  background: {
    color: "#ffffff",
    transparent: false,
    rounded: true,
  },
  logo: {
    src: null, // data URL, stays in the browser
    size: 0.22, // share of the QR width (0.12 to 0.3)
    padding: 1, // empty modules around the logo
  },
  frame: {
    style: "none", // none | bottom | top | pill
    color: "#111827",
    text: "Scan me",
  },
  art: {
    shape: "none", // none | heart | star | pin | cup | leaf | monogram | custom
    color: "#be123c",
    strength: 0.45, // how strong the tint inside the shape is
    text: "Q", // monogram letters
    custom: null, // data URL of an uploaded shape
    detail: "medium", // low | medium | high: more modules = sharper picture
  },
  ecLevel: "M",
  quietZone: 3, // empty border in modules (scanners need at least 2)
};

export const DOT_SHAPE_OPTIONS = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Fluid" },
  { value: "dots", label: "Dots" },
  { value: "diamond", label: "Diamond" },
  { value: "leaf", label: "Leaf" },
  { value: "pixel", label: "Pixel" },
];

export const EYE_OUTER_OPTIONS = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "circle", label: "Circle" },
  { value: "leaf", label: "Leaf" },
];

export const EYE_INNER_OPTIONS = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "circle", label: "Dot" },
  { value: "diamond", label: "Diamond" },
  { value: "leaf", label: "Leaf" },
];

export const FRAME_OPTIONS = [
  { value: "none", label: "None" },
  { value: "bottom", label: "Label below" },
  { value: "top", label: "Label above" },
  { value: "pill", label: "Badge" },
];

export const CTA_SUGGESTIONS = ["Scan me", "View menu", "Pay now", "Join WiFi", "Follow us", "Save contact", "Open map", "Get the app"];

// A sensible call-to-action for each QR type, used when the user turns a frame on.
export const CTA_BY_TYPE = {
  url: "Scan me",
  text: "Scan to read",
  pdf: "View document",
  phone: "Call us",
  sms: "Text us",
  whatsapp: "Chat on WhatsApp",
  email: "Email us",
  contact: "Save contact",
  wifi: "Join WiFi",
  location: "Open map",
  upi: "Pay now",
  app: "Get the app",
  social: "Follow us",
};

export const ART_SHAPE_OPTIONS = [
  { value: "none", label: "Off" },
  { value: "heart", label: "Heart" },
  { value: "star", label: "Star" },
  { value: "pin", label: "Pin" },
  { value: "cup", label: "Cup" },
  { value: "leaf", label: "Leaf" },
  { value: "monogram", label: "Letters" },
  { value: "custom", label: "Upload" },
];

// Minimum QR version per detail level. Higher version = more modules = sharper picture.
export const ART_DETAIL_VERSION = { low: 0, medium: 6, high: 9 };

export const EC_LEVELS = [
  { value: "L", label: "Low (7%)" },
  { value: "M", label: "Medium (15%)" },
  { value: "Q", label: "Quartile (25%)" },
  { value: "H", label: "High (30%)" },
];

export const DOWNLOAD_SIZES = [512, 1024, 2048, 4096];

export const DOWNLOAD_FORMATS = [
  { value: "png", label: "PNG", hint: "Best for screens, WhatsApp and docs" },
  { value: "svg", label: "SVG", hint: "Vector: sharp at any size, best for designers" },
  { value: "pdf", label: "PDF", hint: "Print-ready at 300 DPI" },
  { value: "jpeg", label: "JPG", hint: "Smallest file, no transparency" },
];

export const MAX_LOGO_BYTES = 500 * 1024; // 500 KB
export const MAX_ART_BYTES = 1024 * 1024; // 1 MB
