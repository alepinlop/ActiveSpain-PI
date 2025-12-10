// src/app/servicios/auth.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ServiciosService } from './servicios.service';
import { Usuario } from '../modelos/usuarios';

// Claves de localStorage (en español)
const CLAVE_USUARIO_ALMACENAMIENTO = 'pi_current_user';
const CLAVE_TOKEN_ALMACENAMIENTO = 'pi_api_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Mantengo el BehaviorSubject con el usuario actual (o null)
  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  // Exposición observable para que otros componentes se suscriban
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private servicios: ServiciosService,
    private router: Router
  ) {
    // Al crear el servicio cargo desde localStorage si existe usuario almacenado
    const rawUser = localStorage.getItem(CLAVE_USUARIO_ALMACENAMIENTO);
    if (rawUser) {
      try {
        const user: Usuario = JSON.parse(rawUser);
        this.currentUserSubject.next(user);
      } catch {
        // Si la deserialización falla, prefiero no romper la inicialización
      }
    }
  }

  /**
   * iniciarSesion:
   * Intento autenticar usando el servicio de backend.
   * Si recibo token, lo guardo en localStorage y actualizo el estado del usuario.
   * Devuelvo el observable para que el componente que llama maneje la suscripción.
   */
  iniciarSesion(email: string, password: string) {
    return this.servicios.loginUsuario(email, password).pipe(
      tap((res: any) => {
        // Respuesta esperada:
        // { result: "OK", user: { ... , api_token: "..." } }
        // o { result: "OK", user: {...}, api_token: "..." }
        if (res?.result === 'OK') {
          const user: Usuario = (res.user ?? {});
          // el token puede venir en user.api_token o en res.api_token
          const token = user.api_token ?? res.api_token ?? null;
          if (token) {
            // Guardo el token y el usuario completo en localStorage y actualizo el subject
            user.api_token = token;
            localStorage.setItem(CLAVE_TOKEN_ALMACENAMIENTO, token);
            localStorage.setItem(CLAVE_USUARIO_ALMACENAMIENTO, JSON.stringify(user));
            this.currentUserSubject.next(user);
          } else {
            // Si no llega token, guardo el usuario parcial si existe id
            if (user && (user as any).id) {
              localStorage.setItem(CLAVE_USUARIO_ALMACENAMIENTO, JSON.stringify(user));
              this.currentUserSubject.next(user);
            }
          }
        }
      })
    );
  }

  /**
   * registrar:
   * Llamo al servicio para registrar un usuario.
   * Devuelvo el observable para que quien llame decida si realiza auto-login.
   */
  registrar(payload: any) {
    return this.servicios.registerUsuario(payload);
  }

  /**
   * cerrarSesion:
   * Limpio el token y el usuario del localStorage y reinicio el estado.
   * Luego navego a la ruta indicada (por defecto '/auth').
   */
  cerrarSesion(redirectTo = '/auth') {
    localStorage.removeItem(CLAVE_TOKEN_ALMACENAMIENTO);
    localStorage.removeItem(CLAVE_USUARIO_ALMACENAMIENTO);
    this.currentUserSubject.next(null);
    this.router.navigate([redirectTo]);
  }

  // --------------------
  // Getters y métodos auxiliares
  // --------------------

  /**
   * obtenerToken:
   * Devuelvo el token guardado en localStorage (si existe).
   */
  get obtenerToken(): string | null {
    return localStorage.getItem(CLAVE_TOKEN_ALMACENAMIENTO);
  }

  /**
   * usuarioActualValor:
   * Devuelvo el valor actual del subject (usuario o null).
   */
  get usuarioActualValor(): Usuario | null {
    return this.currentUserSubject.value;
  }

  /**
   * estaLogueado:
   * Compruebo si hay un usuario en el estado (truthy).
   */
  estaLogueado(): boolean {
    return !!this.currentUserSubject.value;
  }

  // --------------------
  // Alias en inglés para compatibilidad
  // --------------------

  // login -> iniciarSesion
  login(email: string, password: string) {
    return this.iniciarSesion(email, password);
  }

  // register -> registrar
  register(payload: any) {
    return this.registrar(payload);
  }

  // logout -> cerrarSesion
  logout(redirectTo = '/auth') {
    return this.cerrarSesion(redirectTo);
  }

  // token -> obtenerToken (getter)
  get token(): string | null {
    return this.obtenerToken;
  }

  // currentUserValue -> usuarioActualValor (getter)
  get currentUserValue(): Usuario | null {
    return this.usuarioActualValor;
  }

  // isLoggedIn -> estaLogueado
  isLoggedIn(): boolean {
    return this.estaLogueado();
  }
}
