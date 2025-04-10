import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDesPromotionsComponent } from './gestion-des-promotions.component';

describe('GestionDesPromotionsComponent', () => {
  let component: GestionDesPromotionsComponent;
  let fixture: ComponentFixture<GestionDesPromotionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionDesPromotionsComponent]
    });
    fixture = TestBed.createComponent(GestionDesPromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
