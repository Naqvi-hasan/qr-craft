import AppShell from "@/components/layout/AppShell";
import Hero from "@/components/layout/Hero";
import ScannerApp from "@/components/scanner/ScannerApp";

export const metadata = {
  title: "QR Code Scanner Online: Scan with Camera or Image | QR Craft",
  description: "Scan any QR code with your camera or from a photo or screenshot. See the real link, WiFi password or UPI details before opening. Free and private.",
  alternates: { canonical: "/scanner" },
};

export default function ScannerPage() {
  return (
    <AppShell>
      <Hero
        icon="scan"
        title={
          <>
            Scan a <span className="text-brand-gradient">QR code</span>
          </>
        }
        description="Use your camera or upload a photo. See exactly what's inside before you open anything."
      />
      <ScannerApp />
    </AppShell>
  );
}
