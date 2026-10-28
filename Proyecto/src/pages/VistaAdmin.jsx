import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users, Activity, BarChart3, UserPlus, Send, UserX, CheckCircle2 } from 'lucide-react';
import { EncabezadoSuperior } from '../components/official/EncabezadoSuperior';
import { FormularioNuevaCuenta } from '../components/official/FormularioNuevaCuenta';
import { FiltrosFuncionarios, FILTROS_INICIALES } from '../components/official/FiltrosFuncionarios';
import { GraficosMetricas } from '../components/official/GraficosMetricas';
import { PiePagina } from '../components/common/PiePagina';
import { usarContextoCuentas } from '../context/ContextoCuentas';

/**
 * ============================================================================
 * VISTA: VistaAdmin (Panel de Administración)
 * ============================================================================
 * Ubicación: src/pages/VistaAdmin.jsx
 * Ruta: /admin
 *
 * Sección superior: cards de métricas.
 * Sección media: filtros (AND) + gráficos que responden a esos mismos filtros.
 * Sección inferior: botón "Crear cuenta" (modal) y tabla de funcionarios con
 * acciones por fila (enviar correo, revocar cuenta).
 *
 * Estilo: acento celeste (cesfam-500 / sky-*), fondos blancos/slate-50, bordes
 * slate-200, sombras shadow-card — consistente con VistaFuncionario. Sin protección
 * de acceso todavía: el sistema aún no tiene autenticación real.
 */

const TarjetaMetrica = ({ icono: Icono, etiqueta, valor }) => (
  <div className="bg-white rounded-lg border border-slate-200 shadow-card p-4">
    <div className="flex items-center gap-2 text-cesfam-600">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-cesfam-50">
        <Icono className="w-4 h-4" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{etiqueta}</p>
    </div>
    <p className="text-2xl font-extrabold mt-2 text-slate-900">{valor}</p>
  </div>
);

export const VistaAdmin = () => {
  const { cuentas, atenciones, enviarCorreo, revocarCuenta } = usarContextoCuentas();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [confirmacion, setConfirmacion] = useState(null);
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);

  // Funcionarios que pasan el filtro por nombre (coincidencia parcial, sin acentos-sensible).
  const funcionariosFiltrados = useMemo(() => {
    const termino = filtros.nombre.trim().toLowerCase();
    if (!termino) return cuentas;
    return cuentas.filter((c) => c.nombre.toLowerCase().includes(termino));
  }, [cuentas, filtros.nombre]);

  // Atenciones que pasan TODOS los filtros (AND). Alimenta tabla y gráficos.
  const atencionesFiltradas = useMemo(() => {
    const idsVisibles = new Set(funcionariosFiltrados.map((c) => c.id));
    return atenciones.filter((a) => {
      if (!idsVisibles.has(a.funcionarioId)) return false;
      if (filtros.tipoConsulta && a.tipoConsulta !== filtros.tipoConsulta) return false;
      if (filtros.tipoAtencion && a.tipoAtencion !== filtros.tipoAtencion) return false;
      if (filtros.anio && a.fecha.slice(0, 4) !== filtros.anio) return false;
      if (filtros.mes && Number(a.fecha.slice(5, 7)) !== Number(filtros.mes)) return false;
      return true;
    });
  }, [atenciones, funcionariosFiltrados, filtros]);

  // Conteo de atenciones filtradas por funcionario.
  const conteoPorFuncionario = useMemo(() => {
    const mapa = new Map();
    atencionesFiltradas.forEach((a) => {
      mapa.set(a.funcionarioId, (mapa.get(a.funcionarioId) || 0) + 1);
    });
    return mapa;
  }, [atencionesFiltradas]);

  // Métricas (sobre los datos filtrados).
  const totalFuncionarios = funcionariosFiltrados.length;
  const totalAtenciones = atencionesFiltradas.length;
  const atencionesPromedio =
    totalFuncionarios > 0 ? Math.round(totalAtenciones / totalFuncionarios) : 0;

  const manejarCuentaCreada = (cuenta) => {
    setModalAbierto(false);
    setConfirmacion(
      `Cuenta creada para ${cuenta.nombre}. Se envió un correo a ${cuenta.email} para crear la contraseña.`
    );
  };

  const manejarEnvioCorreo = (cuenta) => {
    enviarCorreo(cuenta.id);
    setConfirmacion(`Correo de acceso reenviado a ${cuenta.email}.`);
  };

  const manejarRevocacion = (cuenta) => {
    revocarCuenta(cuenta.id);
    setConfirmacion(`Se revocó la cuenta de ${cuenta.nombre}.`);
  };

  return (
    <div className="min-h-[calc(100vh-42px)] bg-slate-100 flex flex-col font-sans">
      <EncabezadoSuperior />

      <main className="flex-1 p-4 sm:p-6 md:p-8 bg-slate-50 flex flex-col">
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center text-slate-500 hover:text-cesfam-600 font-medium transition-colors"
            aria-label="Volver a la vista de inicio"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al inicio
          </Link>
        </div>

        <div className="max-w-7xl mx-auto w-full space-y-6">
          <header className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-cesfam-50 text-cesfam-600">
                <Users className="w-5 h-5" />
              </span>
              Panel de administración
            </h1>
            <p className="text-slate-500 text-sm sm:text-base">
              Gestione las cuentas de los funcionarios del CESFAM y revise su actividad.
            </p>
          </header>

          {/* Filtros (aplican a métricas, gráficos y tabla) */}
          <FiltrosFuncionarios
            valores={filtros}
            onCambio={setFiltros}
            onLimpiar={() => setFiltros(FILTROS_INICIALES)}
          />

          {/* Cards de métricas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TarjetaMetrica icono={Users} etiqueta="Funcionarios" valor={totalFuncionarios} />
            <TarjetaMetrica icono={Activity} etiqueta="Atenciones" valor={totalAtenciones} />
            <TarjetaMetrica icono={BarChart3} etiqueta="Promedio por funcionario" valor={atencionesPromedio} />
          </div>

          {/* Gráficos: responden a los mismos filtros que la tabla */}
          <GraficosMetricas funcionarios={funcionariosFiltrados} atenciones={atencionesFiltradas} />

          {/* Sección inferior: acción + tabla */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
                Funcionarios
              </h2>
              <button
                onClick={() => {
                  setConfirmacion(null);
                  setModalAbierto(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cesfam-500 hover:bg-cesfam-600 text-white font-medium text-sm shadow-active-pill hover:shadow-lg transition-all active:scale-98"
              >
                <UserPlus className="w-4 h-4" />
                <span>Crear cuenta</span>
              </button>
            </div>

            {confirmacion && (
              <p
                role="status"
                className="flex items-center gap-2 text-sm font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3.5 py-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{confirmacion}</span>
              </p>
            )}

            <div className="bg-white rounded-lg border border-slate-200 shadow-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Funcionarios del CESFAM y sus atenciones según los filtros aplicados</caption>
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-left">
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-500">Nombre</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-500">Email</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-500 text-right">Atenciones</th>
                      <th scope="col" className="px-4 py-3 font-semibold text-slate-500 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {funcionariosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                          No hay funcionarios que coincidan con los filtros.
                        </td>
                      </tr>
                    )}
                    {funcionariosFiltrados.map((cuenta) => (
                      <tr key={cuenta.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">{cuenta.nombre}</td>
                        <td className="px-4 py-3 text-slate-500">{cuenta.email}</td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full bg-cesfam-50 text-cesfam-700 text-xs font-semibold tabular-nums">
                            {conteoPorFuncionario.get(cuenta.id) || 0}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2 flex-wrap">
                            <button
                              onClick={() => manejarEnvioCorreo(cuenta)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-cesfam-700 font-medium text-xs transition-colors active:scale-98"
                              aria-label={`Enviar correo de acceso a ${cuenta.nombre}`}
                            >
                              <Send className="w-4 h-4" />
                              Enviar correo
                            </button>
                            <button
                              onClick={() => manejarRevocacion(cuenta)}
                              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 font-medium text-xs transition-colors active:scale-98"
                              aria-label={`Revocar la cuenta de ${cuenta.nombre}`}
                            >
                              <UserX className="w-4 h-4" />
                              Revocar cuenta
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <PiePagina />

      {modalAbierto && (
        <FormularioNuevaCuenta
          onExito={manejarCuentaCreada}
          onCancelar={() => setModalAbierto(false)}
        />
      )}
    </div>
  );
};
