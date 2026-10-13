"use client";

import { ColorInput, OptionPills, ShapePicker, Slider } from "./controls";
import { DOT_SHAPES } from "@/lib/qr/shapes";
import { DOT_SHAPE_OPTIONS } from "@/config/qrStyle";

// A tiny 3×3 pattern so each tile shows how the shape looks next to its neighbours.
const SAMPLE = [
  [1, 1, 0],
  [1, 0, 1],
  [0, 1, 1],
];
const sampleHas = (r, c) => r >= 0 && c >= 0 && r < 3 && c < 3 && SAMPLE[r][c] === 1;

function dotPreview(shape) {
  let d = "";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (SAMPLE[r][c]) d += DOT_SHAPES[shape](c, r, (dr, dc) => sampleHas(r + dr, c + dc));
    }
  }
  return d;
}

export default function DotControls({ style, set }) {
  const { dots } = style;
  const gradient = dots.gradient;

  return (
    <>
      <ShapePicker label="Dot shape" options={DOT_SHAPE_OPTIONS} value={dots.shape} onChange={(v) => set("dots.shape", v)} renderPreview={dotPreview} viewBox="-0.2 -0.2 3.4 3.4" />

      <OptionPills
        label="Fill"
        options={[
          { value: "solid", label: "Solid colour" },
          { value: "gradient", label: "Gradient" },
        ]}
        value={gradient.enabled ? "gradient" : "solid"}
        onChange={(v) => set("dots.gradient.enabled", v === "gradient")}
      />

      {gradient.enabled ? (
        <>
          <div className="flex gap-2">
            <ColorInput label="From" value={gradient.from} onChange={(v) => set("dots.gradient.from", v)} />
            <ColorInput label="To" value={gradient.to} onChange={(v) => set("dots.gradient.to", v)} />
          </div>
          <OptionPills
            label="Gradient type"
            options={[
              { value: "linear", label: "Linear" },
              { value: "radial", label: "Radial" },
            ]}
            value={gradient.type}
            onChange={(v) => set("dots.gradient.type", v)}
          />
          {gradient.type === "linear" && (
            <Slider label="Angle" value={gradient.rotation} min={0} max={360} step={15} onChange={(v) => set("dots.gradient.rotation", v)} format={(v) => `${v}°`} />
          )}
        </>
      ) : (
        <ColorInput label="Dot colour" value={dots.color} onChange={(v) => set("dots.color", v)} />
      )}
    </>
  );
}
