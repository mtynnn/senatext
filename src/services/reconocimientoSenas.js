/**
 * ============================================================================
 * SERVICIO: reconocimientoSenas
 * ============================================================================
 * Ubicación: src/services/reconocimientoSenas.js
 * Cliente de la API de reconocimiento (FastAPI en Colab, expuesta por túnel).
 * La URL base sale SOLO de VITE_URL_RECONOCEDOR (cambia en cada sesión de Colab).
 */

// La respuesta tarda ~12 s (la primera de una sesión puede superar 30 s).
const TIMEOUT_MS = 120000;

export class ErrorReconocimiento extends Error {
  constructor(mensaje, codigo) {
    super(mensaje);
    this.name = 'ErrorReconocimiento';
    this.codigo = codigo;
  }
}

const urlBase = () => (import.meta.env.VITE_URL_RECONOCEDOR || '').trim().replace(/\/+$/, '');

// Verdadero si se debe conservar el comportamiento simulado (sin llamar a la API).
export const modoSimulado = () =>
  String(import.meta.env.VITE_MODO_SIMULADO).toLowerCase() === 'true' || urlBase() === '';

const mensajePorEstado = (estado, detalle) => {
  if (estado === 400) {
    return `El servidor no pudo procesar el video${detalle ? `: ${detalle}` : '.'} Intente grabar la seña nuevamente.`;
  }
  if (estado === 413) return 'El video es demasiado grande. Intente grabar la seña nuevamente.';
  if (estado >= 500) return 'El reconocedor tuvo un error interno. Intente nuevamente en unos segundos.';
  return `No se pudo reconocer la seña (error ${estado}). Intente nuevamente.`;
};

const leerDetalle = async (respuesta) => {
  try {
    const cuerpo = await respuesta.json();
    return typeof cuerpo?.error === 'string' ? cuerpo.error : '';
  } catch {
    return '';
  }
};

// Ejecuta fetch con timeout; `senalExterna` permite cancelar (p. ej. al salir de la vista).
const fetchConTimeout = async (url, opciones = {}, senalExterna) => {
  const controlador = new AbortController();
  let vencio = false;
  const temporizador = setTimeout(() => {
    vencio = true;
    controlador.abort();
  }, TIMEOUT_MS);
  const cancelarPorExterna = () => controlador.abort();
  senalExterna?.addEventListener('abort', cancelarPorExterna);

  try {
    return await fetch(url, { ...opciones, signal: controlador.signal });
  } catch (error) {
    if (error?.name === 'AbortError') {
      if (vencio) {
        throw new ErrorReconocimiento(
          'El reconocedor tardó demasiado en responder. Intente nuevamente.',
          'timeout'
        );
      }
      throw new ErrorReconocimiento('Solicitud cancelada.', 'cancelado');
    }
    throw new ErrorReconocimiento(
      'No se pudo conectar con el reconocedor. Revise la conexión a internet y que el servicio esté activo.',
      'red'
    );
  } finally {
    clearTimeout(temporizador);
    senalExterna?.removeEventListener('abort', cancelarPorExterna);
  }
};

// GET /salud -> { ok: true, version: "..." }
export const verificarSalud = async (senalExterna) => {
  const base = urlBase();
  if (!base) {
    throw new ErrorReconocimiento('El reconocedor no está configurado.', 'sin_url');
  }
  const respuesta = await fetchConTimeout(`${base}/salud`, {}, senalExterna);
  if (!respuesta.ok) {
    throw new ErrorReconocimiento(
      mensajePorEstado(respuesta.status, await leerDetalle(respuesta)),
      'http'
    );
  }
  return respuesta.json();
};

// POST /reconocer (multipart: "video" + "contexto"). Devuelve el JSON de la API.
export const reconocerSena = async (blobVideo, contexto, senalExterna) => {
  const base = urlBase();
  if (!base) {
    throw new ErrorReconocimiento('El reconocedor no está configurado.', 'sin_url');
  }
  const extension = (blobVideo.type || '').includes('mp4') ? 'mp4' : 'webm';
  const datos = new FormData();
  datos.append('video', blobVideo, `sena.${extension}`);
  datos.append('contexto', contexto);

  const respuesta = await fetchConTimeout(
    `${base}/reconocer`,
    { method: 'POST', body: datos },
    senalExterna
  );

  if (!respuesta.ok) {
    throw new ErrorReconocimiento(
      mensajePorEstado(respuesta.status, await leerDetalle(respuesta)),
      'http'
    );
  }

  try {
    return await respuesta.json();
  } catch {
    throw new ErrorReconocimiento('La respuesta del reconocedor no es válida.', 'respuesta');
  }
};
