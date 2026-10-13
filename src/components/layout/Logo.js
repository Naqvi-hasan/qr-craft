// Brand mark: a rounded square with a simple QR-style glyph. Original artwork, change freely.
export default function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="bg-brand-gradient grid h-10 w-10 place-items-center rounded-xl text-on-primary shadow-card">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="2" />
          <rect x="14" y="14" width="3" height="3" rx="0.8" fill="currentColor" />
          <rect x="18" y="18" width="3" height="3" rx="0.8" fill="currentColor" />
          <rect x="18" y="14" width="3" height="3" rx="0.8" fill="currentColor" opacity="0.6" />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-lg font-bold tracking-tight text-text">QR Craft</span>
        {!compact && <span className="block text-[11px] font-medium text-subtle">Simple · Fast · Free</span>}
      </span>
    </div>
  );
}
