import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CONFIG } from "@/lib/config";
import {
  DIAS_ANTELACION,
  NOMBRES_DIA,
  NOMBRES_MES,
  construirPayload,
  esHoraYaPasada,
  estaOcupadaDemo,
  fechaISO,
  generarHoras,
  guardarReservaEnSheet,
  obtenerHorasOcupadas,
  precargarOcupadas,
} from "@/lib/booking";
import type { OcupadasPorDia, ServiceId } from "@/lib/types";
import type { LegalDocId } from "@/lib/legal";
import { SERVICIOS } from "@/data/services";
import DotBorderButton from "@/components/ui/dot-border-button";
import { Reveal } from "./Reveal";

type Mensaje = { tipo: "ok" | "error"; texto: string } | null;

function Paso({
  numero,
  titulo,
  children,
}: {
  numero: number;
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <span className="step-badge inline-flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-semibold">
          {numero}
        </span>
        <p className="font-display text-sm tracking-widest text-brass">{titulo}</p>
      </div>
      {children}
    </div>
  );
}

function Resumen({
  fecha,
  hora,
  servicioNombre,
  hoyISO,
}: {
  fecha: Date | null;
  hora: string | null;
  servicioNombre: string | null;
  hoyISO: string;
}) {
  if (fecha && hora && servicioNombre) {
    const esHoy = fechaISO(fecha) === hoyISO;
    const nombreDia = NOMBRES_DIA[fecha.getDay()];
    const fechaTexto = esHoy
      ? `hoy (${fecha.getDate()} de ${NOMBRES_MES[fecha.getMonth()]})`
      : `${nombreDia} ${fecha.getDate()} de ${NOMBRES_MES[fecha.getMonth()]}`;

    return (
      <p className="text-sm text-bonemuted">
        Vas a reservar <span className="font-medium text-bone">{servicioNombre}</span>{" "}
        {esHoy ? "para" : "el"}{" "}
        <span className="font-medium text-bone">{fechaTexto}</span> a las{" "}
        <span className="font-medium text-bone">{hora}</span>.
      </p>
    );
  }
  return <p className="text-sm text-bonemuted">Todavía no has elegido día, hora o servicio.</p>;
}

export function Booking({ onOpenLegal }: { onOpenLegal: (docId: LegalDocId) => void }) {
  const [fecha, setFecha] = useState<Date | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const [servicioId, setServicioId] = useState<ServiceId | null>(null);
  const [ocupadasPorDia, setOcupadasPorDia] = useState<OcupadasPorDia | null>(null);
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [consent, setConsent] = useState(false);
  const [mensaje, setMensaje] = useState<Mensaje>(null);
  const [enviando, setEnviando] = useState(false);

  const hoy = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const dias = useMemo(
    () =>
      Array.from({ length: DIAS_ANTELACION }, (_, i) => {
        const d = new Date(hoy);
        d.setDate(hoy.getDate() + i);
        return d;
      }),
    [hoy],
  );

  // Precarga las horas ocupadas de toda la semana al montar la página, así
  // cambiar de día es instantáneo sin volver a llamar a Google Sheets.
  useEffect(() => {
    void precargarOcupadas().then(setOcupadasPorDia);
  }, []);

  const servicio = SERVICIOS.find((s) => s.id === servicioId) ?? null;
  const horas = fecha ? generarHoras(fecha) : [];
  const horasOcupadas = fecha ? obtenerHorasOcupadas(ocupadasPorDia, fechaISO(fecha)) : null;

  const esHoy = fecha !== null && fechaISO(fecha) === fechaISO(hoy);
  const esOcupada = (franja: string) =>
    esHoraYaPasada(fecha ?? hoy, franja) ||
    (horasOcupadas ? horasOcupadas.includes(franja) : fecha ? estaOcupadaDemo(fechaISO(fecha), franja) : false);

  const puedeEnviar =
    !!fecha &&
    !!hora &&
    !!servicio &&
    nombre.trim().length > 0 &&
    telefono.trim().length > 0 &&
    consent;

  const slotHelp = !fecha
    ? "Selecciona primero un día para ver las horas disponibles."
    : esHoy
      ? "Horas para hoy. Las horas ya pasadas o reservadas no se pueden elegir."
      : `Horas para el ${fecha.getDate()} de ${NOMBRES_MES[fecha.getMonth()]}. Las horas tachadas ya están reservadas.`;

  function seleccionarDia(dia: Date) {
    setFecha(dia);
    setHora(null); // Al cambiar de día, se pierde la hora elegida
  }

  function seleccionarHora(franja: string) {
    setHora(franja);
  }

  function seleccionarServicio(id: ServiceId) {
    setServicioId(id);
  }

  async function enviarReserva(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Evita el envío tradicional del formulario
    // Honeypot: si un bot ha rellenado el campo oculto "website", descartamos
    // el envío silenciosamente sin tocar Google Sheets.
    if (String(new FormData(e.currentTarget).get("website") ?? "").length > 0) return;
    if (!puedeEnviar || enviando) return;
    if (!fecha || !hora || !servicio) return;

    const payload = construirPayload(fecha, hora, servicio, nombre, telefono);
    setEnviando(true);
    setMensaje(null);

    try {
      // Se guarda en el mismo Google Sheet donde la barbería apunta a mano las
      // citas de teléfono, así ambas fuentes cuadran.
      const resultado = await guardarReservaEnSheet(payload);
      if (!resultado.ok) {
        if (resultado.motivo === "ocupado") {
          // Otro cliente se adelantó: marcar la hora como ocupada y avisar.
          marcarHoraOcupadaLocal(fecha, hora);
          setMensaje({
            tipo: "error",
            texto: "Lo sentimos, esa hora se acaba de reservar. Elige otra hora, por favor.",
          });
        } else if (resultado.motivo === "pasado") {
          // La hora de hoy ya ha empezado: no se puede confirmar.
          marcarHoraOcupadaLocal(fecha, hora);
          setMensaje({
            tipo: "error",
            texto: "Esa hora ya ha pasado. Elige otra hora, por favor.",
          });
        } else {
          throw new Error("El Google Sheet no confirmó el guardado");
        }
        return;
      }

      // Éxito: esta hora queda ocupada ya (evita reservar dos veces seguido
      // desde la misma página) y refrescamos los datos de Google Sheets.
      marcarHoraOcupadaLocal(fecha, hora);
      void precargarOcupadas().then(setOcupadasPorDia);

      setMensaje({
        tipo: "ok",
        texto: "¡Reserva enviada! Te confirmaremos la cita muy pronto por teléfono o WhatsApp.",
      });
      setFecha(null);
      setHora(null);
      setServicioId(null);
      setNombre("");
      setTelefono("");
      setConsent(false);
    } catch (error) {
      console.error("Error al enviar la reserva:", error);
      setMensaje({
        tipo: "error",
        texto: `No hemos podido enviar tu reserva. Llámanos al ${CONFIG.telefono} y te atendemos directamente.`,
      });
    } finally {
      setEnviando(false);
    }
  }

  function marcarHoraOcupadaLocal(dia: Date, franja: string) {
    const iso = fechaISO(dia);
    setOcupadasPorDia((prev) => {
      const base = prev ?? {};
      const previas = base[iso] ?? [];
      if (previas.includes(franja)) return base;
      return { ...base, [iso]: [...previas, franja] };
    });
  }

  return (
    <section id="reserva" className="relative overflow-hidden border-y border-line bg-charcoal">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="glow-barber absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full opacity-30 blur-3xl"
          style={{ width: "480px", height: "280px" }}
        ></div>
      </div>

      <div className="relative mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
        <Reveal className="mb-10 max-w-xl">
          <p className="mb-3 font-display text-sm tracking-widest text-brass">RESERVA ONLINE</p>
          <h2 className="font-display text-4xl text-bone sm:text-5xl">Reserva tu hora</h2>
          <p className="mt-4 text-lg leading-relaxed text-bonemuted">
            Elige el día, la hora libre y el servicio. Solo aceptamos reservas con hasta una semana
            de antelación.
          </p>
        </Reveal>

        <form onSubmit={enviarReserva} className="space-y-10" noValidate>
          {/* Campo truco anti-bots: invisibile para humanos */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />
          <Reveal>
            <Paso numero={1} titulo="ELIGE EL DÍA">
              <div
                className="flex gap-3 overflow-x-auto px-1 pb-2"
                role="listbox"
                aria-label="Selecciona un día"
              >
                {dias.map((dia, i) => {
                  const activo = fecha !== null && fechaISO(fecha) === fechaISO(dia);
                  const esHoy = i === 0;
                  return (
                    <button
                      key={fechaISO(dia)}
                      type="button"
                      onClick={() => seleccionarDia(dia)}
                      aria-pressed={activo}
                      className={cn(
                        "day-option flex w-16 flex-shrink-0 cursor-pointer rounded-md border border-line bg-ink/40 py-3 text-center",
                        "hover:border-brass hover:bg-charcoal/60",
                        activo && "seleccionado",
                      )}
                    >
                      <span
                        className="block text-xs font-semibold"
                        style={{ color: esHoy ? "#B8863B" : "#B7AE9C" }}
                      >
                        {esHoy ? "Hoy" : NOMBRES_DIA[dia.getDay()]}
                      </span>
                      <span className="mt-1 block font-display text-xl text-bone">
                        {dia.getDate()}
                      </span>
                      <span className="block text-[11px] text-bonemuted">
                        {NOMBRES_MES[dia.getMonth()]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Paso>
          </Reveal>

          <Reveal>
            <Paso numero={2} titulo="ELIGE LA HORA">
              <p className="mb-4 text-sm text-bonemuted">{slotHelp}</p>
              <div
                className="grid grid-cols-3 gap-2.5 sm:grid-cols-4"
                role="listbox"
                aria-label="Selecciona una hora"
              >
                {horas.map((franja) => {
                  const ocupada = esOcupada(franja);
                  const activa = hora === franja;
                  return (
                    <button
                      key={franja}
                      type="button"
                      onClick={() => seleccionarHora(franja)}
                      disabled={ocupada}
                      aria-pressed={activa}
                      className={cn(
                        "slot-option rounded-md border py-2.5 text-sm",
                        ocupada
                          ? "slot-occupied cursor-not-allowed border-line text-bonemuted/45 line-through opacity-60"
                          : cn(
                              "border-line bg-ink/40 text-bone transition-colors",
                              "hover:border-brass hover:bg-charcoal/60",
                            ),
                        activa && "seleccionado",
                      )}
                    >
                      {franja}
                    </button>
                  );
                })}
              </div>
              {/* Leyenda */}
              <div className="mt-4 flex flex-wrap gap-5 text-xs text-bonemuted">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-3.5 w-3.5 rounded-sm border border-line bg-ink/40"></span>
                  Libre
                </span>
                <span className="inline-flex items-center gap-2">
                  <span
                    className="inline-block h-3.5 w-3.5 rounded-sm"
                    style={{ background: "linear-gradient(135deg,#8F6529,#B8863B 55%,#D8A95F)" }}
                  ></span>
                  Seleccionada
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center overflow-hidden rounded-sm border border-line bg-ink/50">
                    <span className="slot-occupied absolute inset-0" aria-hidden="true"></span>
                    <span
                      className="absolute left-0 top-1/2 h-[2px] w-[150%] -translate-y-1/2 -rotate-45 bg-bonemuted/60"
                      aria-hidden="true"
                    ></span>
                  </span>
                  Ocupada
                </span>
              </div>
            </Paso>
          </Reveal>

          <Reveal>
            <Paso numero={3} titulo="ELIGE EL SERVICIO">
              <div
                className="grid grid-cols-2 gap-2.5 sm:grid-cols-4"
                role="listbox"
                aria-label="Selecciona un servicio"
              >
                {SERVICIOS.map((s) => {
                  const activo = servicioId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => seleccionarServicio(s.id)}
                      aria-pressed={activo}
                      className={cn(
                        "service-option cursor-pointer rounded-md border border-line bg-ink/40 p-4 text-left",
                        "hover:border-brass hover:bg-charcoal/60",
                        activo && "seleccionado",
                      )}
                    >
                      <span className="block text-sm font-medium text-bone">{s.nombre}</span>
                      <span className="mt-1 block font-display text-lg text-brass">
                        {s.precio} €
                      </span>
                    </button>
                  );
                })}
              </div>
            </Paso>
          </Reveal>

          <Reveal>
            <Paso numero={4} titulo="TUS DATOS">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-bonemuted">
                    Nombre y apellidos
                  </label>
                  <input
                    id="nombre"
                    name="nombre"
                    type="text"
                    required
                    autoComplete="name"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full rounded-md border border-line bg-ink px-4 py-3 text-bone transition-shadow placeholder:text-bonemuted/60 focus:border-brass focus:shadow-brassglow"
                  />
                </div>
                <div>
                  <label
                    htmlFor="telefono"
                    className="mb-2 block text-sm font-medium text-bonemuted"
                  >
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    required
                    autoComplete="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="623 375 207"
                    className="w-full rounded-md border border-line bg-ink px-4 py-3 text-bone transition-shadow placeholder:text-bonemuted/60 focus:border-brass focus:shadow-brassglow"
                  />
                </div>
              </div>
            </Paso>
          </Reveal>

          {/* Resumen de la selección + consentimiento + envío */}
          <Reveal>
            <div className="border-t border-line pt-8">
              {/* Consentimiento RGPD: obligatorio antes de enviar */}
              <div className="mb-6 rounded-md border border-line bg-ink/50 p-5">
                <label
                  htmlFor="consent"
                  className="flex cursor-pointer items-start gap-3 text-sm text-bonemuted"
                >
                  <input
                    id="consent"
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    aria-describedby="consent-help"
                    className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer rounded accent-brass"
                  />
                  <span>
                    He leído y acepto la Política de privacidad y los Términos y condiciones.
                  </span>
                </label>
                <div id="consent-help" className="mt-2 space-y-1 text-xs leading-relaxed text-bonemuted/80">
                  <p>
                    Tu nombre y teléfono se usan únicamente para gestionar tu cita. No se ceden a
                    terceros.
                  </p>
                  <p className="space-x-3">
                    {(
                      [
                        ["privacidad", "Política de privacidad"],
                        ["terminos", "Términos y condiciones"],
                        ["cookies", "Política de cookies"],
                      ] as const
                    ).map(([key, etiqueta]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => onOpenLegal(key)}
                        className="text-brass underline underline-offset-2 transition-colors hover:text-brassdark"
                      >
                        {etiqueta}
                      </button>
                    ))}
                  </p>
                </div>
              </div>

              <div className="mb-6 rounded-md border border-line bg-ink/50 p-5">
                <Resumen
                  fecha={fecha}
                  hora={hora}
                  servicioNombre={servicio?.nombre ?? null}
                  hoyISO={fechaISO(hoy)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <DotBorderButton
                  text={enviando ? "Procesando..." : "Confirmar reserva"}
                  type="submit"
                  variant="brass"
                  disabled={!puedeEnviar || enviando}
                />
                {mensaje && (
                  <p
                    className={cn(
                      "text-sm",
                      mensaje.tipo === "ok" ? "text-brass" : "text-red-400",
                    )}
                    role="status"
                  >
                    {mensaje.texto}
                  </p>
                )}
              </div>
            </div>
          </Reveal>
        </form>

        <Reveal>
          <p className="mt-8 text-sm text-bonemuted">
            ¿Prefieres hablar directamente? Escríbenos por WhatsApp al{" "}
            <a
              href={`https://wa.me/${CONFIG.whatsapp}`}
              className="font-medium text-brass transition-colors hover:text-brassdark"
            >
              {CONFIG.telefono}
            </a>
            .
          </p>
        </Reveal>
      </div>
    </section>
  );
}