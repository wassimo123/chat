import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartenairePromotionsComponent } from './partenaire-promotions.component';

describe('PartenairePromotionsComponent', () => {
  let component: PartenairePromotionsComponent;
  let fixture: ComponentFixture<PartenairePromotionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartenairePromotionsComponent]
    });
    fixture = TestBed.createComponent(PartenairePromotionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
