import React from 'react';
import { Clock } from 'lucide-react';
import { usarContextoPreguntas } from '../../context/ContextoPreguntas';

/**
 * ============================================================================
 * COMPONENTE: VisualizadorTraduccion (Vista Funcionario)
 * ============================================================================
 * Ubicación: src/components/official/VisualizadorTraduccion.jsx
 * Carpeta en Inglés (components/official), Archivo en Español (VisualizadorTraduccion.jsx).
 */
export const VisualizadorTraduccion = () => {
  const { textoReconocido, mensajeEstado } = usarContextoPreguntas();

  return (
    <div className="flex-1 flex flex-col justify-between space-y-6">
      <div className="space-y-6">
        <div className="flex items-center">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200/80 px-3.5 py-1.5 rounded-full text-rose-600 text-xs font-bold tracking-wider shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <span>TEXTO RECONOCIDO</span>
          </div>
        </div>

        <div className="py-6 min-h-[140px] flex flex-col justify-center">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-none">
            {textoReconocido || "Esperando seña..."}
          </h2>

          <p className="text-slate-500 text-sm sm:text-base font-normal mt-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{mensajeEstado || "Esperando más información del paciente..."}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
