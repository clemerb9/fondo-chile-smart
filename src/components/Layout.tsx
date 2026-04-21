import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { StickyAffiliateBanner } from "./StickyAffiliateBanner";
import { WhatsAppButton } from "./WhatsAppButton";

export const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1 pb-24">
      <Outlet />
    </main>
    <Footer />
    <StickyAffiliateBanner />
    <WhatsAppButton />
  </div>
);

