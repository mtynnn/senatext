import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Monitor, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { PiePagina } from '../components/common/PiePagina';

/**
 * ============================================================================
 * VISTA: VistaInicio (Portal SeñaText)
 * ============================================================================
 * Ubicación: src/pages/VistaInicio.jsx
 * Ruta: /
 * 
 * Flujo de navegación:
 * - Ingreso Paciente -> /paciente
 * - Ingreso Funcionario (Abrir módulo de atención) -> /login
 * 
 * Notificación de Cierre de Sesión:
 * - Detecta el retorno desde /funcionario (o EncabezadoSuperior) cuando se
 *   activa "Terminar Jornada Laboral" y dispara la alerta correspondiente.
 */
export const VistaInicio = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const alertaDisparadaRef = useRef(false);

  useEffect(() => {
    // Si viene redirigido tras terminar la jornada laboral
    if (location.state?.sesionCerrada && !alertaDisparadaRef.current) {
      alertaDisparadaRef.current = true;
      setMostrarAlerta(true);

      // Lanzar alerta requerida
      alert('Cierre de sesión exitoso');

      // Limpiar el estado de navegación en el historial para evitar alertas repetidas
      navigate('/', { replace: true, state: {} });
    }
  }, [location, navigate]);

  return (
    <div className="min-h-[calc(100vh-42px)] bg-slate-50 flex flex-col justify-between font-sans">
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 my-auto space-y-8">
        {/* Banner de confirmación de cierre de sesión exitoso */}
        {mostrarAlerta && (
          <div 
            role="status"
            className="max-w-4xl mx-auto w-full p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center justify-between shadow-xs animate-in fade-in duration-200"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-semibold text-sm">Cierre de sesión exitoso</p>
                <p className="text-xs text-emerald-700">Ha finalizado su jornada laboral correctamente.</p>
              </div>
            </div>
            <button
              onClick={() => setMostrarAlerta(false)}
              className="p-1 rounded-md text-emerald-600 hover:bg-emerald-100 transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Portal SeñaText
          </h1>
          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto">
            Seleccione su módulo de ingreso al sistema de atención inclusiva.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Módulo Paciente */}
          <Link
            to="/paciente"
            className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-md hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
            <div className="space-y-4 z-10">
              <div className="w-14 h-14 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/30">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Ingreso Paciente
                </h2>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Acceso al visor de cámara para iniciar la comunicación en Lengua de Señas Chilena.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center font-bold text-sky-600 text-sm group-hover:translate-x-1 transition-transform z-10">
              <span>Abrir visor de paciente</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>

          {/* Módulo Funcionario -> Redirige a /login */}
          <Link
            to="/login"
            className="group bg-white rounded-3xl p-8 border border-slate-200 shadow-md hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
            <div className="space-y-4 z-10">
              <div className="w-14 h-14 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-md shadow-slate-900/30">
                <Monitor className="w-7 h-7 text-sky-400" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
                  Ingreso Funcionario
                </h2>
                <p className="text-slate-500 text-sm mt-2 leading-relaxed">
                  Panel de atención del CESFAM. Requiere inicio de sesión institucional corporativo.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center font-bold text-sky-600 text-sm group-hover:translate-x-1 transition-transform z-10">
              <span>Abrir módulo de atención</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>
        </div>
      </main>

      <PiePagina />
    </div>
  );
};
