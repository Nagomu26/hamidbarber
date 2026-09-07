// ==========================================================================
// RESERVA ESTILO "TAQUILLA DE CINE": día → hora libre → servicio → datos
// La página lee y escribe directamente en el Google Sheet de reservas a
// través del Google Apps Script publicado como aplicación web.
// NO MODIFICAR las URLs ni el flujo de datos: los consumes la hoja que
// también alimenta las citas telefónicas y las automatizaciones (n8n).
// ==========================================================================

import { CONFIG } from "./config";
import type { BookingPayload, OcupadasPorDia, Service } from "./types";

export const DIAS_ANTELACION = 7; // Solo se puede reservar hasta 1 semana vista
export const DURACION_SLOT_MIN = 40; // Minutos entre cada hora disponible

// URL del Google Apps Script (webhook de Google Sheets / n8n)
export const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzfVfl3XqYzmml4Y7u_6NyCB-GxsHbn5dXcv2jG1omxTA0Yoa6CmTtLE4xgRNeHXfayLA/exec";

export const NOMBRES_DIA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
export const NOMBRES_MES = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
];

export function fechaISO(fecha: Date): string {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Horario de apertura según el día de la semana.
// NOTA: los festivos oficiales no se detectan automáticamente aquí.
function getFranjasApertura(fecha: Date): Array<[string, string]> {
  const esDomingo = fecha.getDay() === 0;
  return esDomingo
    ? [["09:00", "14:00"]]
    : [
        ["10:00", "14:00"],
        ["16:00", "21:00"],
      ];
}

// Genera las horas de un día dentro de sus franjas de apertura
export function generarHoras(fecha: Date): string[] {
  const horas: string[] = [];
  for (const [inicio, fin] of getFranjasApertura(fecha)) {
    let [h, m] = inicio.split(":").map(Number);
    const [hFin, mFin] = fin.split(":").map(Number);
    while (h < hFin || (h === hFin && m < mFin)) {
      horas.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      m += DURACION_SLOT_MIN;
      if (m >= 60) {
        h += Math.floor(m / 60);
        m = m % 60;
      }
    }
  }
  return horas;
}

// --------------------------------------------------------------------------
// DISPONIBILIDAD REAL: consulta las horas ya ocupadas ese día directamente
// en el Google Sheet (reservas web + citas apuntadas a mano por teléfono).
// Mientras la conexión falla o no responde, se usa una simulación local solo
// para poder ver y probar el diseño.
// --------------------------------------------------------------------------

// El Apps Script devuelve las horas ocupadas como objetos Date que se
// serializan como "Sat Dec 30 1899 10:00:00 GMT-0014 ..." (hora 10:00).
// Aquí se normaliza todo a "HH:MM" y se eliminan duplicados, para poder
// compararlo limpiamente con las franjas de la rejilla.
function normalizarListaHoras(valores: unknown): string[] {
  if (!Array.isArray(valores)) return [];
  const horas = new Set<string>();
  for (const valor of valores) {
    const partes = String(valor).match(/(\d{1,2}):(\d{2})/);
    if (partes) {
      horas.add(`${partes[1].padStart(2, "0")}:${partes[2]}`);
    }
  }
  return [...horas];
}

function normalizarOcupadas(datos: unknown): OcupadasPorDia | null {
  if (!datos || typeof datos !== "object") return null;
  const resultado: OcupadasPorDia = {};
  for (const [dia, lista] of Object.entries(datos as Record<string, unknown>)) {
    resultado[dia] = normalizarListaHoras(lista);
  }
  return resultado;
}

// Una única llamada al montar la página: trae todas las horas ocupadas de los
// próximos DIAS_ANTELACION días. Así cambiar de día es instantáneo.
export async function precargarOcupadas(): Promise<OcupadasPorDia | null> {
  try {
    const respuesta = await fetch(`${APPS_SCRIPT_URL}?rango=${DIAS_ANTELACION}`);
    const datos = (await respuesta.json()) as unknown;
    return normalizarOcupadas(datos);
  } catch (error) {
    console.error("No se pudo consultar la disponibilidad real del Google Sheet:", error);
    return null;
  }
}

export function obtenerHorasOcupadas(
  ocupadasPorDia: OcupadasPorDia | null,
  fechaISOTexto: string,
): string[] | null {
  // Si tenemos los datos precargados, respondemos al instante desde memoria
  if (ocupadasPorDia && ocupadasPorDia[fechaISOTexto]) {
    return ocupadasPorDia[fechaISOTexto];
  }
  if (ocupadasPorDia) {
    return []; // No hay horas ocupadas para ese día
  }
  return null; // Aún no hay datos: se usará la simulación de demo
}

// Simulación de demo (solo si la conexión falla o no ha respondido)
export function estaOcupadaDemo(fechaISOTexto: string, hora: string): boolean {
  const cadena = fechaISOTexto + hora;
  let hash = 0;
  for (let i = 0; i < cadena.length; i++) {
    hash = (hash * 31 + cadena.charCodeAt(i)) % 997;
  }
  return hash % 3 === 0; // ~1 de cada 3 horas aparece ocupada, solo para el efecto visual
}

// Resultado del intento de guardado. El Apps Script puede rechazar el envío
// con motivo "ocupado" si ya existe esa fecha+hora en la hoja (protección
// frente a dobles reservas de dos clientes a la vez).
export type ResultadoGuardado =
  | { ok: true }
  | { ok: false; motivo: "ocupado" | "error" };

// Envía la reserva al Google Sheet a través del Apps Script.
// Se envía SIN cabecera "Content-Type: application/json" a propósito: así el
// navegador la trata como una petición "simple" y evita el aviso de CORS que
// Apps Script no gestiona bien con peticiones "preflight".
export async function guardarReservaEnSheet(payload: BookingPayload): Promise<ResultadoGuardado> {
  try {
    const respuesta = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const resultado = (await respuesta.json()) as { ok?: boolean; motivo?: string };
    if (resultado.ok === true) {
      return { ok: true };
    }
    return { ok: false, motivo: resultado.motivo === "ocupado" ? "ocupado" : "error" };
  } catch (error) {
    console.error("Error al guardar la reserva en el Google Sheet:", error);
    return { ok: false, motivo: "error" };
  }
}

export function construirPayload(
  fecha: Date,
  hora: string,
  servicio: Service,
  nombre: string,
  telefono: string,
): BookingPayload {
  return {
    nombre: nombre.trim(),
    telefono: telefono.trim(),
    servicio: servicio.nombre,
    precio: servicio.precio,
    fecha: fechaISO(fecha),
    hora,
    origen: `Web ${CONFIG.nombre}`,
    fechaEnvio: new Date().toISOString(),
    token: CONFIG.webhookToken,
  };
}