import React from 'react';
import { Building2, Info, Settings, User } from 'lucide-react';

/**
 * ============================================================================
 * COMPONENTE: EncabezadoSuperior (Vista Funcionario)
 * ============================================================================
 * Ubicación: src/components/official/EncabezadoSuperior.jsx
 * Carpeta en Inglés (components/official), Archivo en Español (EncabezadoSuperior.jsx).
 */
export const EncabezadoSuperior = () => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between shadow-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-white text-sm sm:text-base tracking-wide">
            CESFAM
          </h1>
          <span className="text-slate-500 font-light">|</span>
          <span className="text-slate-300 text-xs sm:text-sm font-medium">
            Módulo de atención
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <button 
          title="Información y ayuda" 
          aria-label="Información y ayuda"
          className="p-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Info className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button 
          title="Configuración del módulo" 
          aria-label="Configuración del módulo"
          className="p-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="h-4 w-px bg-slate-700 my-auto mx-1" />

        <button 
          className="flex items-center gap-2 p-1.5 pl-2 rounded text-slate-300 hover:bg-slate-800 transition-colors"
          title="Perfil de funcionario"
        >
          <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
            <User className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline text-xs font-medium text-slate-200">
            D. Robert (Somatometría)
          </span>
        </button>
      </div>
    </header>
  );
};
