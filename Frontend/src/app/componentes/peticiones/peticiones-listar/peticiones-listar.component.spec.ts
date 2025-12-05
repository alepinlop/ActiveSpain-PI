import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeticionesListarComponent } from './peticiones-listar.component';

describe('PeticionesListarComponent', () => {
  let component: PeticionesListarComponent;
  let fixture: ComponentFixture<PeticionesListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeticionesListarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeticionesListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
