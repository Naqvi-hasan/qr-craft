"use client";

import { useEffect, useState } from "react";
import Icon from "../Icon";
import { decodeImageData, imageDataFrom } from "@/lib/qr/decoder";

const MAX_BYTES = 15 * 1024 * 1024;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't open that image. Try a JPG or PNG."));
    };
    img.src = url;
  });
}

// Reads a QR from a photo or screenshot. Tries a few sizes because tiny or huge
// codes in a big photo read better at different scales.
async function scanFile(file) {
  if (!file.type.startsWith("image/")) throw new Error("Choose an image file (photo or screenshot).");
  if (file.size > MAX_BYTES) throw new Error("That image is over 15 MB. Try a smaller photo or a screenshot.");
  const img = await loadImage(file);
  for (const maxSide of [1200, 2000, 700]) {
    const found = await decodeImageData(imageDataFrom(img, img.naturalWidth, img.naturalHeight, maxSide), { invert: true });
    if (found) return found.text;
  }
  throw new Error("No QR code found. Make sure the whole code is in the picture, in focus and not cut off.");
}

export default function ImageScanner({ onResult }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [dragging, setDragging] = useState(false);

  async function handle(file) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onResult(await scanFile(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  // Paste a screenshot with Ctrl+V / Cmd+V anywhere on the page.
  useEffect(() => {
    const onPaste = (e) => {
      const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith("image/"));
      if (file) handle(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  });

  return (
    <div className="flex flex-col gap-3">
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handle(e.dataTransfer.files?.[0]);
        }}
        className={`flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 text-center transition sm:aspect-video ${
          dragging ? "border-primary bg-primary-soft" : "border-line-strong bg-surface-2 hover:border-primary"
        }`}
      >
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary-text">
          <Icon name={busy ? "loader" : "image"} size={26} className={busy ? "animate-spin" : ""} />
        </span>
        <span className="text-sm font-semibold text-text">{busy ? "Reading the code…" : "Upload a photo or screenshot"}</span>
        <span className="text-xs text-muted">Drag and drop, tap to choose, or paste with Ctrl+V</span>
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            handle(file);
          }}
        />
      </label>
      {error && (
        <p role="alert" className="flex gap-2 rounded-xl bg-warning-soft px-3 py-2 text-xs text-warning">
          <Icon name="alert" size={15} className="mt-px shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
