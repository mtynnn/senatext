import React from 'react';

/**
 * ============================================================================
 * COMPONENTE: PiePagina (Común)
 * ============================================================================
 * Ubicación: src/components/common/PiePagina.jsx
 * Carpeta en Inglés (components/common), Archivo en Español (PiePagina.jsx).
 */
export const PiePagina = () => {
  return (
    <footer className="w-full border-t border-slate-200/80 bg-white py-3 px-4 sm:px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto z-10">
      <div>
        <p>© 2026 CESFAM - Sistema de Salud Pública de Chile</p>
      </div>

      <nav aria-label="Enlaces legales y de contacto">
        <ul className="flex items-center gap-4 sm:gap-6 font-medium">
          <li>
            <a href="#privacidad" className="hover:text-sky-600 transition-colors">
              Privacidad
            </a>
          </li>
          <li>
            <a href="#accesibilidad" className="hover:text-sky-600 transition-colors">
              Accesibilidad
            </a>
          </li>
          <li>
            <a href="#contacto" className="hover:text-sky-600 transition-colors">
              Contacto
            </a>
          </li>
        </ul>
      </nav>
    </footer>
  );
};
