import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/lib/config";

const NAV_LINKS = [
  { href: "#servicios", label: "Servicios" },
  { href: "#reserva", label: "Reserva" },
  { href: "#contacto", label: "Contacto" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-line bg-ink/95 backdrop-blur transition-shadow duration-300",
        scrolled && "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.8)]",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a
          href="#inicio"
          className="font-display text-2xl tracking-wide text-bone"
          aria-label={CONFIG.nombre}
        >
          {CONFIG.logoNombre}
          <span className="text-metal">{CONFIG.logoAcento}</span>
        </a>

        {/* Enlaces de escritorio */}
        <div className="hidden items-center gap-8 text-sm font-medium text-bonemuted md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="group relative transition-colors hover:text-bone"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-brass transition-all duration-300 group-hover:w-full"></span>
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#reserva"
            className="btn-sheen hidden items-center rounded-sm bg-brass px-5 py-2.5 text-sm font-semibold text-ink shadow-brassglow transition-colors hover:bg-brassdark sm:inline-flex"
          >
            Reservar
          </a>
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="-mr-2 p-2 text-bone transition-colors hover:text-brass md:hidden"
          >
            {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Menú desplegable móvil */}
      {menuOpen && (
        <div className="border-t border-line bg-ink md:hidden">
          <div className="flex flex-col gap-4 px-5 py-4 font-medium text-bonemuted">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="py-1 transition-colors hover:text-bone"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#reserva"
              onClick={() => setMenuOpen(false)}
              className="btn-sheen mt-1 inline-flex items-center justify-center rounded-sm bg-brass px-5 py-2.5 font-semibold text-ink transition-colors hover:bg-brassdark"
            >
              Reservar cita
            </a>
          </div>
        </div>
      )}
    </header>
  );
}