import { TestBed } from '@angular/core/testing';

import { ServiciosService } from './servicios.service';

describe('ServiciosService', () => {
  let service: ServiciosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiciosService);
  });

  it('deberia crearse', () => {
    // Compruebo que el servicio se crea correctamente
    expect(service).toBeTruthy();
  });
});
