import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Monitor, Sparkles } from 'lucide-react';
import { usarContextoPreguntas } from '../../context/ContextoPreguntas';

/**
 * ============================================================================
 * COMPONENTE: BarraDesarrollo (Común)
 * ============================================================================
 * Ubicación: src/components/common/BarraDesarrollo.jsx
 * Carpeta en Inglés (components/common), Archivo en Español (BarraDesarrollo.jsx).
 */
export const BarraDesarrollo = () => {
  const ubicacion = useLocation();
  const { setTextoReconocido, setMensajeEstado } = usarContextoPreguntas();

  const senasSimuladas = [
    "Dolor de estómago",
    "Fiebre alta",
    "Tengo hora médica",
    "Retiro de medicamentos",
    "Mareos frecuentes"
  ];

  const simularSena = (texto) => {
    setTextoReconocido(texto);
    setMensajeEstado('Inferencia simulada en tiempo real');
  };

  return (
    <nav 
      aria-label="Barra de desarrollo SeñaText"
      className="bg-slate-900 text-white px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shadow-md z-50 sticky top-0"
    >
      <div className="flex items-center gap-2">
        <span className="bg-sky-500/20 text-sky-300 font-mono text-[10px] px-2 py-0.5 rounded border border-sky-500/30">
          git: main
        </span>
        <span className="text-slate-400 hidden sm:inline">|</span>
        <span className="font-semibold tracking-tight text-slate-200">SeñaText MVP</span>
      </div>

      <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg">
        <Link
          to="/paciente"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
            ubicacion.pathname === '/paciente'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>Vista Paciente (/paciente)</span>
        </Link>

        <Link
          to="/funcionario"
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium ${
            ubicacion.pathname === '/funcionario'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Vista Funcionario (/funcionario)</span>
        </Link>
      </div>

      <div className="hidden lg:flex items-center gap-2">
        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
          <Sparkles className="w-3 h-3 text-amber-400" /> Simular Seña:
        </span>
        <div className="flex gap-1">
          {senasSimuladas.slice(0, 3).map((sena, idx) => (
            <button
              key={idx}
              onClick={() => simularSena(sena)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] px-2 py-0.5 rounded transition-colors"
            >
              {sena}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};
