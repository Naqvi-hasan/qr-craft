import AppShell from "@/components/layout/AppShell";
import Hero from "@/components/layout/Hero";

export const metadata = {
  title: "Privacy | QR Craft",
  description: "How QR Craft handles your data: QR codes are made in your browser, nothing you type is uploaded, and saved designs stay on your device.",
  alternates: { canonical: "/privacy" },
};

const SECTIONS = [
  {
    title: "What you type stays on your device",
    body: "QR codes are created inside your browser. Links, WiFi passwords, contact details, UPI IDs, logos and pictures you add are not sent to our servers.",
  },
  {
    title: "My library",
    body: "Designs you save are stored in your browser's storage on this device only. We can't see them. Clearing your browser data deletes them, so use Back up to keep a copy.",
  },
  {
    title: "Scanner and camera",
    body: "The camera turns on only when you press Start camera. Frames are read on your device to find the QR code and are never recorded or uploaded. Photos you choose for scanning are read the same way.",
  },
  {
    title: "Visitor statistics",
    body: "We use Vercel Web Analytics to count page visits (for example, which pages are popular and the visitor's country). It doesn't use cookies and doesn't collect what you type into the generator.",
  },
  {
    title: "Settings saved in your browser",
    body: "We remember your light or dark theme choice in your browser's local storage. That's the only preference we store.",
  },
  {
    title: "Links inside QR codes",
    body: "QR codes you make point to the links or details you enter. When someone scans one, their phone talks to that destination directly, not to us. We don't track scans of static QR codes.",
  },
];

export default function PrivacyPage() {
  return (
    <AppShell>
      <Hero icon="lock" title="Privacy" description="Short version: we don't collect what you put in your QR codes." />
      <section className="flex max-w-3xl flex-col gap-4">
        {SECTIONS.map((s) => (
          <div key={s.title} className="rounded-3xl border border-line bg-surface p-5 shadow-card">
            <h2 className="text-base font-semibold text-text">{s.title}</h2>
            <p className="mt-1.5 text-sm text-muted">{s.body}</p>
          </div>
        ))}
        <p className="text-xs text-subtle">Last updated: October 2026.</p>
      </section>
    </AppShell>
  );
}
