import AppShell from "@/components/layout/AppShell";
import Hero from "@/components/layout/Hero";
import CardsApp from "@/components/cards/CardsApp";

export const metadata = {
  title: "Printable WiFi Card, QR Business Card and UPI Payment Stand | QR Craft",
  description: "Make print-ready WiFi cards, QR business cards and UPI payment stands. Download PDF at 300 DPI or an A4 sheet with several copies. Free.",
  alternates: { canonical: "/cards" },
};

export default function CardsPage() {
  return (
    <AppShell>
      <Hero
        icon="printer"
        title={
          <>
            Printable <span className="text-brand-gradient">QR cards</span>
          </>
        }
        description="WiFi cards for guests, visiting cards and UPI payment stands. Fill in the details, pick a colour, print."
      />
      <CardsApp />
    </AppShell>
  );
}
