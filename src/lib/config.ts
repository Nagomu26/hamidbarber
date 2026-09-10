// =============================================================================
// CONFIGURACIÓN DE LA PELUQUERÍA (plantilla "Your Barber")
// Edita aquí para cambiar nombre, teléfono, dirección y zona. Se aplica a toda
// la página (logo, footer, botones, WhatsApp, título y meta descripción).
// Para cada cliente nuevo: cambia TODAS las líneas marcadas con "← personalizar".
// =============================================================================

export const CONFIG = {
  // Marca / logo del sitio (qúeda así si vendes la plantilla como "Your Barber")
  nombre: "Your Barber",
  logoNombre: "Your",
  logoAcento: "Barber",
  // --- Datos del barbero cliente (← personalizar por cliente) ---
  telefono: "600 000 000",
  telefonoEnlace: "600000000",
  whatsapp: "34600000000",
  direccion: "C/ Ejemplo, 1",
  ciudad: "Tu ciudad",
  localidad: "Tu código postal y ciudad (Toledo)",
  zona: "TU CIUDAD",
  tituloSeo: "Tu barbería de confianza",
  lemaSeo: "Cortes clásicos, degradados, arreglo de barba.",
  // --- Ficha legal / contacto (RGPD · LSSI). Rellena para un cliente nuevo ---
  email: "", // Correo de contacto, p. ej. "info@tubarberia.es"
  nif: "", // NIF/CIF del titular real del negocio
  // URL pública exacta donde estará publicada la web (para Open Graph y aviso legal)
  dominio: "https://TU-DOMINIO.com",
  // Clave anti-spam compartida con el Google Apps Script (doPost la comprueba).
  // Debe coincidir EXACTAMENTE con WEBHOOK_TOKEN en reservas-apps-script.gs.
  // Para un cliente nuevo: genera un token nuevo y redeploy del script.
  webhookToken: "hbbk-r65j9hj3-bwan4kpy",
} as const;

export type Config = typeof CONFIG;