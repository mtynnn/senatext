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
    <div className="w-full bg-white rounded-xl border border-slate-300 shadow-sm p-3 sm:p-4 text-center transition-all duration-300">
      <span className="text-[10px] sm:text-xs font-bold tracking-widest text-blue-700 uppercase block mb-1">
        PREGUNTA ACTUAL
      </span>

      <h1 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug my-1">
        {preguntaActiva || "¿A qué viene hoy?"}
      </h1>

      <div className="flex items-center justify-center gap-1.5 text-slate-600 text-xs font-medium mt-2 pt-2 border-t border-slate-200">
        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-100 text-blue-700">
          <Hand className="w-3.5 h-3.5" />
        </span>
        <span>Responda con la seña correspondiente</span>
      </div>
    </div>
  );
};
