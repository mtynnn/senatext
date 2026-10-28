import React, { useRef, useEffect, useState } from 'react';
import { Video, VideoOff, Camera, Loader2, AlertCircle } from 'lucide-react';
import { usarContextoPreguntas } from '../../context/ContextoPreguntas';
import { reconocerSena, modoSimulado } from '../../services/reconocimientoSenas';
import {
  DURACION_GRABACION_S,
  PREPARACION_S,
  UMBRAL_CONFIANZA_BAJA,
  CONTEXTOS_RECONOCIMIENTO,
} from '../../constants/contextosReconocimiento';

// WebM sirve: el servidor convierte con ffmpeg. Se usa el primer tipo que soporte el navegador.
const MIME_TYPES_GRABACION = ['video/webm;codecs=vp9', 'video/webm', 'video/mp4'];
const elegirMimeType = () => MIME_TYPES_GRABACION.find((t) => MediaRecorder.isTypeSupported(t)) || '';
import { Holistic, FACEMESH_TESSELATION, HAND_CONNECTIONS, POSE_CONNECTIONS } from '@mediapipe/holistic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export const ContenedorCamara = () => {
  const {
    camaraActiva, setCamaraActiva,
    actualizarTraduccion, setMensajeEstado, setResultadoReconocimiento,
  } = usarContextoPreguntas();
  const referenciaVideo = useRef(null);
  const referenciaLienzo = useRef(null);
  const [camaraLista, setCamaraLista] = useState(false);

  // --- Reconocimiento real: grabación del clip y envío a la API ---
  const simulado = modoSimulado();
  // La grabación la solicita el funcionario por BroadcastChannel (SOLICITAR_GRABACION).
  // Estados locales al paciente: inactivo | preparando | grabando | procesando | resultado | error
  const canalRef = useRef(null);
  const solicitarGrabacionRef = useRef(null);
  const [estadoReconocimiento, setEstadoReconocimiento] = useState('inactivo');
  const [segundosRestantes, setSegundosRestantes] = useState(DURACION_GRABACION_S);
  const [resultado, setResultado] = useState(null);
  const [mensajeError, setMensajeError] = useState('');
  const grabadorRef = useRef(null);
  const trozosRef = useRef([]);
  const temporizadorRef = useRef(null);
  const intervaloRef = useRef(null);
  const abortRef = useRef(null);
  const enCursoRef = useRef(false); // evita envíos dobles
  const canceladaRef = useRef(false);
  const montadoRef = useRef(true);

  const limpiarTemporizadores = () => {
    clearTimeout(temporizadorRef.current);
    clearInterval(intervaloRef.current);
  };

  // Cambia el estado local y avisa al funcionario (SYNC_FASE_GRABACION) para deshabilitar su botón.
  const cambiarFase = (fase) => {
    setEstadoReconocimiento(fase);
    const enCurso = fase === 'preparando' || fase === 'grabando' || fase === 'procesando';
    canalRef.current?.postMessage({ type: 'SYNC_FASE_GRABACION', payload: enCurso ? fase : 'inactivo' });
  };

  const fallar = (mensaje) => {
    enCursoRef.current = false;
    if (!montadoRef.current) return;
    setMensajeError(mensaje);
    cambiarFase('error');
    setMensajeEstado(mensaje);
  };

  const enviarClip = async (blob, contexto) => {
    if (blob.size === 0) {
      fallar('No se grabó video. Intente nuevamente.');
      return;
    }
    cambiarFase('procesando');
    setMensajeEstado('Procesando seña...');
    abortRef.current = new AbortController();
    try {
      const respuesta = await reconocerSena(blob, contexto, abortRef.current.signal);
      if (!montadoRef.current) return;
      // Confianza = margen_relativo entre la mejor y la segunda opción (0 a 1).
      // NO es una precisión calibrada. Se muestra como porcentaje solo de forma orientativa.
      const margen = Number(respuesta.margen_relativo);
      const confianza = Number.isFinite(margen) ? margen : null;
      const alternativa = respuesta.segunda_opcion || null;
      setResultado({ texto: respuesta.prediccion, confianza, alternativa });
      actualizarTraduccion(respuesta.prediccion, 'Seña reconocida');
      setResultadoReconocimiento({ confianza, alternativa });
      enCursoRef.current = false;
      cambiarFase('resultado');
    } catch (error) {
      if (error?.codigo === 'cancelado') return;
      fallar(error?.message || 'Ocurrió un error inesperado al reconocer la seña.');
    }
  };

  // Grabación del clip (tras la cuenta de preparación); al detenerse se envía a la API.
  const grabar = (contexto) => {
    const stream = referenciaVideo.current?.srcObject;
    if (!stream) {
      fallar('No hay cámara disponible para grabar. Intente nuevamente.');
      return;
    }
    trozosRef.current = [];

    let grabador;
    try {
      const mimeType = elegirMimeType();
      grabador = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    } catch {
      fallar('Este navegador no permite grabar video. Pruebe con Chrome o Edge actualizado.');
      return;
    }

    grabador.ondataavailable = (evento) => {
      if (evento.data && evento.data.size > 0) trozosRef.current.push(evento.data);
    };
    grabador.onerror = () => {
      limpiarTemporizadores();
      fallar('Ocurrió un error durante la grabación. Intente nuevamente.');
    };
    grabador.onstop = () => {
      limpiarTemporizadores();
      if (canceladaRef.current || !montadoRef.current) {
        enCursoRef.current = false;
        return;
      }
      const blob = new Blob(trozosRef.current, { type: grabador.mimeType || 'video/webm' });
      trozosRef.current = [];
      enviarClip(blob, contexto);
    };

    grabadorRef.current = grabador;
    setSegundosRestantes(DURACION_GRABACION_S);
    cambiarFase('grabando');
    setMensajeEstado('Grabando la seña del paciente...');

    grabador.start();
    const finGrabacion = Date.now() + DURACION_GRABACION_S * 1000;
    intervaloRef.current = setInterval(() => {
      setSegundosRestantes(Math.max(0, Math.ceil((finGrabacion - Date.now()) / 1000)));
    }, 200);
    temporizadorRef.current = setTimeout(() => {
      if (grabador.state === 'recording') grabador.stop();
    }, DURACION_GRABACION_S * 1000);
  };

  // Atiende SOLICITAR_GRABACION del funcionario: ACK inmediato, cuenta de preparación y grabación.
  const solicitarGrabacion = (contexto) => {
    if (enCursoRef.current) return; // ignora solicitudes si ya hay una en curso (sin envíos dobles)
    if (simulado || !CONTEXTOS_RECONOCIMIENTO[contexto]) return;
    if (!camaraActiva || !camaraLista || !referenciaVideo.current?.srcObject) return; // sin ACK
    enCursoRef.current = true;
    canceladaRef.current = false;
    canalRef.current?.postMessage({ type: 'ACK_GRABACION' });

    setResultado(null);
    setResultadoReconocimiento({ confianza: null, alternativa: null });
    setMensajeError('');
    let restantes = PREPARACION_S;
    setSegundosRestantes(restantes);
    cambiarFase('preparando');
    setMensajeEstado(`Prepare al paciente: la grabación comienza en ${PREPARACION_S} s`);
    intervaloRef.current = setInterval(() => {
      restantes -= 1;
      if (restantes > 0) {
        setSegundosRestantes(restantes);
        return;
      }
      clearInterval(intervaloRef.current);
      if (canceladaRef.current || !montadoRef.current) return;
      grabar(contexto);
    }, 1000);
  };
  solicitarGrabacionRef.current = solicitarGrabacion;

  // Canal con el funcionario: recibe SOLICITAR_GRABACION y publica ACK / fase.
  useEffect(() => {
    const canal = new BroadcastChannel('senatext_sync_channel');
    canalRef.current = canal;
    canal.onmessage = (evento) => {
      if (evento.data?.type === 'SOLICITAR_GRABACION') {
        solicitarGrabacionRef.current?.(evento.data.payload?.contexto);
      }
    };
    return () => {
      canal.postMessage({ type: 'SYNC_FASE_GRABACION', payload: 'inactivo' });
      canal.close();
      canalRef.current = null;
    };
  }, []);

  // Al salir de la vista: cancela grabación y petición en curso (la cámara la libera el efecto de MediaPipe).
  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
      canceladaRef.current = true;
      limpiarTemporizadores();
      abortRef.current?.abort();
      if (grabadorRef.current?.state === 'recording') grabadorRef.current.stop();
    };
  }, []);

  // Si el funcionario apaga la cámara en plena preparación o grabación, se descarta el clip.
  useEffect(() => {
    const grabando = grabadorRef.current?.state === 'recording';
    if (!camaraActiva && (grabando || estadoReconocimiento === 'preparando')) {
      canceladaRef.current = true;
      limpiarTemporizadores();
      if (grabando) grabadorRef.current.stop();
      enCursoRef.current = false;
      cambiarFase('inactivo');
      setMensajeEstado('Cámara apagada. Grabación cancelada.');
    }
  }, [camaraActiva]);

  const confianzaBaja = resultado && resultado.confianza !== null
    && resultado.confianza < UMBRAL_CONFIANZA_BAJA;

  useEffect(() => {
    const videoElement = referenciaVideo.current;
    const canvasElement = referenciaLienzo.current;

    if (!videoElement || !canvasElement) return;

    if (!camaraActiva) {
      if (videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
        videoElement.srcObject = null;
      }
      setCamaraLista(false);
      return;
    }

    const canvasCtx = canvasElement.getContext('2d');
    let timeoutId;

    function onResults(results) {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

      // Renderizado de landmarks de MediaPipe
      if (results.faceLandmarks) {
        drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION, { color: '#C0C0C070', lineWidth: 1 });
      }
      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 4 });
        drawLandmarks(canvasCtx, results.poseLandmarks, { color: '#FF0000', lineWidth: 2 });
      }
      if (results.leftHandLandmarks) {
        drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, { color: '#CC0000', lineWidth: 5 });
        drawLandmarks(canvasCtx, results.leftHandLandmarks, { color: '#00FF00', lineWidth: 2 });
      }
      if (results.rightHandLandmarks) {
        drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS, { color: '#00CC00', lineWidth: 5 });
        drawLandmarks(canvasCtx, results.rightHandLandmarks, { color: '#FF0000', lineWidth: 2 });
      }
      canvasCtx.restore();
    }

    const holistic = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      }
    });

    holistic.setOptions({
      modelComplexity: 0,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      refineFaceLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    holistic.onResults(onResults);

    // Bucle asÃ­ncrono para anÃ¡lisis de frames con MediaPipe (~10 FPS)
    async function procesarFrame() {
      if (!camaraActiva) return;
      if (videoElement && videoElement.readyState >= 2) {
        await holistic.send({ image: videoElement });
      }
      timeoutId = setTimeout(procesarFrame, 100);
    }

    async function inicializarCamara() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 }
          }
        });

        if (videoElement && camaraActiva) {
          videoElement.srcObject = stream;
          videoElement.play();

          videoElement.onloadeddata = () => {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            setCamaraLista(true);
            procesarFrame();
          };
        }
      } catch (error) {
        console.error("Error al iniciar cÃ¡mara:", error);
      }
    }

    inicializarCamara();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
      }
      holistic.close();
    };
  }, [camaraActiva]);

  return (
    <>
    <div className="relative w-full aspect-video bg-slate-100 border-2 border-slate-300 rounded-2xl p-2 flex flex-col items-center justify-center overflow-hidden group mx-auto">

      {/* Marcadores visuales de visor de cÃ¡mara (Fiel al mockup) */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-blue-400 pointer-events-none" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-blue-400 pointer-events-none" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-blue-400 pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-blue-400 pointer-events-none" />

      {/* Video y Canvas para MediaPipe */}
      <video
        ref={referenciaVideo}
        className={`absolute inset-0 w-full h-full object-contain rounded-3xl z-0 ${(!camaraActiva || !camaraLista) ? 'hidden' : ''}`}
        playsInline
        muted
      />
      <canvas
        ref={referenciaLienzo}
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none rounded-3xl z-10 ${(!camaraActiva || !camaraLista) ? 'hidden' : ''}`}
      />

      {/* Mensajes de estado (Apagada o Cargando) */}
      {!camaraActiva ? (
        <div className="flex flex-col items-center justify-center text-center z-20 px-4 transition-opacity duration-500">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-slate-200 border-2 border-slate-300 shadow-sm flex items-center justify-center text-slate-400 mb-4">
            <Camera className="w-10 h-10 md:w-12 md:h-12 stroke-[1.5]" />
          </div>
          <span className="text-slate-500 font-semibold text-lg">La cámara está apagada</span>
          <span className="text-slate-400 text-sm mt-1">Enciende la cámara para comenzar la traducción</span>
        </div>
      ) : !camaraLista && (
        <div className="flex flex-col items-center justify-center text-center z-20 px-4 opacity-75 transition-opacity duration-500 animate-pulse">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-white/90 border-2 border-slate-300 shadow-sm flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform duration-300 mb-4">
            <Video className="w-10 h-10 md:w-12 md:h-12 stroke-[1.5]" />
          </div>
          <span className="text-blue-500 font-semibold">Iniciando cámara y modelo de IA...</span>
        </div>
      )}
    </div>

    {/* Panel de reconocimiento real (no se muestra en modo simulado) */}
    {/* La grabación la inicia el funcionario; aquí solo se ven la cuenta, el procesamiento y el resultado. */}
    {!simulado && estadoReconocimiento !== 'inactivo' && (
      <div className="w-full mt-3 bg-white border border-slate-300 rounded-xl shadow-sm p-4 flex flex-col items-center gap-3 text-center">
        {estadoReconocimiento === 'preparando' && (
          <div className="flex flex-col items-center gap-1 text-cesfam-800">
            <span className="text-lg font-bold">Prepárate</span>
            <span className="text-5xl font-extrabold text-cesfam-500">{segundosRestantes}</span>
            <span className="text-sm text-slate-500">La grabación empieza en unos segundos</span>
          </div>
        )}

        {estadoReconocimiento === 'grabando' && (
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 px-4 py-1.5 rounded-full text-rose-600 text-sm font-bold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
            <span>Grabando... {segundosRestantes} s</span>
          </div>
        )}

        {estadoReconocimiento === 'procesando' && (
          <div className="inline-flex items-center gap-2 text-cesfam-700 text-sm font-semibold">
            <Loader2 className="w-4 h-4 animate-spin text-cesfam-500" />
            <span>Procesando seña, puede tardar hasta 20 segundos</span>
          </div>
        )}

        {estadoReconocimiento === 'error' && (
          <div className="w-full bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium px-4 py-2.5 rounded-xl flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{mensajeError}</span>
          </div>
        )}

        {estadoReconocimiento === 'resultado' && resultado && (
          <div className="w-full bg-cesfam-50 border border-cesfam-200 rounded-xl px-4 py-3">
            <p className="text-xl sm:text-2xl font-semibold text-slate-900">{resultado.texto}</p>
            {resultado.confianza !== null && (
              <p className="text-sm text-cesfam-800 mt-1">
                Confianza: {Math.round(resultado.confianza * 100)}%
              </p>
            )}
            {resultado.alternativa && (
              <p className="text-xs text-slate-500 mt-0.5">Alternativa: {resultado.alternativa}</p>
            )}
            {confianzaBaja && (
              <p className="text-xs font-semibold text-amber-700 mt-2 inline-flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Confianza baja, conviene repetir la seña
              </p>
            )}
          </div>
        )}
      </div>
    )}
    </>
  );
};

