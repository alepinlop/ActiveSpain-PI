// src/app/services/servicios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { APP_CONFIG } from '../app.config';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario } from '../modelos/usuarios';
import { Peticiones } from '../modelos/peticiones';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  // usa la URL del environment (ajusta en environment.ts)
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  private httpOptionsWithToken() {
    const headersInit: {[k:string]:string} = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('pi_api_token');
    if (token) {
      headersInit['Authorization'] = `Bearer ${token}`;
    }
    return { headers: new HttpHeaders(headersInit) };
  }

  // helper: adjunta token al body (por si el header no llega)
  private attachTokenToBody(body: any): any {
    const token = localStorage.getItem('pi_api_token');
    if (token) {
      // no mutamos el objeto original por si lo reusas en llamdas; clonamos
      const b = Object.assign({}, body);
      b.token = token;
      return b;
    }
    return body;
  }

  listarUsuarios(): Observable<Usuario[]> {
    const body = { accion: 'ListarUsuarios' };
    return this.http.post<Usuario[]>(
      this.apiUrl,
      this.attachTokenToBody(body),
      this.httpOptionsWithToken()
    ).pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  registerUsuario(payload: any) {
    const body = { accion: 'AnadeUsuario', usuario: payload };
    return this.http.post<any>(this.apiUrl, this.attachTokenToBody(body), this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  loginUsuario(email: string, password: string) {
    const body = { accion: 'LoginUsuario', email, password };
    // login no necesita token
    return this.http.post<any>(this.apiUrl, body, { headers: new HttpHeaders({'Content-Type': 'application/json'}) })
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // OFERTAS
  anadeOferta(oferta: any) {
    const body = { accion: 'AnadeOferta', oferta };
    const bodyWithToken = this.attachTokenToBody(body);
    const opts = this.httpOptionsWithToken();
    console.debug('[ServiciosService] anadeOferta - body:', bodyWithToken, 'opts:', opts);
    return this.http.post<any>(this.apiUrl, bodyWithToken, opts)
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  modificaOferta(oferta: any) {
    const body = { accion: 'ModificaOferta', oferta };
    const bodyWithToken = this.attachTokenToBody(body);
    return this.http.post<any>(this.apiUrl, bodyWithToken, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  borraOferta(id: number) {
    const body = { accion: 'BorraOferta', id };
    const bodyWithToken = this.attachTokenToBody(body);
    return this.http.post<any>(this.apiUrl, bodyWithToken, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  listarOfertas() {
    const body = { accion: 'ListarOfertas' };
    return this.http.post<any[]>(this.apiUrl, this.attachTokenToBody(body), this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // PETICIONES
  anadePeticion(peticion: any) {
    const body = { accion: 'AnadePeticion', peticion };
    const bodyWithToken = this.attachTokenToBody(body);
    console.debug('[ServiciosService] anadePeticion - body:', bodyWithToken);
    return this.http.post<any>(this.apiUrl, bodyWithToken, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  modificaPeticion(peticion: any) {
    const body = { accion: 'ModificaPeticion', peticion };
    const bodyWithToken = this.attachTokenToBody(body);
    return this.http.post<any>(this.apiUrl, bodyWithToken, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  borraPeticion(id: number) {
    const body = { accion: 'BorraPeticion', id };
    const bodyWithToken = this.attachTokenToBody(body);
    return this.http.post<any>(this.apiUrl, bodyWithToken, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  listarPeticiones(): Observable<Peticiones[]> {
    const body = { accion: 'ListarPeticiones' };
    // usar this.apiUrl en lugar de APP_CONFIG directo
    return this.http.post<Peticiones[]>(this.apiUrl, this.attachTokenToBody(body), this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

}
