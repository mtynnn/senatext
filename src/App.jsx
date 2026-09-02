import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorPreguntas } from './context/ContextoPreguntas';
import { VistaPaciente } from './pages/VistaPaciente';
import { VistaFuncionario } from './pages/VistaFuncionario';
import { VistaInicio } from './pages/VistaInicio';

/**
 * ============================================================================
 * COMPONENTE PRINCIPAL: App (Configuración de Rutas con React Router v6)
 * ============================================================================
 * Carpetas en Inglés (context, components, pages), Archivos en Español.
 * Configuración estricta de rutas:
 * - /paciente: Vista del paciente sordo.
 * - /funcionario: Módulo de atención del funcionario del CESFAM.
 * - /: Panel de inicio y navegación del MVP.
 */
function App() {
  return (
    <ProveedorPreguntas>
      <BrowserRouter>
        <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
          {/* Rutas principales del MVP SeñaText */}
          <Routes>
            <Route path="/" element={<VistaInicio />} />
            <Route path="/paciente" element={<VistaPaciente />} />
            <Route path="/funcionario" element={<VistaFuncionario />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ProveedorPreguntas>
  );
}

export default App;
