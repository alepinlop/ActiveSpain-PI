import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes),
  provideHttpClient()]
};

// app.config.ts
export const APP_CONFIG = {
  API_URL: 'https://activespain.infinityfree.me/servicios.php'
  // local
  // API_URL: 'http://localhost/Ejercicios/ProyectoIntegrado/Backend/servicios.php'
};