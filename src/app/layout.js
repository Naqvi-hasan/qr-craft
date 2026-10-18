import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: "QR Craft: Free QR Code Generator for URL, WiFi, UPI, Contact and more",
  description:
    "Create free QR codes for links, phone numbers, WiFi, UPI payments, contacts, locations and more. Customize colours, add a logo and download as PNG, SVG or PDF. No sign-up.",
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "QR Craft: Free, beautiful QR codes",
    description: "Make QR codes for links, WiFi, UPI, contacts and more. Themes, logos, frames, templates. No sign-up.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "QR Craft QR code generator" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
  // Google Search Console: add the code from the "HTML tag" method as an environment variable.
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } : undefined,
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fb" },
    { media: "(prefers-color-scheme: dark)", color: "#060a18" },
  ],
};

// Runs before the page paints, so the saved theme is applied without a white flash.
const themeScript = `
(function () {
  try {
    var saved = localStorage.getItem("theme");
    var theme = saved || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    document.documentElement.setAttribute("data-theme", theme);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
