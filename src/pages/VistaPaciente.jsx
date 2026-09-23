import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { ContenedorCamara } from '../components/patient/ContenedorCamara';
import { TarjetaPregunta } from '../components/patient/TarjetaPregunta';
import { TarjetaIndicaciones } from '../components/patient/TarjetaIndicaciones';


export const VistaPaciente = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between px-4 sm:px-6 md:px-8 pt-2 pb-4 font-sans overflow-x-hidden">
      <header>
                <div className="flex items-center justify-between mb-1">
          <Link to="/" className="inline-flex items-center text-slate-500 hover:text-blue-700 font-medium transition-colors text-xs sm:text-sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Volver al inicio
          </Link>
          <div className="flex justify-center items-center">
            <img 
              src="/Logo oficcial-Photoroom.png" 
              alt="Logo SeñaText" 
              className="w-40 sm:w-64 md:w-72 max-w-full h-auto max-h-14 sm:max-h-16 md:max-h-20 object-contain"
            />
          </div>
        </div>
      </header>
      <main className="w-full my-auto">
        <div className="grid w-full gap-3 sm:gap-4 2xl:grid-cols-[minmax(0,1fr)_minmax(0,56rem)_minmax(0,1fr)] 2xl:items-stretch">
          <section aria-label="Indicaciones para el reconocimiento" className="w-full 2xl:col-start-1 2xl:row-start-1 2xl:justify-self-end">
            <TarjetaIndicaciones />
          </section>

          <section aria-label="Visor de cámara y procesamiento de señas" className="w-full max-w-4xl justify-self-center 2xl:col-start-2 2xl:row-start-1">
            <ContenedorCamara />
          </section>

          <div aria-hidden="true" className="hidden 2xl:col-start-3 2xl:row-start-1 2xl:block" />

          <section aria-label="Pregunta actual del funcionario" className="w-full max-w-4xl justify-self-center 2xl:col-start-2">
            <TarjetaPregunta />
          </section>
        </div>
      </main>
    </div>
  );
};
