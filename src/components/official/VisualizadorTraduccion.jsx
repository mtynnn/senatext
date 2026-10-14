import React from 'react';
import { Clock } from 'lucide-react';
import { usarContextoPreguntas } from '../../context/ContextoPreguntas';
import { UMBRAL_CONFIANZA_BAJA } from '../../constants/contextosReconocimiento';

/**
 * ============================================================================
 * COMPONENTE: VisualizadorTraduccion (Vista Funcionario)
 * ============================================================================
 * Ubicaci贸n: src/components/official/VisualizadorTraduccion.jsx
 * Carpeta en Ingl茅s (components/official), Archivo en Espa帽ol (VisualizadorTraduccion.jsx).
 */
export const VisualizadorTraduccion = () => {
  const { textoReconocido, mensajeEstado, confianza, alternativa } = usarContextoPreguntas();

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

        <div className="mt-4 p-6 md:p-8 bg-slate-50 border-2 border-slate-200 rounded-2xl min-h-[200px] sm:min-h-[250px] shadow-inner flex flex-col justify-start overflow-y-auto">
          <p className="text-2xl sm:text-3xl md:text-4xl font-medium text-slate-800 leading-relaxed break-words">
            {textoReconocido || "Esperando se馻..."}
          </p>

          {/* Confianza = margen relativo entre la mejor y la segunda opci贸n, NO una precisi贸n calibrada. */}
          {confianza !== null && confianza !== undefined && (
            <div className="mt-3 space-y-1">
              <p className="text-sm font-semibold text-cesfam-800">
                Confianza: {Math.round(confianza * 100)}%
              </p>
              {alternativa && (
                <p className="text-xs text-slate-500">Alternativa: {alternativa}</p>
              )}
              {/* UMBRAL_CONFIANZA_BAJA es provisional (sin calibrar). */}
              {confianza < UMBRAL_CONFIANZA_BAJA && (
                <p className="text-xs font-semibold text-amber-700">
                  Confianza baja, conviene repetir la se帽a
                </p>
              )}
            </div>
          )}

          <p className="text-slate-500 text-sm sm:text-base font-normal mt-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{mensajeEstado || "Esperando m谩s informaci贸n del paciente..."}</span>
          </p>
        </div>
      </div>
    </div>
  );
};


