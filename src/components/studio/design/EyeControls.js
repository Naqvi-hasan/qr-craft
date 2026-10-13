"use client";

import { ColorInput, ShapePicker, Toggle } from "./controls";
import { eyeInnerPath, eyeOuterPath } from "@/lib/qr/shapes";
import { EYE_INNER_OPTIONS, EYE_OUTER_OPTIONS } from "@/config/qrStyle";

// The three big corner squares ("eyes") help scanners find the code.
export default function EyeControls({ style, set }) {
  const { eyes } = style;
  return (
    <>
      <ShapePicker
        label="Corner frame"
        options={EYE_OUTER_OPTIONS}
        value={eyes.outer}
        onChange={(v) => set("eyes.outer", v)}
        renderPreview={(shape) => eyeOuterPath(0, 0, shape) + eyeInnerPath(0, 0, "square")}
        viewBox="-0.5 -0.5 8 8"
      />
      <ShapePicker
        label="Corner centre"
        options={EYE_INNER_OPTIONS}
        value={eyes.inner}
        onChange={(v) => set("eyes.inner", v)}
        renderPreview={(shape) => eyeInnerPath(-2, -2, shape)}
        viewBox="-0.6 -0.6 4.2 4.2"
      />
      <Toggle label="Same colour as dots" checked={eyes.matchDots} onChange={(v) => set("eyes.matchDots", v)} />
      {!eyes.matchDots && (
        <div className="flex gap-2">
          <ColorInput label="Frame colour" value={eyes.outerColor} onChange={(v) => set("eyes.outerColor", v)} />
          <ColorInput label="Centre colour" value={eyes.innerColor} onChange={(v) => set("eyes.innerColor", v)} />
        </div>
      )}
    </>
  );
}
