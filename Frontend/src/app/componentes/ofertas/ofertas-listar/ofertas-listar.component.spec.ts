import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfertasListarComponent } from './ofertas-listar.component';

describe('OfertasListarComponent', () => {
  let component: OfertasListarComponent;
  let fixture: ComponentFixture<OfertasListarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfertasListarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfertasListarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
