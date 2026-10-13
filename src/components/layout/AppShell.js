import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

// Frame shared by every page: header on top, sidebar on the left, footer at the bottom.
export default function AppShell({ children }) {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex min-w-0 flex-1 flex-col gap-5 px-4 py-5 sm:px-6 sm:py-6">
          {children}
          <Footer />
        </main>
      </div>
    </div>
  );
}
