"use client";

import { useEffect, useMemo, useState } from "react";
import { createMatrix } from "@/lib/qr/matrix";
import { renderQrSvg } from "@/lib/qr/render";
import { buildArtMask } from "@/lib/qr/mask";
import { getEffectiveEcLevel, getMinVersion, hasArt } from "@/lib/qr/style";

// payload + style  ->  { svg, aspect } ready to show or export.
// The picture-art mask needs a canvas (and may load an image), so it is built asynchronously.
export function useQrDesign(payload, style, width = 512) {
  const ecLevel = getEffectiveEcLevel(style);
  const minVersion = getMinVersion(style);

  const { matrix, error } = useMemo(() => {
    if (!payload) return { matrix: null, error: null };
    try {
      return { matrix: createMatrix(payload, ecLevel, minVersion), error: null };
    } catch {
      return { matrix: null, error: "This content is too long for one QR code. Shorten it or lower error correction." };
    }
  }, [payload, ecLevel, minVersion]);

  const art = style.art;
  const artOn = hasArt(style);
  const [mask, setMask] = useState(null);

  useEffect(() => {
    if (!matrix || !artOn) {
      setMask(null);
      return;
    }
    let cancelled = false;
    buildArtMask(art, matrix.size)
      .then((m) => !cancelled && setMask(m))
      .catch(() => !cancelled && setMask(null));
    return () => {
      cancelled = true;
    };
    // Only the parts of `art` that change the shape matter here.
  }, [matrix, artOn, art.shape, art.text, art.custom]); // eslint-disable-line react-hooks/exhaustive-deps

  const rendered = useMemo(() => {
    if (!matrix) return null;
    const usableMask = mask && mask.length === matrix.size * matrix.size ? mask : null;
    return renderQrSvg({ matrix, style, mask: usableMask, width });
  }, [matrix, style, mask, width]);

  return { svg: rendered?.svg ?? null, aspect: rendered?.aspect ?? 1, moduleCount: matrix?.size ?? 0, error };
}
