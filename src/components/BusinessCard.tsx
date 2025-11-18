
//import { Comercio } from '../types';
import type { Comercio } from '../types';  // Agrega 'type' y cambia a '../types'
interface BusinessCardProps {
  comercio: Comercio;
  onClick: () => void;
}

const BusinessCard = ({ comercio, onClick }: BusinessCardProps) => {
  const imageUrl = comercio.imagen_url || 'https://via.placeholder.com/400x300.png?text=Sin+Imagen';

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden cursor-pointer group"
    >
      <div className="overflow-hidden">
        <img 
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300" 
          src={imageUrl} 
          alt={comercio.nombre} 
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 truncate">{comercio.nombre}</h3>
        <p className="text-sm text-gray-500">{comercio.ciudad_nombre}, {comercio.provincia_nombre}</p>
        <p className="text-sm text-gray-700 mt-2 h-10 overflow-hidden text-ellipsis">
          {comercio.description}
        </p>
      </div>
    </div>
  );
};

export default BusinessCard;
