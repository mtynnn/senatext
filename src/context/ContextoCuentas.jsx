import React, { createContext, useContext, useState, useCallback } from 'react';
import { PREGUNTAS_PREDETERMINADAS } from './ContextoPreguntas';

/**
 * ============================================================================
 * ARQUITECTURA DE ESTADO GLOBAL (Contexto de Cuentas — Panel de Administración)
 * ============================================================================
 * Ubicación: src/context/ContextoCuentas.jsx
 * Carpeta en Inglés, Archivo en Español.
 *
 * Gestiona la lista de cuentas de funcionarios del CESFAM (creación, envío del
 * correo de acceso, revocación) y el registro de atenciones realizadas, que
 * alimenta las métricas, los filtros y los gráficos del panel.
 *
 * NOTA (temporal): el estado se mantiene en memoria con datos simulados.
 * En la siguiente etapa se reemplaza por Supabase:
 *   - `crearCuenta` → `supabase.auth.admin.inviteUserByEmail` + insert en `cuentas`.
 *     El usuario recibe un correo para definir su contraseña (por eso aquí solo
 *     se piden nombre y email; nunca una contraseña).
 *   - `enviarCorreo` → reenvío del correo de invitación / acceso.
 *   - `revocarCuenta` → borrado (o baja lógica) de la fila.
 *   - `atenciones` → hoy es una lista simulada; luego será `select` sobre la
 *     tabla `atenciones` (una fila por atención).
 * Forma de una cuenta: id, nombre, email, rol, estadoInvitacion, creadaEn, correoEnviadoEn.
 * Forma de una atención: id, funcionarioId, fecha (ISO YYYY-MM-DD), tipoConsulta, tipoAtencion.
 */

const ContextoCuentas = createContext(undefined);

/** Roles posibles de una cuenta. */
export const ROLES = {
  PENDIENTE: 'pendiente',
  FUNCIONARIO: 'funcionario',
};

/** Estado del flujo de invitación / creación de contraseña. */
export const ESTADOS_INVITACION = {
  ENVIADA: 'enviada', // correo enviado, el usuario aún no define su contraseña
  ACTIVA: 'activa', // el usuario ya creó su contraseña
};

/** Tipo de profesional CESFAM que realiza la atención (para el filtro "Tipo de atención"). */
export const TIPOS_ATENCION = [
  'Matrona',
  'Doctor general',
  'Somatometría',
  'Enfermería',
  'Nutrición',
  'Psicología',
];

/**
 * Tipo de consulta del paciente. Se reutiliza el vocabulario de preguntas ya
 * definido para el flujo de atención (ContextoPreguntas.PREGUNTAS_PREDETERMINADAS).
 */
export const TIPOS_CONSULTA = PREGUNTAS_PREDETERMINADAS;

/** Rango de años disponible para el filtro (simulado). */
export const ANIOS_DISPONIBLES = [2024, 2025, 2026];

/** Datos simulados iniciales de cuentas (se reemplazan por `select` de Supabase). */
export const CUENTAS_SIMULADAS = [
  {
    id: 'c-001',
    nombre: 'Diego Robert',
    email: 'diego.robert@cesfam.cl',
    rol: ROLES.FUNCIONARIO,
    estadoInvitacion: ESTADOS_INVITACION.ACTIVA,
    creadaEn: '2026-02-10T09:00:00.000Z',
    correoEnviadoEn: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'c-002',
    nombre: 'Ariel Valverde',
    email: 'ariel.valverde@cesfam.cl',
    rol: ROLES.FUNCIONARIO,
    estadoInvitacion: ESTADOS_INVITACION.ACTIVA,
    creadaEn: '2026-02-10T09:05:00.000Z',
    correoEnviadoEn: '2026-02-10T09:05:00.000Z',
  },
  {
    id: 'c-003',
    nombre: 'Martín Quiroga',
    email: 'martin.quiroga@cesfam.cl',
    rol: ROLES.FUNCIONARIO,
    estadoInvitacion: ESTADOS_INVITACION.ACTIVA,
    creadaEn: '2026-03-01T14:20:00.000Z',
    correoEnviadoEn: '2026-03-01T14:20:00.000Z',
  },
  {
    id: 'c-004',
    nombre: 'Camila Fuentes',
    email: 'camila.fuentes@cesfam.cl',
    rol: ROLES.FUNCIONARIO,
    estadoInvitacion: ESTADOS_INVITACION.ENVIADA,
    creadaEn: '2026-03-12T08:30:00.000Z',
    correoEnviadoEn: '2026-03-12T08:30:00.000Z',
  },
];

/**
 * Construye un set determinista de atenciones simuladas repartidas entre los
 * funcionarios, meses y años. Reemplazable por un `select` a Supabase.
 */
const construirAtencionesSimuladas = () => {
  const plan = [
    { funcionarioId: 'c-001', cantidad: 42 },
    { funcionarioId: 'c-002', cantidad: 37 },
    { funcionarioId: 'c-003', cantidad: 28 },
    { funcionarioId: 'c-004', cantidad: 6 },
  ];

  const atenciones = [];
  let n = 0;

  plan.forEach(({ funcionarioId, cantidad }) => {
    for (let i = 0; i < cantidad; i += 1) {
      n += 1;
      const anio = ANIOS_DISPONIBLES[n % ANIOS_DISPONIBLES.length];
      const mes = 1 + ((n * 7) % 12);
      const dia = 1 + ((n * 3) % 27);
      atenciones.push({
        id: `a-${n}`,
        funcionarioId,
        fecha: `${anio}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`,
        tipoConsulta: TIPOS_CONSULTA[n % TIPOS_CONSULTA.length],
        tipoAtencion: TIPOS_ATENCION[n % TIPOS_ATENCION.length],
      });
    }
  });

  return atenciones;
};

export const ATENCIONES_SIMULADAS = construirAtencionesSimuladas();

const EXPRESION_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Genera un id local temporal (Supabase entregará el UUID real). */
const generarIdLocal = () =>
  `c-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

export const ProveedorCuentas = ({ children }) => {
  const [cuentas, setCuentas] = useState(CUENTAS_SIMULADAS);
  const [atenciones, setAtenciones] = useState(ATENCIONES_SIMULADAS);

  /**
   * Crea una cuenta de funcionario con los datos ingresados por el administrador.
   * Valida los campos y el email duplicado. Devuelve { ok, error?, cuenta? }.
   * (Futuro: invitar por correo vía Supabase para que el usuario cree su contraseña.)
   */
  const crearCuenta = useCallback(
    ({ nombre, email }) => {
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

      const ahora = new Date().toISOString();
      const nuevaCuenta = {
        id: generarIdLocal(),
        nombre: nombreLimpio,
        email: emailLimpio,
        rol: ROLES.FUNCIONARIO,
        estadoInvitacion: ESTADOS_INVITACION.ENVIADA,
        creadaEn: ahora,
        correoEnviadoEn: ahora,
      };

      setCuentas((previas) => [...previas, nuevaCuenta]);
      return { ok: true, cuenta: nuevaCuenta };
    },
    [cuentas]
  );

  /** Envía (o reenvía) el correo de acceso. Simulado: solo actualiza la fecha. */
  const enviarCorreo = useCallback((idCuenta) => {
    setCuentas((previas) =>
      previas.map((cuenta) =>
        cuenta.id === idCuenta
          ? { ...cuenta, correoEnviadoEn: new Date().toISOString() }
          : cuenta
      )
    );
  }, []);

  /** Revoca (elimina) una cuenta y sus atenciones asociadas. */
  const revocarCuenta = useCallback((idCuenta) => {
    setCuentas((previas) => previas.filter((cuenta) => cuenta.id !== idCuenta));
    setAtenciones((previas) => previas.filter((a) => a.funcionarioId !== idCuenta));
  }, []);

  /** Cambia el rol de una cuenta puntual (se usará en la fase de Supabase). */
  const cambiarRolCuenta = useCallback((idCuenta, nuevoRol) => {
    setCuentas((previas) =>
      previas.map((cuenta) =>
        cuenta.id === idCuenta ? { ...cuenta, rol: nuevoRol } : cuenta
      )
    );
  }, []);

  const otorgarFuncionario = useCallback(
    (idCuenta) => cambiarRolCuenta(idCuenta, ROLES.FUNCIONARIO),
    [cambiarRolCuenta]
  );

  const revocarFuncionario = useCallback(
    (idCuenta) => cambiarRolCuenta(idCuenta, ROLES.PENDIENTE),
    [cambiarRolCuenta]
  );

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
