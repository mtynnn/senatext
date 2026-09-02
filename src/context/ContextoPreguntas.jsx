import React, { createContext, useContext, useState } from 'react';

/**
 * ============================================================================
 * ARQUITECTURA DE ESTADO GLOBAL (Contexto de Preguntas y Traducción)
 * ============================================================================
 * Ubicación: src/context/ContextoPreguntas.jsx
 * Carpeta en Inglés, Archivo en Español.
 * 
 * Gestiona la sincronización en tiempo real entre la pantalla del Funcionario
 * del CESFAM y la pantalla del Paciente.
 */

const ContextoPreguntas = createContext(undefined);

export const PREGUNTAS_PREDETERMINADAS = [
  "¿A qué viene hoy?",
  "¿Tiene hora agendada?",
  "¿Con qué profesional?",
  "¿Tiene algún síntoma?",
  "¿Entendió la indicación?"
];

export const ProveedorPreguntas = ({ children }) => {
  const [preguntaActiva, setPreguntaActiva] = useState("¿A qué viene hoy?");
  const [textoReconocido, setTextoReconocido] = useState("Dolor de estómago");
  const [mensajeEstado, setMensajeEstado] = useState("Esperando más información del paciente...");
  const [camaraActiva, setCamaraActiva] = useState(true);
  const [preguntas, setPreguntas] = useState(PREGUNTAS_PREDETERMINADAS);

  const agregarPreguntaLibre = (nuevaPregunta) => {
    if (!nuevaPregunta || nuevaPregunta.trim() === '') return;
    const preguntaFormateada = nuevaPregunta.trim();
    if (!preguntas.includes(preguntaFormateada)) {
      setPreguntas((previas) => [...previas, preguntaFormateada]);
    }
    setPreguntaActiva(preguntaFormateada);
  };

  const actualizarTraduccion = (texto, estado = "Traducción activa en tiempo real") => {
    setTextoReconocido(texto);
    setMensajeEstado(estado);
  };

  const valorContexto = {
    preguntaActiva,
    setPreguntaActiva,
    textoReconocido,
    setTextoReconocido,
    mensajeEstado,
    setMensajeEstado,
    camaraActiva,
    setCamaraActiva,
    preguntas,
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
