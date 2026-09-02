import React from 'react';
import { ContenedorCamara } from '../components/patient/ContenedorCamara';
import { TarjetaPregunta } from '../components/patient/TarjetaPregunta';


export const VistaPaciente = () => {
  return (
    <div className="min-h-[calc(100vh-42px)] bg-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-10 font-sans">
      <main className="max-w-4xl mx-auto w-full space-y-6 md:space-y-8 my-auto">
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
