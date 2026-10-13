// Download and copy actions. `svg` and `aspect` come from renderQrSvg().

import { canvasToBlob, svgToCanvas, withSize } from "./raster.js";

const PRINT_DPI = 300;

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

function safeName(name) {
  return String(name || "qr-code").replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "qr-code";
}

/**
 * @param {object} args
 * @param {string} args.svg
 * @param {number} args.aspect   height / width
 * @param {"png"|"jpeg"|"svg"|"pdf"} args.format
 * @param {number} args.size     width in px
 * @param {string} [args.fileName]
 */
export async function exportQr({ svg, aspect, format, size, fileName }) {
  const name = safeName(fileName);
  const width = size;
  const height = Math.round(size * aspect);

  if (format === "svg") {
    const blob = new Blob([`<?xml version="1.0" encoding="UTF-8"?>\n${withSize(svg, width, height)}`], { type: "image/svg+xml" });
    return downloadBlob(blob, `${name}.svg`);
  }

  if (format === "jpeg") {
    // JPG has no transparency, so transparent areas become white.
    const canvas = await svgToCanvas(svg, width, height, { background: "#ffffff" });
    return downloadBlob(await canvasToBlob(canvas, "image/jpeg", 0.95), `${name}.jpg`);
  }

  const canvas = await svgToCanvas(svg, width, height);

  if (format === "pdf") {
    const { jsPDF } = await import("jspdf");
    const mmW = (width / PRINT_DPI) * 25.4;
    const mmH = (height / PRINT_DPI) * 25.4;
    const doc = new jsPDF({ orientation: mmW > mmH ? "landscape" : "portrait", unit: "mm", format: [mmW, mmH] });
    doc.addImage(canvas, "PNG", 0, 0, mmW, mmH);
    return doc.save(`${name}.pdf`);
  }

  return downloadBlob(await canvasToBlob(canvas, "image/png"), `${name}.png`);
}

// Copies the QR as a PNG so it can be pasted into WhatsApp, Docs, email...
export async function copyQrImage({ svg, aspect, size = 768 }) {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    throw new Error("Your browser can't copy images. Use Download instead.");
  }
  const canvas = await svgToCanvas(svg, size, Math.round(size * aspect));
  const blob = await canvasToBlob(canvas, "image/png");
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

// Physical print size at 300 DPI, for the hint under the export options.
export function printSizeCm(widthPx) {
  return ((widthPx / PRINT_DPI) * 2.54).toFixed(1);
}
