import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Usuario } from '../modelos/usuarios';
import { Peticiones } from '../modelos/peticiones';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {

  // Uso la URL guardada en environment (ajusta en environment.ts si hace falta)
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Construyo las cabeceras HTTP y añado Authorization si tengo token en localStorage.
  // Devuelvo el objeto esperado por HttpClient (headers: HttpHeaders).
  private httpOptionsWithToken() {
    const headersInit: {[k:string]:string} = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem('pi_api_token');
    if (token) {
      headersInit['Authorization'] = `Bearer ${token}`;
    }
    return { headers: new HttpHeaders(headersInit) };
  }

  // Si por alguna razón el header llega mal, incluyo el token también en el body.
  // Clono el objeto body para no mutar el original por si lo reutilizo en otras llamadas.
  private attachTokenToBody(body: any): any {
    const token = localStorage.getItem('pi_api_token');
    if (token) {
      const b = Object.assign({}, body);
      b.token = token;
      return b;
    }
    return body;
  }

  // Pido la lista de usuarios al backend.
  // Añado token (header + body) para mantener compatibilidad con distintos entornos.
  listarUsuarios(): Observable<Usuario[]> {
    const body = { accion: 'ListarUsuarios' };
    return this.http.post<Usuario[]>(
      this.apiUrl,
      this.attachTokenToBody(body),
      this.httpOptionsWithToken()
    ).pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // Registro de usuario: envío el objeto usuario al endpoint.
  registerUsuario(payload: any) {
    const body = { accion: 'AnadeUsuario', usuario: payload };
    return this.http.post<any>(this.apiUrl, this.attachTokenToBody(body), this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // Login: no requiero token previo, envío sólo email/password.
  loginUsuario(email: string, password: string) {
    const body = { accion: 'LoginUsuario', email, password };
    // login no necesita token
    return this.http.post<any>(this.apiUrl, body, { headers: new HttpHeaders({'Content-Type': 'application/json'}) })
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // --------------------
  // OFERTAS
  // --------------------

  // Creo oferta: adjunto token en header y, por redundancia, en el body.
  anadeOferta(oferta: any) {
    const body = { accion: 'AnadeOferta', oferta };
    const bodyWithToken = this.attachTokenToBody(body);
    const opts = this.httpOptionsWithToken();
    console.debug('[ServiciosService] anadeOferta - body:', bodyWithToken, 'opts:', opts);
    return this.http.post<any>(this.apiUrl, bodyWithToken, opts)
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // Modifico oferta: envío la oferta ya con el id para que el backend valide propiedad/permiso.
  modificaOferta(oferta: any) {
    const body = { accion: 'ModificaOferta', oferta };
    const bodyWithToken = this.attachTokenToBody(body);
    return this.http.post<any>(this.apiUrl, bodyWithToken, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // Borro oferta por id: incluyo token para que el backend valide sesión/propiedad.
  borraOferta(id: number) {
    const body = { accion: 'BorraOferta', id };
    const bodyWithToken = this.attachTokenToBody(body);
    return this.http.post<any>(this.apiUrl, bodyWithToken, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // Listado de ofertas públicas / filtradas por backend.
  listarOfertas() {
    const body = { accion: 'ListarOfertas' };
    return this.http.post<any[]>(this.apiUrl, this.attachTokenToBody(body), this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // --------------------
  // PETICIONES
  // --------------------

  // Creo petición (demanda): envío el objeto y adjunto token.
  anadePeticion(peticion: any) {
    const body = { accion: 'AnadePeticion', peticion };
    const bodyWithToken = this.attachTokenToBody(body);
    console.debug('[ServiciosService] anadePeticion - body:', bodyWithToken);
    return this.http.post<any>(this.apiUrl, bodyWithToken, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // Modifico petición existente; backend valida propiedad.
  modificaPeticion(peticion: any) {
    const body = { accion: 'ModificaPeticion', peticion };
    const bodyWithToken = this.attachTokenToBody(body);
    return this.http.post<any>(this.apiUrl, bodyWithToken, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // Borro petición por id.
  borraPeticion(id: number) {
    const body = { accion: 'BorraPeticion', id };
    const bodyWithToken = this.attachTokenToBody(body);
    return this.http.post<any>(this.apiUrl, bodyWithToken, this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

  // Pido la lista de peticiones; incluyo token como el resto de llamadas.
  listarPeticiones(): Observable<Peticiones[]> {
    const body = { accion: 'ListarPeticiones' };
    return this.http.post<Peticiones[]>(this.apiUrl, this.attachTokenToBody(body), this.httpOptionsWithToken())
      .pipe(catchError(err => { console.error(err); return throwError(() => err); }));
  }

}
