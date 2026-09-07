import { useCallback, useEffect, useState } from "react";
import { Header } from "@/components/site/Header";
import { Hero } from "@/components/site/Hero";
import { Services } from "@/components/site/Services";
import { Booking } from "@/components/site/Booking";
import { Footer } from "@/components/site/Footer";
import { CookieBanner } from "@/components/site/CookieBanner";
import { LegalDialog } from "@/components/site/LegalDialog";
import { CONFIG } from "@/lib/config";
import type { LegalDocId } from "@/lib/legal";

// Título, meta descripción y datos de negocio (schema.org) se construyen a
// partir de config.ts, así cada cliente solo edita ese archivo.
function aplicarSEO() {
  document.title = `${CONFIG.nombre} | ${CONFIG.tituloSeo} | Reserva tu cita online`;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (meta) {
    meta.content = `${CONFIG.nombre} en ${CONFIG.ciudad}. ${CONFIG.lemaSeo} Reserva tu cita online en segundos.`;
  }

  const codigoPostal = (CONFIG.localidad.match(/\d{5}/) ?? [""])[0];
  const horarioCentral = {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "10:00",
    closes: "14:00",
  } as const;
  const schema = {
    "@context": "https://schema.org",
    "@type": "BarberShop",
    name: CONFIG.nombre,
    url: CONFIG.dominio,
    image: `${CONFIG.dominio}/og.png`,
    telephone: `+34${CONFIG.telefonoEnlace}`,
    priceRange: "€-€€",
    address: {
      "@type": "PostalAddress",
      streetAddress: CONFIG.direccion,
      addressLocality: CONFIG.ciudad,
      postalCode: codigoPostal,
      addressCountry: "ES",
    },
    openingHoursSpecification: [
      horarioCentral,
      { ...horarioCentral, opens: "16:00", closes: "21:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Sunday", opens: "09:00", closes: "14:00" },
    ],
  };
  document.getElementById("schema-local-business")?.remove();
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.id = "schema-local-business";
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

export default function App() {
  const [legalDoc, setLegalDoc] = useState<LegalDocId | null>(null);
  const openLegal = useCallback((docId: LegalDocId) => setLegalDoc(docId), []);

  useEffect(() => {
    aplicarSEO();
  }, []);

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