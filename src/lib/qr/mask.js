// Picture art: turns a shape (heart, star, letters, an uploaded icon...) into an n×n grid
// that says which QR modules sit inside the shape. The renderer then colours those modules.
// Uses an off-screen <canvas>, so it only runs in the browser.

// Shapes are SVG paths in a 0-100 box, drawn over the whole code area.
function starPath() {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? 46 : 20;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(2)} ${(54 + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

export const ART_PATHS = {
  heart: { d: "M50 90C17 67 4 47 12 28C20 9 42 11 50 28C58 11 80 9 88 28C96 47 83 67 50 90Z" },
  star: { d: starPath() },
  pin: { d: "M50 95C50 95 17 61 17 40A33 33 0 1 1 83 40C83 61 50 95 50 95ZM50 27A13 13 0 1 0 50.01 27Z", evenOdd: true },
  cup: {
    d: "M14 28H70L66 70Q42 86 18 70ZM68 34A16 16 0 0 1 68 66L68 56A6 6 0 0 0 68 44ZM6 80H86A5 5 0 0 1 81 88H11A5 5 0 0 1 6 80Z",
  },
  leaf: { d: "M14 86C14 40 40 14 88 12C86 60 60 86 14 86Z" },
};

const PIXELS_PER_MODULE = 8;
const cache = new Map();

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't read that image."));
    img.src = src;
  });
}

function drawMonogram(ctx, size, text) {
  const letters = String(text || "").trim().slice(0, 3).toUpperCase();
  let fontSize = size * 0.82;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const font = (px) => `900 ${px}px "Arial Black", "Helvetica Neue", Arial, sans-serif`;
  ctx.font = font(fontSize);
  const measured = ctx.measureText(letters).width;
  if (measured > size * 0.9) fontSize *= (size * 0.9) / measured;
  ctx.font = font(fontSize);
  ctx.fillText(letters, size / 2, size * 0.54);
}

async function drawCustom(ctx, size, src) {
  const img = await loadImage(src);
  const scale = Math.min(size / img.width, size / img.height) * 0.92;
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  return true;
}

/**
 * @param {object} art  style.art
 * @param {number} n    QR module count
 * @returns {Promise<Uint8Array|null>}
 */
export async function buildArtMask(art, n) {
  if (typeof document === "undefined" || !art || art.shape === "none") return null;
  const key = `${art.shape}|${n}|${art.shape === "monogram" ? art.text : ""}|${art.shape === "custom" ? art.custom?.length + (art.custom || "").slice(-32) : ""}`;
  if (cache.has(key)) return cache.get(key);

  const size = n * PIXELS_PER_MODULE;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.fillStyle = "#000";

  let isPhoto = false;
  if (art.shape === "monogram") {
    if (!String(art.text || "").trim()) return null;
    drawMonogram(ctx, size, art.text);
  } else if (art.shape === "custom") {
    if (!art.custom) return null;
    await drawCustom(ctx, size, art.custom);
    isPhoto = true;
  } else {
    const shape = ART_PATHS[art.shape];
    if (!shape) return null;
    ctx.scale(size / 100, size / 100);
    ctx.fill(new Path2D(shape.d), shape.evenOdd ? "evenodd" : "nonzero");
  }

  const data = ctx.getImageData(0, 0, size, size).data;

  // Uploaded images: transparent PNG icons use their opaque area; photos/JPGs use their dark parts.
  let hasTransparency = false;
  if (isPhoto) {
    let clear = 0;
    for (let i = 3; i < data.length; i += 4 * 16) if (data[i] < 200) clear++;
    hasTransparency = clear > data.length / (4 * 16) / 20;
  }

  const mask = new Uint8Array(n * n);
  const half = PIXELS_PER_MODULE / 2;
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const i = ((r * PIXELS_PER_MODULE + half) * size + (c * PIXELS_PER_MODULE + half)) * 4;
      const alpha = data[i + 3];
      let inside = alpha > 128;
      if (inside && isPhoto && !hasTransparency) {
        const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
        inside = lum < 0.5;
      }
      mask[r * n + c] = inside ? 1 : 0;
    }
  }

  if (cache.size > 30) cache.clear();
  cache.set(key, mask);
  return mask;
}
