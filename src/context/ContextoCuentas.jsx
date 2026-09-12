import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PREGUNTAS_PREDETERMINADAS } from './ContextoPreguntas';
import { supabase, supabaseAdmin } from '../lib/supabase';

/**
 * ============================================================================
 * ARQUITECTURA DE ESTADO GLOBAL (Contexto de Cuentas - Panel de Administración)
 * ============================================================================
 */

const ContextoCuentas = createContext(undefined);

export const ROLES = {
  PENDIENTE: 'pendiente',
  FUNCIONARIO: 'funcionario',
};

export const ESTADOS_INVITACION = {
  ENVIADA: 'enviada',
  ACTIVA: 'activa',
};

export const TIPOS_ATENCION = [
  'Matrona',
  'Doctor general',
  'Somatometría',
  'Enfermería',
  'Nutrición',
  'Psicología',
];

export const TIPOS_CONSULTA = PREGUNTAS_PREDETERMINADAS;
export const ANIOS_DISPONIBLES = [2024, 2025, 2026];

const EXPRESION_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ProveedorCuentas = ({ children }) => {
  const [cuentas, setCuentas] = useState([]);
  const [atenciones, setAtenciones] = useState([]);

  useEffect(() => {
    const cargarCuentas = async () => {
      const { data, error } = await supabaseAdmin.from('funcionarios').select('*');
      if (error) {
        console.error('Error cargando funcionarios:', error);
      } else if (data) {
        const cuentasMapeadas = data.map(f => ({
          id: f.id,
          nombre: f.nombre,
          email: f.correo,
          rol: f.rol || ROLES.FUNCIONARIO,
          estadoInvitacion: ESTADOS_INVITACION.ACTIVA,
          creadaEn: new Date().toISOString(),
          correoEnviadoEn: new Date().toISOString()
        }));
        setCuentas(cuentasMapeadas);
      }
    };
    cargarCuentas();
  }, []);

  const crearCuenta = useCallback(
    async ({ nombre, email }) => {
      const nombreLimpio = (nombre || '').trim();
      const emailLimpio = (email || '').trim().toLowerCase();

      if (!nombreLimpio || !emailLimpio) {
        return { ok: false, error: 'Complete nombre y correo.' };
      }
      if (!EXPRESION_EMAIL.test(emailLimpio)) {
        return { ok: false, error: 'Ingrese un correo electrónico válido.' };
      }
      if (cuentas.some((c) => c.email.toLowerCase() === emailLimpio)) {
        return { ok: false, error: 'Ya existe una cuenta con ese correo.' };
      }

      // 1. Crear el usuario en Supabase Auth usando el cliente Admin
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: emailLimpio,
        password: '123456',
        email_confirm: true
      });

      if (authError) {
        return { ok: false, error: authError.message };
      }

      const userId = authData.user.id;

      // 2. Insertar en la tabla funcionarios
      const { error: dbError } = await supabaseAdmin.from('funcionarios').insert([
        {
          id: userId,
          nombre: nombreLimpio,
          correo: emailLimpio,
          rol: 'funcionario',
          modulo: 'general'
        }
      ]);

      if (dbError) {
        return { ok: false, error: 'Error guardando en la tabla: ' + dbError.message };
      }

      const nuevaCuenta = {
        id: userId,
        nombre: nombreLimpio,
        email: emailLimpio,
        rol: ROLES.FUNCIONARIO,
        estadoInvitacion: ESTADOS_INVITACION.ACTIVA,
        creadaEn: new Date().toISOString(),
        correoEnviadoEn: new Date().toISOString(),
      };

      setCuentas((previas) => [...previas, nuevaCuenta]);
      return { ok: true, cuenta: nuevaCuenta };
    },
    [cuentas]
  );

  const enviarCorreo = useCallback((idCuenta) => {
    // Simulado para MVP
  }, []);

  const revocarCuenta = useCallback(async (idCuenta) => {
    // Primero borrar de la tabla
    await supabaseAdmin.from('funcionarios').delete().eq('id', idCuenta);
    // Luego borrar de auth
    await supabaseAdmin.auth.admin.deleteUser(idCuenta);
    
    setCuentas((previas) => previas.filter((cuenta) => cuenta.id !== idCuenta));
    setAtenciones((previas) => previas.filter((a) => a.funcionarioId !== idCuenta));
  }, []);

  const otorgarFuncionario = useCallback(() => {}, []);
  const revocarFuncionario = useCallback(() => {}, []);

  const valorContexto = {
    cuentas,
    atenciones,
    crearCuenta,
    enviarCorreo,
    revocarCuenta,
    otorgarFuncionario,
    revocarFuncionario,
  };

  return (
    <ContextoCuentas.Provider value={valorContexto}>
      {children}
    </ContextoCuentas.Provider>
  );
};

export const usarContextoCuentas = () => {
  const contexto = useContext(ContextoCuentas);
  if (!contexto) {
    throw new Error('usarContextoCuentas debe ser utilizado dentro de un ProveedorCuentas');
  }
  return contexto;
};


