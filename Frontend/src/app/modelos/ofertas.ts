export interface Ofertas {
  id: number;
  usuario_id: number;
  titulo: string;
  descripcion: string;
  actividad_tipo: string;
  lugar_ciudad: string;
  fechahora_inicio: string;
  duracion_horas: number;
  requisitos_necesarios: string | null;
  precio: number | null;
  proveedor_telefono: string | null;
}
