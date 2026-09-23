import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { PREGUNTAS_PREDETERMINADAS } from './ContextoPreguntas';
import { supabase } from '../lib/supabase';

const ContextoCuentas = createContext(undefined);
export const ROLES = { PENDIENTE: 'pendiente', FUNCIONARIO: 'funcionario' };
export const ESTADOS_INVITACION = { ENVIADA: 'enviada', ACTIVA: 'activa' };
export const TIPOS_ATENCION = ['Matrona', 'Doctor general', 'Somatometría', 'Enfermería', 'Nutrición', 'Psicología'];
export const TIPOS_CONSULTA = PREGUNTAS_PREDETERMINADAS;
export const ANIOS_DISPONIBLES = [2024, 2025, 2026];
const EXPRESION_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ejecutarAdministracion(action, payload = {}) {
  const { data, error } = await supabase.functions.invoke('manage-users', { body: { action, ...payload } });
  if (error) throw new Error(error.message || 'No fue posible completar la operación.');
  if (data?.error) throw new Error(data.error);
  return data;
}

export const ProveedorCuentas = ({ children }) => {
  const [cuentas, setCuentas] = useState([]);
  const [atenciones, setAtenciones] = useState([]);
  const cargarCuentas = useCallback(async () => {
    try { setCuentas((await ejecutarAdministracion('list')).cuentas || []); }
    catch (error) { console.error('Error cargando funcionarios:', error); }
  }, []);
  useEffect(() => { cargarCuentas(); }, [cargarCuentas]);

  const crearCuenta = useCallback(async ({ nombre, email }) => {
    const nombreLimpio = (nombre || '').trim();
    const emailLimpio = (email || '').trim().toLowerCase();
    if (!nombreLimpio || !emailLimpio) return { ok: false, error: 'Complete nombre y correo.' };
    if (!EXPRESION_EMAIL.test(emailLimpio)) return { ok: false, error: 'Ingrese un correo electrónico válido.' };
    try {
      const data = await ejecutarAdministracion('create', { nombre: nombreLimpio, email: emailLimpio });
      setCuentas((previas) => [...previas, data.cuenta]);
      return { ok: true, cuenta: data.cuenta };
    } catch (error) { return { ok: false, error: error.message }; }
  }, []);

  const enviarCorreo = useCallback(async (idCuenta) => ejecutarAdministracion('resend-invite', { id: idCuenta }), []);
  const revocarCuenta = useCallback(async (idCuenta) => {
    await ejecutarAdministracion('delete', { id: idCuenta });
    setCuentas((previas) => previas.filter((cuenta) => cuenta.id !== idCuenta));
    setAtenciones((previas) => previas.filter((a) => a.funcionarioId !== idCuenta));
  }, []);

  return <ContextoCuentas.Provider value={{ cuentas, atenciones, crearCuenta, enviarCorreo, revocarCuenta, otorgarFuncionario: () => {}, revocarFuncionario: () => {} }}>{children}</ContextoCuentas.Provider>;
};
export const usarContextoCuentas = () => {
  const contexto = useContext(ContextoCuentas);
  if (!contexto) throw new Error('usarContextoCuentas debe ser utilizado dentro de un ProveedorCuentas');
  return contexto;
};