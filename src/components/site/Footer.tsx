import { MapPin, Phone } from "lucide-react";
import { CONFIG } from "@/lib/config";
import type { LegalDocId } from "@/lib/legal";

const LINKS_LEGALES: Array<{ id: LegalDocId; etiqueta: string }> = [
  { id: "aviso", etiqueta: "Aviso legal" },
  { id: "privacidad", etiqueta: "Política de privacidad" },
  { id: "terminos", etiqueta: "Términos y condiciones" },
  { id: "cookies", etiqueta: "Política de cookies" },
];

export function Footer({ onOpenLegal }: { onOpenLegal: (docId: LegalDocId) => void }) {
  return (
    <footer id="contacto" className="relative overflow-hidden border-t border-line bg-charcoal">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="barber-stripes-thin absolute left-0 top-0 h-full w-10 opacity-[0.05]"></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-3">
          <div>
            <p className="font-display text-2xl text-bone">
              {CONFIG.logoNombre}
              <span className="text-metal">{CONFIG.logoAcento}</span>
            </p>
            <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-bonemuted">
              <MapPin
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-brass/70"
                aria-hidden="true"
              />
              <span>
                {CONFIG.direccion}
                <br />
                {CONFIG.localidad}
              </span>
            </p>
          </div>

          <div>
            <p className="mb-3 font-display text-lg text-bone">Contacto</p>
            <p className="text-sm text-bonemuted">
              Teléfono / WhatsApp:
              <br />
              <a
                href={`tel:${CONFIG.telefonoEnlace}`}
                className="mt-1 inline-flex items-center gap-2 font-medium text-brass transition-colors hover:text-brassdark"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {CONFIG.telefono}
              </a>
            </p>
          </div>

          <div>
            <p className="mb-3 font-display text-lg text-bone">Horario</p>
            <p className="space-y-1 text-sm leading-relaxed text-bonemuted">
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass/70"></span>
                Lunes a sábado: 10h–14h y 16h–21h
              </span>
              <span className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-brass/70"></span>
                Domingos y festivos: 9h–14h
              </span>
            </p>
          </div>
        </div>

        {/* Enlaces legales (LSSI / RGPD) */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-line pt-6 sm:justify-start">
          {LINKS_LEGALES.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => onOpenLegal(link.id)}
              className="text-xs text-bonemuted/90 underline-offset-2 transition-colors hover:text-brass hover:underline"
            >
              {link.etiqueta}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col justify-between gap-2 border-t border-line pt-6 text-xs text-bonemuted/80 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {CONFIG.nombre}. Todos los derechos reservados.
          </p>
          <p>
            {CONFIG.nombre} · {CONFIG.direccion} · {CONFIG.ciudad}, Toledo
          </p>
        </div>
      </div>
    </footer>
  );
}