import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import type { AuthSession } from '@supabase/supabase-js';
import { Page } from './types';
import type { Profile, Comercio, PageValue } from './types';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';

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
  const [page, setPage] = useState<PageValue>(Page.Home);
  const [selectedComercio, setSelectedComercio] = useState<Comercio | null>(null);

  useEffect(() => {
    // --- Listener para el Deep Link ---
    if (Capacitor.isNativePlatform()) {
      CapacitorApp.addListener('appUrlOpen', (event) => {
        setIsVerifying(true);
        const url = new URL(event.url);
        const hash = url.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          }).catch(err => console.error('Error en setSession desde deep link', err));
        }
      });
    }

    // --- Lógica de Autenticación Robusta ---
    
    // 1. Carga inicial de la sesión
    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
          setProfile(profileData as Profile);
          setPage(Page.Dashboard);
        }
      } catch (error) {
        console.error("Error en la carga inicial de sesión:", error);
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
      if (Capacitor.isNativePlatform()) {
        CapacitorApp.removeAllListeners();
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