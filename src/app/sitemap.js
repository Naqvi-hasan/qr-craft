import { SEO_PAGES } from "@/config/seo";
import { SITE_URL } from "@/lib/site";

// Served at /sitemap.xml. Submit this address in Google Search Console.
export default function sitemap() {
  const now = new Date();
  const main = [
    { path: "", priority: 1 },
    { path: "/templates", priority: 0.8 },
    { path: "/cards", priority: 0.8 },
    { path: "/scanner", priority: 0.8 },
    { path: "/privacy", priority: 0.3 },
  ];
  return [
    ...main.map((p) => ({ url: `${SITE_URL}${p.path}`, lastModified: now, changeFrequency: "monthly", priority: p.priority })),
    ...SEO_PAGES.map((p) => ({ url: `${SITE_URL}/${p.slug}`, lastModified: now, changeFrequency: "monthly", priority: 0.9 })),
  ];
}
