/**
 * ============================================================================
 * CONSTANTES DEL RECONOCEDOR DE SEÑAS (contextos, vocabulario y parámetros)
 * ============================================================================
 * Ubicación: src/constants/contextosReconocimiento.js
 * Carpeta en inglés (constants), archivo en español.
 */

// Duración del clip que se graba y se envía al reconocedor (corte automático).
export const DURACION_GRABACION_S = 6;

// Cuenta de preparación ("Prepárate") en /paciente antes de empezar a grabar.
export const PREPARACION_S = 3;

// PROVISIONAL, sin calibrar: por debajo de este margen relativo se avisa al usuario
// que conviene repetir la seña. No es una probabilidad ni una precisión.
export const UMBRAL_CONFIANZA_BAJA = 0.15;

// Los 5 contextos del reconocedor con sus 4 clases cada uno (20 clases en total).
export const CONTEXTOS_RECONOCIMIENTO = {
  comunicacion: ['Sí', 'No', 'No entiendo', 'Por favor'],
  gestion: ['Tengo hora', 'Solicitar hora', 'Receta médica', 'Retiro de medicamentos'],
  motivo: ['Control Niño Sano', 'Control de adulto', 'Consulta médica', 'Farmacia'],
  profesional: ['Médico/a', 'Matrona', 'Dentista', 'Enfermero/a'],
  sintomas: ['Dolor', 'Malestar general', 'Fiebre', 'Alergia'],
};

// Mapeo pregunta preparada (PREGUNTAS_PREDETERMINADAS) -> contexto del reconocedor.
// Las preguntas libres no tienen contexto: no se puede reconocer la seña para ellas.
export const CONTEXTO_POR_PREGUNTA = {
  '¿A qué viene hoy?': 'motivo',
  // SIN CONFIRMAR: se asume "gestion" porque incluye "Tengo hora"; no validado con el equipo.
  '¿Tiene hora agendada?': 'gestion',
  '¿Con qué profesional?': 'profesional',
  '¿Tiene algún síntoma?': 'sintomas',
};

// Devuelve el contexto de una pregunta preparada, o null si es una pregunta libre.
export const obtenerContextoDePregunta = (pregunta) => CONTEXTO_POR_PREGUNTA[pregunta] ?? null;
