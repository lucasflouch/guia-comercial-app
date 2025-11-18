import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { AuthSession } from '@supabase/supabase-js';
import { Page } from '../types';  // Sin 'type' para Page, porque es valor
import type { Profile, Comercio, PageValue } from '../types';  // Con 'type' para los invisibles

interface DashboardPageProps {
  session: AuthSession;
  profile: Profile;
  onNavigate: (page: PageValue, comercio?: Comercio) => void;
}

const DashboardPage = ({ session, onNavigate }: DashboardPageProps) => {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserComercios = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('comercios')
        .select('*')
        .eq('usuario_id', session.user.id);
      
      if (error) {
        console.error('Error fetching user comercios:', error);
      } else {
        setComercios(data || []);
      }
      setLoading(false);
    };

    fetchUserComercios();
  }, [session.user.id]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Mis Comercios</h1>
        <button
          onClick={() => onNavigate(Page.CreateComercio)}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          + Crear Nuevo Comercio
        </button>
      </div>

      {loading ? (
        <p>Cargando tus comercios...</p>
      ) : comercios.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-lg shadow">
            <p className="text-gray-500">Aún no has creado ningún comercio.</p>
            <p className="text-gray-400 text-sm">¡Haz clic en el botón de arriba para empezar!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comercios.map((comercio) => (
            <div 
              key={comercio.id}
              className="bg-white p-4 rounded-lg shadow flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onNavigate(Page.ComercioDetail, comercio)}
            >
              <div>
                <h3 className="font-semibold text-lg">{comercio.nombre}</h3>
                <p className="text-sm text-gray-600">{comercio.direccion}</p>
              </div>
              <span className="text-indigo-600 font-semibold text-sm">Ver Detalles →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;