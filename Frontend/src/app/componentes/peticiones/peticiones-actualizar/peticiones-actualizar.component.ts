// src/app/componentes/peticiones/peticiones-actualizar/peticiones-actualizar.component.ts
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiciosService } from '../../../servicios/servicios.service';

@Component({
  selector: 'app-peticiones-actualizar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './peticiones-actualizar.component.html',
  styleUrls: ['./peticiones-actualizar.component.css']
})
export class PeticionesActualizarComponent implements OnChanges {
  @Input() peticion: any | null = null;
  @Output() updated = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  error = '';

  estadoOpciones = ['activa', 'atendida', 'cancelada'];

  constructor(private fb: FormBuilder, private servicios: ServiciosService) {
    this.form = this.fb.group({
      id: [null],
      titulo: ['', Validators.required],
      descripcion: [''],
      actividad_tipo: ['', Validators.required],
      lugar_ciudad: ['', Validators.required],
      fechahora_deseada: [''], // date (YYYY-MM-DD)
      duracion_horas: [1, Validators.required],
      necesidades_concretas: [''],
      presupuesto_min: [null],
      presupuesto_max: [null],
      contacto_telefono: [''],
      estado: ['activa', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['peticion'] && this.peticion) {
      // Preparar valor de fecha para input type="date"
      const clone: any = { ...this.peticion };
      if (clone.fechahora_deseada && typeof clone.fechahora_deseada === 'string') {
        // Acepta formatos 'YYYY-MM-DD', 'YYYY-MM-DD HH:MM:SS' o ISO
        const s = clone.fechahora_deseada;
        // si tiene espacio con time -> tomar parte fecha
        if (s.includes(' ')) {
          clone.fechahora_deseada = s.split(' ')[0];
        } else if (s.includes('T')) {
          clone.fechahora_deseada = s.split('T')[0];
        }
      }
      // Patch value
      this.form.patchValue({
        id: clone.id ?? null,
        titulo: clone.titulo ?? '',
        descripcion: clone.descripcion ?? '',
        actividad_tipo: clone.actividad_tipo ?? '',
        lugar_ciudad: clone.lugar_ciudad ?? '',
        fechahora_deseada: clone.fechahora_deseada ?? '',
        duracion_horas: clone.duracion_horas ?? 1,
        necesidades_concretas: clone.necesidades_concretas ?? '',
        presupuesto_min: clone.presupuesto_min ?? null,
        presupuesto_max: clone.presupuesto_max ?? null,
        contacto_telefono: clone.contacto_telefono ?? '',
        estado: clone.estado ?? 'activa'
      });
      // reset errores
      this.error = '';
    }
  }

  cancelar() {
    this.cancel.emit();
  }

  save() {
    if (this.form.invalid) {
      this.error = 'Completa los campos obligatorios.';
      return;
    }

    this.loading = true;
    this.error = '';

    const payload = { ...this.form.value };

    // Normalizaciones mínimas: convertir strings vacíos a null si quieres
    if (payload.presupuesto_min === '') payload.presupuesto_min = null;
    if (payload.presupuesto_max === '') payload.presupuesto_max = null;

    // Llamada al servicio
    this.servicios.modificaPeticion(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        // según tu backend devuelve { result: "OK" } o similar
        if (res?.result === 'OK') {
          this.updated.emit();
        } else {
          this.error = res?.error ?? 'Error actualizando';
        }
      },
      error: (err) => {
        console.error('peticiones-actualizar error', err);
        this.loading = false;
        // intentar leer mensaje de error
        this.error = err?.error?.error ?? err?.message ?? 'Error en la petición';
      }
    });
  }
}
