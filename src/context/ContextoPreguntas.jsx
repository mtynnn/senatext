import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * ============================================================================
 * ARQUITECTURA DE ESTADO GLOBAL (Contexto de Preguntas y Traducción)
 * ============================================================================
 * Ubicación: src/context/ContextoPreguntas.jsx
 * 
 * Gestiona la sincronización en tiempo real entre la pantalla del Funcionario
 * del CESFAM y la pantalla del Paciente.
 */

const ContextoPreguntas = createContext(undefined);

export const PREGUNTAS_PREDETERMINADAS = [
  "¿A qué viene hoy?",
  "¿Tiene hora agendada?",
  "¿Con qué profesional?",
  "¿Tiene algún síntoma?"
];

export const ProveedorPreguntas = ({ children }) => {
  const [preguntaActivaState, setPreguntaActivaState] = useState("¿A qué viene hoy?");
  const [textoReconocidoState, setTextoReconocidoState] = useState("Dolor de estómago");
  const [mensajeEstadoState, setMensajeEstadoState] = useState("Esperando más información del paciente...");
  const [camaraActivaState, setCamaraActivaState] = useState(true);
  const [preguntasState, setPreguntasState] = useState(PREGUNTAS_PREDETERMINADAS);

  // Sincronización entre pestañas usando BroadcastChannel
  useEffect(() => {
    const channel = new BroadcastChannel('senatext_sync_channel');
    
    channel.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === 'SYNC_CAMARA') setCamaraActivaState(payload);
      if (type === 'SYNC_PREGUNTA_ACTIVA') setPreguntaActivaState(payload);
      if (type === 'SYNC_TEXTO_RECONOCIDO') setTextoReconocidoState(payload);
      if (type === 'SYNC_MENSAJE_ESTADO') setMensajeEstadoState(payload);
      if (type === 'SYNC_PREGUNTAS') setPreguntasState(payload);
    };

    return () => {
      channel.close();
    };
  }, []);

  const broadcast = (type, payload) => {
    const channel = new BroadcastChannel('senatext_sync_channel');
    channel.postMessage({ type, payload });
    channel.close();
  };

  const setCamaraActiva = (estado) => {
    setCamaraActivaState(estado);
    broadcast('SYNC_CAMARA', estado);
  };

  const setPreguntaActiva = (pregunta) => {
    setPreguntaActivaState(pregunta);
    broadcast('SYNC_PREGUNTA_ACTIVA', pregunta);
  };

  const setTextoReconocido = (texto) => {
    setTextoReconocidoState(texto);
    broadcast('SYNC_TEXTO_RECONOCIDO', texto);
  };

  const setMensajeEstado = (mensaje) => {
    setMensajeEstadoState(mensaje);
    broadcast('SYNC_MENSAJE_ESTADO', mensaje);
  };

  const setPreguntas = (nuevasPreguntas) => {
    setPreguntasState(nuevasPreguntas);
    broadcast('SYNC_PREGUNTAS', nuevasPreguntas);
  };

  const agregarPreguntaLibre = (nuevaPregunta) => {
    if (!nuevaPregunta || nuevaPregunta.trim() === '') return;
    const preguntaFormateada = nuevaPregunta.trim();
    if (!preguntasState.includes(preguntaFormateada)) {
      const actualizadas = [...preguntasState, preguntaFormateada];
      setPreguntas(actualizadas);
    }
    setPreguntaActiva(preguntaFormateada);
  };

  const actualizarTraduccion = (texto, estado = "Traducción activa en tiempo real") => {
    setTextoReconocido(texto);
    setMensajeEstado(estado);
  };

  const valorContexto = {
    preguntaActiva: preguntaActivaState,
    setPreguntaActiva,
    textoReconocido: textoReconocidoState,
    setTextoReconocido,
    mensajeEstado: mensajeEstadoState,
    setMensajeEstado,
    camaraActiva: camaraActivaState,
    setCamaraActiva,
    preguntas: preguntasState,
    agregarPreguntaLibre,
    actualizarTraduccion,
  };

  return (
    <ContextoPreguntas.Provider value={valorContexto}>
      {children}
    </ContextoPreguntas.Provider>
  );
};

export const usarContextoPreguntas = () => {
  const contexto = useContext(ContextoPreguntas);
  if (!contexto) {
    throw new Error('usarContextoPreguntas debe ser utilizado dentro de un ProveedorPreguntas');
  }
  return contexto;
};