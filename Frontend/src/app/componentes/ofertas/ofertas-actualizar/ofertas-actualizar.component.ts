// src/app/componentes/ofertas/ofertas-actualizar/ofertas-actualizar.component.ts
import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiciosService } from '../../../servicios/servicios.service';

@Component({
  selector: 'app-ofertas-actualizar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ofertas-actualizar.component.html',
  styleUrls: ['./ofertas-actualizar.component.css']
})
export class OfertasActualizarComponent implements OnChanges {
  @Input() oferta: any | null = null;
  @Output() updated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  error = '';

  preparacionOpciones = ['Baja', 'Media', 'Alta'];
  estadoOpciones = ['publicada','cancelada','completada','borrador'];

  constructor(private fb: FormBuilder, private servicios: ServiciosService) {
    // NO incluimos campos readonly (id, usuario_id, created_at, updated_at) en el formulario editable
    this.form = this.fb.group({
      id: [null, Validators.required],
      titulo: ['', Validators.required],
      descripcion: [''],
      actividad_tipo: ['', Validators.required],
      lugar_ciudad: ['', Validators.required],
      fechahora_inicio: ['', Validators.required],
      tarifa: [0],
      preparacion_fisica: ['Media'],
      duracion_horas: [1],
      material_necesario: [false],
      material_ofertado: [''],
      plazas_min: [1],
      plazas_max: [10],
      transport_incluido: [false],
      estado: ['publicada']
    });
  }

  ngOnChanges(): void {
    if (this.oferta) {
      // adaptar fechahora_inicio 'YYYY-MM-DD HH:MM:SS' => 'YYYY-MM-DDTHH:MM' para datetime-local
      const copy = { ...this.oferta };
      if (copy.fechahora_inicio && typeof copy.fechahora_inicio === 'string') {
        copy.fechahora_inicio = copy.fechahora_inicio.replace(' ', 'T').replace(/:\d{2}$/, (m: string) => m);
      }
      this.form.patchValue(copy);

      // controlar material_ofertado disabled si material_necesario false
      if (!this.form.get('material_necesario')!.value) {
        this.form.get('material_ofertado')!.disable({ emitEvent: false });
      } else {
        this.form.get('material_ofertado')!.enable({ emitEvent: false });
      }

      this.form.get('material_necesario')!.valueChanges.subscribe((v: boolean) => {
        const ctrl = this.form.get('material_ofertado')!;
        if (v) ctrl.enable({ emitEvent: false }); else ctrl.disable({ emitEvent: false });
      });
    }
  }

  private normalizeFecha(f: any) {
    if (!f) return null;
    if (typeof f === 'string' && f.includes('T')) {
      let s = f.replace('T', ' ');
      if (!/:\d{2}:\d{2}$/.test(s)) s += ':00';
      return s;
    }
    return f;
  }

  save() {
    if (this.form.invalid) {
      this.error = 'Rellena los campos obligatorios';
      return;
    }
    this.loading = true;
    const payload: any = { ...this.form.getRawValue() };
    payload.fechahora_inicio = this.normalizeFecha(payload.fechahora_inicio);

    this.servicios.modificaOferta(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.result === 'OK') {
          this.updated.emit();
        } else {
          this.error = res?.error ?? 'Error al actualizar';
        }
      },
      error: (err) => {
        console.error('[OfertasActualizar] error:', err);
        this.error = 'Error en la petición';
        this.loading = false;
      }
    });
  }

  close() {
    this.cancel.emit();
  }
}
