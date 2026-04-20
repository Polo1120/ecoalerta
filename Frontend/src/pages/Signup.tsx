import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const { signup, isSignupLoading: isLoading, signupError: error } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (name.trim().length < 2 || name.trim().length > 100) {
      setLocalError('El nombre debe tener a menos 2 caracteres.');
      return;
    }

    if (password.length < 8) {
      setLocalError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (!/\d/.test(password)) {
      setLocalError('La contraseña debe contener al menos un número.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden.');
      return;
    }

    signup({ name: name.trim(), email: email.trim(), password });
  };

  const getBackendError = () => {
    if (!error) return '';
    const detail = (error as any).response?.data?.detail;
    if (Array.isArray(detail)) return detail[0]?.msg || 'Error de validación.';
    if (typeof detail === 'string') {
      if (detail.toLowerCase().includes('already registered') || detail.toLowerCase().includes('unique') || detail.toLowerCase().includes('ya registrado')) {
        return 'Ya existe una cuenta con este correo electrónico.';
      }
      return detail;
    }
    return 'Error al intentar registrarse. Intenta nuevamente.';
  };

  const errorMsg = localError || getBackendError();

  return (
    <div className="min-h-screen flex items-center justify-center  p-4">

      <div className="relative w-full max-w-md z-10">
        {/* Card */}
        <div className="bg-white p-9 rounded-[12px] shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold text-(--text-color-black) mb-3">
              Crear Cuenta
            </h1>
            <p className="text-(--text-color-black) text-sm">Únete a EcoAlerta y reporta incidencias
              ambientales.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm text-center font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            <input
              name='name'
              id='name'
              autoComplete='name'
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full input-primary mb-4"
              placeholder="Ej. Juan Pérez"
              required
            />



            <input
              name='email'
              id='email'
              autoComplete='email'
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full input-primary mb-4"
              placeholder="nombre@ejemplo.com"
              required
            />



            <div className="relative mb-4">
              <input
                name='password'
                id='password'
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full input-primary !pr-12"
                placeholder="Crea una contraseña segura"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[54%] -translate-y-1/2 text-zinc-400 hover:text-zinc-200 focus:outline-none"
              >
                <i className={`text-lg ${showPassword ? 'icon-contra-ojo1' : 'icon-contra-ojo'}`}></i>
              </button>
            </div>

            <div className="relative mb-4">
              <input
                name='confirmPassword'
                id='confirmPassword'
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full input-primary !pr-12"
                placeholder="Vuelve a escribir la contraseña"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-[54%] -translate-y-1/2 text-zinc-400 hover:text-zinc-200 focus:outline-none"
              >
                <i className={`text-lg ${showConfirmPassword ? 'icon-contra-ojo1' : 'icon-contra-ojo'}`}></i>
              </button>
            </div>


            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary mt-7"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <span className="flex items-center font-bold">
                  Registrarme
                </span>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            Ya tengo una cuenta {' '}
            <Link to="/login" className="text-(--primary) font-bold">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
