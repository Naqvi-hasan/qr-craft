"use client";

import { OptionPills, Slider } from "./controls";
import { EC_LEVELS } from "@/config/qrStyle";
import { getEffectiveEcLevel } from "@/lib/qr/style";

export default function AdvancedControls({ style, set, onReset }) {
  const forced = getEffectiveEcLevel(style) !== style.ecLevel;
  return (
    <>
      <OptionPills
        label="Error correction (higher = survives damage, but more dots)"
        options={EC_LEVELS}
        value={forced ? "H" : style.ecLevel}
        onChange={(v) => set("ecLevel", v)}
        disabled={forced}
      />
      {forced && <p className="-mt-2 text-xs text-subtle">Locked to High because a logo or picture art is on.</p>}
      <Slider
        label="Quiet zone (empty border)"
        value={style.quietZone}
        min={1}
        max={6}
        onChange={(v) => set("quietZone", v)}
        format={(v) => `${v} dot${v > 1 ? "s" : ""}`}
      />
      <button type="button" onClick={onReset} className="self-start text-xs font-medium text-subtle underline-offset-2 hover:text-danger hover:underline">
        Reset the whole design
      </button>
    </>
  );
}
