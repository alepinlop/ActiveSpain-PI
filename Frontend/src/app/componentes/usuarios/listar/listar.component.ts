import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnInit } from '@angular/core';
import { Usuario } from '../../../modelos/usuarios';

import { ServiciosService } from '../../../servicios/servicios.service';

@Component({
  selector: 'app-listar',
  imports: [CommonModule],
  templateUrl: './listar.component.html',
  styleUrl: './listar.component.css'
})
export class ListarComponent implements OnInit {

  usuarios: Usuario[] = [];
  cargando = false;
  error: string | null = null;

  // nuevos contadores
  ofertantesCount: number = 0;
  consumidoresCount: number = 0;

  constructor(private servicios: ServiciosService) { }

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.cargando = true;
    this.error = null;
    this.servicios.listarUsuarios().subscribe({
      next: (data: Usuario[]) => {
        this.usuarios = data || [];
        // calcular contadores (asegurando que rol existe)
        this.ofertantesCount = this.usuarios.filter(u => (u.rol || '').toString() === 'ofertante').length;
        this.consumidoresCount = this.usuarios.filter(u => (u.rol || '').toString() === 'consumidor').length;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al obtener usuarios', err);
        this.error = 'No se pudo cargar la lista de usuarios. Comprueba el backend.';
        this.cargando = false;
      }
    });
  }

  // Método utilitario para mostrar "Sí/No" desde 0/1
  boolToSiNo(val: number) {
    return val ? 'Sí' : 'No';
  }
}
