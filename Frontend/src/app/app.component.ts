// src/app/app.component.ts
import { Component, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './servicios/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'ProyectoIntegrado';
  currentUserName: string | null = null;
  private sub?: Subscription;

  // control del menú móvil
  isMenuOpen = false;

  constructor(private auth: AuthService, private router: Router) {
    this.sub = this.auth.currentUser$.subscribe(u => {
      if (u) {
        this.currentUserName = (u.nombre ?? '') + (u.apellidos ? ' ' + u.apellidos : '');
      } else {
        this.currentUserName = null;
      }
    });
  }

  logout() {
    this.isMenuOpen = false;
    this.auth.logout('/auth');
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  go(route: string) {
    // Navegar y cerrar menú móvil
    this.router.navigate([route]);
    this.isMenuOpen = false;
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
