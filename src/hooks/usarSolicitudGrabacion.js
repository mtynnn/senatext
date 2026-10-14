import { useEffect, useRef, useState } from 'react';
import { usarContextoPreguntas } from '../context/ContextoPreguntas';

const ESPERA_ACK_MS = 1500;
// Si la vista del paciente desaparece sin avisar, se libera el botón pasado este tiempo.
const VIGILANTE_FASE_MS = 150000;

/**
 * Lado del funcionario de la grabación remota. Envía SOLICITAR_GRABACION por el
 * BroadcastChannel existente y espera ACK_GRABACION de ContenedorCamara (/paciente).
 * `fase` refleja SYNC_FASE_GRABACION: inactivo | preparando | grabando | procesando.
 */
export const usarSolicitudGrabacion = () => {
  const { setMensajeEstado } = usarContextoPreguntas();
  const [fase, setFase] = useState('inactivo');
  const [esperandoAck, setEsperandoAck] = useState(false);
  const canalRef = useRef(null);
  const temporizadorAckRef = useRef(null);
  const vigilanteRef = useRef(null);

  const armarVigilante = (nuevaFase) => {
    clearTimeout(vigilanteRef.current);
    if (nuevaFase !== 'inactivo') {
      vigilanteRef.current = setTimeout(() => setFase('inactivo'), VIGILANTE_FASE_MS);
    }
  };

  useEffect(() => {
    const canal = new BroadcastChannel('senatext_sync_channel');
    canalRef.current = canal;
    canal.onmessage = (evento) => {
      const { type, payload } = evento.data || {};
      if (type === 'ACK_GRABACION') {
        clearTimeout(temporizadorAckRef.current);
        setEsperandoAck(false);
        setFase((actual) => (actual === 'inactivo' ? 'preparando' : actual));
        armarVigilante('preparando');
      }
      if (type === 'SYNC_FASE_GRABACION') {
        setFase(payload);
        armarVigilante(payload);
      }
    };
    return () => {
      clearTimeout(temporizadorAckRef.current);
      clearTimeout(vigilanteRef.current);
      canal.close();
      canalRef.current = null;
    };
  }, []);

  const solicitarGrabacion = (contexto) => {
    // Sin solicitudes dobles: ya hay una en curso o se espera el ACK de la anterior.
    if (!contexto || esperandoAck || fase !== 'inactivo' || !canalRef.current) return;
    setEsperandoAck(true);
    canalRef.current.postMessage({ type: 'SOLICITAR_GRABACION', payload: { contexto } });
    temporizadorAckRef.current = setTimeout(() => {
      setEsperandoAck(false);
      setMensajeEstado('No hay una vista de paciente abierta con la cámara encendida');
    }, ESPERA_ACK_MS);
  };

  return { fase, esperandoAck, solicitarGrabacion };
};
