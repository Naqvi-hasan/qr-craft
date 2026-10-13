"use client";

import Icon from "../Icon";

const STATUS = {
  idle: { icon: "edit", text: "Waiting for details", tone: "border-line bg-surface text-subtle" },
  checking: { icon: "loader", text: "Checking it scans…", tone: "border-line bg-surface text-muted", spin: true },
  pass: { icon: "checkCircle", text: "Scan-tested", tone: "border-success/30 bg-success-soft text-success" },
  fail: { icon: "alert", text: "Might not scan", tone: "border-warning/30 bg-warning-soft text-warning" },
  error: { icon: "info", text: "Couldn't run the scan check", tone: "border-line bg-surface text-muted" },
};

// Shows the finished SVG. The QR tile keeps its own colours in both site themes,
// and a checkerboard appears behind it when the background is transparent.
export default function QrPreview({ svg, type, scanStatus, transparent, error }) {
  const status = STATUS[svg ? scanStatus : "idle"] ?? STATUS.idle;

  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface-2 px-4 py-6">
      <div
        className="relative grid w-full max-w-[300px] place-items-center rounded-2xl"
        style={
          transparent && svg
            ? { backgroundImage: "repeating-conic-gradient(#d9dde6 0% 25%, #ffffff 0% 50%)", backgroundSize: "16px 16px" }
            : undefined
        }
      >
        {svg ? (
          // The SVG is built by our renderer: all user text is escaped and images must be local data URLs.
          <div role="img" aria-label={`${type.label} QR code preview`} className="qr-canvas w-full" dangerouslySetInnerHTML={{ __html: svg }} />
        ) : (
          <div className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface px-6 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-subtle">
              <Icon name={error ? "alert" : "qr"} size={28} />
            </span>
            <p className="text-xs leading-relaxed text-muted">{error || "Fill in the details and your QR code appears here."}</p>
          </div>
        )}
      </div>

      <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.tone}`} role="status">
        <Icon name={status.icon} size={14} className={status.spin ? "animate-spin" : ""} />
        {status.text}
      </span>

      {svg && scanStatus === "fail" && (
        <p className="max-w-[300px] text-center text-xs text-muted">
          Our checker couldn't read this design. Try darker dots, a smaller logo, lower picture strength, or another dot shape. Always test with your phone.
        </p>
      )}
    </div>
  );
}
