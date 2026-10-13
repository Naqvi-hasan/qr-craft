"use client";

import { useState } from "react";
import Icon from "../../Icon";
import { ColorInput, FieldLabel, ImageDrop, OptionPills, Slider, readImageFile } from "./controls";
import { ART_SHAPE_OPTIONS, MAX_ART_BYTES } from "@/config/qrStyle";
import { deriveArtColors } from "@/lib/color";

// Picture art: colours the QR's own dots to paint a shape. No dots move, so the code still scans.
export default function ArtControls({ style, set }) {
  const { art } = style;
  const [error, setError] = useState(null);
  const on = art.shape !== "none";
  const { dark, light } = deriveArtColors(art.color, style.background.color, art.strength);

  async function handleFile(file) {
    try {
      set("art.custom", await readImageFile(file, MAX_ART_BYTES));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <OptionPills label="Shape" options={ART_SHAPE_OPTIONS} value={art.shape} onChange={(v) => set("art.shape", v)} />

      {art.shape === "monogram" && (
        <label className="flex flex-col gap-1.5">
          <FieldLabel hint="1 to 3 letters">Letters</FieldLabel>
          <input
            type="text"
            value={art.text}
            maxLength={3}
            onChange={(e) => set("art.text", e.target.value.replace(/\s/g, "").toUpperCase())}
            placeholder="HA"
            className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm font-semibold uppercase tracking-widest text-text outline-none transition focus:border-primary"
          />
        </label>
      )}

      {art.shape === "custom" &&
        (art.custom ? (
          <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={art.custom} alt="Your shape" className="h-11 w-11 rounded-lg bg-white object-contain p-1" />
            <span className="flex-1 text-xs text-muted">Bold, simple icons work best. Photos use their dark areas.</span>
            <button type="button" onClick={() => set("art.custom", null)} aria-label="Remove shape" className="rounded-lg p-1.5 text-subtle hover:bg-surface hover:text-danger">
              <Icon name="x" size={16} />
            </button>
          </div>
        ) : (
          <ImageDrop label="Upload a simple icon or logo (max 1 MB)" onFile={handleFile} error={error} />
        ))}

      {on && (
        <>
          <div className="flex items-end gap-3">
            <ColorInput label="Shape colour" value={art.color} onChange={(v) => set("art.color", v)} />
            <span className="flex shrink-0 items-center gap-1 pb-2 text-[11px] text-subtle" title="Colours actually used, adjusted so the code still scans">
              <span className="h-5 w-5 rounded border border-line" style={{ background: dark }} />
              <span className="h-5 w-5 rounded border border-line" style={{ background: light }} />
              Used
            </span>
          </div>
          <Slider label="Shape strength" value={Math.round(art.strength * 100)} min={20} max={80} step={5} onChange={(v) => set("art.strength", v / 100)} format={(v) => `${v}%`} />
          <OptionPills
            label="Picture detail"
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
            ]}
            value={art.detail}
            onChange={(v) => set("art.detail", v)}
          />
          <p className="flex gap-2 rounded-lg bg-primary-soft px-3 py-2 text-xs text-primary-text">
            <Icon name="info" size={15} className="mt-px shrink-0" />
            Higher detail adds more dots, so the shape looks sharper. The scan check below the preview tells you if the design still reads.
          </p>
        </>
      )}
    </>
  );
}
