import React, { useEffect, useState } from 'react';
import { UserPlus, Mail, AlertCircle, X } from 'lucide-react';
import { usarContextoCuentas } from '../../context/ContextoCuentas';

/**
 * ============================================================================
 * COMPONENTE: FormularioNuevaCuenta (Vista Admin)
 * ============================================================================
 * Ubicación: src/components/official/FormularioNuevaCuenta.jsx
 * Carpeta en Inglés (components/official), Archivo en Español.
 *
 * Modal con un formulario simple (nombre, email) para que el administrador
 * cree la cuenta de un funcionario. No se pide contraseña: al crear la cuenta
 * se envía un correo al usuario para que defina la suya (flujo simulado por
 * ahora; luego Supabase Auth).
 *
 * Props:
 *   - onExito(cuenta): se llama tras crear la cuenta correctamente.
 *   - onCancelar(): se llama al cerrar el modal sin crear la cuenta.
 */

const ESTADO_INICIAL = { nombre: '', email: '' };

export const FormularioNuevaCuenta = ({ onExito, onCancelar }) => {
  const { crearCuenta } = usarContextoCuentas();
  const [valores, setValores] = useState(ESTADO_INICIAL);
  const [error, setError] = useState(null);

  // Cerrar con la tecla Escape.
  useEffect(() => {
    const alPresionar = (evento) => {
      if (evento.key === 'Escape') onCancelar?.();
    };
    window.addEventListener('keydown', alPresionar);
    return () => window.removeEventListener('keydown', alPresionar);
  }, [onCancelar]);

  const manejarCambio = (evento) => {
    const { name, value } = evento.target;
    setValores((previos) => ({ ...previos, [name]: value }));
  };

  const manejarEnvio = (evento) => {
    evento.preventDefault();
    setError(null);

    const resultado = crearCuenta(valores);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }

    setValores(ESTADO_INICIAL);
    onExito?.(resultado.cuenta);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-900/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titulo-nueva-cuenta"
      onClick={() => onCancelar?.()}
    >
      <div
        className="w-full max-w-md bg-white rounded-lg border border-slate-300 shadow-xl p-5 sm:p-6"
        onClick={(evento) => evento.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-cesfam-100 text-cesfam-700">
              <UserPlus className="w-4 h-4" />
            </span>
            <div>
              <h2 id="titulo-nueva-cuenta" className="font-semibold text-slate-800 text-sm uppercase tracking-wider">
                Crear cuenta
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                El funcionario recibirá un correo para definir su contraseña.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onCancelar?.()}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Cerrar formulario de creación de cuenta"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <form onSubmit={manejarEnvio} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="nuevo-nombre" className="block text-xs font-semibold text-slate-600">
              Nombre
            </label>
            <input
              id="nuevo-nombre"
              name="nombre"
              type="text"
              value={valores.nombre}
              onChange={manejarCambio}
              autoComplete="name"
              placeholder="Ej: Camila Fuentes"
              autoFocus
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cesfam-500 focus:border-cesfam-500 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="nuevo-email" className="block text-xs font-semibold text-slate-600">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="nuevo-email"
                name="email"
                type="email"
                value={valores.email}
                onChange={manejarCambio}
                autoComplete="email"
                placeholder="usuario@cesfam.cl"
                className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-cesfam-500 focus:border-cesfam-500 bg-white"
              />
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="flex items-center gap-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-3 py-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => onCancelar?.()}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium text-sm transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cesfam-500 hover:bg-cesfam-600 text-white font-medium text-sm shadow-active-pill hover:shadow-lg transition-all active:scale-98"
            >
              <UserPlus className="w-4 h-4" />
              <span>Crear cuenta</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
