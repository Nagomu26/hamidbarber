import { Phone } from "lucide-react";
import { CONFIG } from "@/lib/config";
import DotBorderButton from "@/components/ui/dot-border-button";
import { Reveal } from "./Reveal";

const HORARIOS = [
  { dias: "L–S", horas: "10h–14h y 16h–21h" },
  { dias: "Dom. y fest.", horas: "9h–14h" },
];

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      {/* Franja de acento de firma, único uso destacado del motivo de rayas */}
      <div className="h-1.5 barber-stripes" aria-hidden="true"></div>

      {/* Resplandores ambientales decorativos */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="glow-brass absolute -right-24 -top-32 rounded-full opacity-70 blur-3xl"
          style={{ width: "420px", height: "420px" }}
        ></div>
        <div
          className="glow-barber absolute -bottom-40 -left-24 rounded-full opacity-60 blur-3xl"
          style={{ width: "380px", height: "380px" }}
        ></div>
        <div className="barber-stripes-thin absolute right-0 top-0 h-full w-14 opacity-[0.06]"></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-8 sm:pb-24 sm:pt-20">
        <Reveal>
          <p className="mb-6 inline-flex items-center gap-3 font-display text-sm tracking-widest text-brass">
            <span className="inline-block h-px w-10 bg-brass/60"></span>
            {CONFIG.zona}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h1 className="max-w-3xl font-display text-5xl leading-[1.05] text-bone sm:text-6xl lg:text-7xl">
            Tu corte perfecto,
            <br className="hidden sm:block" /> sin esperas.
          </h1>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-bonemuted sm:text-xl">
            Barbería de confianza en el corazón de Valmojado. Elige tu hora, entra, siéntate y sal
            como quieres verte.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <DotBorderButton
              text="Reservar cita online"
              href="#reserva"
              variant="brass"
              size="md"
            />
            <a
              href={`tel:${CONFIG.telefonoEnlace}`}
              className="inline-flex items-center justify-center rounded-md border border-line bg-transparent px-8 py-4 font-medium text-bone transition-all hover:border-brass hover:bg-charcoal/60"
            >
              <Phone className="mr-2 h-5 w-5 text-brass" aria-hidden="true" />
              Llamar ahora · <span className="ml-1">{CONFIG.telefono}</span>
            </a>
          </div>
        </Reveal>

        {/* Franja de datos rápidos: horario y ubicación */}
        <Reveal delay={320}>
          <div className="mt-14 grid max-w-2xl grid-cols-2 gap-6 border-t border-line pt-8 sm:grid-cols-3">
            {HORARIOS.map((slot) => (
              <div key={slot.dias}>
                <p className="font-display text-2xl text-bone">{slot.dias}</p>
                <p className="mt-1 text-sm text-bonemuted">{slot.horas}</p>
              </div>
            ))}
            <div className="col-span-2 sm:col-span-1">
              <p className="font-display text-2xl text-bone">{CONFIG.ciudad}</p>
              <p className="mt-1 text-sm text-bonemuted">{CONFIG.direccion}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}