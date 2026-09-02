import React, { useRef, useEffect } from 'react';
import { Video, Camera } from 'lucide-react';
import { usarContextoPreguntas } from '../../context/ContextoPreguntas';

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

  /*
  useEffect(() => {
    // Inferencia Edge Computing con MediaPipe JS
    async function inicializarCamara() {
      try {
        const flujoVideo = await navigator.mediaDevices.getUserMedia({ video: true });
        if (referenciaVideo.current) {
          referenciaVideo.current.srcObject = flujoVideo;
          referenciaVideo.current.play();
        }
      } catch (error) {
        console.error("Error al acceder a la cámara:", error);
      }
    }
    inicializarCamara();
  }, []);
  */

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
        className="hidden absolute inset-0 w-full h-full object-cover rounded-3xl"
        playsInline
        muted
      />
      <canvas
        ref={referenciaLienzo}
        className="hidden absolute inset-0 w-full h-full pointer-events-none rounded-3xl"
      />

      {/* Placeholder centrado */}
      <div className="flex flex-col items-center justify-center text-center z-10 px-4">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-lg bg-white/90 border-2 border-slate-300 shadow-sm flex items-center justify-center text-blue-500 group-hover:scale-105 transition-transform duration-300">
          <Video className="w-10 h-10 md:w-12 md:h-12 stroke-[1.5]" />
        </div>
      </div>
    </div>
  );
};
