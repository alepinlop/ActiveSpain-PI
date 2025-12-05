// src/app/services/servicios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { APP_CONFIG } from '../app.config';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario } from '../modelos/usuarios';
import { Peticiones } from '../modelos/peticiones';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  private apiUrl = APP_CONFIG.API_URL;

  constructor(private http: HttpClient) { }

  private httpOptionsWithToken() {
    const headersInit: {[k:string]:string} = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('pi_api_token');
    if (token) {
      headersInit['Authorization'] = `Bearer ${token}`;
    }
    return { headers: new HttpHeaders(headersInit) };
  }

  listarUsuarios(): Observable<Usuario[]> {
    const body = { accion: 'ListarUsuarios' };
    return this.http.post<Usuario[]>(this.apiUrl, body, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  registerUsuario(payload: any) {
    const body = { accion: 'AnadeUsuario', usuario: payload };
    return this.http.post<any>(this.apiUrl, body, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  loginUsuario(email: string, password: string) {
    const body = { accion: 'LoginUsuario', email, password };
    return this.http.post<any>(this.apiUrl, body, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // Otros métodos (ofertas/peticiones) deben usar this.httpOptionsWithToken() también
  anadeOferta(oferta: any) {
  const body = { accion: 'AnadeOferta', oferta };
  const opts = this.httpOptionsWithToken();
  console.log('[ServiciosService] anadeOferta - body:', body);
  console.log('[ServiciosService] anadeOferta - headers:', opts);
  return this.http.post<any>(this.apiUrl, body, opts);
}


  modificaOferta(oferta: any) {
    const body = { accion: 'ModificaOferta', oferta };
    return this.http.post<any>(this.apiUrl, body, this.httpOptionsWithToken());
  }

  borraOferta(id: number) {
    const body = { accion: 'BorraOferta', id };
    return this.http.post<any>(this.apiUrl, body, this.httpOptionsWithToken());
  }

  listarOfertas() {
    const body = { accion: 'ListarOfertas' };
    return this.http.post<any[]>(this.apiUrl, body, this.httpOptionsWithToken());
  }

  anadePeticion(peticion: any) {
    const body = { accion: 'AnadePeticion', peticion };
    console.log('[ServiciosService] anadePeticion - body:', body);
    return this.http.post<any>(this.apiUrl, body, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  modificaPeticion(peticion: any) {
    const body = { accion: 'ModificaPeticion', peticion };
    return this.http.post<any>(this.apiUrl, body, this.httpOptionsWithToken());
  }

  borraPeticion(id: number) {
    const body = { accion: 'BorraPeticion', id };
    return this.http.post<any>(this.apiUrl, body, this.httpOptionsWithToken());
  }

  listarPeticiones(): Observable<Peticiones[]> {
  return this.http.post<Peticiones[]>(APP_CONFIG.API_URL, {
    accion: 'ListarPeticiones'
  });
}

}
