
import { useState } from 'react';
import { Page } from '../types';  // Sin 'type' para Page, porque es valor
import type { Comercio, PageValue } from '../types';  // Agrega 'type' y cambia a '../types'
interface ComercioDetailPageProps {
  comercio: Comercio;
  onNavigate: (page: PageValue) => void;
}

const ComercioDetailPage = ({ comercio, onNavigate }: ComercioDetailPageProps) => {
  const allImages = [comercio.imagen_url, ...(comercio.gallery_urls || [])].filter(Boolean) as string[];
  const [mainImage, setMainImage] = useState(allImages[0] || 'https://via.placeholder.com/800x600.png?text=Sin+Imagen');

  return (
    <div>
       <button onClick={() => onNavigate(Page.Home)} className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold">
        &larr; Volver a la Guía
      </button>

      <div className="bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image Gallery */}
            <div className="p-4">
                <img src={mainImage} alt={comercio.nombre} className="w-full h-96 object-cover rounded-lg mb-4"/>
                <div className="flex space-x-2 overflow-x-auto pb-2">
                    {allImages.map((imgUrl, index) => (
                        <img 
                            key={index}
                            src={imgUrl} 
                            alt={`Thumbnail ${index + 1}`}
                            className={`flex-shrink-0 w-20 h-20 object-cover rounded-md cursor-pointer border-2 ${mainImage === imgUrl ? 'border-indigo-500' : 'border-transparent'}`}
                            onClick={() => setMainImage(imgUrl)}
                        />
                    ))}
                </div>
            </div>

            {/* Commerce Details */}
            <div className="p-8 flex flex-col justify-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{comercio.nombre}</h1>
                <p className="text-lg text-gray-500 mb-4">{comercio.direccion}, {comercio.ciudad_nombre}</p>
                <p className="text-gray-700 leading-relaxed mb-6">{comercio.description}</p>
                
                <a 
                    href={`https://wa.me/${comercio.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded text-center transition-colors duration-300"
                >
                    Contactar por WhatsApp
                </a>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ComercioDetailPage;
