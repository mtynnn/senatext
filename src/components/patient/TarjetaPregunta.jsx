import React from 'react';
import { Hand } from 'lucide-react';
import { usarContextoPreguntas } from '../../context/ContextoPreguntas';

/**
 * ============================================================================
 * COMPONENTE: TarjetaPregunta (Vista Paciente)
 * ============================================================================
 * Ubicación: src/components/patient/TarjetaPregunta.jsx
 * Carpeta en Inglés (components/patient), Archivo en Español (TarjetaPregunta.jsx).
 */
export const TarjetaPregunta = () => {
  const { preguntaActiva } = usarContextoPreguntas();

  return (
    <div className="w-full bg-white rounded-lg border border-slate-300 shadow-md p-6 sm:p-8 md:p-10 text-center transition-all duration-300">
      <span className="text-xs md:text-sm font-bold tracking-widest text-blue-700 uppercase block mb-3">
        PREGUNTA ACTUAL
      </span>

      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-snug my-2">
        {preguntaActiva || "¿A qué viene hoy?"}
      </h1>

      <div className="flex items-center justify-center gap-2 text-slate-600 text-xs sm:text-sm md:text-base font-medium mt-6 pt-5 border-t border-slate-200">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded bg-blue-100 text-blue-700">
          <Hand className="w-4 h-4" />
        </span>
        <span>Responda con la seña correspondiente</span>
      </div>
    </div>
  );
};
