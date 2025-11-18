import { createClient } from '@supabase/supabase-js'
import { Preferences } from '@capacitor/preferences'; // Importar el paquete correcto

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL or anonymous key is missing. Make sure to set it in your .env file.");
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
