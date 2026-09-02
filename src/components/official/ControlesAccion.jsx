import React, { useState } from 'react';
import { ArrowRight, Edit3, CheckCircle2 } from 'lucide-react';
import { usarContextoPreguntas } from '../../context/ContextoPreguntas';

/**
 * ============================================================================
 * COMPONENTE: ControlesAccion (Vista Funcionario)
 * ============================================================================
 * Ubicación: src/components/official/ControlesAccion.jsx
 * Carpeta en Inglés (components/official), Archivo en Español (ControlesAccion.jsx).
 */
export const ControlesAccion = () => {
  const { textoReconocido, setTextoReconocido, setMensajeEstado } = usarContextoPreguntas();
  const [estaEditando, setEstaEditando] = useState(false);
  const [textoManual, setTextoManual] = useState('');
  const [notificacion, setNotificacion] = useState(null);

  const manejarEdicion = () => {
    setTextoManual(textoReconocido);
    setEstaEditando(true);
  };

  const guardarEdicion = (evento) => {
    evento.preventDefault();
    if (textoManual.trim()) {
      setTextoReconocido(textoManual.trim());
      setMensajeEstado('Texto corregido manualmente por el funcionario');
      setEstaEditando(false);
    }
  };

  const registrarSintoma = () => {
    setNotificacion(`Síntoma "${textoReconocido}" registrado en la ficha médica.`);
    setMensajeEstado('Síntoma registrado con éxito. Esperando nueva seña.');
    setTimeout(() => {
      setNotificacion(null);
    }, 3500);
  };

  return (
    <div className="flex flex-col items-end gap-3 pt-6 border-t border-slate-100">
      {notificacion && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notificacion}</span>
        </div>
      )}

      {estaEditando ? (
        <form onSubmit={guardarEdicion} className="flex items-center gap-2 w-full max-w-md">
          <input
            type="text"
            value={textoManual}
            onChange={(e) => setTextoManual(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-sky-400 focus:ring-2 focus:ring-sky-500 outline-none"
            placeholder="Escriba la corrección..."
            autoFocus
          />
          <button
            type="submit"
            className="bg-sky-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setEstaEditando(false)}
            className="bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Cancelar
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={manejarEdicion}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-all flex items-center gap-2 shadow-2xs active:scale-98"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Corregir</span>
          </button>

          <button
            onClick={registrarSintoma}
            className="px-5 py-2.5 rounded-xl bg-cesfam-900 hover:bg-cesfam-950 text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 group active:scale-98"
          >
            <span>Registrar síntoma</span>
            <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}
    </div>
  );
};
