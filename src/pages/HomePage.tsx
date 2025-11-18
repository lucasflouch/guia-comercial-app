import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Comercio, PageValue } from '../types';
import { Page } from '../types';
import BusinessCard from '../components/BusinessCard';

interface HomePageProps {
  onNavigate: (page: PageValue, comercio?: Comercio) => void;
}

const HomePage = ({ onNavigate }: HomePageProps) => {
  const [comercios, setComercios] = useState<Comercio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComercios = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('comercios')
        .select('*')
        .order('publicidad', { ascending: false });

      if (error) {
        console.error('Error fetching comercios:', error);
        setError('No se pudieron cargar los comercios. Intente más tarde.');
      } else {
        setComercios(data || []);
      }
      setLoading(false);
    };

    fetchComercios();
  }, []);

  return (
    // Contenedor principal para centrar y limitar el ancho como en el diseño
    <div className="w-full max-w-lg mx-auto px-4 py-6">
           
      <h1 className="text-2xl font-bold text-gray-800 mb-6 px-4">Comercios Destacados</h1>
      
      {loading && <p className="text-center text-gray-500">Cargando comercios...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}
      
      {!loading && !error && comercios.length === 0 && (
        <p className="text-center text-gray-500">No hay comercios para mostrar en este momento.</p>
      )}

      {!loading && !error && comercios.length > 0 && (
        // Cambiamos el grid por una lista vertical con espacio entre elementos
        <div className="flex flex-col gap-6">
          {comercios.map((comercio) => (
            <BusinessCard 
              key={comercio.id} 
              comercio={comercio}
              onClick={() => onNavigate(Page.ComercioDetail, comercio)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;