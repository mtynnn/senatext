import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ContextoAuth = createContext();

export const ProveedorAuth = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [sesion, setSesion] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    // 1. Obtener la sesión activa inicial al cargar
    const obtenerSesionInicial = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error obteniendo sesión inicial:', error);
        }
        setSesion(session);
        setUsuario(session?.user ?? null);
      } catch (err) {
        console.error('Excepción consultando sesión:', err);
      } finally {
        setCargando(false);
      }
    };

    obtenerSesionInicial();

    // 2. Suscribirse a cambios de estado de autenticación en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSesion(session);
      setUsuario(session?.user ?? null);
      setCargando(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const esAdmin = usuario?.email === 'admin@cesfam.com';

  const cerrarSesion = async () => {
    setCargando(true);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    } finally {
      setUsuario(null);
      setSesion(null);
      setCargando(false);
    }
  };

  const valor = {
    usuario,
    sesion,
    cargando,
    esAdmin,
    cerrarSesion
  };

  return (
    <ContextoAuth.Provider value={valor}>
      {children}
    </ContextoAuth.Provider>
  );
};

export const usarAuth = () => {
  const contexto = useContext(ContextoAuth);
  if (!contexto) {
    throw new Error('usarAuth debe utilizarse dentro de un ProveedorAuth');
  }
  return contexto;
};
