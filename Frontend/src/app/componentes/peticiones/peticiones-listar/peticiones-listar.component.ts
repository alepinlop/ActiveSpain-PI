import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServiciosService } from '../../../servicios/servicios.service';
import { AuthService } from '../../../servicios/auth.service';
import { PeticionesCrearComponent } from '../peticiones-crear/peticiones-crear.component';
import { PeticionesActualizarComponent } from '../peticiones-actualizar/peticiones-actualizar.component';
import { PeticionesBorrarComponent } from '../peticiones-borrar/peticiones-borrar.component';

@Component({
  selector: 'app-peticiones-listar',
  standalone: true,
  imports: [CommonModule, RouterModule, PeticionesCrearComponent, PeticionesActualizarComponent, PeticionesBorrarComponent],
  templateUrl: './peticiones-listar.component.html',
  styleUrls: ['./peticiones-listar.component.css']
})
export class PeticionesListarComponent implements OnInit {
  // array con las peticiones que muestro
  peticiones: any[] = [];

  // estados UI
  cargando = true;
  error = '';

  // usuario conectado (si existe)
  usuarioActual: any = null;

  // edición / borrado
  editando: any = null;
  idBorrando: number | null = null;

  // controlo mostrar/ocultar formulario de creación
  mostrarCrear = false;

  constructor(private servicios: ServiciosService, private auth: AuthService) {
    // me suscribo para mantener siempre el usuario actual actualizado
    this.auth.currentUser$.subscribe(u => this.usuarioActual = u);
  }

  ngOnInit(): void {
    // cargo las peticiones al inicializar el componente
    this.cargarPeticiones();
  }

  /**
   * cargarPeticiones:
   * Solicito las peticiones al backend.
   * Ordeno por id ascendente para asegurar consistencia en la lista.
   * Registro errores en consola y muestro mensaje al usuario si algo falla.
   */
  cargarPeticiones() {
    this.cargando = true;
    this.servicios.listarPeticiones().subscribe({
      next: (res: any[]) => {
        // guardo copia y ordeno por id ascendente (aseguro conversión a número)
        this.peticiones = (res || []).slice().sort((a,b) => {
          const ai = Number(a.id ?? 0);
          const bi = Number(b.id ?? 0);
          return ai - bi;
        });
        this.cargando = false;
      },
      error: (err) => {
        this.error = 'Error cargando peticiones';
        console.error(err);
        this.cargando = false;
      }
    });
  }

  // alterno la visibilidad del formulario de creación
  alternarCrear() {
    this.mostrarCrear = !this.mostrarCrear;
  }

  // compruebo si el usuario actual es propietario de la petición
  esPropietario(pet: any) {
    return this.usuarioActual && (pet.usuario_id == this.usuarioActual.id);
  }

  /**
   * nombreSolicitante:
   * Uso los campos que pueda devolver el backend (consumidor_nombre/consumidor_apellidos).
   * Si no están, muestro fallback con #<id_usuario>.
   */
  nombreSolicitante(p: any) {
    if (!p) return '-';
    if (p.consumidor_nombre) {
      return (p.consumidor_nombre || '') + (p.consumidor_apellidos ? ' ' + p.consumidor_apellidos : '');
    }
    return '#' + (p.usuario_id ?? '?');
  }

  // normalizo la duración para presentación (ej. "3h")
  formatearDuracion(v: any) {
    if (v === null || v === undefined || v === '') return '-';
    const n = Number(v);
    if (isNaN(n)) return String(v);
    // muestro entero o decimal tal cual venga
    return (Number.isInteger(n) ? n : n) + 'h';
  }

  // manejadores de eventos emitidos por componentes hijos
  alCreado() { this.cargarPeticiones(); }
  alActualizado() { this.editando = null; this.cargarPeticiones(); }
  alBorrado() { this.idBorrando = null; this.cargarPeticiones(); }

  // inicio edición: guardo la petición en estado local para pasarla al modal
  iniciarEdicion(p: any) { this.editando = p; }

  // inicio borrado inline: marco id que se está borrando
  iniciarBorrado(id: number) { this.idBorrando = id; }
}
