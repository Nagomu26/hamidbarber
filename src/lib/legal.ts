// =============================================================================
// CONTENIDO LEGAL (LSSI, RGPD, Ley de Cookies — España)
// Los textos se muestran en el diálogo legal de la web. Incluyen los datos
// identificativos de la barbería (config.ts) para cumplir la LSSI.
// =============================================================================

import { CONFIG } from "./config";

export type LegalDocId = "aviso" | "privacidad" | "terminos" | "cookies";

export interface LegalBlock {
  titulo?: string;
  parrafos?: string[];
  lista?: string[];
}

export interface LegalDocument {
  id: LegalDocId;
  titulo: string;
  resumen: string;
  fecha: string;
  bloques: LegalBlock[];
}

const IDENTIDAD: string[] = [
  `${CONFIG.nombre}, con domicilio en ${CONFIG.direccion}, ${CONFIG.localidad}.`,
  CONFIG.nif ? `NIF/CIF: ${CONFIG.nif}.` : null,
  `Teléfono / WhatsApp: ${CONFIG.telefono}.`,
  CONFIG.email ? `Correo electrónico de contacto: ${CONFIG.email}.` : null,
  CONFIG.dominio ? `Web: ${CONFIG.dominio}.` : null,
].filter((x): x is string => x !== null);

export const DOCUMENTOS: Record<LegalDocId, LegalDocument> = {
  aviso: {
    id: "aviso",
    titulo: "Aviso legal",
    resumen: "Identificación del titular y condiciones generales de uso del sitio web.",
    fecha: "Septiembre de 2026",
    bloques: [
      {
        titulo: "1. Titular del sitio web",
        parrafos: [
          `En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), se informa de que este sitio web es titularidad de ${CONFIG.nombre}:`,
        ],
        lista: IDENTIDAD,
      },
      {
        titulo: "2. Objeto",
        parrafos: [
          "El presente sitio web tiene por objeto informar sobre los servicios de barbería ofrecidos y permitir la reserva de citas online.",
        ],
      },
      {
        titulo: "3. Propiedad intelectual",
        parrafos: [
          "Los contenidos de este sitio web (textos, logotipos, imágenes, diseño y código) están protegidos por la normativa de propiedad intelectual e industrial y pertenecen a su titular o a terceros autorizados. Queda prohibida su reproducción, distribución o transformación sin autorización expresa.",
        ],
      },
      {
        titulo: "4. Responsabilidad",
        parrafos: [
          "Se pone el máximo cuidado en que la información sea correcta y esté actualizada, pero no se garantiza la ausencia de errores. La navegación y el uso de la web se realizan bajo la exclusiva responsabilidad del usuario.",
        ],
      },
      {
        titulo: "5. Legislación aplicable",
        parrafos: [
          "Las presentes condiciones se rigen por la legislación española. Para cualquier controversia, serán competentes los juzgados y tribunales correspondientes al domicilio del consumidor.",
        ],
      },
    ],
  },
  privacidad: {
    id: "privacidad",
    titulo: "Política de privacidad",
    resumen: "Cómo tratamos tus datos personales de acuerdo con el Reglamento (UE) 2016/679 (RGPD).",
    fecha: "Septiembre de 2026",
    bloques: [
      {
        titulo: "1. Responsable del tratamiento",
        parrafos: ["El responsable del tratamiento de los datos personales recogidos en esta web es:"],
        lista: IDENTIDAD,
      },
      {
        titulo: "2. Finalidad del tratamiento y base jurídica",
        parrafos: [
          "Solo recogemos los datos imprescindibles para gestionar tu reserva: el nombre y el número de teléfono.",
          "Estos datos se utilizan exclusivamente para crear, confirmar y comunicar el estado de tu cita (por ejemplo, avisarte de cambios). NO se utilizan para envíos publicitarios ni se ceden a terceros.",
          "La base jurídica es el consentimiento que prestas al marcar la casilla correspondiente y enviar el formulario (artículo 6.1.a del RGPD).",
        ],
      },
      {
        titulo: "3. Datos que recogemos",
        lista: ["Nombre y apellidos.", "Teléfono de contacto."],
        parrafos: [
          "No se solicitan ni recogen categorías especiales de datos ni más información de la estrictamente necesaria.",
        ],
      },
      {
        titulo: "4. Conservación",
        parrafos: [
          "Los datos se conservan únicamente durante el tiempo necesario para gestionar la reserva y, como máximo, durante 12 meses desde la última cita, salvo que exista obligación legal de conservarlos.",
        ],
      },
      {
        titulo: "5. Destinatarios y encargados del tratamiento",
        parrafos: [
          "Tus datos no se venden, ceden ni comunican a terceros, salvo obligación legal.",
          "La gestión de las reservas se realiza a través de Google Sheets (Google LLC), que actúa como encargado del tratamiento de conformidad con el RGPD y con acuerdos de protección de datos.",
        ],
      },
      {
        titulo: "6. Derechos",
        parrafos: [
          "Puedes ejercer en cualquier momento tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiéndonos por teléfono o WhatsApp al " +
            CONFIG.telefono +
            ".",
          "También tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).",
        ],
      },
      {
        titulo: "7. Seguridad",
        parrafos: [
          "Se aplican medidas técnicas y organizativas adecuadas para proteger tus datos frente a accesos no autorizados, alteraciones o pérdidas.",
        ],
      },
    ],
  },
  terminos: {
    id: "terminos",
    titulo: "Términos y condiciones",
    resumen: "Condiciones que regulan el uso del servicio de reserva de citas online.",
    fecha: "Septiembre de 2026",
    bloques: [
      {
        titulo: "1. Objeto",
        parrafos: [
          `El servicio de reserva online permite a los clientes de ${CONFIG.nombre} elegir día, hora y servicio, y solicitar una cita en la barbería.`,
        ],
      },
      {
        titulo: "2. Cómo funciona",
        parrafos: [
          "El cliente selecciona el día (con hasta una semana de antelación), la hora libre y el servicio, e introduce su nombre y teléfono. Al confirmar, se envía la solicitud de reserva, que será gestionada por la barbería.",
          "La confirmación definitiva se comunica por teléfono o WhatsApp al número facilitado.",
        ],
      },
      {
        titulo: "3. Obligaciones del usuario",
        parrafos: [
          "El usuario se compromete a facilitar datos veraces y a utilizar el servicio de forma lícita y de buena fe.",
          "Si no puedes asistir a tu cita, rogamos nos avises con antelación por teléfono o WhatsApp.",
        ],
      },
      {
        titulo: "4. Precios",
        parrafos: [
          "Los precios de los servicios son los indicados en esta web. El pago se realiza en el establecimiento al finalizar el servicio, salvo que se indique expresamente otra cosa.",
        ],
      },
      {
        titulo: "5. Modificación y cancelación",
        parrafos: [
          "La barbería podrá modificar los horarios y servicios mostrados, así como cancelar una cita en caso de incumplimiento de estas condiciones, informando al cliente siempre que sea posible.",
        ],
      },
      {
        titulo: "6. Propiedad intelectual y legislación",
        parrafos: [
          "Los contenidos de la web están protegidos por la normativa de propiedad intelectual. Estas condiciones se rigen por la legislación española.",
        ],
      },
    ],
  },
  cookies: {
    id: "cookies",
    titulo: "Política de cookies",
    resumen: "Información sobre el uso de cookies y tecnologías similares en este sitio web.",
    fecha: "Septiembre de 2026",
    bloques: [
      {
        titulo: "1. Qué son las cookies",
        parrafos: [
          "Las cookies son pequeños archivos de texto que los sitios web guardan en tu navegador para que el sitio pueda recordar información o funcionar correctamente.",
        ],
      },
      {
        titulo: "2. Qué usamos en esta web",
        parrafos: [
          "Esta web utiliza únicamente tecnologías técnicas y necesarias para su funcionamiento. NO emplea cookies de publicidad, analíticas ni de seguimiento de terceros.",
          "Para recordar si ya has aceptado este aviso, guardamos tu preferencia en el almacenamiento local de tu navegador (localStorage), no mediante cookies.",
          "La carga de fuentes externas (por ejemplo, las tipografías de Google Fonts) puede suponer peticiones a servidores de Google, que no se utilizan con fines de seguimiento.",
        ],
        lista: ["Cookies técnicas: imprescindibles para el funcionamiento básico del sitio."],
      },
      {
        titulo: "3. Cómo gestionarlas",
        parrafos: [
          "Puedes configurar tu navegador para bloquear o avisarte de las cookies, y borrar las almacenadas, desde los ajustes de tu navegador (Chrome, Firefox, Safari, Edge).",
          "Si tienes dudas sobre esta política, puedes contactar con nosotros por teléfono o WhatsApp en " +
            CONFIG.telefono +
            ".",
        ],
      },
    ],
  },
};