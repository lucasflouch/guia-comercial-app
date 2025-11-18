import { createClient } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'; // Importar el paquete correcto

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ ERROR CRÍTICO: Supabase URL o clave anónima faltante.");
  console.error("Por favor, crea un archivo .env en la raíz del proyecto con:");
  console.error("VITE_SUPABASE_URL=tu_url_de_supabase");
  console.error("VITE_SUPABASE_ANON_KEY=tu_clave_anonima");
  // No lanzamos error para que la app no se rompa, pero mostramos el problema
}

// El almacenamiento personalizado usando Preferences
const customStorage = {
  getItem: async (key: string) => {
    const { value } = await Preferences.get({ key });
    return value;
  },
  setItem: async (key: string, value: string) => {
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string) => {
    await Preferences.remove({ key });
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage, // Usar el nuevo almacenamiento
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
