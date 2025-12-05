// src/app/componentes/peticiones/peticiones-crear/peticiones-crear.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ServiciosService } from '../../../servicios/servicios.service';

@Component({
  selector: 'app-peticiones-crear',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './peticiones-crear.component.html',
  styleUrls: ['./peticiones-crear.component.css']
})
export class PeticionesCrearComponent implements OnInit {
  @Output() created = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  form: FormGroup;
  loading = false;
  error = '';

  constructor(private fb: FormBuilder, private servicios: ServiciosService) {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
      actividad_tipo: ['', Validators.required],
      lugar_ciudad: ['', Validators.required],
      fechahora_deseada: ['', Validators.required],
      duracion_horas: [1, Validators.required],
      necesidades_concretas: [''],
      presupuesto_min: [null],
      presupuesto_max: [null],
      contacto_telefono: [''],
      estado: ['activa']
    });
  }

  ngOnInit(): void {
    // inicialización si hace falta
    // console.log('[PeticionesCrear] init form', this.form.value);
  }

  // normaliza datetime-local -> 'YYYY-MM-DD HH:MM:SS'
  private normalizeFecha(fecha: any): any {
    if (!fecha) return null;
    if (typeof fecha === 'string' && fecha.includes('T')) {
      let s = fecha.replace('T', ' ');
      if (!/:\d{2}:\d{2}$/.test(s)) s += ':00';
      return s;
    }
    return fecha;
  }

  submit() {
    this.error = '';
    if (this.form.invalid) {
      this.error = 'Rellena los campos obligatorios';
      return;
    }

    this.loading = true;
    const data: any = { ...this.form.value };

    // normalizar fecha
    data.fechahora_deseada = this.normalizeFecha(data.fechahora_deseada);

    // Si el usuario introduce un único presupuesto, podrías mapearlo aquí.
    // Por ahora enviamos presupuesto_min y presupuesto_max tal cual están en el form.

    // Llamada al servicio
    this.servicios.anadePeticion(data).subscribe({
      next: (res: any) => {
        this.loading = false;
        // backend responde {"result":"OK"} o {"result":"FAIL", ...}
        if (res && res.result && res.result === 'OK') {
          this.form.reset({
            titulo: '',
            descripcion: '',
            actividad_tipo: '',
            lugar_ciudad: '',
            fechahora_deseada: '',
            duracion_horas: 1,
            necesidades_concretas: '',
            presupuesto_min: null,
            presupuesto_max: null,
            contacto_telefono: '',
            estado: 'activa'
          });
          this.created.emit();
        } else {
          this.error = (res && (res.error || res.result)) ? (res.error || res.result || 'Error') : 'Error creando petición';
        }
      },
      error: (e) => {
        console.error('[PeticionesCrear] error', e);
        this.loading = false;
        this.error = 'Error de red o servidor';
      }
    });
  }

  onCancel() {
    this.cancel.emit();
  }
}
