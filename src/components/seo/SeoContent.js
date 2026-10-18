import Link from "next/link";
import Icon from "../Icon";
import { SEO_PAGES } from "@/config/seo";

// Helpful text under the Studio on per-type pages: how-to, use cases, FAQ.
// Also adds FAQ structured data so search engines can show the questions.
export default function SeoContent({ page }) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const others = SEO_PAGES.filter((p) => p.slug !== page.slug);

  return (
    <section aria-label={`About ${page.name} QR codes`} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }} />

      <div className="flex flex-col gap-6 rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
        <div>
          <h2 className="text-xl font-bold text-text">How to make a {page.name} QR code</h2>
          <p className="mt-2 text-sm text-muted">{page.intro}</p>
          <ol className="mt-4 flex flex-col gap-3">
            {page.steps.map((step, i) => (
              <li key={step} className="flex gap-3 text-sm text-text">
                <span className="bg-brand-gradient grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold text-on-primary">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div>
          <h2 className="text-xl font-bold text-text">Frequently asked questions</h2>
          <div className="mt-3 flex flex-col divide-y divide-line rounded-2xl border border-line">
            {page.faqs.map((f) => (
              <details key={f.q} className="group px-4 py-3">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-text">
                  {f.q}
                  <Icon name="chevron" size={16} className="shrink-0 text-subtle transition group-open:rotate-180" />
                </summary>
                <p className="mt-2 text-sm text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>

      <aside className="flex flex-col gap-5">
        <div className="rounded-3xl border border-line bg-surface p-5 shadow-card">
          <h2 className="text-base font-semibold text-text">Popular uses</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {page.uses.map((u) => (
              <li key={u} className="flex items-center gap-2 text-sm text-muted">
                <Icon name="checkCircle" size={16} className="shrink-0 text-success" />
                {u}
              </li>
            ))}
          </ul>
        </div>
        <nav aria-label="Other QR generators" className="rounded-3xl border border-line bg-surface p-5 shadow-card">
          <h2 className="text-base font-semibold text-text">Other QR generators</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {others.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}`} className="block rounded-full border border-line px-3 py-1 text-xs font-medium text-muted transition hover:border-primary hover:text-primary-text">
                  {p.name} QR
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </section>
  );
}
