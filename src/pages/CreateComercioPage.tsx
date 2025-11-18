import { useState } from 'react';
import type { FormEvent } from 'react';
import { supabase } from '../supabaseClient';
import type { AuthSession } from '@supabase/supabase-js';
import type { Profile, PageValue } from '../types';
import { Page } from '../types';

interface CreateComercioPageProps {
  session: AuthSession;
  profile: Profile;
  onNavigate: (page: PageValue) => void;
}

const CreateComercioPage = ({ session, onNavigate }: CreateComercioPageProps) => {
  const [form, setForm] = useState({
    nombre: '',
    description: '',
    direccion: '',
    whatsapp: '',
    provincia_id: '',
    provincia_nombre: '',
    ciudad_id: '',
    ciudad_nombre: '',
    rubro_id: '',
    sub_rubro_id: '',
    publicidad: '0',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    // Validaciones básicas
    if (!form.nombre.trim() || !form.description.trim() || !form.direccion.trim() || !form.whatsapp.trim()) {
      setError('Por favor completa todos los campos obligatorios.');
      setSaving(false);
      return;
    }

    // Validar WhatsApp (solo números)
    const whatsappClean = form.whatsapp.replace(/\D/g, '');
    if (whatsappClean.length < 10) {
      setError('El número de WhatsApp debe tener al menos 10 dígitos.');
      setSaving(false);
      return;
    }

    try {
      const { error: insertError } = await supabase.from('comercios').insert({
        nombre: form.nombre.trim(),
        description: form.description.trim(),
        direccion: form.direccion.trim(),
        whatsapp: whatsappClean,
        provincia_id: form.provincia_id || 'default',
        provincia_nombre: form.provincia_nombre || 'Sin especificar',
        ciudad_id: form.ciudad_id || 'default',
        ciudad_nombre: form.ciudad_nombre || 'Sin especificar',
        rubro_id: form.rubro_id || 'default',
        sub_rubro_id: form.sub_rubro_id || null,
        publicidad: Number(form.publicidad) || 0,
        usuario_id: session.user.id,
      });

      if (insertError) {
        setError(insertError.message || 'Error al crear el comercio. Intenta nuevamente.');
      } else {
        // Éxito: redirigir al dashboard
        onNavigate(Page.Dashboard);
      }
    } catch (err) {
      console.error('Error al crear comercio:', err);
      setError('Ocurrió un error inesperado. Intenta nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => onNavigate(Page.Dashboard)}
        className="mb-6 text-indigo-600 hover:text-indigo-800 font-semibold"
      >
        &larr; Volver al Panel
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Crear Nuevo Comercio</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Comercio <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Ej: Panadería El Buen Pan"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe tu comercio, productos o servicios..."
            />
          </div>

          <div>
            <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input
              id="direccion"
              type="text"
              value={form.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Calle y número"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="provincia_nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Provincia
              </label>
              <input
                id="provincia_nombre"
                type="text"
                value={form.provincia_nombre}
                onChange={(e) => {
                  handleChange('provincia_nombre', e.target.value);
                  handleChange('provincia_id', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: Buenos Aires"
              />
            </div>

            <div>
              <label htmlFor="ciudad_nombre" className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                id="ciudad_nombre"
                type="text"
                value={form.ciudad_nombre}
                onChange={(e) => {
                  handleChange('ciudad_nombre', e.target.value);
                  handleChange('ciudad_id', e.target.value.toLowerCase().replace(/\s+/g, '-'));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: La Plata"
              />
            </div>
          </div>

          <div>
            <label htmlFor="whatsapp" className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp <span className="text-red-500">*</span>
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={form.whatsapp}
              onChange={(e) => handleChange('whatsapp', e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="5491123456789 (sin + ni espacios)"
            />
            <p className="mt-1 text-xs text-gray-500">Solo números, sin + ni espacios</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="rubro_id" className="block text-sm font-medium text-gray-700 mb-1">
                Rubro
              </label>
              <input
                id="rubro_id"
                type="text"
                value={form.rubro_id}
                onChange={(e) => handleChange('rubro_id', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Ej: Alimentos"
              />
            </div>

            <div>
              <label htmlFor="publicidad" className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de Publicidad (0-100)
              </label>
              <input
                id="publicidad"
                type="number"
                min="0"
                max="100"
                value={form.publicidad}
                onChange={(e) => handleChange('publicidad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={() => onNavigate(Page.Dashboard)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Guardando...' : 'Crear Comercio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateComercioPage;
