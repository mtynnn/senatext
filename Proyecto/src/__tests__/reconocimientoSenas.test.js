import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ErrorReconocimiento,
  modoSimulado,
  verificarSalud,
  reconocerSena,
} from '../services/reconocimientoSenas';

describe('Pruebas Unitarias — reconocimientoSenas', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('ErrorReconocimiento hereda de Error y conserva mensaje y código', () => {
    const err = new ErrorReconocimiento('Fallo de prueba', 'http');
    expect(err).toBeInstanceOf(Error);
    expect(err.name).toBe('ErrorReconocimiento');
    expect(err.message).toBe('Fallo de prueba');
    expect(err.codigo).toBe('http');
  });

  it('modoSimulado es true si VITE_MODO_SIMULADO=true o no hay URL', () => {
    vi.stubEnv('VITE_MODO_SIMULADO', 'true');
    vi.stubEnv('VITE_URL_RECONOCEDOR', 'https://api.senatext.test');
    expect(modoSimulado()).toBe(true);

    vi.stubEnv('VITE_MODO_SIMULADO', 'false');
    vi.stubEnv('VITE_URL_RECONOCEDOR', '');
    expect(modoSimulado()).toBe(true);
  });

  it('modoSimulado es false cuando VITE_MODO_SIMULADO=false y hay URL configurada', () => {
    vi.stubEnv('VITE_MODO_SIMULADO', 'false');
    vi.stubEnv('VITE_URL_RECONOCEDOR', 'https://api.senatext.test/');
    expect(modoSimulado()).toBe(false);
  });

  it('verificarSalud lanza código sin_url cuando falta VITE_URL_RECONOCEDOR', async () => {
    vi.stubEnv('VITE_URL_RECONOCEDOR', '');
    await expect(verificarSalud()).rejects.toMatchObject({
      name: 'ErrorReconocimiento',
      codigo: 'sin_url',
    });
  });

  it('verificarSalud consulta GET /salud normalizando barras finales y devuelve JSON', async () => {
    vi.stubEnv('VITE_URL_RECONOCEDOR', 'https://api.senatext.test///');
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true, version: '1.0.0' }),
    });

    const res = await verificarSalud();
    expect(res).toEqual({ ok: true, version: '1.0.0' });
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.senatext.test/salud',
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );
  });

  it('reconocerSena envía POST /reconocer con FormData (video + contexto) y retorna predicción', async () => {
    vi.stubEnv('VITE_URL_RECONOCEDOR', 'https://api.senatext.test');
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ palabra: 'Dolor', confianza: 0.88, contexto: 'sintomas' }),
    });

    const blob = new Blob(['video-simulado'], { type: 'video/mp4' });
    const res = await reconocerSena(blob, 'sintomas');

    expect(res).toEqual({ palabra: 'Dolor', confianza: 0.88, contexto: 'sintomas' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toBe('https://api.senatext.test/reconocer');
    expect(opts.method).toBe('POST');
    expect(opts.body).toBeInstanceOf(FormData);
    expect(opts.body.get('contexto')).toBe('sintomas');
    expect(opts.body.get('video').name).toBe('sena.mp4');
  });

  it('reconocerSena maneja errores HTTP 400 (con detalle), 413 y 500 correctamente', async () => {
    vi.stubEnv('VITE_URL_RECONOCEDOR', 'https://api.senatext.test');
    const blob = new Blob(['x'], { type: 'video/webm' });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'video corrupto' }),
    });
    await expect(reconocerSena(blob, 'motivo')).rejects.toMatchObject({
      codigo: 'http',
      message: expect.stringContaining('video corrupto'),
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 413,
      json: async () => ({}),
    });
    await expect(reconocerSena(blob, 'motivo')).rejects.toMatchObject({
      codigo: 'http',
      message: expect.stringContaining('demasiado grande'),
    });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });
    await expect(reconocerSena(blob, 'motivo')).rejects.toMatchObject({
      codigo: 'http',
      message: expect.stringContaining('error interno'),
    });
  });

  it('reconocerSena lanza código respuesta cuando el servidor devuelve JSON inválido', async () => {
    vi.stubEnv('VITE_URL_RECONOCEDOR', 'https://api.senatext.test');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      },
    });
    const blob = new Blob(['x'], { type: 'video/webm' });
    await expect(reconocerSena(blob, 'gestion')).rejects.toMatchObject({
      codigo: 'respuesta',
    });
  });

  it('reconocerSena lanza código red ante fallo de conexión', async () => {
    vi.stubEnv('VITE_URL_RECONOCEDOR', 'https://api.senatext.test');
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));
    const blob = new Blob(['x'], { type: 'video/webm' });
    await expect(reconocerSena(blob, 'profesional')).rejects.toMatchObject({
      codigo: 'red',
    });
  });
});
