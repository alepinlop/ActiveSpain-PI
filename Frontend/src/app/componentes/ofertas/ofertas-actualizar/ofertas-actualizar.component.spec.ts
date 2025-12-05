import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfertasActualizarComponent } from './ofertas-actualizar.component';

describe('OfertasActualizarComponent', () => {
  let component: OfertasActualizarComponent;
  let fixture: ComponentFixture<OfertasActualizarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfertasActualizarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfertasActualizarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
