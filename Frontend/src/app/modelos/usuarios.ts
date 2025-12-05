export interface Usuario {
  id: number;
  email: string;
  // password_hash no se expone al frontend
  rol: 'ofertante' | 'consumidor' | 'admin';
  nombre: string;
  apellidos?: string | null;
  ciudad?: string | null;
  telefono?: string | null;
  descripcion?: string | null;
  esta_activo: number; // 0 o 1
  num_ofertas: number;
  num_peticiones: number;
  api_token?: string | null;
  created_at?: string | null; // ISO datetime
  updated_at?: string | null;
}
