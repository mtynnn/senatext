import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { Building2, Info, Settings, User, LogOut } from 'lucide-react';

export const EncabezadoSuperior = () => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [usuario, setUsuario] = useState({ nombre: 'Cargando...', email: '', modulo: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const cargarPerfil = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: perfil } = await supabaseAdmin.from('funcionarios')
          .select('nombre, modulo, correo')
          .eq('id', user.id)
          .single();
        
        if (perfil) {
          setUsuario({
            nombre: perfil.nombre,
            email: perfil.correo,
            modulo: perfil.modulo || 'General'
          });
        } else {
          setUsuario({ nombre: 'Funcionario', email: user.email, modulo: 'General' });
        }
      }
    };
    cargarPerfil();
  }, []);

  const manejarCerrarSesion = async () => {
    await supabase.auth.signOut();
    navigate('/', { 
      state: { 
        sesionCerrada: true, 
        mensaje: 'Cierre de sesión exitoso' 
      } 
    });
  };

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 px-4 sm:px-5 py-1 flex items-center justify-between shadow-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <img 
          src="/Logo oficcial-Photoroom.png" 
          alt="Logo SeñaText" 
          className="h-12 sm:h-20 w-auto object-contain bg-white rounded-md "
        />
        <div className="flex items-center gap-2">
          <h1 className="font-bold text-white text-sm sm:text-base tracking-wide">
            CESFAM
          </h1>
          <span className="text-slate-500 font-light">|</span>
          <span className="text-slate-300 text-xs sm:text-sm font-medium">
            Módulo de atención
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 relative">
        <button 
          title="Información y ayuda" 
          className="p-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Info className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <button 
          title="Configuración del módulo" 
          className="p-2 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        <div className="h-4 w-px bg-slate-700 my-auto mx-1" />

        <button
          onClick={manejarCerrarSesion}
          title="Terminar Jornada Laboral"
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium text-slate-300 hover:text-red-400 hover:bg-red-950/40 border border-slate-700 hover:border-red-900/60 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-400 shrink-0" />
          <span className="hidden sm:inline">Terminar Jornada Laboral</span>
          <span className="sm:hidden">Terminar</span>
        </button>

        <div className="h-4 w-px bg-slate-700 my-auto mx-1" />

        <div className="relative">
          <button 
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded text-slate-300 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-700 cursor-pointer"
            title="Perfil de funcionario"
          >
            <div className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-sm">
              <User className="w-4 h-4" />
            </div>
            <span className="hidden md:inline text-xs font-medium text-slate-200">
              {usuario.nombre} ({usuario.modulo})
            </span>
          </button>

          {menuAbierto && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-slate-900">
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50">
                <p className="text-xs font-semibold text-slate-800">{usuario.nombre}</p>
                <p className="text-[11px] text-slate-500 truncate">{usuario.email}</p>
              </div>
              <button 
                onClick={() => {
                  setMenuAbierto(false);
                  manejarCerrarSesion();
                }}
                className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4 text-red-600 shrink-0" />
                <span>Terminar Jornada Laboral</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


