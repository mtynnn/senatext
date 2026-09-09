import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BarChart3, TrendingUp } from 'lucide-react';

/**
 * ============================================================================
 * COMPONENTE: GraficosMetricas (Vista Admin)
 * ============================================================================
 * Ubicación: src/components/official/GraficosMetricas.jsx
 * Carpeta en Inglés (components/official), Archivo en Español.
 *
 * Dos gráficos sobre las atenciones YA FILTRADAS que recibe por props (mismos
 * filtros que la tabla): atenciones por funcionario y atenciones por mes.
 *
 * Paleta: una sola serie por gráfico → un solo color de acento celeste
 * (cesfam-500 #009fe3); grilla y ejes en gris slate recesivo. Sin azul oscuro.
 */

const ACENTO = '#009fe3'; // cesfam-500
const GRIS_GRILLA = '#e2e8f0'; // slate-200
const GRIS_EJE = '#64748b'; // slate-500

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const InformacionEmergente = ({ active, payload, label, sufijo }) => {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-card px-3 py-2 text-xs">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="text-slate-500 mt-0.5">
        {payload[0].value} {sufijo}
      </p>
    </div>
  );
};

const ContenedorGrafico = ({ icono: Icono, titulo, children }) => (
  <div className="bg-white rounded-lg border border-slate-200 shadow-card p-4 sm:p-5">
    <div className="flex items-center gap-2 mb-4">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-cesfam-50 text-cesfam-600">
        <Icono className="w-4 h-4" />
      </span>
      <h3 className="text-sm font-semibold text-slate-800">{titulo}</h3>
    </div>
    {children}
  </div>
);

export const GraficosMetricas = ({ funcionarios, atenciones }) => {
  // Atenciones por funcionario (respeta los filtros: `atenciones` ya viene filtrado).
  const porFuncionario = funcionarios.map((funcionario) => ({
    nombre: funcionario.nombre.split(' ')[0],
    atenciones: atenciones.filter((a) => a.funcionarioId === funcionario.id).length,
  }));

  // Atenciones por mes (se suman los años presentes en los datos filtrados).
  const porMes = MESES_CORTOS.map((nombreMes, indice) => ({
    mes: nombreMes,
    atenciones: atenciones.filter((a) => Number(a.fecha.slice(5, 7)) === indice + 1).length,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ContenedorGrafico icono={BarChart3} titulo="Atenciones por funcionario">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={porFuncionario} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke={GRIS_GRILLA} vertical={false} />
            <XAxis dataKey="nombre" tick={{ fill: GRIS_EJE, fontSize: 12 }} tickLine={false} axisLine={{ stroke: GRIS_GRILLA }} />
            <YAxis allowDecimals={false} tick={{ fill: GRIS_EJE, fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: 'rgba(0,159,227,0.06)' }} content={<InformacionEmergente sufijo="atenciones" />} />
            <Bar dataKey="atenciones" fill={ACENTO} radius={[4, 4, 0, 0]} maxBarSize={48} />
          </BarChart>
        </ResponsiveContainer>
      </ContenedorGrafico>

      <ContenedorGrafico icono={TrendingUp} titulo="Atenciones por mes">
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={porMes} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
            <CartesianGrid stroke={GRIS_GRILLA} vertical={false} />
            <XAxis dataKey="mes" tick={{ fill: GRIS_EJE, fontSize: 12 }} tickLine={false} axisLine={{ stroke: GRIS_GRILLA }} />
            <YAxis allowDecimals={false} tick={{ fill: GRIS_EJE, fontSize: 12 }} tickLine={false} axisLine={false} />
            <Tooltip content={<InformacionEmergente sufijo="atenciones" />} />
            <Line
              type="monotone"
              dataKey="atenciones"
              stroke={ACENTO}
              strokeWidth={2}
              dot={{ r: 3, fill: ACENTO }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ContenedorGrafico>
    </div>
  );
};
