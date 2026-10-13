import AppShell from "@/components/layout/AppShell";
import StudioApp from "@/components/studio/StudioApp";

// Home = the QR Studio. New pages are new folders: src/app/templates/page.js -> /templates
export default function HomePage() {
  return (
    <AppShell>
      <StudioApp />
    </AppShell>
  );
}
