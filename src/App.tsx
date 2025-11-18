import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import type { AuthSession } from '@supabase/supabase-js';
import { Page } from './types';
import type { Profile, Comercio, PageValue } from './types';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import type { PluginListenerHandle } from '@capacitor/core';

// Import Page Components
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import CreateComercioPage from './pages/CreateComercioPage';
import ComercioDetailPage from './pages/ComercioDetailPage';

// Import Reusable Components
import Header from './components/Header';

const App = () => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<PageValue>(Page.Home);
  const [selectedComercio, setSelectedComercio] = useState<Comercio | null>(null);

  useEffect(() => {
    // --- Listener para el Deep Link ---
    let appUrlListener: PluginListenerHandle | null = null;
    
    const setupDeepLinkListener = async () => {
      if (Capacitor.isNativePlatform()) {
        appUrlListener = await CapacitorApp.addListener('appUrlOpen', async (event) => {
          setIsVerifying(true);
          try {
            const url = new URL(event.url);
            const hash = url.hash.substring(1);
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');

            if (accessToken && refreshToken) {
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            }
          } catch (err) {
            console.error('Error en setSession desde deep link', err);
          } finally {
            setIsVerifying(false);
          }
        });
      }
    };
    
    setupDeepLinkListener();

    // --- Lógica de Autenticación Robusta ---
    
    // 1. Carga inicial de la sesión
    const checkInitialSession = async () => {
      try {
        // Verificar que Supabase esté configurado
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.error("❌ Variables de entorno de Supabase no configuradas");
          setError("Error de configuración: faltan las credenciales de Supabase. Revisa la consola.");
          setLoading(false);
          return;
        }

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error al obtener sesión:", sessionError);
          setLoading(false);
          return;
        }

        setSession(session);
        if (session) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) {
            console.error("Error al obtener perfil:", profileError);
          } else {
            setProfile(profileData as Profile);
          }
          setPage(Page.Dashboard);
        }
      } catch (error) {
        console.error("Error en la carga inicial de sesión:", error);
        setError("Error al conectar con el servidor. Verifica tu conexión a internet.");
      } finally {
        setLoading(false); // Garantiza que la carga inicial siempre termina
      }
    };

    checkInitialSession();

    // 2. Listener para cambios FUTUROS (login, logout)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        setIsVerifying(false);
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', newSession.user.id).single();
        setProfile(profileData as Profile);
        setPage(Page.Dashboard);
      } else {
        setProfile(null);
        setPage(Page.Home);
      }
    });

    return () => {
      if (appUrlListener) {
        appUrlListener.remove();
      }
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleNavigate = (newPage: PageValue, comercio?: Comercio) => {
    if (comercio) {
      setSelectedComercio(comercio);
    } else {
      setSelectedComercio(null);
    }
    setPage(newPage);
  };

  const renderPage = () => {
    if (loading) {
      return <div className="text-center p-10 font-semibold text-gray-500">Cargando Guía Comercial...</div>;
    }

    if (error) {
      return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error de Configuración</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <p className="text-sm text-red-600">
            Por favor, verifica que el archivo <code className="bg-red-100 px-2 py-1 rounded">.env</code> existe en la raíz del proyecto con las variables:
            <br />• VITE_SUPABASE_URL
            <br />• VITE_SUPABASE_ANON_KEY
          </p>
          <button
            onClick={() => {
              setError(null);
              setLoading(true);
              window.location.reload();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (isVerifying) {
      return <div className="text-center p-10 font-semibold text-gray-500">Verificando tu cuenta...</div>;
    }

    switch (page) {
        case Page.Auth:
            return <AuthPage onNavigate={handleNavigate} />;
        case Page.Dashboard:
            return session && profile ? <DashboardPage session={session} profile={profile} onNavigate={handleNavigate} /> : <HomePage onNavigate={handleNavigate} />;
        case Page.CreateComercio:
            return session && profile ? <CreateComercioPage session={session} profile={profile} onNavigate={handleNavigate} /> : <HomePage onNavigate={handleNavigate} />;
        case Page.ComercioDetail:
            return selectedComercio ? <ComercioDetailPage comercio={selectedComercio} onNavigate={handleNavigate} /> : <HomePage onNavigate={handleNavigate} />;
        case Page.Home:
        default:
            return <HomePage onNavigate={handleNavigate} />;
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header session={session} profile={profile} onNavigate={handleNavigate} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;