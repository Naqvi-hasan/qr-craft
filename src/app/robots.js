import { SITE_URL } from "@/lib/site";

// Served at /robots.txt
export default function robots() {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/library"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
