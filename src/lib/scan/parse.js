// Understands what a scanned QR contains (link, WiFi, contact, UPI...) and turns it into
// something readable, with safety warnings. Nothing here opens links: the user decides.

const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "rb.gy", "cutt.ly", "is.gd", "ow.ly", "buff.ly", "tiny.cc", "shorturl.at", "s.id", "rebrand.ly"];
const UNSAFE_SCHEMES = /^(javascript|data|vbscript|file|blob):/i;

function urlWarnings(url) {
  const warnings = [];
  if (url.protocol === "http:") warnings.push("Not encrypted (http). Don't enter passwords or payment details on this site.");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(url.hostname) || url.hostname.startsWith("[")) warnings.push("Goes to a bare IP address instead of a website name. Real businesses rarely do this.");
  if (url.hostname.split(".").some((part) => part.startsWith("xn--"))) warnings.push("The site name uses special characters that can imitate another website.");
  if (SHORTENERS.includes(url.hostname.replace(/^www\./, ""))) warnings.push("Short link: the real destination stays hidden until you open it.");
  if (url.username || url.password) warnings.push("The link hides extra text before the site name, a common phishing trick.");
  return warnings;
}

// WIFI:T:WPA;S:name;P:pass;H:true;;  (\ escapes ; , : " \)
function parseWifi(text) {
  const body = text.slice(5);
  const out = {};
  let key = "";
  let value = "";
  let inValue = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch === "\\" && i + 1 < body.length) {
      (inValue ? (value += body[++i]) : (key += body[++i]));
      continue;
    }
    if (!inValue && ch === ":") {
      inValue = true;
      continue;
    }
    if (ch === ";") {
      if (key) out[key.toUpperCase()] = value;
      key = "";
      value = "";
      inValue = false;
      continue;
    }
    inValue ? (value += ch) : (key += ch);
  }
  if (key) out[key.toUpperCase()] = value;
  return out;
}

function unescapeVCard(value) {
  return value.replace(/\\n/gi, "\n").replace(/\\([,;\\])/g, "$1");
}

function parseVCard(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
  const card = {};
  for (const line of lines) {
    const idx = line.indexOf(":");
    if (idx < 0) continue;
    const name = line.slice(0, idx).split(";")[0].toUpperCase();
    const value = line.slice(idx + 1);
    if (!(name in card)) card[name] = value;
  }
  const [last = "", first = ""] = (card.N ?? "").split(/(?<!\\);/).map(unescapeVCard);
  const full = unescapeVCard(card.FN ?? [first, last].filter(Boolean).join(" "));
  const address = card.ADR ? unescapeVCard(card.ADR.split(/(?<!\\);/).filter(Boolean).join(", ")) : "";
  return {
    full,
    first: first || full.split(" ")[0] || "",
    last: last || full.split(" ").slice(1).join(" "),
    phone: card.TEL ?? "",
    email: card.EMAIL ?? "",
    // ORG can have parts (company;department) separated by unescaped ";"
    company: (card.ORG ?? "").split(/(?<!\\);/).filter(Boolean).map(unescapeVCard).join(", "),
    title: unescapeVCard(card.TITLE ?? ""),
    website: card.URL ?? "",
    address,
  };
}

function safeUrl(text) {
  try {
    return new URL(text);
  } catch {
    return null;
  }
}

/**
 * @param {string} raw  decoded QR text
 * @returns {{ kind, label, icon, fields: {label,value,secret?}[], action: {href,label,download?}|null,
 *             warnings: string[], prefill: {typeId, values}|null, raw }}
 */
export function parseQrText(raw) {
  const text = String(raw ?? "");
  const trimmed = text.trim();
  const base = { raw: text, fields: [], action: null, warnings: [], prefill: null };

  if (UNSAFE_SCHEMES.test(trimmed)) {
    return { ...base, kind: "unsafe", label: "Unsafe code", icon: "alert", warnings: ["This QR contains a script or data link. Opening it could be harmful, so we won't make it clickable."], fields: [{ label: "Content", value: text }] };
  }

  // WhatsApp links get their own view before the general URL handling.
  const asUrl = /^https?:\/\//i.test(trimmed) ? safeUrl(trimmed) : null;
  if (asUrl && /^(wa\.me|api\.whatsapp\.com)$/i.test(asUrl.hostname)) {
    const phone = (asUrl.pathname.replace(/\D/g, "") || asUrl.searchParams.get("phone") || "").replace(/\D/g, "");
    const message = asUrl.searchParams.get("text") ?? "";
    return {
      ...base,
      kind: "whatsapp",
      label: "WhatsApp chat",
      icon: "whatsapp",
      fields: [{ label: "Number", value: phone ? `+${phone}` : "Not set" }, ...(message ? [{ label: "Message", value: message }] : [])],
      action: { href: asUrl.href, label: "Open WhatsApp" },
      prefill: phone ? { typeId: "whatsapp", values: { phone: `+${phone}`, message } } : null,
    };
  }

  if (asUrl) {
    return {
      ...base,
      kind: "url",
      label: "Website link",
      icon: "link",
      fields: [
        { label: "Opens", value: asUrl.hostname },
        { label: "Full link", value: asUrl.href },
      ],
      action: { href: asUrl.href, label: "Open link" },
      warnings: urlWarnings(asUrl),
      prefill: { typeId: "url", values: { url: asUrl.href } },
    };
  }

  if (/^tel:/i.test(trimmed)) {
    const phone = trimmed.slice(4).trim();
    return { ...base, kind: "phone", label: "Phone number", icon: "phone", fields: [{ label: "Number", value: phone }], action: { href: `tel:${phone}`, label: "Call" }, prefill: { typeId: "phone", values: { phone } } };
  }

  if (/^(smsto|sms):/i.test(trimmed)) {
    const rest = trimmed.replace(/^(smsto|sms):/i, "");
    const [phone, ...msg] = rest.split(/[:?]/);
    const message = msg.join(":").replace(/^body=/i, "");
    return {
      ...base,
      kind: "sms",
      label: "Text message",
      icon: "sms",
      fields: [{ label: "To", value: phone }, ...(message ? [{ label: "Message", value: message }] : [])],
      action: { href: `sms:${phone}${message ? `?body=${encodeURIComponent(message)}` : ""}`, label: "Open messages" },
      prefill: { typeId: "sms", values: { phone, message } },
    };
  }

  if (/^mailto:/i.test(trimmed)) {
    const url = safeUrl(trimmed);
    const to = decodeURIComponent(trimmed.slice(7).split("?")[0]);
    const subject = url?.searchParams.get("subject") ?? "";
    const body = url?.searchParams.get("body") ?? "";
    return {
      ...base,
      kind: "email",
      label: "Email",
      icon: "mail",
      fields: [{ label: "To", value: to }, ...(subject ? [{ label: "Subject", value: subject }] : []), ...(body ? [{ label: "Message", value: body }] : [])],
      action: { href: trimmed, label: "Write email" },
      prefill: { typeId: "email", values: { to, subject, body } },
    };
  }

  if (/^MATMSG:/i.test(trimmed)) {
    const get = (k) => (trimmed.match(new RegExp(`${k}:([^;]*)`, "i")) ?? [])[1] ?? "";
    const to = get("TO");
    const subject = get("SUB");
    const body = get("BODY");
    return {
      ...base,
      kind: "email",
      label: "Email",
      icon: "mail",
      fields: [{ label: "To", value: to }, ...(subject ? [{ label: "Subject", value: subject }] : [])],
      action: { href: `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, label: "Write email" },
      prefill: { typeId: "email", values: { to, subject, body } },
    };
  }

  if (/^WIFI:/i.test(trimmed)) {
    const w = parseWifi(trimmed);
    const type = (w.T || "").toUpperCase();
    const encryption = !w.P || type === "NOPASS" || type === "" ? (w.P ? "WPA" : "nopass") : type === "WEP" ? "WEP" : "WPA";
    return {
      ...base,
      kind: "wifi",
      label: "WiFi network",
      icon: "wifi",
      fields: [
        { label: "Network", value: w.S ?? "" },
        { label: "Security", value: encryption === "nopass" ? "Open (no password)" : encryption },
        ...(w.P ? [{ label: "Password", value: w.P, secret: true }] : []),
        ...(w.H?.toLowerCase() === "true" ? [{ label: "Hidden", value: "Yes" }] : []),
      ],
      warnings: encryption === "nopass" ? ["Open network: anyone nearby can see what you send over it."] : [],
      prefill: { typeId: "wifi", values: { ssid: w.S ?? "", encryption, password: w.P ?? "", hidden: w.H?.toLowerCase() === "true" } },
    };
  }

  if (/^BEGIN:VCARD/i.test(trimmed)) {
    const c = parseVCard(trimmed);
    return {
      ...base,
      kind: "contact",
      label: "Contact card",
      icon: "contact",
      fields: [
        { label: "Name", value: c.full },
        ...(c.title || c.company ? [{ label: "Work", value: [c.title, c.company].filter(Boolean).join(", ") }] : []),
        ...(c.phone ? [{ label: "Phone", value: c.phone }] : []),
        ...(c.email ? [{ label: "Email", value: c.email }] : []),
        ...(c.website ? [{ label: "Website", value: c.website }] : []),
        ...(c.address ? [{ label: "Address", value: c.address }] : []),
      ],
      action: { href: `data:text/vcard;charset=utf-8,${encodeURIComponent(trimmed)}`, label: "Save contact (.vcf)", download: `${(c.full || "contact").replace(/[^a-z0-9]+/gi, "-")}.vcf` },
      prefill: {
        typeId: "contact",
        values: { firstName: c.first, lastName: c.last, phone: c.phone, email: c.email, company: c.company, jobTitle: c.title, website: c.website, address: c.address },
      },
    };
  }

  if (/^upi:\/\/pay/i.test(trimmed)) {
    const url = safeUrl(trimmed);
    const p = (k) => url?.searchParams.get(k) ?? "";
    return {
      ...base,
      kind: "upi",
      label: "UPI payment",
      icon: "rupee",
      fields: [
        { label: "Pay to", value: p("pn") || "Name not given" },
        { label: "UPI ID", value: p("pa") },
        ...(p("am") ? [{ label: "Amount", value: `₹${p("am")}` }] : []),
        ...(p("tn") ? [{ label: "Note", value: p("tn") }] : []),
      ],
      action: { href: trimmed, label: "Pay with UPI app" },
      warnings: ["Check the name and UPI ID before paying. Your UPI app shows the verified name on the next screen."],
      prefill: { typeId: "upi", values: { upiId: p("pa"), name: p("pn"), amount: p("am"), note: p("tn") } },
    };
  }

  if (/^geo:/i.test(trimmed)) {
    const [lat, lng] = trimmed.slice(4).split(/[,?;]/);
    const href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;
    return {
      ...base,
      kind: "location",
      label: "Location",
      icon: "pin",
      fields: [{ label: "Coordinates", value: `${lat}, ${lng}` }],
      action: { href, label: "Open in Maps" },
      prefill: { typeId: "location", values: { mode: "coords", lat, lng } },
    };
  }

  const otherScheme = /^[a-z][a-z0-9+.-]{1,20}:/i.test(trimmed);
  return {
    ...base,
    kind: "text",
    label: otherScheme ? "App link" : "Text",
    icon: "text",
    fields: [{ label: "Content", value: text }],
    warnings: otherScheme ? ["This is a link for a specific app. We don't open it from here."] : [],
    prefill: { typeId: "text", values: { text: text.slice(0, 1000) } },
  };
}
