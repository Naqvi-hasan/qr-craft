import AppShell from "@/components/layout/AppShell";
import Hero from "@/components/layout/Hero";
import PrintStudio from "@/components/print/PrintStudio";

export const metadata = {
  title: "Print Studio: QR Business Cards, WiFi Cards, Wristbands, Invitations | QR Craft",
  description:
    "Design print-ready business cards, WiFi cards, UPI stands, review cards, QR wristbands, invitations, badges, stickers and posters. Bulk printing, double-sided PDF, 300 DPI. Free.",
  alternates: { canonical: "/cards" },
};

export default function CardsPage() {
  return (
    <AppShell>
      <Hero
        icon="printer"
        title={
          <>
            Print <span className="text-brand-gradient">Studio</span>
          </>
        }
        description="Business cards, WiFi cards, UPI stands, wristbands, invitations, badges and more. Pick a layout, add your details, print."
      />
      <PrintStudio />
    </AppShell>
  );
}
