"use client";

import { useState } from "react";
import Icon from "../../Icon";
import { ImageDrop, Slider, readImageFile } from "./controls";
import { MAX_LOGO_BYTES } from "@/config/qrStyle";

// The logo is read in the browser and never uploaded anywhere.
export default function LogoControls({ style, set }) {
  const { logo } = style;
  const [error, setError] = useState(null);

  async function handleFile(file) {
    try {
      set("logo.src", await readImageFile(file, MAX_LOGO_BYTES));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  if (!logo.src) {
    return (
      <>
        <ImageDrop label="Upload logo (max 500 KB)" onFile={handleFile} error={error} />
        <p className="text-xs text-subtle">Square logos with a transparent background look best.</p>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-2.5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo.src} alt="Your logo" className="h-11 w-11 rounded-lg bg-white object-contain p-1" />
        <span className="flex-1 text-xs text-muted">Logo added. Error correction switched to High so it still scans.</span>
        <button type="button" onClick={() => set("logo.src", null)} aria-label="Remove logo" className="rounded-lg p-1.5 text-subtle hover:bg-surface hover:text-danger">
          <Icon name="x" size={16} />
        </button>
      </div>
      <Slider label="Logo size" value={Math.round(logo.size * 100)} min={12} max={30} onChange={(v) => set("logo.size", v / 100)} format={(v) => `${v}%`} />
      <Slider label="Space around logo" value={logo.padding} min={0} max={3} onChange={(v) => set("logo.padding", v)} format={(v) => (v === 0 ? "None" : `${v} dot${v > 1 ? "s" : ""}`)} />
    </>
  );
}
