import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signup, isSignupLoading: isLoading, signupError: error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup({ name, email, password });
  };

  const errorMsg = error ? (error as any).response?.data?.detail || 'Error al intentar registrarse. Intenta nuevamente.' : '';

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">
      {/* Decorative backdrop */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] right-[20%] w-[35%] h-[35%] rounded-full bg-emerald-500/15 blur-[120px]" />
        <div className="absolute bottom-[20%] left-[20%] w-[35%] h-[35%] rounded-full bg-blue-500/15 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md z-10">
        {/* Card */}
        <div className="bg-white p-9 rounded-[12px] shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500 mb-3">
              EcoAlerta
            </h1>
            <p className="text-zinc-400 text-sm">Crea una cuenta nueva para empezar</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center font-medium">
              {Array.isArray(errorMsg) ? errorMsg[0].msg : errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 ml-1">Nombre Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full  border border-zinc-800 rounded-2xl px-5 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                placeholder="Ej. Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 ml-1">Correo electrónico</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full  border border-zinc-800 rounded-2xl px-5 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                placeholder="nombre@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-zinc-300 ml-1">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-zinc-800 rounded-2xl px-5 py-3.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold flex items-center justify-center rounded-2xl px-4 py-4 mt-8 shadow-lg shadow-emerald-500/25 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="flex items-center">
                  Registrarse
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            ¿Ya tienes una cuenta? {' '}
            <Link to="/login" className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
