import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfertasCrearComponent } from './ofertas-crear.component';

describe('OfertasCrearComponent', () => {
  let component: OfertasCrearComponent;
  let fixture: ComponentFixture<OfertasCrearComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfertasCrearComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OfertasCrearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
