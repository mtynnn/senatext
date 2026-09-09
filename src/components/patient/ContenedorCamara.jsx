import React, { useRef, useEffect, useState } from 'react';
import { Video, Camera } from 'lucide-react';
import { usarContextoPreguntas } from '../../context/ContextoPreguntas';
import { Holistic, FACEMESH_TESSELATION, HAND_CONNECTIONS, POSE_CONNECTIONS } from '@mediapipe/holistic';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

/**
 * ============================================================================
 * COMPONENTE: ContenedorCamara (Vista Paciente)
 * ============================================================================
 * Ubicación: src/components/patient/ContenedorCamara.jsx
 * Carpeta en Inglés (components/patient), Archivo en Español (ContenedorCamara.jsx).
 * 
 * Preparado arquitectónicamente para inyectar los elementos HTML5 <video> y <canvas>
 * requeridos por MediaPipe JS (Edge Computing).
 */

export const ContenedorCamara = () => {
  const { camaraActiva } = usarContextoPreguntas();
  const referenciaVideo = useRef(null);
  const referenciaLienzo = useRef(null);
  const [camaraLista, setCamaraLista] = useState(false);

  useEffect(() => {
    const videoElement = referenciaVideo.current;
    const canvasElement = referenciaLienzo.current;

    if (!videoElement || !canvasElement) return;

    const canvasCtx = canvasElement.getContext('2d');
    let animationFrameId;

    function onResults(results) {
      canvasCtx.save();
      canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      
      // Dibujar rostro
      if (results.faceLandmarks) {
        drawConnectors(canvasCtx, results.faceLandmarks, FACEMESH_TESSELATION,
                       {color: '#C0C0C070', lineWidth: 1});
      }
      // Dibujar pose
      if (results.poseLandmarks) {
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,
                       {color: '#00FF00', lineWidth: 4});
        drawLandmarks(canvasCtx, results.poseLandmarks,
                      {color: '#FF0000', lineWidth: 2});
      }
      // Dibujar manos
      if (results.leftHandLandmarks) {
        drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS,
                       {color: '#CC0000', lineWidth: 5});
        drawLandmarks(canvasCtx, results.leftHandLandmarks,
                      {color: '#00FF00', lineWidth: 2});
      }
      if (results.rightHandLandmarks) {
        drawConnectors(canvasCtx, results.rightHandLandmarks, HAND_CONNECTIONS,
                       {color: '#00CC00', lineWidth: 5});
        drawLandmarks(canvasCtx, results.rightHandLandmarks,
                      {color: '#FF0000', lineWidth: 2});
      }
      canvasCtx.restore();
    }

    const holistic = new Holistic({locateFile: (file) => {
      return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    }});
    
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

    let procesando = false;
    let lastTime = 0;
    const fpsLimit = 15; // Limitar a 15 FPS para reducir la carga de la CPU
    const frameInterval = 1000 / fpsLimit;

    async function procesarFrame(currentTime) {
      if (!lastTime) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;

      if (deltaTime >= frameInterval) {
        if (videoElement && videoElement.readyState >= 2 && !procesando) {
          procesando = true;
          await holistic.send({image: videoElement});
          procesando = false;
        }
        lastTime = currentTime - (deltaTime % frameInterval);
      }
      animationFrameId = requestAnimationFrame(procesarFrame);
    }

    async function inicializarCamara() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 640 }, 
            height: { ideal: 480 },
            frameRate: { ideal: 30 }
          } 
        });
        
        if (videoElement) {
          videoElement.srcObject = stream;
          videoElement.play();
          
          videoElement.onloadeddata = () => {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;
            setCamaraLista(true);
            animationFrameId = requestAnimationFrame(procesarFrame);
          };
        }
      } catch (error) {
        console.error("Error al iniciar cámara:", error);
      }
    }

    inicializarCamara();

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (videoElement && videoElement.srcObject) {
        videoElement.srcObject.getTracks().forEach(track => track.stop());
      }
      holistic.close();
    };
  }, []);
  return (
    <div className="relative w-full bg-slate-100 border-2 border-slate-300 rounded-lg p-4 md:p-6 flex flex-col items-center justify-center min-h-[320px] sm:min-h-[400px] md:min-h-[460px] overflow-hidden group">
      
      {/* Marcadores visuales de visor de cámara (Fiel al mockup) */}
      <div className="absolute top-6 left-6 w-8 h-8 border-t-4 border-l-4 border-blue-400 pointer-events-none" />
      <div className="absolute top-6 right-6 w-8 h-8 border-t-4 border-r-4 border-blue-400 pointer-events-none" />
      <div className="absolute bottom-6 left-6 w-8 h-8 border-b-4 border-l-4 border-blue-400 pointer-events-none" />
      <div className="absolute bottom-6 right-6 w-8 h-8 border-b-4 border-r-4 border-blue-400 pointer-events-none" />

      {/* Video y Canvas para MediaPipe */}
      <video
        ref={referenciaVideo}
        className="absolute inset-0 w-full h-full object-cover rounded-3xl z-0"
        playsInline
        muted
      />
      <canvas
        ref={referenciaLienzo}
        className="absolute inset-0 w-full h-full pointer-events-none rounded-3xl z-10"
      />

      {/* Placeholder centrado (visible cuando no hay video cargado o se está cargando) */}
      {!camaraLista && (
        <div className="flex flex-col items-center justify-center text-center z-20 px-4 opacity-50 transition-opacity duration-500">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-white/90 border-2 border-slate-300 shadow-sm flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform duration-300">
            <Video className="w-10 h-10 md:w-12 md:h-12 stroke-[1.5]" />
          </div>
        </div>
      )}
    </div>
  );
};
