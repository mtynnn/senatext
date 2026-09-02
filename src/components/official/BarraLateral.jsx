import React, { useState } from 'react';
import { MessageSquare, Plus, ChevronRight, Check } from 'lucide-react';
import { usarContextoPreguntas } from '../../context/ContextoPreguntas';

/**
 * ============================================================================
 * COMPONENTE: BarraLateral (Vista Funcionario)
 * ============================================================================
 * Ubicación: src/components/official/BarraLateral.jsx
 * Carpeta en Inglés (components/official), Archivo en Español (BarraLateral.jsx).
 */
export const BarraLateral = () => {
  const { preguntaActiva, setPreguntaActiva, preguntas, agregarPreguntaLibre } = usarContextoPreguntas();
  const [estaAbiertaEntrada, setEstaAbiertaEntrada] = useState(false);
  const [textoPreguntaLibre, setTextoPreguntaLibre] = useState('');

  const manejarEnvioPreguntaLibre = (evento) => {
    evento.preventDefault();
    if (textoPreguntaLibre.trim()) {
      agregarPreguntaLibre(textoPreguntaLibre);
      setTextoPreguntaLibre('');
      setEstaAbiertaEntrada(false);
    }
  };

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

      <div className="pt-4 border-t border-slate-100 mt-4">
        {estaAbiertaEntrada ? (
          <form onSubmit={manejarEnvioPreguntaLibre} className="space-y-2">
            <input
              type="text"
              value={textoPreguntaLibre}
              onChange={(e) => setTextoPreguntaLibre(e.target.value)}
              placeholder="Ej: ¿Tiene alergia a algún medicamento?"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Guardar
              </button>
              <button
                type="button"
                onClick={() => setEstaAbiertaEntrada(false)}
                className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium py-2 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setEstaAbiertaEntrada(true)}
            className="w-full border border-blue-200 hover:border-blue-400 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-medium text-sm py-2.5 px-4 rounded-md transition-all flex items-center justify-center gap-2 group shadow-sm"
          >
            <Plus className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>+ Escribir pregunta libre</span>
          </button>
        )}
      </div>
    </aside>
  );
};
