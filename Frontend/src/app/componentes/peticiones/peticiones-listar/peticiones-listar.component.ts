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
  peticiones: any[] = [];
  cargando = true;
  error = '';
  currentUser: any = null;
  editing: any = null;
  deletingId: number | null = null;

  // <-- propiedad para controlar mostrar/ocultar formulario
  mostrarCrear = false;

  constructor(private servicios: ServiciosService, private auth: AuthService) {
    this.auth.currentUser$.subscribe(u => this.currentUser = u);
  }

  ngOnInit(): void { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.servicios.listarPeticiones().subscribe({
      next: (res) => { this.peticiones = res || []; this.cargando = false; },
      error: (err) => { this.error = 'Error cargando peticiones'; console.error(err); this.cargando = false; }
    });
  }

  toggleCrear() {
    this.mostrarCrear = !this.mostrarCrear;
  }

  isOwner(pet: any) {
    return this.currentUser && (pet.usuario_id == this.currentUser.id);
  }

  // helper para mostrar nombre del solicitante (si lo devuelve el backend)
  ownerName(p: any) {
    if (!p) return '-';
    if (p.consumidor_nombre) {
      return (p.consumidor_nombre || '') + (p.consumidor_apellidos ? ' ' + p.consumidor_apellidos : '');
    }
    // si no hay nombres, mostrar id
    return '#' + (p.usuario_id ?? '?');
  }

  // helper para formato duración (mostrar "3h")
  formatDuracion(v: any) {
    if (v === null || v === undefined || v === '') return '-';
    const n = Number(v);
    if (isNaN(n)) return String(v);
    return (Number.isInteger(n) ? n : n) + 'h';
  }

  onCreated() { this.cargar(); }
  onUpdated() { this.editing = null; this.cargar(); }
  onDeleted() { this.deletingId = null; this.cargar(); }

  startEdit(p: any) { this.editing = p; }
  startDelete(id: number) { this.deletingId = id; }
}
