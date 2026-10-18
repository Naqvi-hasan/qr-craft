import AppShell from "@/components/layout/AppShell";
import Hero from "@/components/layout/Hero";
import LibraryApp from "@/components/library/LibraryApp";

export const metadata = {
  title: "My library | QR Craft",
  description: "Your saved QR code designs. Stored only in this browser.",
  robots: { index: false }, // personal page, nothing for search engines here
};

export default function LibraryPage() {
  return (
    <AppShell>
      <Hero
        icon="folder"
        title={
          <>
            My <span className="text-brand-gradient">library</span>
          </>
        }
        description="Every design you save, ready to edit, copy or download again. Saved privately in this browser."
      />
      <LibraryApp />
    </AppShell>
  );
}
