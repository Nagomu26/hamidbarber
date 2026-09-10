/**
 * Apps Script de reservas (Google Sheets) para la web de barberías.
 * Pega TODO este archivo en el editor de Google Apps Script del proyecto
 * vinculado a la hoja "Reservas", guarda e implementa como aplicación web.
 *
 * - doGet:  ?rango=7  ->  { "AAAA-MM-DD": ["HH:MM", ...] } (horas ocupadas)
 * - doPost: body JSON { nombre, telefono, servicio, precio, fecha, hora,
 *                       origen, fechaEnvio, token } -> { ok: true } o
 *                       { ok: false, motivo: 'ocupado' | 'error' }
 *
 * IMPORTANTE: en config.ts usa el MISMO webhookToken que se comprueba en doPost.
 */

const HOJA_RESERVAS = 'Reservas';
const HOJA_HISTORIAL = 'Historial';
const CABECERAS = ['Reservado', 'Hora', 'Nombre', 'Teléfono', 'Día', 'Servicio', 'Precio', 'Origen', 'Fecha', 'Marca temporal'];
const DIAS_ANTELACION = 7;
const DURACION_SLOT_MIN = 40;

// El MISMO valor que pongas en `webhookToken` dentro de src/lib/config.ts
const WEBHOOK_TOKEN = 'hbbk-r65j9hj3-bwan4kpy';

// Correo al que llegan las notificaciones de cada cita. Es EL correo que se le
// da a la barbería para gestionar las citas. Cambiar por cliente.
// >>> TRASPASO: al entregar al comprador, cambia a su dirección de correo.
const CORREO_NOTIFICACIONES = 'nagokeys1328@gmail.com';

const IDX = {
  RESERVADO: CABECERAS.indexOf('Reservado'),
  HORA: CABECERAS.indexOf('Hora'),
  NOMBRE: CABECERAS.indexOf('Nombre'),
  TELEFONO: CABECERAS.indexOf('Teléfono'),
  DIA: CABECERAS.indexOf('Día'),
  SERVICIO: CABECERAS.indexOf('Servicio'),
  PRECIO: CABECERAS.indexOf('Precio'),
  ORIGEN: CABECERAS.indexOf('Origen'),
  FECHA: CABECERAS.indexOf('Fecha'),
  MARCA: CABECERAS.indexOf('Marca temporal'),
};

const NOMBRES_DIA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const COLORES_DIA = {
  0: '#F4CCCC', 1: '#FCE5CD', 2: '#FFF2CC', 3: '#D9EAD3',
  4: '#D0E0E3', 5: '#CFE2F3', 6: '#D9D2E9',
};

function obtenerFranjas(fecha) {
  const d = fecha.getDay();
  if (d === 0) return [['09:00', '14:00']];
  return [['10:00', '14:00'], ['16:00', '21:00']];
}

function generarHorasDelDia(fecha) {
  const horas = [];
  obtenerFranjas(fecha).forEach(function(rango) {
    let h = parseInt(rango[0].split(':')[0], 10);
    let m = parseInt(rango[0].split(':')[1], 10);
    const hFin = parseInt(rango[1].split(':')[0], 10);
    const mFin = parseInt(rango[1].split(':')[1], 10);
    while (h < hFin || (h === hFin && m < mFin)) {
      horas.push((h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m);
      m += DURACION_SLOT_MIN;
      if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    }
  });
  return horas;
}

// Normaliza cualquier valor de celda (p. ej. "Sat Dec 30 1899 10:00:00 GMT...")
// a texto "HH:MM" limpio, para poder compararlo con las horas de la rejilla.
function normalizarHora(valor) {
  var texto = String(valor).trim();
  var m = texto.match(/([0-2]?[0-9]):([0-5][0-9])/);
  if (m) {
    var hh = m[1].length === 1 ? '0' + m[1] : m[1];
    return hh + ':' + m[2];
  }
  return texto;
}

// Hora actual local "HH:MM" (huso horario de la hoja).
function horaActualLocal() {
  var d = new Date();
  var hh = d.getHours();
  var mm = d.getMinutes();
  return (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
}

// Fecha actual local "AAAA-MM-DD" (huso horario de la hoja).
function fechaHoyLocal() {
  var d = new Date();
  var m = d.getMonth() + 1;
  var dd = d.getDate();
  return d.getFullYear() + '-' + (m < 10 ? '0' : '') + m + '-' + (dd < 10 ? '0' : '') + dd;
}

// Devuelve true si el slot (fecha + hora) ya ha empezado: es de hoy y su hora
// es menor o igual a la hora actual.
function slotYaPasado(fecha, hora) {
  return String(fecha).trim() === fechaHoyLocal() && normalizarHora(hora) <= horaActualLocal();
}

// true si la hora es un slot exacto de la rejilla de ese día (40 min).
function esSlotDeRejilla(fecha, hora) {
  var horas = generarHorasDelDia(fecha);
  return horas.indexOf(normalizarHora(hora)) !== -1;
}

// Devuelve true si la hora pertenece a una franja de apertura válida del día.
// Además exige que la hora esté ALINEADA con la rejilla de slots (p. ej. "11:00"
// NO es válido; solo 10:00, 10:40, 11:20...). Así se evita que citas escritas
// a mano o por API creen horas "rotas" que la web no puede mostrar.
function esFranjaValida(fecha, hora) {
  var d = parsearFecha(String(fecha).trim());
  var franjas = obtenerFranjas(d);
  var hb = normalizarHora(hora);
  for (var i = 0; i < franjas.length; i++) {
    if (hb >= franjas[i][0] && hb < franjas[i][1]) {
      return esSlotDeRejilla(d, hb);
    }
  }
  return false;
}

function parsearFecha(fechaStr) {
  var partes = String(fechaStr).trim().split('-');
  if (partes.length === 3) {
    return new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));
  }
  return new Date(fechaStr);
}

function formatearDia(fechaStr) {
  return NOMBRES_DIA[parsearFecha(fechaStr).getDay()];
}

function filaOcupada(fila) {
  return !!fila[IDX.NOMBRE] || fila[IDX.RESERVADO] === true;
}

function obtenerHojaReservas() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = libro.getSheetByName(HOJA_RESERVAS);
  if (!hoja) hoja = libro.insertSheet(HOJA_RESERVAS);

  if (hoja.getLastRow() === 0) {
    hoja.appendRow(CABECERAS);
    hoja.getRange(1, 1, 1, CABECERAS.length)
        .setFontWeight('bold').setBackground('#434343').setFontColor('#FFFFFF');
    hoja.setFrozenRows(1);
    hoja.setColumnWidth(IDX.RESERVADO + 1, 40);
    hoja.setColumnWidth(IDX.HORA + 1, 60);
  }
  return hoja;
}

function respuestaJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function aplicarColoresPorDia(hoja) {
  var numFilas = hoja.getLastRow() - 1;
  if (numFilas <= 0) return;
  var valores = hoja.getRange(2, IDX.FECHA + 1, numFilas, 1).getValues();
  var colores = [];
  for (var i = 0; i < valores.length; i++) {
    var fecha = parsearFecha(valores[i][0]);
    var color = COLORES_DIA[fecha.getDay()] || '#FFFFFF';
    var fila = [];
    for (var j = 0; j < CABECERAS.length; j++) fila.push(color);
    colores.push(fila);
  }
  hoja.getRange(2, 1, numFilas, CABECERAS.length).setBackgrounds(colores);
}

function ordenarPorFechaYHora(hoja) {
  var numFilas = hoja.getLastRow() - 1;
  if (numFilas > 0) {
    hoja.getRange(2, 1, numFilas, CABECERAS.length)
        .sort([{ column: IDX.FECHA + 1, ascending: true }, { column: IDX.HORA + 1, ascending: true }]);
  }
}

function generarPlantillaSemana() {
  var hoja = obtenerHojaReservas();
  var filas = hoja.getDataRange().getValues();
  var existentes = {};
  for (var i = 1; i < filas.length; i++) {
    existentes[normalizarHora(filas[i][IDX.FECHA]) + '|' + normalizarHora(filas[i][IDX.HORA])] = true;
  }
  var hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  var nuevasFilas = [];
  for (var d = 0; d < DIAS_ANTELACION; d++) {
    var fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() + d);
    var mm = fecha.getMonth() + 1;
    var dd = fecha.getDate();
    var fechaTexto = fecha.getFullYear() + '-' + (mm < 10 ? '0' : '') + mm + '-' + (dd < 10 ? '0' : '') + dd;
    var diaTexto = NOMBRES_DIA[fecha.getDay()];
    var horas = generarHorasDelDia(fecha);
    for (var h = 0; h < horas.length; h++) {
      var clave = fechaTexto + '|' + horas[h];
      if (!existentes[clave]) {
        var fila = new Array(CABECERAS.length).fill('');
        fila[IDX.RESERVADO] = false;
        fila[IDX.HORA] = horas[h];
        fila[IDX.DIA] = diaTexto;
        fila[IDX.FECHA] = fechaTexto;
        nuevasFilas.push(fila);
        existentes[clave] = true;
      }
    }
  }
  if (nuevasFilas.length > 0) {
    var filaInicio = hoja.getLastRow() + 1;
    var numFilasNuevas = nuevasFilas.length;

    hoja.getRange(filaInicio, IDX.FECHA + 1, numFilasNuevas, 1).setNumberFormat('@');
    hoja.getRange(filaInicio, IDX.HORA + 1, numFilasNuevas, 1).setNumberFormat('@');

    hoja.getRange(filaInicio, 1, numFilasNuevas, CABECERAS.length).setValues(nuevasFilas);
    hoja.getRange(filaInicio, 1, numFilasNuevas, CABECERAS.length).setHorizontalAlignment('left');
    hoja.getRange(filaInicio, IDX.RESERVADO + 1, numFilasNuevas, 1).insertCheckboxes();
  }
  ordenarPorFechaYHora(hoja);
  aplicarColoresPorDia(hoja);
}

function notificarPorEmail(datos) {
  if (!datos) {
    datos = { nombre: 'PRUEBA', telefono: '600000000', servicio: 'Test', fecha: '2026-09-06', hora: '10:00' };
  }
  try {
    var correoDestino = CORREO_NOTIFICACIONES;
    var asunto = "✂️ NUEVA CITA: " + datos.nombre + " - " + datos.hora;
    var mensaje = "Se ha recibido una nueva reserva desde la web:\n\n" +
                  "Cliente: " + datos.nombre + "\n" +
                  "Teléfono: " + datos.telefono + "\n" +
                  "Servicio: " + datos.servicio + "\n" +
                  "Día: " + datos.fecha + "\n" +
                  "Hora: " + datos.hora;

    MailApp.sendEmail(correoDestino, asunto, mensaje);

    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reservas').getRange('L1').setValue('OK enviado ' + new Date());
  } catch (error) {
    SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reservas').getRange('L1').setValue('ERROR: ' + String(error));
    console.log("Error al enviar email: " + error);
  }
}

// Borra el contenido de las citas de PRUEBA/TEST para dejar la plantilla limpia.
// Solo libera las filas (deja cabecera, hora, día y fecha de la plantilla).
function limpiarFilasPrueba() {
  var hoja = obtenerHojaReservas();
  var filas = hoja.getDataRange().getValues();
  var cambios = 0;
  for (var i = 1; i < filas.length; i++) {
    var nombre = String(filas[i][IDX.NOMBRE]).trim();
    if (nombre.indexOf('PRUEBA') === 0 || nombre.indexOf('TEST') === 0) {
      hoja.getRange(i + 1, IDX.RESERVADO + 1).setValue(false);
      hoja.getRange(i + 1, IDX.NOMBRE + 1).setValue('');
      hoja.getRange(i + 1, IDX.TELEFONO + 1).setValue('');
      hoja.getRange(i + 1, IDX.SERVICIO + 1).setValue('');
      hoja.getRange(i + 1, IDX.PRECIO + 1).setValue('');
      hoja.getRange(i + 1, IDX.ORIGEN + 1).setValue('');
      hoja.getRange(i + 1, IDX.MARCA + 1).setValue('');
      cambios++;
    }
  }
  return cambios;
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var datos = JSON.parse(e.postData.contents);

    if (datos.token !== WEBHOOK_TOKEN) {
      return respuestaJSON({ ok: false, motivo: 'error', error: 'Token no válido' });
    }

    var hoja = obtenerHojaReservas();
    var filas = hoja.getDataRange().getValues();

    var fechaBuscar = String(datos.fecha).trim();
    var horaBuscar = normalizarHora(datos.hora);

    // Rechaza reservas en horas que no son de apertura de ese día o que no
    // coinciden con la rejilla de slots.
    if (!esFranjaValida(fechaBuscar, horaBuscar)) {
      return respuestaJSON({ ok: false, motivo: 'error', error: 'Esa hora no está disponible' });
    }

    // Rechaza reservas de horas de HOY que ya han empezado.
    if (slotYaPasado(fechaBuscar, horaBuscar)) {
      return respuestaJSON({ ok: false, motivo: 'pasado', error: 'Esa hora ya ha pasado' });
    }

    for (var i = 1; i < filas.length; i++) {
      var fechaFila = String(filas[i][IDX.FECHA]).trim();
      var horaFila = normalizarHora(filas[i][IDX.HORA]);
      if (fechaFila === fechaBuscar && horaFila === horaBuscar) {
        if (filaOcupada(filas[i])) {
          return respuestaJSON({ ok: false, motivo: 'ocupado', error: 'Esa hora ya no está disponible' });
        }
        hoja.getRange(i + 1, IDX.RESERVADO + 1).setValue(true);
        hoja.getRange(i + 1, IDX.NOMBRE + 1).setValue(datos.nombre);
        hoja.getRange(i + 1, IDX.TELEFONO + 1).setValue(datos.telefono);
        hoja.getRange(i + 1, IDX.SERVICIO + 1).setValue(datos.servicio);
        hoja.getRange(i + 1, IDX.PRECIO + 1).setValue(datos.precio);
        hoja.getRange(i + 1, IDX.ORIGEN + 1).setValue(datos.origen || 'Web');
        hoja.getRange(i + 1, IDX.MARCA + 1).setValue(new Date());
        aplicarColoresPorDia(hoja);
        notificarPorEmail(datos);
        return respuestaJSON({ ok: true });
      }
    }

    var fila = new Array(CABECERAS.length).fill('');
    fila[IDX.RESERVADO] = true;
    fila[IDX.FECHA] = fechaBuscar;
    fila[IDX.DIA] = formatearDia(fechaBuscar);
    fila[IDX.HORA] = horaBuscar;
    fila[IDX.NOMBRE] = datos.nombre;
    fila[IDX.TELEFONO] = datos.telefono;
    fila[IDX.SERVICIO] = datos.servicio;
    fila[IDX.PRECIO] = datos.precio;
    fila[IDX.ORIGEN] = datos.origen || 'Web';
    fila[IDX.MARCA] = new Date();
    hoja.appendRow(fila);
    var ultima = hoja.getLastRow();
    // Fuerza formato TEXTO en hora y fecha y VUELVE A ESCRIBIRLOS: si se deja
    // que Sheets los interprete como hora/fecha, al releer la hoja aparecen
    // valores rotos ("11" en vez de "11:20") y la web no puede marcar la cita.
    hoja.getRange(ultima, IDX.HORA + 1, 1, 1).setNumberFormat('@').setValue(horaBuscar);
    hoja.getRange(ultima, IDX.FECHA + 1, 1, 1).setNumberFormat('@').setValue(fechaBuscar);
    ordenarPorFechaYHora(hoja);
    aplicarColoresPorDia(hoja);
    notificarPorEmail(datos);
    return respuestaJSON({ ok: true });
  } catch (error) {
    return respuestaJSON({ ok: false, motivo: 'error', error: String(error) });
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    var hoja = obtenerHojaReservas();
    var filas = hoja.getDataRange().getValues();
    var hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    var rango = e.parameter.rango;
    if (rango) {
      var resultado = {};
      var dias = parseInt(rango, 10) || 7;

      for (var d = 0; d < dias; d++) {
        var fec = new Date(hoy);
        fec.setDate(hoy.getDate() + d);
        var mm = fec.getMonth() + 1;
        var dd = fec.getDate();
        var fechaTexto = fec.getFullYear() + '-' + (mm < 10 ? '0' : '') + mm + '-' + (dd < 10 ? '0' : '') + dd;
        resultado[fechaTexto] = [];
      }

      for (var i = 1; i < filas.length; i++) {
        var dObj = parsearFecha(filas[i][IDX.FECHA]);
        var mF = dObj.getMonth() + 1;
        var dF = dObj.getDate();
        var fechaFila = dObj.getFullYear() + '-' + (mF < 10 ? '0' : '') + mF + '-' + (dF < 10 ? '0' : '') + dF;

        if (filaOcupada(filas[i]) && resultado[fechaFila] !== undefined) {
          resultado[fechaFila].push(normalizarHora(filas[i][IDX.HORA]));
        }
      }

      // Las horas de HOY que ya han empezado se consideran ocupadas.
      if (resultado[fechaHoyLocal()]) {
        var horasHoy = generarHorasDelDia(new Date());
        var ahora = horaActualLocal();
        for (var k = 0; k < horasHoy.length; k++) {
          if (horasHoy[k] <= ahora && resultado[fechaHoyLocal()].indexOf(horasHoy[k]) === -1) {
            resultado[fechaHoyLocal()].push(horasHoy[k]);
          }
        }
      }

      return respuestaJSON(resultado);
    }

    var fecha = e.parameter.fecha;
    var ocupadas = [];
    var fechaBuscada = String(fecha).trim();
    for (var j = 1; j < filas.length; j++) {
      var dObj2 = parsearFecha(filas[j][IDX.FECHA]);
      var mF2 = dObj2.getMonth() + 1;
      var dF2 = dObj2.getDate();
      var fFila = dObj2.getFullYear() + '-' + (mF2 < 10 ? '0' : '') + mF2 + '-' + (dF2 < 10 ? '0' : '') + dF2;

      if (fFila === fechaBuscada && filaOcupada(filas[j])) {
        ocupadas.push(normalizarHora(filas[j][IDX.HORA]));
      }
    }
    return respuestaJSON({ ocupadas: ocupadas });
  } catch (error) {
    return respuestaJSON({ error: String(error) });
  }
}

function limpiezaDiaria() {
  var libro = SpreadsheetApp.getActiveSpreadsheet();
  var hoja = obtenerHojaReservas();
  var historial = libro.getSheetByName(HOJA_HISTORIAL);

  if (!historial) {
    historial = libro.insertSheet(HOJA_HISTORIAL);
    historial.appendRow(CABECERAS);
    historial.getRange(1, 1, 1, CABECERAS.length)
             .setFontWeight('bold').setBackground('#434343').setFontColor('#FFFFFF');
    historial.setFrozenRows(1);
    historial.setColumnWidth(IDX.RESERVADO + 1, 40);
  }

  var filas = hoja.getDataRange().getValues();
  var hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  var filasAConservar = [CABECERAS];
  var nuevasAlHistorial = 0;

  for (var i = 1; i < filas.length; i++) {
    var fechaFila = parsearFecha(filas[i][IDX.FECHA]);

    if (fechaFila < hoy) {
      if (filaOcupada(filas[i])) {
        historial.appendRow(filas[i]);
        nuevasAlHistorial++;
      }
    } else {
      filasAConservar.push(filas[i]);
    }
  }

  for (var s = 0; s < filasAConservar.length; s++) {
    filasAConservar[s] = filasAConservar[s].slice(0, CABECERAS.length);
  }

  hoja.clearContents();
  hoja.getRange(1, 1, filasAConservar.length, CABECERAS.length).setValues(filasAConservar);
  if (filasAConservar.length > 1) {
    hoja.getRange(2, IDX.RESERVADO + 1, filasAConservar.length - 1, 1).insertCheckboxes();
  }

  if (nuevasAlHistorial > 0) {
    var ultimaFilaHist = historial.getLastRow();
    historial.getRange(ultimaFilaHist - nuevasAlHistorial + 1, IDX.RESERVADO + 1, nuevasAlHistorial, 1).insertCheckboxes();
  }

  generarPlantillaSemana();
}

function regenerarPlantillaLimpiando() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Reservas');
  if (!hoja) return;
  hoja.clearContents();
  hoja.appendRow(CABECERAS);
  hoja.getRange(1, 1, 1, CABECERAS.length)
      .setFontWeight('bold').setBackground('#434343').setFontColor('#FFFFFF');
  hoja.setFrozenRows(1);
  generarPlantillaSemana();
}

function forzarFormatoTexto() {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HOJA_RESERVAS);
  if (!hoja) return;
  const numFilas = hoja.getLastRow() - 1;
  if (numFilas <= 0) return;

  hoja.getRange(2, IDX.FECHA + 1, numFilas, 1).setNumberFormat('@');
  hoja.getRange(2, IDX.HORA + 1, numFilas, 1).setNumberFormat('@');

  const datos = hoja.getRange(2, 1, numFilas, CABECERAS.length).getValues();
  const nuevos = datos.map(function(fila) {
    fila[IDX.FECHA] = String(fila[IDX.FECHA]);
    fila[IDX.HORA] = String(fila[IDX.HORA]);
    return fila;
  });
  hoja.getRange(2, 1, numFilas, CABECERAS.length).setValues(nuevos);
  hoja.getRange(2, 1, numFilas, CABECERAS.length).setHorizontalAlignment('left');
}