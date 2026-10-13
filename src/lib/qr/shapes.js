// SVG path builders for QR modules (dots) and eyes (the 3 big corner squares).
// All coordinates are in "module units": 1 = the width of one QR dot.
// Scanners read the CENTRE of each module, so every shape here covers the centre generously.

const fmt = (n) => Math.round(n * 1000) / 1000;

// Rectangle with its own radius per corner: [topLeft, topRight, bottomRight, bottomLeft].
export function roundedRectPath(x, y, w, h, radii) {
  const [tl, tr, br, bl] = radii.map((r) => Math.max(0, Math.min(r, w / 2, h / 2)));
  return (
    `M${fmt(x + tl)} ${fmt(y)}` +
    `H${fmt(x + w - tr)}` +
    (tr ? `A${fmt(tr)} ${fmt(tr)} 0 0 1 ${fmt(x + w)} ${fmt(y + tr)}` : "") +
    `V${fmt(y + h - br)}` +
    (br ? `A${fmt(br)} ${fmt(br)} 0 0 1 ${fmt(x + w - br)} ${fmt(y + h)}` : "") +
    `H${fmt(x + bl)}` +
    (bl ? `A${fmt(bl)} ${fmt(bl)} 0 0 1 ${fmt(x)} ${fmt(y + h - bl)}` : "") +
    `V${fmt(y + tl)}` +
    (tl ? `A${fmt(tl)} ${fmt(tl)} 0 0 1 ${fmt(x + tl)} ${fmt(y)}` : "") +
    "Z"
  );
}

export function circlePath(cx, cy, r) {
  return `M${fmt(cx - r)} ${fmt(cy)}a${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(2 * r)} 0a${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(-2 * r)} 0Z`;
}

function diamondPath(cx, cy, half) {
  return `M${fmt(cx)} ${fmt(cy - half)}L${fmt(cx + half)} ${fmt(cy)}L${fmt(cx)} ${fmt(cy + half)}L${fmt(cx - half)} ${fmt(cy)}Z`;
}

// ---------- Module (dot) shapes ----------
// `has(dr, dc)` tells whether the neighbouring module is also dark (used by "rounded").

const OVERLAP = 0.02; // tiny overlap so neighbouring squares don't show hairline gaps

export const DOT_SHAPES = {
  square: (x, y) => roundedRectPath(x - OVERLAP / 2, y - OVERLAP / 2, 1 + OVERLAP, 1 + OVERLAP, [0, 0, 0, 0]),

  // Neighbour-aware: corners are rounded only where the module has no neighbour,
  // so connected modules flow into smooth blobs.
  rounded: (x, y, has) => {
    const r = 0.5;
    const up = has(-1, 0);
    const down = has(1, 0);
    const left = has(0, -1);
    const right = has(0, 1);
    return roundedRectPath(x - OVERLAP / 2, y - OVERLAP / 2, 1 + OVERLAP, 1 + OVERLAP, [
      !up && !left ? r : 0,
      !up && !right ? r : 0,
      !down && !right ? r : 0,
      !down && !left ? r : 0,
    ]);
  },

  dots: (x, y) => circlePath(x + 0.5, y + 0.5, 0.46),

  diamond: (x, y) => diamondPath(x + 0.5, y + 0.5, 0.56),

  leaf: (x, y) => roundedRectPath(x + 0.04, y + 0.04, 0.92, 0.92, [0.46, 0.08, 0.46, 0.08]),

  // Smaller squares with gaps: a light, "pixel" look.
  pixel: (x, y) => roundedRectPath(x + 0.1, y + 0.1, 0.8, 0.8, [0.12, 0.12, 0.12, 0.12]),
};

// ---------- Eye shapes ----------
// Outer ring: 7×7 with a 5×5 hole. Drawn as one path with fill-rule="evenodd".

const OUTER = {
  square: { outer: [0, 0, 0, 0], hole: [0, 0, 0, 0] },
  rounded: { outer: [1.8, 1.8, 1.8, 1.8], hole: [1, 1, 1, 1] },
  leaf: { outer: [3, 0.6, 3, 0.6], hole: [2.1, 0.3, 2.1, 0.3] },
};

export function eyeOuterPath(x, y, shape) {
  if (shape === "circle") return circlePath(x + 3.5, y + 3.5, 3.5) + circlePath(x + 3.5, y + 3.5, 2.5);
  const s = OUTER[shape] ?? OUTER.square;
  return roundedRectPath(x, y, 7, 7, s.outer) + roundedRectPath(x + 1, y + 1, 5, 5, s.hole);
}

export function eyeInnerPath(x, y, shape) {
  const ix = x + 2;
  const iy = y + 2;
  switch (shape) {
    case "rounded":
      return roundedRectPath(ix, iy, 3, 3, [0.9, 0.9, 0.9, 0.9]);
    case "circle":
      return circlePath(ix + 1.5, iy + 1.5, 1.5);
    case "diamond":
      return diamondPath(ix + 1.5, iy + 1.5, 1.85);
    case "leaf":
      return roundedRectPath(ix, iy, 3, 3, [1.4, 0.3, 1.4, 0.3]);
    default:
      return roundedRectPath(ix, iy, 3, 3, [0, 0, 0, 0]);
  }
}

export const DOT_SHAPE_IDS = Object.keys(DOT_SHAPES);
export const EYE_OUTER_IDS = ["square", "rounded", "circle", "leaf"];
export const EYE_INNER_IDS = ["square", "rounded", "circle", "diamond", "leaf"];
