import React, { useRef, useEffect, useState } from 'react';
import { Video, VideoOff, Camera } from 'lucide-react';
import { usarContextoPreguntas } from '../../context/ContextoPreguntas';
import { Holistic, FACEMESH_TESSELATION, HAND_CONNECTIONS, POSE_CONNECTIONS } from '@mediapipe/holistic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

export const ContenedorCamara = () => {
  const { camaraActiva, setCamaraActiva } = usarContextoPreguntas();
  const referenciaVideo = useRef(null);
  const referenciaLienzo = useRef(null);
  const [camaraLista, setCamaraLista] = useState(false);

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
  );
};

