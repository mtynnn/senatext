import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProveedorPreguntas } from './context/ContextoPreguntas';
import { ProveedorCuentas } from './context/ContextoCuentas';
import { ProveedorAuth } from './context/ContextoAuth';
import { RutaProtegida } from './components/auth/RutaProtegida';
import { VistaPaciente } from './pages/VistaPaciente';
import { VistaFuncionario } from './pages/VistaFuncionario';
import { VistaInicio } from './pages/VistaInicio';
import { VistaAdmin } from './pages/VistaAdmin';
import { LoginFuncionario } from './pages/LoginFuncionario';

/**
 * ============================================================================
 * COMPONENTE PRINCIPAL: App (Configuración de Rutas con React Router v6)
 * ============================================================================
 * Configuración de rutas del sistema SeñaText con Auth Guard:
 * - /: Portal de inicio y selección de rol (Pública).
 * - /login: Inicio de sesión corporativo (Pública).
 * - /paciente: Vista del paciente (Pública).
 * - /funcionario: Módulo de atención del funcionario (Protegida).
 * - /admin: Panel de administración (Protegida - Solo Admin).
 */
function App() {
  return (
    <ProveedorAuth>
      <ProveedorPreguntas>
        <ProveedorCuentas>
          <BrowserRouter>
            <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
              {/* Rutas principales del MVP SeñaText */}
              <Routes>
                <Route path="/" element={<VistaInicio />} />
                <Route path="/login" element={<LoginFuncionario />} />
                <Route path="/paciente" element={<VistaPaciente />} />
                <Route 
                  path="/funcionario" 
                  element={
                    <RutaProtegida>
                      <VistaFuncionario />
                    </RutaProtegida>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <RutaProtegida soloAdmin={true}>
                      <VistaAdmin />
                    </RutaProtegida>
                  } 
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </BrowserRouter>
        </ProveedorCuentas>
      </ProveedorPreguntas>
    </ProveedorAuth>
  );
}

export default App;
