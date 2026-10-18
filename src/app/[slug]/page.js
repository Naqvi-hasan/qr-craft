import { notFound } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import StudioApp from "@/components/studio/StudioApp";
import Hero from "@/components/layout/Hero";
import SeoContent from "@/components/seo/SeoContent";
import { SEO_BY_SLUG, SEO_PAGES } from "@/config/seo";
import { getQrType } from "@/qr-types";

// One page per QR type, e.g. /wifi-qr-code-generator, built at deploy time.
// Any other address under / that isn't a real page shows the 404 page.
export const dynamicParams = false;

export function generateStaticParams() {
  return SEO_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const page = SEO_BY_SLUG[slug];
  if (!page) return {};
  return {
    title: `${page.metaTitle} | QR Craft`,
    description: page.metaDescription,
    alternates: { canonical: `/${page.slug}` },
    openGraph: { title: page.metaTitle, description: page.metaDescription, url: `/${page.slug}` },
  };
}

export default async function TypePage({ params }) {
  const { slug } = await params;
  const page = SEO_BY_SLUG[slug];
  if (!page) notFound();
  const type = getQrType(page.typeId);

  return (
    <AppShell>
      <Hero
        icon={type.icon}
        title={
          <>
            Free <span className="text-brand-gradient">{page.name}</span> QR code generator
          </>
        }
        description={page.intro}
      />
      <StudioApp initialTypeId={page.typeId} showHero={false} />
      <SeoContent page={page} />
    </AppShell>
  );
}
