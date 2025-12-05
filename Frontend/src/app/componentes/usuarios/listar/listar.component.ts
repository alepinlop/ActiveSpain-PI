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
