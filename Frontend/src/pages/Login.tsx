import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { login, isLoginLoading: isLoading, loginError: error } = useAuth();
  const location = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  const errorMsg = error ? (error as any).response?.data?.detail || 'Error de conexión con el servidor. Intenta nuevamente.' : '';
  const successMsg = location.state?.registered ? 'Tu cuenta ha sido creada con éxito. Ahora puedes iniciar sesión.' : '';

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">


      <div className="relative w-full max-w-md z-10">
        {/* Card */}
        <div className="bg-white p-9 rounded-[12px] shadow-2xl">
          <div className="mb-6 text-center">
            <h1 className="text-4xl text-(--primary)">
              EcoAlerta
            </h1>
            <p className="text-black text-3xl/[40px]">Iniciar Sesión</p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm text-center font-medium">
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-black">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                autoComplete='email'
                onChange={(e) => setEmail(e.target.value)}
                className="w-full  bg-(--bg-input) border border-(--border-input) rounded-[8px] placeholder-(--text-color-placeholder)  px-3.5  py-3.5 text-black  "
                placeholder="nombre@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor='password' className="text-black">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}

                onChange={(e) => setPassword(e.target.value)}
                className="w-full  bg-(--bg-input) border border-(--border-input) rounded-[8px] placeholder-(--text-color-placeholder)  px-3.5  py-3.5 text-black "
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="flex items-center">
                  Iniciar Sesión
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </span>
              )}
            </button>
            <Link to="/signup" className="!bg-white  btn-primary  !text-(--primary)">Crear cuenta</Link>
          </form>



          <div className="flex items-center justify-between pt-1">
            <a href="#" className="text-sm text-emerald-400 font-medium hover:text-emerald-300 transition-colors">¿Olvidaste tu contraseña?</a>
          </div>
        </div>
      </div>
    </div>
  );
}

