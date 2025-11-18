
import { supabase } from '../supabaseClient';
import  type { AuthSession } from '@supabase/supabase-js';
//import { Profile, Page, PageValue } from '../types';
import { Page } from '../types';  // Sin 'type' para Page, porque es valor
import type { PageValue } from '../types';  // Agrega 'type' y cambia a '../types'
import type { Profile } from '../types';


interface HeaderProps {
  session: AuthSession | null;
  profile: Profile | null;
  onNavigate: (page: PageValue) => void;
}

const Header = ({ session, profile, onNavigate }: HeaderProps) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    onNavigate(Page.Home);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div onClick={() => onNavigate(Page.Home)} className="text-2xl font-bold text-gray-800 cursor-pointer">
          🇦🇷 Guía Comercial
        </div>
        <div className="flex items-center space-x-4">
          {session && profile ? (
            <>
              <span className="hidden sm:inline">Hola, {profile.nombre}</span>
              <button onClick={() => onNavigate(Page.Dashboard)} className="text-gray-600 hover:text-indigo-600 font-semibold">
                Mi Panel
              </button>
              <button onClick={handleLogout} className="text-gray-600 hover:text-indigo-600">
                Salir
              </button>
            </>
          ) : (
            <button onClick={() => onNavigate(Page.Auth)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 font-semibold">
              Acceder / Registrarse
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
