"use client";

import { useRef } from "react";
import Icon from "../Icon";

const STEPS = [
  { icon: "app", title: "Pick a type", text: "Choose what the QR should do: open a link, call, join WiFi, pay by UPI and more." },
  { icon: "edit", title: "Fill in the details", text: "The QR updates live as you type. Fix anything marked in red." },
  { icon: "download", title: "Download and test", text: "Download PNG for screens, SVG for print. Always test-scan with 2 phones before printing." },
];

// "Help" button in the header that opens a short how-to.
export default function HelpDialog() {
  const dialogRef = useRef(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-text"
      >
        <Icon name="help" size={18} />
        <span className="hidden sm:inline">Help</span>
      </button>

      <dialog
        ref={dialogRef}
        onClick={(e) => e.target === dialogRef.current && dialogRef.current.close()}
        className="m-auto w-[min(92vw,440px)] rounded-2xl border border-line bg-surface p-0 text-text shadow-card"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-base font-semibold">How it works</h2>
          <button type="button" onClick={() => dialogRef.current?.close()} aria-label="Close" className="rounded-lg p-1.5 text-subtle hover:bg-surface-2 hover:text-text">
            <Icon name="x" size={18} />
          </button>
        </div>
        <ol className="flex flex-col gap-4 px-5 py-5">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary-text">
                <Icon name={step.icon} size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">
                  {i + 1}. {step.title}
                </p>
                <p className="mt-0.5 text-sm text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="border-t border-line px-5 py-3 text-xs text-subtle">Your data never leaves your browser. Static QR codes work forever.</p>
      </dialog>
    </>
  );
}
