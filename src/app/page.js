import AppShell from "@/components/layout/AppShell";
import StudioApp from "@/components/studio/StudioApp";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata = {
  alternates: { canonical: "/" },
};

// Tells search engines this is a free web app (structured data).
const appJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: SITE_NAME,
  url: SITE_URL,
  applicationCategory: "DesignApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
  description: "Free QR code generator for links, WiFi, UPI, contacts and more, with themes, logos, frames and templates.",
};

// Home = the QR Studio. New pages are new folders: src/app/templates/page.js -> /templates
export default function HomePage() {
  return (
    <AppShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appJsonLd) }} />
      <StudioApp />
    </AppShell>
  );
}
