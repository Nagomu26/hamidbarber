import { useState } from "react";
import type { LegalDocId } from "@/lib/legal";

const STORAGE_KEY = "hamidbarber-cookies-v1";

interface CookieBannerProps {
  onOpenLegal: (docId: LegalDocId) => void;
}

export function CookieBanner({ onOpenLegal }: CookieBannerProps) {
  const [aceptado, setAceptado] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      return window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  if (aceptado) return null;

  const aceptar = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // Sin almacenamiento disponible: solo ocultamos el aviso durante la sesión.
    }
    setAceptado(true);
  };

  return (
    <div
      role="dialog"
      aria-label="Aviso de cookies"
      className="fixed inset-x-4 bottom-4 z-40 mx-auto max-w-lg rounded-lg border border-line bg-charcoal/95 p-5 shadow-2xl backdrop-blur"
    >
      <p className="text-sm leading-relaxed text-bonemuted">
        Este sitio usa únicamente cookies técnicas para funcionar. No empleamos cookies de
        seguimiento ni publicidad. Consulta nuestra{" "}
        <button
          type="button"
          onClick={() => onOpenLegal("cookies")}
          className="font-medium text-brass underline underline-offset-2 transition-colors hover:text-brassdark"
        >
          Política de cookies
        </button>
        .
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={aceptar}
          className="btn-sheen rounded-sm bg-brass px-5 py-2.5 text-sm font-semibold text-ink shadow-brassglow transition-colors hover:bg-brassdark"
        >
          Aceptar
        </button>
        <button
          type="button"
          onClick={() => onOpenLegal("cookies")}
          className="text-sm font-medium text-bonemuted underline underline-offset-2 transition-colors hover:text-bone"
        >
          Más información
        </button>
      </div>
    </div>
  );
}

export default CookieBanner;