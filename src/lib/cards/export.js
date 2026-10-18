// Downloads for printable cards: PNG and PDF at 300 DPI, plus an A4 sheet with several copies.

import { canvasToBlob, svgToCanvas } from "../qr/raster.js";
import { sheetLayout } from "./cards.js";

const DPI = 300;
const mmToPx = (mm) => Math.round((mm / 25.4) * DPI);

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const fileBase = (card, name) => String(name || card.label).replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "card";

async function renderCanvas(svg, card) {
  const [w, h] = card.sizeMm;
  return svgToCanvas(svg, mmToPx(w), mmToPx(h), { background: "#ffffff" });
}

export async function downloadCardPng({ svg, card, name }) {
  const canvas = await renderCanvas(svg, card);
  downloadBlob(await canvasToBlob(canvas, "image/png"), `${fileBase(card, name)}.png`);
}

export async function downloadCardPdf({ svg, card, name }) {
  const [w, h] = card.sizeMm;
  const canvas = await renderCanvas(svg, card);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: w > h ? "landscape" : "portrait", unit: "mm", format: [w, h] });
  doc.addImage(canvas, "PNG", 0, 0, w, h);
  doc.save(`${fileBase(card, name)}.pdf`);
}

// A4 page filled with copies, with light cut lines around each card.
export async function downloadCardSheet({ svg, card, name }) {
  const canvas = await renderCanvas(svg, card);
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const { slots } = sheetLayout(card);
  doc.setDrawColor(190, 190, 190);
  doc.setLineWidth(0.15);
  for (const s of slots) {
    doc.addImage(canvas, "PNG", s.x, s.y, s.w, s.h);
    doc.rect(s.x, s.y, s.w, s.h);
  }
  doc.save(`${fileBase(card, name)}-a4-sheet.pdf`);
  return slots.length;
}
