import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ContenedorCamara } from '../components/patient/ContenedorCamara';
import { TarjetaPregunta } from '../components/patient/TarjetaPregunta';


export const VistaPaciente = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between px-4 sm:px-6 md:px-8 pt-2 pb-4 font-sans overflow-x-hidden">
      <main className="max-w-4xl mx-auto w-full space-y-3 sm:space-y-4 my-auto">
        <div className="flex items-center justify-between mb-1">
          <Link to="/" className="inline-flex items-center text-slate-500 hover:text-blue-700 font-medium transition-colors text-xs sm:text-sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Volver al inicio
          </Link>
          <div className="flex justify-center items-center">
            <img 
              src="/Logo oficcial-Photoroom.png" 
              alt="Logo SeñaText" 
              className="w-36 sm:w-56 md:w-64 max-w-full h-auto max-h-12 sm:max-h-14 object-contain"
            />
          </div>
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
