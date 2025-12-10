import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css']
})
export class InicioComponent {
  constructor(private enrutador: Router) {}

  irA(ruta: 'ofertas' | 'peticiones') {
    this.enrutador.navigate([`/${ruta}`]);
  }
}