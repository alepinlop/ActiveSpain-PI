import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ServiciosService } from './servicios.service';
import { Usuario } from '../modelos/usuarios';

const STORAGE_USER_KEY = 'pi_current_user';
const STORAGE_TOKEN_KEY = 'pi_api_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private servicios: ServiciosService,
    private router: Router
  ) {
    // Cargar usuario/token desde localStorage si existe
    const rawUser = localStorage.getItem(STORAGE_USER_KEY);
    if (rawUser) {
      try {
        const user: Usuario = JSON.parse(rawUser);
        this.currentUserSubject.next(user);
      } catch {}
    }
  }

  /**
   * Intenta loguear y guarda token + usuario.
   * Devuelve el observable del login para que el componente lo suscriba.
   */
  login(email: string, password: string) {
    return this.servicios.loginUsuario(email, password).pipe(
      tap((res: any) => {
        // Respuesta posible:
        // { result: "OK", user: { ... , api_token: "..." } }
        // o { result: "OK", user: {...}, api_token: "..." }
        if (res?.result === 'OK') {
          const user: Usuario = (res.user ?? {});
          // token puede estar en user.api_token o en res.api_token
          const token = user.api_token ?? res.api_token ?? null;
          if (token) {
            user.api_token = token;
            // Guardar en localStorage
            localStorage.setItem(STORAGE_TOKEN_KEY, token);
            localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
            this.currentUserSubject.next(user);
          } else {
            // Si no hay token, aún podemos guardar usuario parcial si viene
            if (user && user.id) {
              localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
              this.currentUserSubject.next(user);
            }
          }
        }
      })
    );
  }

  /**
   * Registrar (opcional). Devuelve el observable del register.
   * No auto-login; pero puedes hacerlo si prefieres.
   */
  register(payload: any) {
    return this.servicios.registerUsuario(payload);
  }

  logout(redirectTo = '/auth') {
    // Limpiar storage y estado
    localStorage.removeItem(STORAGE_TOKEN_KEY);
    localStorage.removeItem(STORAGE_USER_KEY);
    this.currentUserSubject.next(null);
    // Navegar a auth
    this.router.navigate([redirectTo]);
  }

  get token(): string | null {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  }

  get currentUserValue(): Usuario | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }
}
