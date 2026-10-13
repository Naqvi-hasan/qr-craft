"use client";

import { useEffect, useState } from "react";
import { scanCheck } from "@/lib/qr/validate";

// Re-checks the design a moment after it stops changing.
// status: "idle" (nothing to check) | "checking" | "pass" | "fail" | "error"
export function useScanCheck({ svg, aspect, payload }, delay = 450) {
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    if (!svg || !payload) {
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("checking");
    const timer = setTimeout(() => {
      scanCheck({ svg, aspect, payload })
        .then((result) => !cancelled && setStatus(result))
        .catch(() => !cancelled && setStatus("error"));
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [svg, aspect, payload, delay]);

  return status;
}
