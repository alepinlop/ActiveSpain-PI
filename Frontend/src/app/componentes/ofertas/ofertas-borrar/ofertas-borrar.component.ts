import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiciosService } from '../../../servicios/servicios.service';

@Component({
  selector: 'app-ofertas-borrar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ofertas-borrar.component.html',
  styleUrls: ['./ofertas-borrar.component.css']
})
export class OfertasBorrarComponent {
  @Input() id!: number;
  @Output() deleted = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  loading = false;
  error = '';

  constructor(private servicios: ServiciosService) {}

  confirmar() {
    this.loading = true;
    this.servicios.borraOferta(this.id).subscribe({
      next: () => { this.loading=false; this.deleted.emit(); },
      error: (e) => { console.error(e); this.error='Error borrando'; this.loading=false; }
    });
  }
}
