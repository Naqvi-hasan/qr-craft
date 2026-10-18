// The public address of the site, used for canonical links, sitemap and social previews.
// Set NEXT_PUBLIC_SITE_URL in Vercel (Settings > Environment Variables) when you add your own domain.
// On Vercel it otherwise falls back to the project's production address automatically.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");

export const SITE_NAME = "QR Craft";
