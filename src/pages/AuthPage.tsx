
import { useState } from 'react';
import { supabase } from '../supabaseClient';
import type { PageValue } from '../types';
import { Page } from '../types';  // Sin 'type' para Page, porque es valor
interface AuthPageProps {
    onNavigate: (page: PageValue) => void;
}

const AuthPage = ({ onNavigate }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (isLogin) {
      // Handle Login
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        onNavigate(Page.Dashboard);
      }
    } else {
      // Handle Sign Up
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: nombre, // Pasamos el nombre aquí para que el trigger lo pueda usar
          },
          // Redirigir al Deep Link de la App Nativa
          emailRedirectTo: 'com.guiacomercial.miapp://auth-callback'
        }
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        // En lugar de una alerta, mostramos un mensaje en la UI.
        setShowConfirmationMessage(true);
      }
    }
    setLoading(false);
  };

  if (showConfirmationMessage) {
    return (
      <div className="max-w-md mx-auto mt-10 text-center bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h2 className="text-2xl mb-4 font-bold">¡Registro casi completo!</h2>
        <p className="text-gray-700">
          Te hemos enviado un correo electrónico a <strong>{email}</strong>. 
          Por favor, haz clic en el enlace de confirmación para activar tu cuenta.
        </p>
        <p className="text-gray-500 text-sm mt-4">
          (Si no lo encuentras, revisa tu carpeta de spam)
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="flex border-b">
        <button
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 text-center font-semibold ${isLogin ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
        >
          Ingresar
        </button>
        <button
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 text-center font-semibold ${!isLogin ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}
        >
          Registrarse
        </button>
      </div>
      <form onSubmit={handleAuth} className="bg-white shadow-md rounded-b px-8 pt-6 pb-8">
        <h2 className="text-2xl mb-6 text-center font-bold">{isLogin ? 'Acceder' : 'Crear Cuenta'}</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        
        {!isLogin && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="nombre">
              Nombre Completo
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>
        )}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline disabled:bg-indigo-400"
        >
          {loading ? 'Procesando...' : (isLogin ? 'Ingresar' : 'Registrarse')}
        </button>
      </form>
    </div>
  );
};

export default AuthPage;
