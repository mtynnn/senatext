import React, { useState } from 'react';
import { ArrowRight, Edit3, CheckCircle2, AlertCircle, Loader2, Video, VideoOff, Hand } from 'lucide-react';
import { usarContextoPreguntas } from '../../context/ContextoPreguntas';
import { usarSolicitudGrabacion } from '../../hooks/usarSolicitudGrabacion';
import { obtenerContextoDePregunta } from '../../constants/contextosReconocimiento';
import { modoSimulado } from '../../services/reconocimientoSenas';
import { usarAuth } from '../../context/ContextoAuth';
import { supabase } from '../../lib/supabase';

/**
 * ============================================================================
 * COMPONENTE: ControlesAccion (Vista Funcionario)
 * ============================================================================
 * Ubicación: src/components/official/ControlesAccion.jsx
 * Carpeta en Inglés (components/official), Archivo en Español (ControlesAccion.jsx).
 */
export const ControlesAccion = () => {
  const { preguntaActiva, textoReconocido, setTextoReconocido, setMensajeEstado, camaraActiva, setCamaraActiva } = usarContextoPreguntas();
  const { usuario } = usarAuth();
  const [estaEditando, setEstaEditando] = useState(false);
  const [textoManual, setTextoManual] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [notificacion, setNotificacion] = useState(null);

  // Grabación remota: el funcionario pide a /paciente que grabe la seña.
  const simulado = modoSimulado();
  const contextoReconocimiento = obtenerContextoDePregunta(preguntaActiva);
  const { fase: faseGrabacion, esperandoAck, solicitarGrabacion } = usarSolicitudGrabacion();
  const grabacionEnCurso = esperandoAck || faseGrabacion !== 'inactivo';
  const etiquetaGrabacion = esperandoAck ? 'Solicitando...'
    : faseGrabacion === 'preparando' ? 'Preparando...'
    : faseGrabacion === 'grabando' ? 'Grabando...'
    : faseGrabacion === 'procesando' ? 'Procesando...'
    : 'Grabar seña';

  const manejarEdicion = () => {
    setTextoManual(textoReconocido);
    setEstaEditando(true);
  };

  const guardarEdicion = (evento) => {
    evento.preventDefault();
    if (textoManual.trim()) {
      setTextoReconocido(textoManual.trim());
      setMensajeEstado('Texto corregido manualmente por el funcionario');
      setEstaEditando(false);
    }
  };

  const registrarSintoma = async () => {
    if (!textoReconocido || textoReconocido.trim() === '') {
      setNotificacion({ tipo: 'error', mensaje: 'No hay texto reconocido para registrar.' });
      setTimeout(() => setNotificacion(null), 3500);
      return;
    }

    setGuardando(true);
    try {
      // 1. Obtener o crear una atención activa en la sesión del navegador
      let idAtencion = sessionStorage.getItem('senatext_atencion_activa_id');

      if (!idAtencion) {
        const { data: nuevaAtencion, error: errorAtencion } = await supabase
          .from('atenciones')
          .insert([
            {
              funcionario_id: usuario?.id || null,
              nombre_paciente: 'Paciente CESFAM',
              estado: 'en_curso',
            }
          ])
          .select('id')
          .single();

        if (errorAtencion) {
          console.error('Error al iniciar atención en Supabase:', errorAtencion);
          throw new Error(errorAtencion.message);
        }

        idAtencion = nuevaAtencion.id;
        sessionStorage.setItem('senatext_atencion_activa_id', idAtencion);
      }

      // 2. Buscar si la pregunta existe en el catálogo para asociar su ID
      let idPregunta = null;
      try {
        const { data: preguntaBd } = await supabase
          .from('preguntas')
          .select('id')
          .ilike('texto', `%${preguntaActiva?.replace('¿', '').replace('?', '').trim()}%`)
          .limit(1)
          .maybeSingle();

        if (preguntaBd?.id) {
          idPregunta = preguntaBd.id;
        }
      } catch (errPregunta) {
        console.warn('No se pudo resolver pregunta_id, continuando con null:', errPregunta);
      }

      // 3. Buscar si la seña/respuesta existe en el catálogo de vocabulario
      let idVocabulario = null;
      try {
        const { data: vocBd } = await supabase
          .from('vocabulario')
          .select('id')
          .ilike('termino', `%${textoReconocido.trim()}%`)
          .limit(1)
          .maybeSingle();

        if (vocBd?.id) {
          idVocabulario = vocBd.id;
        }
      } catch (errVoc) {
        console.warn('No se pudo resolver vocabulario_id, continuando con null:', errVoc);
      }

      // 4. Registrar la interacción correspondiente a la respuesta del paciente
      const { error: errorInteraccion } = await supabase
        .from('interacciones')
        .insert([
          {
            atencion_id: idAtencion,
            pregunta_id: idPregunta,
            vocabulario_id: idVocabulario,
            confirmada: true,
            nivel_confianza: 0.95,
          }
        ]);

      if (errorInteraccion) {
        console.error('Error al registrar interacción en Supabase:', errorInteraccion);
        throw new Error(errorInteraccion.message);
      }

      setNotificacion({
        tipo: 'exito',
        mensaje: `Respuesta "${textoReconocido}" registrada con éxito en Supabase.`
      });
      setMensajeEstado('Interacción guardada en la base de datos. Esperando nueva seña.');
    } catch (err) {
      console.error('Error general al conectar con Supabase:', err);
      setNotificacion({
        tipo: 'error',
        mensaje: `Error al guardar en Supabase: ${err.message || 'Error de conexión'}`
      });
    } finally {
      setGuardando(false);
      setTimeout(() => setNotificacion(null), 4000);
    }
  };

  return (
    <div className="flex flex-col items-end gap-3 pt-6 border-t border-slate-100">
      {notificacion && (
        <div className={`border text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm ${
          notificacion.tipo === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-800 animate-bounce'
        }`}>
          {notificacion.tipo === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{notificacion.mensaje}</span>
        </div>
      )}

      {!estaEditando && !simulado && !contextoReconocimiento && (
        <p className="text-xs text-slate-500">Elige una pregunta preparada para reconocer la seña</p>
      )}

      {estaEditando ? (
        <form onSubmit={guardarEdicion} className="flex items-center gap-2 w-full max-w-md">
          <input
            type="text"
            value={textoManual}
            onChange={(e) => setTextoManual(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-sky-400 focus:ring-2 focus:ring-sky-500 outline-none"
            placeholder="Escriba la corrección..."
            autoFocus
          />
          <button
            type="submit"
            className="bg-sky-600 text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            Guardar
          </button>
          <button
            type="button"
            onClick={() => setEstaEditando(false)}
            className="bg-slate-200 text-slate-700 text-xs font-medium px-3 py-2 rounded-lg hover:bg-slate-300 transition-colors"
          >
            Cancelar
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={() => solicitarGrabacion(contextoReconocimiento)}
            disabled={simulado || !contextoReconocimiento || grabacionEnCurso}
            title={simulado ? 'Modo simulado: el reconocedor no está activo' : undefined}
            className="px-4 py-2.5 rounded-xl bg-cesfam-500 hover:bg-cesfam-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 active:scale-98"
          >
            {grabacionEnCurso ? <Loader2 className="w-4 h-4 animate-spin" /> : <Hand className="w-4 h-4" />}
            <span>{etiquetaGrabacion}</span>
          </button>

          <button
            onClick={() => setCamaraActiva(!camaraActiva)}
            className={`px-4 py-2.5 rounded-xl border font-medium text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm active:scale-98 ${camaraActiva
                ? 'border-rose-300 text-rose-600 hover:bg-rose-50'
                : 'border-emerald-400 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
              }`}
          >
            {camaraActiva ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
            <span>{camaraActiva ? "Apagar Cámara" : "Encender Cámara"}</span>
          </button>

          <button
            onClick={manejarEdicion}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-all flex items-center gap-2 shadow-sm active:scale-98"
          >
            <Edit3 className="w-4 h-4 text-slate-500" />
            <span>Corregir</span>
          </button>

          <button
            onClick={registrarSintoma}
            disabled={guardando}
            className="px-5 py-2.5 rounded-xl bg-cesfam-900 hover:bg-cesfam-950 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 group active:scale-98"
          >
            {guardando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <span>Registrar síntoma</span>
                <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
