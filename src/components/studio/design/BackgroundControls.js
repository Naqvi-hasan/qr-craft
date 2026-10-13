"use client";

import { ColorInput, Toggle } from "./controls";

export default function BackgroundControls({ style, set }) {
  const { background } = style;
  return (
    <>
      <ColorInput label="Background colour" value={background.color} onChange={(v) => set("background.color", v)} />
      <Toggle
        label="Transparent background"
        hint="For placing the QR on your own design. Works with PNG, SVG and PDF."
        checked={background.transparent}
        onChange={(v) => set("background.transparent", v)}
      />
      <Toggle label="Rounded corners" checked={background.rounded} onChange={(v) => set("background.rounded", v)} />
    </>
  );
}
