import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Building2, ArrowLeft, AlertCircle, Loader2, Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { PiePagina } from '../components/common/PiePagina';
import { supabase } from '../lib/supabase';

const DOMINIOS_VALIDOS = ['@gmail.com', '@cesfam.com', '@cesfam.cl'];

export const LoginFuncionario = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const [errorCorreo, setErrorCorreo] = useState('');
  const [errorCredenciales, setErrorCredenciales] = useState(location.state?.mensajeError || '');
  const [cargando, setCargando] = useState(false);

  const esDominioValido = (email) => {
    const emailNormalizado = email.trim().toLowerCase();
    return DOMINIOS_VALIDOS.some((dominio) => emailNormalizado.endsWith(dominio));
  };

  const manejarCambioCorreo = (e) => {
    const valor = e.target.value;
    setCorreo(valor);
    setErrorCredenciales('');

    if (errorCorreo) {
      if (!valor.trim() || esDominioValido(valor)) {
        setErrorCorreo('');
      }
    }
  };

  const manejarBlurCorreo = () => {
    const valor = correo.trim();
    if (valor && !esDominioValido(valor)) {
      setErrorCorreo('Debe usar un correo @gmail.com o institucional @cesfam');
    } else {
      setErrorCorreo('');
    }
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setErrorCredenciales('');

    const emailNormalizado = correo.trim();
    if (!emailNormalizado || !password) {
      setErrorCredenciales('Por favor ingrese correo y contraseña.');
      return;
    }

    if (!esDominioValido(emailNormalizado)) {
      setErrorCorreo('Debe usar un correo @gmail.com o institucional @cesfam');
      return;
    }

    setErrorCorreo('');
    setCargando(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailNormalizado,
        password: password
      });

      if (error) {
        throw error;
      }

      if (emailNormalizado === 'admin@cesfam.com') {
        navigate('/admin');
      } else {
        navigate('/funcionario');
      }
    } catch (err) {
      console.error('Error de autenticación:', err);
      setErrorCredenciales('Credenciales incorrectas. Verifique su correo y contraseña.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-42px)] bg-slate-50 flex flex-col justify-between font-sans">
      <main className="max-w-md w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 my-auto">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center text-xs sm:text-sm text-slate-500 hover:text-blue-700 font-medium transition-colors"
            aria-label="Volver a la vista de inicio"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Volver al portal principal
          </Link>
        </div>

        <div className="bg-white rounded-md border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center py-1 mb-2">
              <img 
                src="/Logo oficcial-Photoroom.png" 
                alt="Logo SeñaText" 
                className="w-64 sm:w-80 md:w-[340px] max-w-full h-auto max-h-24 sm:max-h-28 object-contain mx-auto"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Portal Funcionario
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Ingrese con sus credenciales institucionales CESFAM
            </p>
          </div>

          {errorCredenciales && (
            <div 
              role="alert"
              className="mb-5 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-md text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in duration-200"
            >
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">
                {errorCredenciales}
              </div>
            </div>
          )}

          <form onSubmit={manejarSubmit} noValidate className="space-y-4">
            <div>
              <label 
                htmlFor="input-correo" 
                className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5"
              >
                Correo Corporativo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-correo"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={correo}
                  onChange={manejarCambioCorreo}
                  onBlur={manejarBlurCorreo}
                  placeholder="ejemplo@cesfam.cl o @gmail.com"
                  className={`w-full pl-9 pr-3 py-2 text-sm rounded-md border transition-colors outline-none ${
                    errorCorreo
                      ? 'border-red-400 bg-red-50/20 text-slate-900 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-slate-300 bg-white text-slate-800 hover:border-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100'
                  }`}
                />
              </div>
              {errorCorreo && (
                <p className="mt-1.5 text-xs text-red-600 font-medium flex items-center gap-1">
                  <span>{errorCorreo}</span>
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label 
                  htmlFor="input-password" 
                  className="block text-xs font-semibold text-slate-700 uppercase tracking-wider"
                >
                  Contraseña <span className="text-red-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">
                  (Demo: 123456)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-password"
                  name="password"
                  type={mostrarPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorCredenciales('');
                  }}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-sm rounded-md border border-slate-300 bg-white text-slate-800 hover:border-slate-400 focus:border-blue-700 focus:ring-2 focus:ring-blue-100 transition-colors outline-none"
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  tabIndex={-1}
                >
                  {mostrarPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={cargando}
                className="w-full py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 transition-colors duration-150 flex items-center justify-center gap-2 shadow-xs disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {cargando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando...</span>
                  </>
                ) : (
                  <span>Ingresar</span>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Acceso seguro cifrado para personal de salud</span>
          </div>
        </div>
      </main>

      <PiePagina />
    </div>
  );
};

export default LoginFuncionario;