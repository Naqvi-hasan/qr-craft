import AppShell from "@/components/layout/AppShell";
import Hero from "@/components/layout/Hero";
import TemplateGallery from "@/components/templates/TemplateGallery";

export const metadata = {
  title: "QR Code Templates: Café, Wedding, Business, UPI and more | QR Craft",
  description: "Ready-made QR code designs for menus, weddings, events, payments, social profiles and shops. Pick one, add your details, download.",
  alternates: { canonical: "/templates" },
};

export default function TemplatesPage() {
  return (
    <AppShell>
      <Hero
        icon="layout"
        title={
          <>
            Start from a <span className="text-brand-gradient">template</span>
          </>
        }
        description="Designs made for real uses: café tables, wedding cards, shop counters and more. Pick one, add your details, and download."
      />
      <TemplateGallery />
    </AppShell>
  );
}
