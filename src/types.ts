

import type { AuthSession } from '@supabase/supabase-js';
export interface Profile {
  id: string;
  nombre: string;
  tipo_usuario: 'cliente' | 'comerciante';
  telefono?: string;
}

export interface Comercio {
  id: number;
  usuario_id: string;
  nombre: string;
  description: string;
  direccion: string;
  whatsapp: string;
  provincia_id: string;
  provincia_nombre: string;
  ciudad_id: string;
  ciudad_nombre: string;
  rubro_id: string;
  sub_rubro_id?: string;
  publicidad: number;
  imagen_url?: string;
  gallery_urls?: string[];
  created_at: string;
}

export const Page = {
  Home: 'Home',
  Auth: 'Auth',
  Dashboard: 'Dashboard',
  CreateComercio: 'CreateComercio',
  ComercioDetail: 'ComercioDetail',
} as const;

export type PageValue = typeof Page[keyof typeof Page];

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface AppContextType {
  session: AuthSession | null;
  profile: Profile | null;
  onNavigate: (page: PageValue, comercio?: Comercio) => void;
}
