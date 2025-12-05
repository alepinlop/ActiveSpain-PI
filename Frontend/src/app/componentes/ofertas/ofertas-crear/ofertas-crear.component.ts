import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiciosService } from '../../../servicios/servicios.service';

@Component({
  selector: 'app-ofertas-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ofertas-crear.component.html',
  styleUrls: ['./ofertas-crear.component.css']
})
export class OfertasCrearComponent implements OnInit {
  @Output() created = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>(); // útil cuando se usa como modal
  form: FormGroup;
  loading = false;
  error = '';

  // opciones útiles (puedes moverlas a constantes si quieres)
  preparacionOpciones = ['Baja', 'Media', 'Alta'];
  estadoOpciones = ['publicada', 'cancelada', 'completada', 'borrador'];

  constructor(private fb: FormBuilder, private servicios: ServiciosService) {
    this.form = this.fb.group({
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

  ngOnInit(): void {
    // cuando cambie material_necesario activamos/desactivamos el campo material_ofertado
    this.form.get('material_necesario')!.valueChanges.subscribe((v: boolean) => {
      const ctrl = this.form.get('material_ofertado')!;
      if (v) ctrl.enable({ emitEvent: false }); else ctrl.disable({ emitEvent: false });
    });
    // inicialmente desactivar material_ofertado si material_necesario es false
    if (!this.form.value.material_necesario) {
      this.form.get('material_ofertado')!.disable({ emitEvent: false });
    }
  }

  // normaliza el datetime-local a 'YYYY-MM-DD HH:MM:SS'
  private normalizeFecha(f: any) {
    if (!f) return null;
    if (typeof f === 'string' && f.includes('T')) {
      let s = f.replace('T', ' ');
      if (!/:\d{2}:\d{2}$/.test(s)) s += ':00';
      return s;
    }
    return f;
  }

  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.error = 'Rellena los campos obligatorios';
      return;
    }
    this.loading = true;
    const payload: any = { ...this.form.getRawValue() }; // getRawValue para leer material_ofertado aunque esté disabled
    payload.fechahora_inicio = this.normalizeFecha(payload.fechahora_inicio);
    // llamar servicio
    this.servicios.anadeOferta(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res?.result === 'OK' || res?.id) {
          this.form.reset({
            tarifa: 0,
            preparacion_fisica: 'Media',
            duracion_horas: 1,
            material_necesario: false,
            plazas_min: 1,
            plazas_max: 10,
            transport_incluido: false,
            estado: 'publicada'
          });
          // forzar que material_ofertado se desactive tras reset
          this.form.get('material_ofertado')!.disable({ emitEvent: false });
          this.created.emit();
        } else {
          this.error = res?.error ?? 'Error creando oferta';
        }
      },
      error: (err) => {
        console.error('[OfertasCrear] error:', err);
        this.error = 'Error en la petición';
        this.loading = false;
      }
    });
  }

  close() {
    this.cancel.emit();
  }
}
