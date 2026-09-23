import React from 'react';
import { CheckCircle2, Lightbulb } from 'lucide-react';

const indicaciones = [
  'Mantén el rostro y ambas manos visibles.',
  'Ubícate frente a la cámara.',
  'Mantén una distancia aproximada de un brazo.',
  'Utiliza un lugar con buena iluminación.',
  'Evita fondos con demasiado movimiento.',
  'Realiza la seña de forma clara y natural.',
  'Espera a que la cámara esté lista antes de responder.',
];

export const TarjetaIndicaciones = () => (
  <aside className="h-full rounded-2xl border border-sky-200 bg-sky-50/70 p-5 shadow-card">
    <div className="flex items-start gap-3 border-b border-sky-100 pb-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
        <Lightbulb className="h-5 w-5" />
      </span>
      <h2 className="pt-0.5 text-base font-bold leading-snug text-cesfam-900 sm:text-lg">
        Indicaciones para un mejor reconocimiento
      </h2>
    </div>

    <ul className="mt-4 space-y-3">
      {indicaciones.map((indicacion) => (
        <li key={indicacion} className="flex items-start gap-2.5 text-sm leading-relaxed text-slate-700 sm:text-base">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-sky-700 sm:h-5 sm:w-5" />
          <span>{indicacion}</span>
        </li>
      ))}
    </ul>
  </aside>
);
