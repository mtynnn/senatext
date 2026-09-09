import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorPreguntas } from './context/ContextoPreguntas';
import { ProveedorCuentas } from './context/ContextoCuentas';
import { VistaPaciente } from './pages/VistaPaciente';
import { VistaFuncionario } from './pages/VistaFuncionario';
import { VistaInicio } from './pages/VistaInicio';
import { VistaAdmin } from './pages/VistaAdmin';

/**
 * ============================================================================
 * COMPONENTE PRINCIPAL: App (Configuración de Rutas con React Router v6)
 * ============================================================================
 * Carpetas en Inglés (context, components, pages), Archivos en Español.
 * Configuración estricta de rutas:
 * - /paciente: Vista del paciente sordo.
 * - /funcionario: Módulo de atención del funcionario del CESFAM.
 * - /: Panel de inicio y navegación del MVP.
 * - /admin: Panel de administración de cuentas (sin protección de acceso todavía).
 */
function App() {
  return (
    <ProveedorPreguntas>
      <ProveedorCuentas>
        <BrowserRouter>
          <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
            {/* Rutas principales del MVP SeñaText */}
            <Routes>
              <Route path="/" element={<VistaInicio />} />
              <Route path="/paciente" element={<VistaPaciente />} />
              <Route path="/funcionario" element={<VistaFuncionario />} />
              <Route path="/admin" element={<VistaAdmin />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ProveedorCuentas>
    </ProveedorPreguntas>
  );
}

export default App;
