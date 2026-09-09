import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ContenedorCamara } from '../components/patient/ContenedorCamara';
import { TarjetaPregunta } from '../components/patient/TarjetaPregunta';


export const VistaPaciente = () => {
  return (
    <div className="min-h-[calc(100vh-42px)] bg-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans">
      <main className="max-w-4xl mx-auto w-full space-y-6 md:space-y-8 my-auto">
        <div className="flex items-center">
          <Link to="/" className="inline-flex items-center text-slate-500 hover:text-sky-600 font-medium transition-colors">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al inicio
          </Link>
        </div>
        
        <section aria-label="Visor de cámara y procesamiento de señas">
          <ContenedorCamara />
        </section>

        <section aria-label="Pregunta actual del funcionario">
          <TarjetaPregunta />
        </section>
      </main>
    </div>
  );
};
