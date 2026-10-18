"use client";

import { useState } from "react";
import Link from "next/link";
import Icon from "../Icon";
import { prefillLink } from "@/lib/studioLink";

function Field({ field }) {
  const [shown, setShown] = useState(!field.secret);
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(field.value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: the user can still select the text.
    }
  }
  return (
    <div className="flex items-start gap-3 border-b border-line py-2.5 last:border-b-0">
      <dt className="w-24 shrink-0 text-xs font-semibold uppercase tracking-wide text-subtle">{field.label}</dt>
      <dd className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm text-text">{shown ? field.value : "•".repeat(Math.min(12, field.value.length))}</dd>
      <span className="flex shrink-0 gap-1">
        {field.secret && (
          <button type="button" onClick={() => setShown((s) => !s)} aria-label={shown ? "Hide" : "Show"} className="rounded-md p-1 text-subtle hover:text-text">
            <Icon name="eye" size={15} />
          </button>
        )}
        <button type="button" onClick={copy} aria-label={`Copy ${field.label}`} className="rounded-md p-1 text-subtle hover:text-text">
          <Icon name={copied ? "check" : "copy"} size={15} />
        </button>
      </span>
    </div>
  );
}

// Shows what a scanned code contains. Links are never opened automatically.
export default function ScanResult({ result, onScanAgain }) {
  const [copied, setCopied] = useState(false);

  async function copyAll() {
    try {
      await navigator.clipboard.writeText(result.raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-center gap-3">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${result.kind === "unsafe" ? "bg-danger-soft text-danger" : "bg-primary-soft text-primary-text"}`}>
          <Icon name={result.icon} size={22} />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Found</p>
          <h2 className="text-lg font-semibold text-text">{result.label}</h2>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {result.warnings.map((w) => (
            <li key={w} className={`flex gap-2 rounded-xl px-3 py-2 text-xs ${result.kind === "unsafe" ? "bg-danger-soft text-danger" : "bg-warning-soft text-warning"}`}>
              <Icon name="alert" size={15} className="mt-px shrink-0" />
              {w}
            </li>
          ))}
        </ul>
      )}

      <dl className="rounded-xl border border-line bg-surface-2 px-3">
        {result.fields.map((f) => (
          <Field key={f.label} field={f} />
        ))}
      </dl>

      <div className="flex flex-wrap gap-2">
        {result.action &&
          (result.action.download ? (
            <a href={result.action.href} download={result.action.download} className="bg-brand-gradient flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-on-primary">
              <Icon name="download" size={16} />
              {result.action.label}
            </a>
          ) : (
            <a href={result.action.href} target="_blank" rel="noopener noreferrer nofollow" className="bg-brand-gradient flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-on-primary">
              <Icon name="external" size={16} />
              {result.action.label}
            </a>
          ))}
        <button type="button" onClick={copyAll} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-text hover:border-line-strong">
          <Icon name={copied ? "check" : "copy"} size={16} />
          {copied ? "Copied" : "Copy text"}
        </button>
        {result.prefill && (
          <Link href={prefillLink(result.prefill.typeId, result.prefill.values)} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-text hover:border-line-strong">
            <Icon name="wand" size={16} />
            Make a QR like this
          </Link>
        )}
        <button type="button" onClick={onScanAgain} className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted hover:text-text">
          <Icon name="scan" size={16} />
          Scan another
        </button>
      </div>
    </div>
  );
}
