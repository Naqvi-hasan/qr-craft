// Files for printing: PNG, PDF (one page per side), print-shop PDF (bleed + crop marks),
// A4 sheets (with mirrored backs for double-sided printing), table tents, bulk sets
// and the WhatsApp-size e-invite. Everything is drawn in the browser at 300 DPI.

import { canvasToBlob, svgToCanvas } from "../qr/raster.js";
import { BLEED, withBleed } from "./kit.js";
import { sheetLayout } from "./engine.js";

const DPI = 300;
const px = (mm) => Math.round((mm / 25.4) * DPI);
const MARK_SPACE = 8; // room around a print-shop page for crop marks

export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

export const fileBase = (name, fallback = "print") =>
  String(name || fallback)
    .replace(/[^\p{L}\p{N}_-]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || fallback;

export function renderCanvas(svg, [w, h], { bleed = 0, scale = 1 } = {}) {
  const source = bleed ? withBleed(svg, w, h, bleed) : svg;
  return svgToCanvas(source, Math.round(px(w + 2 * bleed) * scale), Math.round(px(h + 2 * bleed) * scale), { background: "#ffffff" });
}

async function loadPdf() {
  const { jsPDF } = await import("jspdf");
  return jsPDF;
}

const orientation = (w, h) => (w > h ? "landscape" : "portrait");

export async function downloadPng({ svg, size, name }) {
  const canvas = await renderCanvas(svg, size);
  downloadBlob(await canvasToBlob(canvas, "image/png"), `${fileBase(name)}.png`);
}

function cropMarks(doc, x, y, w, h) {
  const gap = BLEED + 0.5;
  const len = 4.5;
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.12);
  for (const [cx, sx] of [
    [x, -1],
    [x + w, 1],
  ]) {
    for (const [cy, sy] of [
      [y, -1],
      [y + h, 1],
    ]) {
      doc.line(cx + sx * gap, cy, cx + sx * (gap + len), cy);
      doc.line(cx, cy + sy * gap, cx, cy + sy * (gap + len));
    }
  }
}

// One page per side. printShop = artwork with 3 mm bleed and crop marks around it.
export async function downloadPdf({ pages, size, name, printShop = false }) {
  const [w, h] = size;
  const JsPDF = await loadPdf();
  const pageW = printShop ? w + 2 * (BLEED + MARK_SPACE) : w;
  const pageH = printShop ? h + 2 * (BLEED + MARK_SPACE) : h;
  const doc = new JsPDF({ orientation: orientation(pageW, pageH), unit: "mm", format: [pageW, pageH] });
  for (let i = 0; i < pages.length; i++) {
    if (i > 0) doc.addPage([pageW, pageH], orientation(pageW, pageH));
    const canvas = await renderCanvas(pages[i], size, { bleed: printShop ? BLEED : 0 });
    if (printShop) {
      doc.addImage(canvas, "PNG", MARK_SPACE, MARK_SPACE, w + 2 * BLEED, h + 2 * BLEED);
      cropMarks(doc, MARK_SPACE + BLEED, MARK_SPACE + BLEED, w, h);
    } else {
      doc.addImage(canvas, "PNG", 0, 0, w, h);
    }
  }
  doc.save(`${fileBase(name)}${printShop ? "-print-shop" : ""}.pdf`);
}

/**
 * A4 sheets. items = [{ front: svg, back?: svg }]. A single design is repeated to fill one page.
 * Backs go on the following page in mirrored columns, so the paper can be flipped on the long edge.
 */
export async function downloadSheet({ items, size, sheet, name, onProgress }) {
  const layout = sheetLayout(size, sheet);
  const perPage = layout.slots.length;
  const list = items.length === 1 ? Array.from({ length: perPage }, () => items[0]) : items;
  const hasBack = list.some((it) => it.back);
  const JsPDF = await loadPdf();
  const doc = new JsPDF({ orientation: layout.landscape ? "landscape" : "portrait", unit: "mm", format: "a4" });
  const cache = new Map();
  const bulk = list.length > perPage;
  let done = 0;
  const total = list.length * (hasBack ? 2 : 1);
  async function image(svg) {
    if (!cache.has(svg)) {
      if (cache.size > 6) cache.clear();
      const canvas = await renderCanvas(svg, size);
      // Big jobs use JPEG to keep the PDF small; single designs stay lossless.
      cache.set(svg, bulk ? { data: canvas.toDataURL("image/jpeg", 0.92), type: "JPEG" } : { data: canvas, type: "PNG" });
    }
    return cache.get(svg);
  }
  const pages = Math.ceil(list.length / perPage);
  let first = true;
  for (let p = 0; p < pages; p++) {
    const chunk = list.slice(p * perPage, (p + 1) * perPage);
    for (const side of hasBack ? ["front", "back"] : ["front"]) {
      if (!first) doc.addPage("a4", layout.landscape ? "landscape" : "portrait");
      first = false;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.12);
      for (let i = 0; i < chunk.length; i++) {
        const svg = chunk[i][side];
        if (!svg) continue;
        let slot = layout.slots[i];
        if (side === "back") slot = layout.slots.find((s) => s.row === slot.row && s.col === sheet.cols - 1 - slot.col);
        const img = await image(svg);
        doc.addImage(img.data, img.type, slot.x, slot.y, slot.w, slot.h);
        doc.rect(slot.x, slot.y, slot.w, slot.h);
        done++;
        onProgress?.(done, total);
      }
    }
  }
  doc.save(`${fileBase(name)}-a4${list.length > 1 && items.length > 1 ? `-${list.length}` : ""}.pdf`);
  return { pages: doc.getNumberOfPages?.() ?? pages, copies: list.length };
}

function rotated(canvas) {
  const out = document.createElement("canvas");
  out.width = canvas.width;
  out.height = canvas.height;
  const ctx = out.getContext("2d");
  ctx.translate(out.width, out.height);
  ctx.rotate(Math.PI);
  ctx.drawImage(canvas, 0, 0);
  return out;
}

// Table tent: the card twice (top copy upside down), fold in the middle and it stands on a table.
export async function downloadTent({ svg, size, name }) {
  const [w, h] = size;
  const canvas = await renderCanvas(svg, size);
  const flipped = rotated(canvas);
  const JsPDF = await loadPdf();
  const doc = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const scale = Math.min(1, 200 / (2 * w), 285 / (2 * h));
  const cw = w * scale;
  const ch = h * scale;
  const top = (297 - 2 * ch) / 2;
  for (const col of [0, 1]) {
    const x = (210 - 2 * cw) / 2 + col * cw;
    doc.addImage(flipped, "PNG", x, top, cw, ch);
    doc.addImage(canvas, "PNG", x, top + ch, cw, ch);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.12);
    doc.rect(x, top, cw, 2 * ch);
    doc.setLineDashPattern?.([2, 1.5], 0);
    doc.setDrawColor(120, 120, 120);
    doc.line(x, top + ch, x + cw, top + ch);
    doc.setLineDashPattern?.([], 0);
  }
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text("Cut along the grey lines, fold on the dashed line.", 105, 292, { align: "center" });
  doc.save(`${fileBase(name)}-table-tent.pdf`);
}

// WhatsApp / Instagram-story size image (1080 × 1920) with the card in the middle.
export async function makeEInvite({ svg, size, background = "#111827" }) {
  const [w, h] = size;
  const W = 1080;
  const H = 1920;
  const cardW = 940;
  const cardH = Math.round((cardW * h) / w);
  const card = await svgToCanvas(svg, cardW * 2, cardH * 2, { background: "#ffffff" });
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, background);
  grad.addColorStop(1, "#0b1020");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  const x = (W - cardW) / 2;
  const y = Math.max(40, (H - cardH) / 2);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 20;
  ctx.fillStyle = "#ffffff";
  roundRect(ctx, x, y, cardW, cardH, 26);
  ctx.fill();
  ctx.restore();
  ctx.save();
  roundRect(ctx, x, y, cardW, cardH, 26);
  ctx.clip();
  ctx.drawImage(card, x, y, cardW, cardH);
  ctx.restore();
  return canvasToBlob(canvas, "image/jpeg", 0.92);
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function canShareFiles() {
  try {
    return typeof navigator !== "undefined" && !!navigator.canShare && navigator.canShare({ files: [new File(["x"], "x.jpg", { type: "image/jpeg" })] });
  } catch {
    return false;
  }
}

// Phone share sheet (WhatsApp etc.). Falls back to a download.
export async function shareOrDownload(blob, fileName, title) {
  const file = new File([blob], fileName, { type: blob.type });
  if (canShareFiles()) {
    try {
      await navigator.share({ files: [file], title });
      return "shared";
    } catch (err) {
      if (err?.name === "AbortError") return "cancelled";
    }
  }
  downloadBlob(blob, fileName);
  return "downloaded";
}
