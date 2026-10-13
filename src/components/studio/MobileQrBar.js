"use client";

import { useEffect, useState } from "react";
import Icon from "../Icon";

// Phones/tablets only: once the QR is ready, a floating button jumps down to the preview.
// It hides itself while the preview is already on screen.
export default function MobileQrBar({ ready, targetId, label }) {
  const [targetVisible, setTargetVisible] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setTargetVisible(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  if (!ready || targetVisible) return null;

  return (
    <button
      type="button"
      onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" })}
      className="bg-brand-gradient fixed inset-x-4 bottom-4 z-40 flex items-center justify-center gap-2 rounded-2xl px-4 py-3.5 text-sm font-semibold text-on-primary shadow-card lg:hidden"
    >
      <Icon name="qr" size={18} />
      {label} QR ready: view and download
      <Icon name="chevron" size={16} />
    </button>
  );
}
