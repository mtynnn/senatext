import React from 'react';
import { EncabezadoSuperior } from '../components/official/EncabezadoSuperior';
import { BarraLateral } from '../components/official/BarraLateral';
import { VisualizadorTraduccion } from '../components/official/VisualizadorTraduccion';
import { ControlesAccion } from '../components/official/ControlesAccion';
import { PiePagina } from '../components/common/PiePagina';

export const VistaFuncionario = () => {
  return (
    <div className="min-h-[calc(100vh-42px)] bg-slate-100 flex flex-col font-sans">
      <EncabezadoSuperior />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <BarraLateral />

        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-slate-50 flex flex-col">
          <div className="bg-white rounded-lg border border-slate-300 p-6 sm:p-8 md:p-10 shadow-sm flex-1 flex flex-col justify-between max-w-6xl mx-auto w-full">
            <VisualizadorTraduccion />
            <ControlesAccion />
          </div>
        </main>
      </div>

      <PiePagina />
    </div>
  );
};
