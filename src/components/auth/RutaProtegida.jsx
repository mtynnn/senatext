import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usarAuth } from '../../context/ContextoAuth';
import { Loader2 } from 'lucide-react';

/**
 * Componente Wrapper para Proteger Rutas Privadas
 * @param {Object} props
 * @param {React.ReactNode} props.children Componentes/páginas protegidas
 * @param {boolean} [props.soloAdmin=false] Si la ruta requiere perfil de Administrador
 */
export const RutaProtegida = ({ children, soloAdmin = false }) => {
  const { usuario, cargando, esAdmin } = usarAuth();
  const location = useLocation();

  // 1. Mostrar pantalla de carga mientras se verifica el token de sesión
  if (cargando) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-700 animate-spin" />
          <span className="text-slate-600 text-sm font-medium">Verificando credenciales de acceso...</span>
        </div>
      </div>
    );
  }

  // 2. Si no hay usuario logueado, redirigir a /login enviando el estado de error
  if (!usuario) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          mensajeError: 'Debes iniciar sesión con tu cuenta corporativa para acceder a esta vista.' 
        }} 
        replace 
      />
    );
  }

  // 3. Si la ruta requiere perfil Admin y el usuario no es admin
  if (soloAdmin && !esAdmin) {
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          mensajeError: 'Acceso denegado: Esta vista requiere privilegios de administrador.' 
        }} 
        replace 
      />
    );
  }

  // 4. Usuario autenticado y con permisos válidos
  return children;
};
