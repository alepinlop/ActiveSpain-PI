import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeticionesCrearComponent } from './peticiones-crear.component';

describe('PeticionesCrearComponent', () => {
  let component: PeticionesCrearComponent;
  let fixture: ComponentFixture<PeticionesCrearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeticionesCrearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeticionesCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
