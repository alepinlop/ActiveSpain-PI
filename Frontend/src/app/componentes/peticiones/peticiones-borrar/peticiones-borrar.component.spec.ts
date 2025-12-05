import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeticionesBorrarComponent } from './peticiones-borrar.component';

describe('PeticionesBorrarComponent', () => {
  let component: PeticionesBorrarComponent;
  let fixture: ComponentFixture<PeticionesBorrarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeticionesBorrarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeticionesBorrarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
