import { describe, it, expect } from 'vitest';
import {
  DURACION_GRABACION_S,
  PREPARACION_S,
  UMBRAL_CONFIANZA_BAJA,
  CONTEXTOS_RECONOCIMIENTO,
  CONTEXTO_POR_PREGUNTA,
  obtenerContextoDePregunta,
} from '../constants/contextosReconocimiento';

describe('Pruebas Unitarias — contextosReconocimiento', () => {
  it('define parámetros temporales y umbral de confianza válidos', () => {
    expect(DURACION_GRABACION_S).toBe(6);
    expect(PREPARACION_S).toBe(3);
    expect(UMBRAL_CONFIANZA_BAJA).toBeGreaterThan(0);
    expect(UMBRAL_CONFIANZA_BAJA).toBeLessThan(1);
  });

  it('incluye las 4 respuestas generales en cada contexto sin perder sus clases específicas', () => {
    const contextos = Object.keys(CONTEXTOS_RECONOCIMIENTO);
    expect(contextos).toEqual([
      'comunicacion',
      'gestion',
      'motivo',
      'profesional',
      'sintomas',
    ]);

    let totalClases = 0;
    const conjuntoUnico = new Set();
    for (const ctx of contextos) {
      const clases = CONTEXTOS_RECONOCIMIENTO[ctx];
      expect(clases).toHaveLength(ctx === 'comunicacion' ? 4 : 8);
      expect(new Set(clases).size).toBe(clases.length);
      expect(clases).toEqual(expect.arrayContaining(['Sí', 'No', 'No entiendo', 'Por favor']));
      for (const c of clases) {
        expect(typeof c).toBe('string');
        expect(c.trim().length).toBeGreaterThan(0);
        conjuntoUnico.add(c);
        totalClases += 1;
      }
    }
    expect(totalClases).toBe(36);
    expect(conjuntoUnico.size).toBe(20);
  });

  it('mapea todas las preguntas predeterminadas hacia un contexto existente', () => {
    for (const [pregunta, ctx] of Object.entries(CONTEXTO_POR_PREGUNTA)) {
      expect(CONTEXTOS_RECONOCIMIENTO).toHaveProperty(ctx);
      expect(obtenerContextoDePregunta(pregunta)).toBe(ctx);
    }
  });

  it('obtenerContextoDePregunta devuelve el contexto esperado para cada pregunta CESFAM', () => {
    expect(obtenerContextoDePregunta('¿A qué viene hoy?')).toBe('motivo');
    expect(obtenerContextoDePregunta('¿Tiene hora agendada?')).toBe('gestion');
    expect(obtenerContextoDePregunta('¿Con qué profesional?')).toBe('profesional');
    expect(obtenerContextoDePregunta('¿Tiene algún síntoma?')).toBe('sintomas');
  });

  it('obtenerContextoDePregunta devuelve null para preguntas libres o entradas inválidas', () => {
    expect(obtenerContextoDePregunta('¿Cuál es su RUT?')).toBeNull();
    expect(obtenerContextoDePregunta('')).toBeNull();
    expect(obtenerContextoDePregunta(null)).toBeNull();
    expect(obtenerContextoDePregunta(undefined)).toBeNull();
  });
});
