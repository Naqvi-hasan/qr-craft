// Ready-made designs for the Templates page. Each template is a full style (merged on top of
// DEFAULT_STYLE) plus the QR type it suits. "Use template" opens the Studio with it applied.
// Every colour here is dark enough on white to scan; tests/templates.test.js checks this.

export const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "business", label: "Business" },
  { id: "food", label: "Food & café" },
  { id: "events", label: "Events" },
  { id: "payments", label: "Payments" },
  { id: "social", label: "Social & gaming" },
  { id: "places", label: "Places" },
];

export const TEMPLATES = [
  {
    id: "business-card",
    name: "Business card",
    category: "business",
    typeId: "contact",
    description: "Navy and gold, label below. Saves your contact in one scan.",
    style: {
      dots: { shape: "square", color: "#1e3a8a" },
      eyes: { outer: "square", inner: "square", matchDots: false, outerColor: "#1e3a8a", innerColor: "#92400e" },
      background: { rounded: false },
      frame: { style: "bottom", color: "#1e3a8a", text: "Save contact" },
    },
  },
  {
    id: "monogram",
    name: "Monogram",
    category: "business",
    typeId: "url",
    description: "Your initials painted into the code. Change the letters in Picture art.",
    style: {
      dots: { shape: "rounded", color: "#16233f" },
      eyes: { outer: "rounded", inner: "rounded", matchDots: false, outerColor: "#16233f", innerColor: "#92400e" },
      art: { shape: "monogram", text: "QR", color: "#b45309", strength: 0.5, detail: "medium" },
    },
  },
  {
    id: "cafe-menu",
    name: "Café menu",
    category: "food",
    typeId: "url",
    description: "A coffee cup in the dots and a View menu label. Made for tables.",
    style: {
      dots: { shape: "rounded", color: "#3e2723" },
      eyes: { outer: "rounded", inner: "circle", matchDots: true },
      art: { shape: "cup", color: "#ea580c", strength: 0.6, detail: "medium" },
      frame: { style: "bottom", color: "#3e2723", text: "View menu" },
    },
  },
  {
    id: "restaurant-wifi",
    name: "Guest WiFi",
    category: "food",
    typeId: "wifi",
    description: "Soft green dots with a Join WiFi badge for counters and walls.",
    style: {
      dots: { shape: "dots", color: "#14532d" },
      eyes: { outer: "rounded", inner: "circle", matchDots: true },
      frame: { style: "pill", color: "#15803d", text: "Join WiFi" },
    },
  },
  {
    id: "wedding",
    name: "Wedding invite",
    category: "events",
    typeId: "location",
    description: "A heart in rose and plum. Point guests to the venue.",
    style: {
      dots: { shape: "rounded", color: "#4a044e" },
      eyes: { outer: "leaf", inner: "leaf", matchDots: true },
      art: { shape: "heart", color: "#be123c", strength: 0.5, detail: "medium" },
      frame: { style: "top", color: "#4a044e", text: "Our big day" },
    },
  },
  {
    id: "event-pass",
    name: "Event pass",
    category: "events",
    typeId: "url",
    description: "A gold star and diamond dots for launches and concerts.",
    style: {
      dots: { shape: "diamond", color: "#1e1b4b" },
      eyes: { outer: "rounded", inner: "diamond", matchDots: true },
      art: { shape: "star", color: "#b45309", strength: 0.55, detail: "medium" },
      frame: { style: "bottom", color: "#1e1b4b", text: "Event details" },
    },
  },
  {
    id: "upi-shop",
    name: "Shop payment",
    category: "payments",
    typeId: "upi",
    description: "Clean and trusted. A Scan and pay label for your counter.",
    style: {
      dots: { shape: "square", color: "#0f172a" },
      eyes: { outer: "rounded", inner: "rounded", matchDots: true },
      frame: { style: "bottom", color: "#166534", text: "Scan and pay" },
    },
  },
  {
    id: "donation",
    name: "Donation",
    category: "payments",
    typeId: "upi",
    description: "A warm heart for fundraisers, temples and NGOs.",
    style: {
      dots: { shape: "dots", color: "#450a0a" },
      eyes: { outer: "circle", inner: "circle", matchDots: true },
      art: { shape: "heart", color: "#b91c1c", strength: 0.45, detail: "medium" },
      frame: { style: "pill", color: "#b91c1c", text: "Support us" },
    },
  },
  {
    id: "social-glow",
    name: "Social glow",
    category: "social",
    typeId: "social",
    description: "A pink-to-orange gradient with a Follow us badge.",
    style: {
      dots: { shape: "rounded", gradient: { enabled: true, type: "linear", from: "#a21caf", to: "#c2410c", rotation: 45 } },
      eyes: { outer: "rounded", inner: "circle", matchDots: true },
      frame: { style: "pill", color: "#a21caf", text: "Follow us" },
    },
  },
  {
    id: "gaming",
    name: "Gaming channel",
    category: "social",
    typeId: "social",
    description: "Pixel dots in violet and cyan on a dark frame.",
    style: {
      dots: { shape: "pixel", gradient: { enabled: true, type: "linear", from: "#5b21b6", to: "#0e7490", rotation: 90 } },
      eyes: { outer: "square", inner: "square", matchDots: false, outerColor: "#5b21b6", innerColor: "#0e7490" },
      frame: { style: "bottom", color: "#0b1020", text: "Join the squad" },
    },
  },
  {
    id: "store-locator",
    name: "Store locator",
    category: "places",
    typeId: "location",
    description: "A red map pin that tells people exactly what the code does.",
    style: {
      dots: { shape: "rounded", color: "#0b2e2a" },
      eyes: { outer: "rounded", inner: "circle", matchDots: true },
      art: { shape: "pin", color: "#b91c1c", strength: 0.5, detail: "medium" },
      frame: { style: "bottom", color: "#0b2e2a", text: "Find us" },
    },
  },
  {
    id: "eco",
    name: "Eco brand",
    category: "places",
    typeId: "url",
    description: "A green leaf for organic shops, farms and parks.",
    style: {
      dots: { shape: "leaf", color: "#14532d" },
      eyes: { outer: "leaf", inner: "leaf", matchDots: true },
      art: { shape: "leaf", color: "#22c55e", strength: 0.6, detail: "medium" },
    },
  },
];

export const TEMPLATE_MAP = Object.fromEntries(TEMPLATES.map((t) => [t.id, t]));
