"use client";

import { useState } from "react";
import Icon from "../Icon";
import { DOWNLOAD_FORMATS, DOWNLOAD_SIZES } from "@/config/qrStyle";
import { copyQrImage, exportQr, printSizeCm } from "@/lib/qr/export";

// Download (PNG, SVG, PDF, JPG) and copy. Feedback appears on the button that was used.
export default function ExportPanel({ svg, aspect, fileName, transparent }) {
  const [format, setFormat] = useState("png");
  const [size, setSize] = useState(1024);
  const [name, setName] = useState("");
  const [status, setStatus] = useState(null); // { type: "ok", key } | { type: "error", text }
  const [busy, setBusy] = useState(false);
  const disabled = !svg || busy;
  const formatInfo = DOWNLOAD_FORMATS.find((f) => f.value === format);

  async function run(key, action) {
    setBusy(true);
    setStatus(null);
    try {
      await action();
      setStatus({ type: "ok", key });
      setTimeout(() => setStatus(null), 2200);
    } catch (err) {
      setStatus({ type: "error", text: err?.message || "Something went wrong. Try again." });
    } finally {
      setBusy(false);
    }
  }

  const finalName = name.trim() || fileName;

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => run("download", () => exportQr({ svg, aspect, format, size, fileName: finalName }))}
        className="bg-brand-gradient flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-on-primary shadow-card transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:brightness-100"
      >
        <Icon name={status?.key === "download" ? "check" : busy ? "loader" : "download"} size={18} className={busy ? "animate-spin" : ""} />
        {status?.key === "download" ? "Downloaded" : `Download ${formatInfo.label}`}
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => run("copy", () => copyQrImage({ svg, aspect }))}
        className="flex items-center justify-center gap-2 rounded-xl border border-primary/50 bg-surface px-4 py-2.5 text-sm font-semibold text-primary-text transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:border-line disabled:text-subtle disabled:hover:bg-surface"
      >
        <Icon name={status?.key === "copy" ? "check" : "copy"} size={17} />
        {status?.key === "copy" ? "Copied. Paste it anywhere" : "Copy image"}
      </button>

      {status?.type === "error" && (
        <p role="alert" className="text-center text-xs font-medium text-danger">
          {status.text}
        </p>
      )}

      <div className="flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-3">
        <div role="radiogroup" aria-label="File format" className="grid grid-cols-4 gap-1 rounded-lg border border-line bg-surface p-1">
          {DOWNLOAD_FORMATS.map((f) => (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={format === f.value}
              onClick={() => setFormat(f.value)}
              className={`rounded-md py-1.5 text-xs font-semibold transition ${format === f.value ? "bg-brand-gradient text-on-primary" : "text-muted hover:text-text"}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-subtle">Size</span>
            <span className="relative">
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                disabled={format === "svg"}
                className="w-full cursor-pointer appearance-none rounded-lg border border-line bg-surface py-2 pl-2.5 pr-7 text-sm font-medium text-text outline-none focus:border-primary disabled:cursor-default disabled:opacity-60"
              >
                {DOWNLOAD_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {format === "svg" ? "Any size" : `${s} px`}
                  </option>
                ))}
              </select>
              <Icon name="chevron" size={14} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-subtle" />
            </span>
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-subtle">File name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={fileName}
              maxLength={60}
              className="w-full rounded-lg border border-line bg-surface px-2.5 py-2 text-sm text-text outline-none placeholder:text-subtle focus:border-primary"
            />
          </label>
        </div>

        <p className="flex items-start gap-1.5 text-xs text-muted">
          <Icon name="info" size={14} className="mt-px shrink-0 text-subtle" />
          <span>
            {formatInfo.hint}.
            {format !== "svg" && ` Prints up to ${printSizeCm(size)} cm wide at full quality.`}
            {transparent && format === "jpeg" && " JPG can't be transparent, so white is used."}
          </span>
        </p>
      </div>
    </div>
  );
}
