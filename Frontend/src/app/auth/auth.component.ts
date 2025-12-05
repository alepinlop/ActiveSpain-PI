// src/app/auth/auth.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../servicios/auth.service';
import { ServiciosService } from '../servicios/servicios.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {

  activeTab: 'login' | 'register' = 'login';
  loading = false;
  errorMsg = '';
  successMsg = '';

  loginForm!: FormGroup;
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private servicios: ServiciosService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rol: ['consumidor', [Validators.required]],
      nombre: ['', [Validators.required]],
      apellidos: [''],
      ciudad: [''],
      telefono: [''],
      descripcion: ['']
    });
  }

  setTab(tab: 'login'|'register') {
    this.activeTab = tab;
    this.errorMsg = '';
    this.successMsg = '';
  }

  submitLogin() {
    if (this.loginForm.invalid) {
      this.errorMsg = 'Rellena email y contraseña correctamente.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    const { email, password } = this.loginForm.value;
    this.auth.login(email!, password!).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.result === 'OK') {
          this.successMsg = 'Login correcto. Redirigiendo...';
          setTimeout(() => this.router.navigate(['/usuarios']), 600);
        } else {
          this.errorMsg = res?.error ?? 'Credenciales incorrectas';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.error ?? 'Error en la petición de login';
      }
    });
  }

  submitRegister() {
    if (this.registerForm.invalid) {
      this.errorMsg = 'Completa todos los campos obligatorios del registro.';
      return;
    }
    this.loading = true;
    this.errorMsg = '';
    const payload = this.registerForm.value;
    this.auth.register(payload).subscribe({
      next: (res) => {
        this.loading = false;
        if (res?.result === 'OK') {
          this.successMsg = 'Registro correcto. Inicia sesión.';
          this.setTab('login');
          this.loginForm.patchValue({ email: payload.email, password: '' });
        } else {
          this.errorMsg = res?.error ?? 'Error al registrar';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.error ?? 'Error en la petición de registro';
      }
    });
  }
}
