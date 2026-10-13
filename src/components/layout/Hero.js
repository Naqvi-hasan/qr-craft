import Icon from "../Icon";

// Decorative art on the right of the hero: a phone showing a QR, with the current type's icon
// floating above it. Pure SVG + CSS variables, so it follows the light/dark theme.
function HeroArt({ icon }) {
  return (
    <div className="relative hidden h-36 w-56 shrink-0 md:block" aria-hidden="true">
      <svg viewBox="0 0 224 144" className="absolute inset-0 h-full w-full">
        <circle cx="168" cy="40" r="56" fill="var(--primary-soft)" />
        <circle cx="38" cy="112" r="5" fill="var(--grad-to)" opacity="0.5" />
        <circle cx="210" cy="118" r="3" fill="var(--grad-from)" opacity="0.6" />
        <circle cx="64" cy="22" r="3" fill="var(--grad-from)" opacity="0.4" />
        <g transform="rotate(-8 140 90)">
          <rect x="104" y="30" width="76" height="128" rx="14" fill="var(--surface)" stroke="var(--line-strong)" strokeWidth="2" />
          <rect x="138" y="36" width="10" height="3" rx="1.5" fill="var(--line-strong)" />
          <g fill="var(--text)" opacity="0.85">
            <rect x="118" y="56" width="16" height="16" rx="3" />
            <rect x="150" y="56" width="16" height="16" rx="3" />
            <rect x="118" y="88" width="16" height="16" rx="3" />
            <rect x="140" y="80" width="6" height="6" rx="1.5" />
            <rect x="152" y="90" width="6" height="6" rx="1.5" />
            <rect x="160" y="80" width="6" height="6" rx="1.5" />
            <rect x="140" y="98" width="6" height="6" rx="1.5" />
            <rect x="160" y="98" width="6" height="6" rx="1.5" />
          </g>
          <g fill="var(--surface)">
            <rect x="122" y="60" width="8" height="8" rx="1.5" />
            <rect x="154" y="60" width="8" height="8" rx="1.5" />
            <rect x="122" y="92" width="8" height="8" rx="1.5" />
          </g>
          <rect x="116" y="118" width="52" height="8" rx="4" fill="var(--primary-soft)" />
        </g>
      </svg>
      <span className="bg-brand-gradient absolute left-[52px] top-3 grid h-14 w-14 place-items-center rounded-2xl text-on-primary shadow-card">
        <Icon name={icon} size={26} />
      </span>
    </div>
  );
}

// Page banner. `title` can contain JSX (e.g. a gradient word).
export default function Hero({ icon, title, description }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-line bg-linear-to-r from-hero-from to-hero-to px-5 py-6 sm:px-8 sm:py-7">
      <div className="flex items-center gap-6">
        <div className="flex min-w-0 flex-1 items-start gap-4 sm:items-center sm:gap-5">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-surface text-primary-text shadow-card sm:h-16 sm:w-16">
            <Icon name={icon} size={28} />
          </span>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-xl text-sm text-muted sm:text-base">{description}</p>
          </div>
        </div>
        <HeroArt icon={icon} />
      </div>
    </section>
  );
}
