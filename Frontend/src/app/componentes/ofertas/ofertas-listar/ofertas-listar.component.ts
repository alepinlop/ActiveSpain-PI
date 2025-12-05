import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ServiciosService } from '../../../servicios/servicios.service';
import { AuthService } from '../../../servicios/auth.service';
import { OfertasCrearComponent } from '../ofertas-crear/ofertas-crear.component';
import { OfertasActualizarComponent } from '../ofertas-actualizar/ofertas-actualizar.component';
import { OfertasBorrarComponent } from '../ofertas-borrar/ofertas-borrar.component';

@Component({
  selector: 'app-ofertas-listar',
  standalone: true,
  imports: [CommonModule, RouterModule, OfertasCrearComponent, OfertasActualizarComponent, OfertasBorrarComponent],
  templateUrl: './ofertas-listar.component.html',
  styleUrls: ['./ofertas-listar.component.css']
})
export class OfertasListarComponent implements OnInit {
  ofertas: any[] = [];
  cargando = true;
  error = '';
  currentUser: any = null;

  // UI state
  mostrarCrear = false;
  editing: any = null;
  deletingId: number | null = null;

  constructor(private servicios: ServiciosService, private auth: AuthService) {
    this.auth.currentUser$.subscribe(u => this.currentUser = u);
  }

  ngOnInit(): void { this.cargar(); }

  cargar() {
    this.cargando = true;
    this.servicios.listarOfertas().subscribe({
      next: (res: any[]) => {
        // ordenar por id ascendente
        this.ofertas = (res || []).slice().sort((a,b) => {
          const ai = Number(a.id ?? 0); const bi = Number(b.id ?? 0);
          return ai - bi;
        });
        this.cargando = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Error cargando ofertas';
        this.cargando = false;
      }
    });
  }

  toggleCrear() { this.mostrarCrear = !this.mostrarCrear; }

  isOwner(oferta: any) {
    return this.currentUser && (oferta.usuario_id == this.currentUser.id);
  }

  startEdit(of: any) { this.editing = { ...of }; }
  startDelete(id: number) { this.deletingId = id; }

  // eventos child
  onCreated() { this.mostrarCrear = false; this.cargar(); }
  onUpdated() { this.editing = null; this.cargar(); }
  onDeleted() { this.deletingId = null; this.cargar(); }

  // Helpers presentación
  boolToSiNo(v: any) {
    return (v === 1 || v === '1' || v === true) ? 'Sí' : 'No';
  }

  formatDuracion(d: any) {
    if (d === null || d === undefined || d === '') return '-';
    return `${d}h`;
  }

  // Format fecha "YYYY-MM-DD HH:MM" (si viene ISO o 'YYYY-MM-DD HH:MM:SS')
  formatFecha(s: any) {
    if (!s) return '-';
    try {
      // acepta "YYYY-MM-DD HH:MM:SS" o ISO
      let date: Date;
      if (typeof s === 'string' && s.includes(' ')) {
        // replace space with T to parse reliably
        date = new Date(s.replace(' ', 'T'));
      } else {
        date = new Date(s);
      }
      if (isNaN(date.getTime())) return s;
      const y = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      const min = String(date.getMinutes()).padStart(2, '0');
      return `${y}-${mm}-${dd} ${hh}:${min}`;
    } catch {
      return s;
    }
  }

  ofertanteNombre(o: any) {
    // modelos.php ya devuelve ofertante_nombre y ofertante_apellidos en ListarOfertas
    const n = o.ofertante_nombre || o.nombre || null;
    const a = o.ofertante_apellidos || o.apellidos || null;
    if (n) return (a ? `${n} ${a}` : n);
    // fallback: mostrar id
    return o.usuario_id ?? '-';
  }
}
