import React from 'react';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { usarContextoPreguntas } from '../../context/ContextoPreguntas';

/**
 * ============================================================================
 * COMPONENTE: BarraLateral (Vista Funcionario)
 * ============================================================================
 * Ubicación: src/components/official/BarraLateral.jsx
 * Carpeta en Inglés (components/official), Archivo en Español (BarraLateral.jsx).
 */
export const BarraLateral = () => {
  const { preguntaActiva, setPreguntaActiva, preguntas } = usarContextoPreguntas();

  return (
    <aside className="w-full md:w-80 bg-white border-r border-slate-200/80 p-4 md:p-5 flex flex-col justify-between shrink-0">
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
          <MessageSquare className="w-5 h-5 text-blue-700" />
          <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
            Preguntas preparadas
          </h2>
        </div>

        <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
          {preguntas.map((pregunta, indice) => {
            const estaActiva = preguntaActiva === pregunta;
            
            return (
              <button
                key={indice}
                onClick={() => setPreguntaActiva(pregunta)}
                className={`w-full text-left px-4 py-2.5 rounded-md text-sm transition-all duration-200 flex items-center justify-between group ${
                  estaActiva
                    ? 'bg-blue-700 text-white shadow-sm font-semibold'
                    : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 font-medium'
                }`}
              >
                <span className="line-clamp-2 pr-2">{pregunta}</span>
                <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${
                  estaActiva ? 'text-white translate-x-0.5' : 'text-sky-400 group-hover:translate-x-0.5'
                }`} />
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
