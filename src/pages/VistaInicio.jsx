import React from 'react';
import { Link } from 'react-router-dom';
import { User, Monitor, ArrowRight, Activity, ShieldCheck, Cpu } from 'lucide-react';
import { PiePagina } from '../components/common/PiePagina';


export const VistaInicio = () => {
  return (
    <div className="min-h-[calc(100vh-42px)] bg-slate-50 flex flex-col justify-between font-sans">
      <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-12 my-auto space-y-12">
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

          {/* Módulo Funcionario */}
          <Link
            to="/funcionario"
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
                  Panel de atención del CESFAM. (Próximamente requerirá inicio de sesión).
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
