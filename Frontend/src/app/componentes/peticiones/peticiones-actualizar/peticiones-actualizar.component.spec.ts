import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeticionesActualizarComponent } from './peticiones-actualizar.component';

describe('PeticionesActualizarComponent', () => {
  let component: PeticionesActualizarComponent;
  let fixture: ComponentFixture<PeticionesActualizarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeticionesActualizarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeticionesActualizarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
