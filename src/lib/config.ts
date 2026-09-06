// =============================================================================
// CONFIGURACIÓN DE LA PELUQUERÍA
// Edita aquí para cambiar nombre, teléfono, dirección y zona. Se aplica a toda
// la página (logo, footer, botones, WhatsApp, título y meta descripción).
// =============================================================================

export const CONFIG = {
  nombre: "Hamidbarber",
  logoNombre: "Hamid",
  logoAcento: "barber",
  telefono: "623 375 207",
  telefonoEnlace: "623375207",
  whatsapp: "34623375207",
  direccion: "Av. Castilla la Mancha, 21",
  ciudad: "Valmojado",
  localidad: "45940 Valmojado (Toledo)",
  zona: "VALMOJADO · TOLEDO",
  tituloSeo: "Barbería en Valmojado",
  lemaSeo: "Cortes clásicos, degradados, arreglo de barba.",
} as const;

export type Config = typeof CONFIG;