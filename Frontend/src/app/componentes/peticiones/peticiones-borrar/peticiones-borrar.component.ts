// peticiones-borrar.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiciosService } from '../../../servicios/servicios.service';

@Component({
  selector: 'app-peticiones-borrar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './peticiones-borrar.component.html',
  styleUrls: ['./peticiones-borrar.component.css']
})
export class PeticionesBorrarComponent {
  @Input() id!: number;
  @Output() deleted = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  loading = false;
  error = '';

  constructor(private servicios: ServiciosService) {}

  confirmar() {
    this.loading = true;

    this.servicios.borraPeticion(this.id).subscribe({
      next: (resp: any) => {
        this.loading = false;

        if (resp?.result === 'OK') {
          this.deleted.emit();
        } else {
          this.error = resp?.error ?? 'Error borrando la petición';
        }
      },
      error: (e) => {
        console.error('Error borrando petición', e);
        this.error = e?.error?.error ?? 'Error borrando la petición';
        this.loading = false;
      }
    });
  }
}
