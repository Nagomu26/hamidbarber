import { useCallback, useState } from "react";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { Booking } from "@/components/site/Booking";
import { Footer } from "@/components/site/Footer";
import { CookieBanner } from "@/components/site/CookieBanner";
import { LegalDialog } from "@/components/site/LegalDialog";
import type { LegalDocId } from "@/lib/legal";

export default function App() {
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null);
  const openLegal = useCallback((docId: LegalDocId) => setLegalDoc(docId), []);

  return (
    <div className="bg-ink font-body text-bone antialiased">
      <Header />
      <main>
        <Hero />
        <Services />
        <Booking onOpenLegal={openLegal} />
      </main>
      <Footer onOpenLegal={openLegal} />
      <CookieBanner onOpenLegal={openLegal} />
      <LegalDialog docId={legalDoc} onClose={() => setLegalDoc(null)} />
    </div>
  );
}