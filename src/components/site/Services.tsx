import { Crown, Layers, Scissors, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICIOS } from "@/data/services";
import type { Service, ServiceId } from "@/lib/types";
import { Reveal } from "./Reveal";

const ICONOS: Record<ServiceId, LucideIcon> = {
  corte: Scissors,
  fade: Layers,
  barba: Sparkles,
  completo: Crown,
};

function ServiceCard({ servicio }: { servicio: Service }) {
  const Icono = ICONOS[servicio.id];

  return (
    <Reveal className="h-full">
      <article
        className={cn(
          "card-lift flex h-full flex-col justify-between overflow-hidden rounded-md border p-7",
          servicio.destacado
            ? "border-brass bg-ink/50 shadow-brassglow"
            : "border-line bg-ink/30 hover:border-brass",
        )}
      >
        <div>
          <div className="flex items-start justify-between gap-4">
            {servicio.destacado ? (
              <p className="inline-flex items-center gap-2 font-display text-xs tracking-widest text-brass">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brass"></span>
                MÁS PEDIDO
              </p>
            ) : (
              <span aria-hidden="true"></span>
            )}
            <Icono
              className={cn(
                "h-8 w-8 flex-shrink-0",
                servicio.destacado ? "text-brass/80" : "text-brass/70",
              )}
              strokeWidth={1.6}
              aria-hidden="true"
            />
          </div>
          <h3 className={cn("mt-2 font-display text-2xl text-bone", servicio.destacado && "mt-5")}>
            {servicio.nombre}
          </h3>
          <p className="mt-2 leading-relaxed text-bonemuted">{servicio.descripcion}</p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5">
          <span className="font-display text-xl text-metal">{servicio.precio} €</span>
          <a
            href="#reserva"
            className="btn-sheen inline-flex items-center rounded-sm bg-brass px-5 py-2.5 text-sm font-semibold text-ink shadow-brassglow transition-colors hover:bg-brassdark"
          >
            Reservar
          </a>
        </div>
      </article>
    </Reveal>
  );
}

export function Services() {
  return (
    <section id="servicios" className="relative overflow-hidden border-y border-line bg-charcoal">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="glow-brass absolute right-0 top-0 rounded-full opacity-40 blur-3xl"
          style={{ width: "300px", height: "300px" }}
        ></div>
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <Reveal className="mb-12 max-w-xl">
          <p className="mb-3 font-display text-sm tracking-widest text-brass">QUÉ OFRECEMOS</p>
          <h2 className="font-display text-4xl text-bone sm:text-5xl">Servicios</h2>
          <p className="mt-4 text-lg text-bonemuted">
            Cuatro formas de salir de aquí mejor de lo que entraste. Reserva la que necesitas.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {SERVICIOS.map((servicio) => (
            <ServiceCard key={servicio.id} servicio={servicio} />
          ))}
        </div>
      </div>
    </section>
  );
}