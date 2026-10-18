"use client";

import { useCallback, useState } from "react";
import Icon from "../Icon";
import CameraScanner from "./CameraScanner";
import ImageScanner from "./ImageScanner";
import ScanResult from "./ScanResult";
import { parseQrText } from "@/lib/scan/parse";

const MODES = [
  { id: "camera", label: "Camera", icon: "camera" },
  { id: "image", label: "Upload image", icon: "image" },
];

export default function ScannerApp() {
  const [mode, setMode] = useState("camera");
  const [result, setResult] = useState(null);

  const handleText = useCallback((text) => setResult(parseQrText(text)), []);

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <section aria-label="Scan a QR code" className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-4 shadow-card sm:p-5">
        <div role="tablist" aria-label="How to scan" className="flex gap-1 rounded-xl border border-line bg-surface-2 p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                mode === m.id ? "bg-brand-gradient text-on-primary" : "text-muted hover:text-text"
              }`}
            >
              <Icon name={m.icon} size={16} />
              {m.label}
            </button>
          ))}
        </div>
        {mode === "camera" ? <CameraScanner onResult={handleText} /> : <ImageScanner onResult={handleText} />}
      </section>

      <section aria-label="Scan result" aria-live="polite">
        {result ? (
          <ScanResult result={result} onScanAgain={() => setResult(null)} />
        ) : (
          <div className="flex flex-col gap-3 rounded-3xl border border-dashed border-line-strong bg-surface p-6 text-sm text-muted">
            <h2 className="text-base font-semibold text-text">What you'll see here</h2>
            <p>What the code contains, before anything opens: the real website address, WiFi password, contact details or UPI payee.</p>
            <ul className="flex flex-col gap-2">
              <li className="flex gap-2">
                <Icon name="shield" size={16} className="mt-0.5 shrink-0 text-success" />
                Links never open by themselves. Check the address first.
              </li>
              <li className="flex gap-2">
                <Icon name="alert" size={16} className="mt-0.5 shrink-0 text-warning" />
                We warn you about short links, insecure sites and look-alike addresses.
              </li>
              <li className="flex gap-2">
                <Icon name="lock" size={16} className="mt-0.5 shrink-0 text-primary-text" />
                Scanning happens on your device. Nothing is uploaded.
              </li>
            </ul>
          </div>
        )}
      </section>
    </div>
  );
}
