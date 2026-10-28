import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Monitor, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { PiePagina } from '../components/common/PiePagina';

export const VistaInicio = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mostrarAlerta, setMostrarAlerta] = useState(false);

  useEffect(() => {
    if (location.state?.sesionCerrada) {
      setMostrarAlerta(true);
      const timer = setTimeout(() => {
        setMostrarAlerta(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state?.sesionCerrada]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans overflow-x-hidden">
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 my-auto space-y-4 sm:space-y-6">
        
        {/* Banner Flotante de Alerta */}
        {mostrarAlerta && (
          <div 
            role="status"
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md p-4 bg-emerald-100 border-2 border-emerald-500 text-emerald-900 rounded-xl shadow-2xl flex items-center justify-between animate-in slide-in-from-top-4 fade-in duration-300"
          >
            <div className="flex items-center gap-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-lg">Sesión Finalizada</p>
                <p className="text-sm font-medium text-emerald-700">Ha cerrado su jornada correctamente.</p>
              </div>
            </div>
            <button
              onClick={() => setMostrarAlerta(false)}
              className="p-2 rounded-lg bg-emerald-200 text-emerald-800 hover:bg-emerald-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
          <div className="flex justify-center items-center py-1">
            <img 
              src="/Logo oficcial-Photoroom.png" 
              alt="Logo SeñaText" 
              className="w-80 sm:w-[540px] md:w-[720px] max-w-full h-auto max-h-50 sm:max-h-60 object-contain mx-auto"
            />
          </div>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto font-medium">
            Seleccione su módulo de ingreso al sistema de atención inclusiva.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {/* Módulo Paciente */}
          <Link
            to="/paciente"
            className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-sky-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
            <div className="space-y-3 z-10">
              <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/30">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  Ingreso Paciente
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  Acceso al visor de cámara para iniciar la comunicación en Lengua de Señas Chilena.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center font-bold text-sky-600 text-sm group-hover:translate-x-1 transition-transform z-10">
              <span>Abrir visor de paciente</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </Link>

          {/* Módulo Funcionario -> Redirige a /login */}
          <Link
            to="/login"
            className="group bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-md hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-28 h-28 bg-sky-50 rounded-bl-full -z-0 group-hover:scale-110 transition-transform" />
            <div className="space-y-3 z-10">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-md shadow-slate-900/30">
                <Monitor className="w-6 h-6 text-sky-400" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1">
                  Ingreso Funcionario
                </h2>
                <p className="text-slate-500 text-xs sm:text-sm mt-1.5 leading-relaxed">
                  Panel de atención del CESFAM. Requiere inicio de sesión institucional corporativo.
                </p>
              </div>
            </div>
            <div className="mt-6 flex items-center font-bold text-sky-600 text-sm group-hover:translate-x-1 transition-transform z-10">
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
