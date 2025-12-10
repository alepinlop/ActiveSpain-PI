import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServiciosService } from '../../../servicios/servicios.service';
import { AuthService } from '../../../servicios/auth.service';
import { OfertasCrearComponent } from '../ofertas-crear/ofertas-crear.component';
import { OfertasActualizarComponent } from '../ofertas-actualizar/ofertas-actualizar.component';
import { OfertasBorrarComponent } from '../ofertas-borrar/ofertas-borrar.component';

@Component({
  selector: 'app-ofertas-listar',
  standalone: true,
  imports: [CommonModule, RouterModule, OfertasCrearComponent, OfertasActualizarComponent, OfertasBorrarComponent],
  templateUrl: './ofertas-listar.component.html',
  styleUrls: ['./ofertas-listar.component.css']
})
export class OfertasListarComponent implements OnInit {
  // lista de ofertas que muestro en la UI
  ofertas: any[] = [];

  // indicadores de estado
  cargando = true;
  error = '';

  // usuario actual (si hay sesión)
  usuarioActual: any = null;

  // estado UI local
  mostrarCrear = false;
  editando: any = null;
  idBorrando: number | null = null;

  constructor(private servicios: ServiciosService, private auth: AuthService) {
    // me suscribo para mantener el usuario actual sincronizado con el AuthService
    this.auth.currentUser$.subscribe(u => this.usuarioActual = u);
  }

  ngOnInit(): void {
    // cargo las ofertas al inicializar componente
    this.cargar();
  }

  /**
   * cargar:
   * Solicito la lista de ofertas al backend y las ordeno por id ascendente.
   * Registro errores en consola y muestro mensaje de fallo al usuario si ocurre.
   */
  cargar() {
    this.cargando = true;
    this.servicios.listarOfertas().subscribe({
      next: (res: any[]) => {
        // copio y ordeno por id (aseguro números)
        this.ofertas = (res || []).slice().sort((a,b) => {
          const ai = Number(a.id ?? 0);
          const bi = Number(b.id ?? 0);
          return ai - bi;
        });
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error cargando ofertas';
        this.cargando = false;
      }
    });
  }

  // alterno la visualización del formulario de creación
  alternarCrear() { this.mostrarCrear = !this.mostrarCrear; }

  // compruebo si el usuario actual es el propietario de la oferta
  esPropietario(oferta: any) {
    return this.usuarioActual && (oferta.usuario_id == this.usuarioActual.id);
  }

  // inicio edición: guardo copia en estado local para pasarla al modal
  iniciarEdicion(of: any) { this.editando = { ...of }; }

  // inicio borrado inline: marco el id que se está borrando
  iniciarBorrado(id: number) { this.idBorrando = id; }

  // manejadores de eventos emitidos por hijos
  alCreado() { this.mostrarCrear = false; this.cargar(); }
  alActualizado() { this.editando = null; this.cargar(); }
  alBorrado() { this.idBorrando = null; this.cargar(); }

  // Helpers de presentación (en primera persona: describo lo que hago)
  boolToSiNo(v: any) {
    // trato valores 1, '1' o true como verdadero
    return (v === 1 || v === '1' || v === true) ? 'Sí' : 'No';
  }

  formatearDuracion(d: any) {
    // muestro guion si falta dato
    if (d === null || d === undefined || d === '') return '-';
    return `${d}h`;
  }

  /**
   * formatearFecha:
   * Intento normalizar varias entradas de fecha (ISO o 'YYYY-MM-DD HH:MM:SS').
   * Si no puedo parsear devuelvo la entrada original.
   */
  formatearFecha(s: any) {
    if (!s) return '-';
    try {
      let date: Date;
      if (typeof s === 'string' && s.includes(' ')) {
        // sustituyo espacio por T para parseo consistente
        date = new Date(s.replace(' ', 'T'));
      } else {
        date = new Date(s);
      }
      if (isNaN(date.getTime())) return s;
      const y = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${mm}-${dd} ${hh}:${min}`;
    } catch {
      return s;
    }
  }

  /**
   * nombreOfertante:
   * Utilizo los campos que devuelve el backend (ofertante_nombre/ofertante_apellidos)
   * y hago fallback a nombre/apellidos o al id del usuario si no hay nombres.
   */
  nombreOfertante(o: any) {
    const n = o.ofertante_nombre || o.nombre || null;
    const a = o.ofertante_apellidos || o.apellidos || null;
    if (n) return (a ? `${n} ${a}` : n);
    return o.usuario_id ?? '-';
  }
}
