import React from 'react';
import { Search, X, ChevronDown } from 'lucide-react';
import {
  TIPOS_CONSULTA,
  TIPOS_ATENCION,
  ANIOS_DISPONIBLES,
} from '../../context/ContextoCuentas';

/**
 * ============================================================================
 * COMPONENTE: FiltrosFuncionarios (Vista Admin)
 * ============================================================================
 * Ubicación: src/components/official/FiltrosFuncionarios.jsx
 * Carpeta en Inglés (components/official), Archivo en Español.
 *
 * Barra de filtros compacta (una sola fila, flex-wrap) para la tabla y los
 * gráficos. Se combinan con AND. Componente controlado: recibe `valores` y
 * `onCambio`. Sin labels visibles: el texto va dentro de cada control.
 */

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const FILTROS_INICIALES = {
  nombre: '',
  tipoConsulta: '',
  mes: '',
  anio: '',
  tipoAtencion: '',
};

/** Select con estilo pill (fondo suave, redondeado, acento celeste al enfocar). */
const SelectPill = ({ valor, onChange, etiqueta, children }) => (
  <div className="relative">
    <select
      value={valor}
      onChange={onChange}
      aria-label={etiqueta}
      className="appearance-none rounded-full border border-cesfam-200 bg-cesfam-50 text-slate-700 text-sm pl-4 pr-9 py-2 hover:border-cesfam-300 focus:outline-none focus:ring-2 focus:ring-cesfam-500 focus:border-cesfam-500 transition-colors cursor-pointer"
    >
      {children}
    </select>
    <ChevronDown className="w-4 h-4 text-cesfam-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
  </div>
);

export const FiltrosFuncionarios = ({ valores, onCambio, onLimpiar }) => {
  const actualizar = (campo) => (evento) =>
    onCambio({ ...valores, [campo]: evento.target.value });

  const hayFiltrosActivos = Object.values(valores).some((v) => v !== '');

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="relative">
        <Search className="w-4 h-4 text-cesfam-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={valores.nombre}
          onChange={actualizar('nombre')}
          placeholder="Buscar funcionario"
          aria-label="Buscar funcionario por nombre"
          className="w-56 rounded-full border border-cesfam-200 bg-cesfam-50 text-slate-700 text-sm pl-10 pr-4 py-2 hover:border-cesfam-300 focus:outline-none focus:ring-2 focus:ring-cesfam-500 focus:border-cesfam-500 transition-colors placeholder:text-slate-500"
        />
      </div>

      <SelectPill valor={valores.tipoConsulta} onChange={actualizar('tipoConsulta')} etiqueta="Filtrar por tipo de consulta del paciente">
        <option value="">Todas las consultas</option>
        {TIPOS_CONSULTA.map((consulta) => (
          <option key={consulta} value={consulta}>{consulta}</option>
        ))}
      </SelectPill>

      <SelectPill valor={valores.mes} onChange={actualizar('mes')} etiqueta="Filtrar por mes">
        <option value="">Mes</option>
        {MESES.map((nombreMes, indice) => (
          <option key={nombreMes} value={String(indice + 1)}>{nombreMes}</option>
        ))}
      </SelectPill>

      <SelectPill valor={valores.anio} onChange={actualizar('anio')} etiqueta="Filtrar por año">
        <option value="">Año</option>
        {ANIOS_DISPONIBLES.map((anio) => (
          <option key={anio} value={String(anio)}>{anio}</option>
        ))}
      </SelectPill>

      <SelectPill valor={valores.tipoAtencion} onChange={actualizar('tipoAtencion')} etiqueta="Filtrar por tipo de atención">
        <option value="">Tipo de atención</option>
        {TIPOS_ATENCION.map((tipo) => (
          <option key={tipo} value={tipo}>{tipo}</option>
        ))}
      </SelectPill>

      {hayFiltrosActivos && (
        <button
          type="button"
          onClick={onLimpiar}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-cesfam-600 hover:text-cesfam-700 transition-colors px-2 py-2"
        >
          <X className="w-3.5 h-3.5" />
          Limpiar
        </button>
      )}
    </div>
  );
};
