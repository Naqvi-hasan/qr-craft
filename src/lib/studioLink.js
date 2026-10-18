// Links that open the Studio with something already loaded:
//   /?template=cafe-menu#url        a ready-made design
//   /?design=<id>#wifi              a design from My Library
//   /?prefill=<data>#wifi           form values (e.g. from the Scanner)

function toBase64Url(text) {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(data) {
  const bin = atob(data.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function prefillLink(typeId, values) {
  return `/?prefill=${toBase64Url(JSON.stringify(values))}#${typeId}`;
}

export function decodePrefill(data) {
  try {
    const values = JSON.parse(fromBase64Url(String(data)));
    return values && typeof values === "object" && !Array.isArray(values) ? values : null;
  } catch {
    return null;
  }
}

export const designLink = (record) => `/?design=${encodeURIComponent(record.id)}#${record.typeId}`;
export const templateLink = (template) => `/?template=${template.id}#${template.typeId}`;
