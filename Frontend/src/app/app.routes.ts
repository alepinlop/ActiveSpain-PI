// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { ListarComponent } from './componentes/usuarios/listar/listar.component';
import { AuthComponent } from './auth/auth.component';
import { OfertasListarComponent } from './componentes/ofertas/ofertas-listar/ofertas-listar.component';
import { PeticionesListarComponent } from './componentes/peticiones/peticiones-listar/peticiones-listar.component';
import { HomeComponent } from './componentes/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },     // <-- ahora Home es la página principal
  { path: 'usuarios', component: ListarComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'ofertas', component: OfertasListarComponent },
  { path: 'peticiones', component: PeticionesListarComponent },
  // opcional: ruta comodín
  // { path: '**', redirectTo: '' }
];
