export interface Peticiones {
  id: number;
  usuario_id: number;
  titulo: string;
  descripcion: string;
  actividad_tipo: string;
  lugar_ciudad: string;
  fechahora_deseada: string | null;
  duracion_horas: number;
  necesidades_concretas: string | null;
  presupuesto_min: number | null;
  presupuesto_max: number | null;
  contacto_telefono: string | null;
}
