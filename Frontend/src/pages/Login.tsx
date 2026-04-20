import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const { login, isLoginLoading: isLoading, loginError: error } = useAuth();
  const location = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setLocalError('Por favor, ingresa un correo electrónico válido.');
      return;
    }

    login({ email, password });
  };

  const getBackendError = () => {
    if (!error) return '';
    const status = (error as any).response?.status;
    const detail = (error as any).response?.data?.detail;


    if (status === 401 || (typeof detail === 'string' && (detail.toLowerCase().includes('incorrect') || detail.toLowerCase().includes('invalid')))) {
      return 'Correo electrónico o contraseña incorrectos.';
    }

    if (Array.isArray(detail)) return detail[0]?.msg || 'Error en los datos ingresados.';
    if (typeof detail === 'string') return detail;

    return 'Error de conexión con el servidor. Intenta nuevamente.';
  };

  const errorMsg = localError || getBackendError();
  const successMsg = location.state?.registered ? 'Tu cuenta ha sido creada con éxito. Ahora puedes iniciar sesión.' : '';

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">


      <div className="relative w-full max-w-md z-10">
        {/* Card */}
        <div className="bg-white p-9 rounded-[12px] shadow-2xl">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <i className="icon-logo text-(--primary) text-4xl"></i>
              <h1 className="text-(--primary) ">
                EcoAlerta
              </h1>
            </div>

            <p className="text-(--text-color-black) text-3xl/[40px] font-bold">Iniciar Sesión</p>
          </div>

          {successMsg && (
            <div className="mb-6 p-4 bg-(--secondary)/10 border border-(--primary)/20 rounded-2xl text-(--secondary) text-sm text-center font-medium">
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
              <label htmlFor="email" className="text-(--text-color-black) block mb-2 ">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                autoComplete='email'
                onChange={(e) => setEmail(e.target.value)}
                className="w-full input-primary"
                placeholder="nombre@ejemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor='password' className="text-(--text-color-black)  block mb-2">Contraseña</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full input-primary !pr-12"
                  placeholder="Ingresa tu contraseña"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-[54%] -translate-y-1/2 text-(--text-color-placeholder) hover:text-black focus:outline-none"
                >
                  <i className={`text-lg ${showPassword ? 'icon-contra-ojo1' : 'icon-contra-ojo'}`}></i>
                </button>
              </div>
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
                <span className="flex items-center font-bold">
                  Ingresar
                </span>
              )}
            </button>
            <Link to="/signup" className="!bg-white  btn-primary  !text-(--primary) font-bold">Crear cuenta</Link>
          </form>
          <a href="#" className="text-sm flex mt-6 justify-center text-(--secondary) underline">¿Olvidaste tu contraseña?</a>
        </div>
      </div>
    </div>
  );
}

