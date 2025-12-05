import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfertasBorrarComponent } from './ofertas-borrar.component';

describe('OfertasBorrarComponent', () => {
  let component: OfertasBorrarComponent;
  let fixture: ComponentFixture<OfertasBorrarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfertasBorrarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfertasBorrarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
