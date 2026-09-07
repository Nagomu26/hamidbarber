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
  // --- Ficha legal / contacto (RGPD · LSSI). Rellena para un cliente nuevo ---
  email: "", // Correo de contacto, p. ej. "info@hamidbarber.es"
  nif: "12345678X", // NIF/CIF del titular real del negocio
  // URL pública exacta donde estará publicada la web (para Open Graph y aviso legal)
  dominio: "https://nagomu26.github.io/hamidbarber",
  // Clave anti-spam compartida con el Google Apps Script (doPost la comprueba).
  // Cámbiala tú y usa la MISMA en el Apps Script cuando montes un cliente nuevo.
  webhookToken: "hbbk-vendedor26",
} as const;

export type Config = typeof CONFIG;