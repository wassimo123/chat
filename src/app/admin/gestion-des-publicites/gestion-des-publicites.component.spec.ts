import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDesPublicitesComponent } from './gestion-des-publicites.component';

describe('GestionDesPublicitesComponent', () => {
  let component: GestionDesPublicitesComponent;
  let fixture: ComponentFixture<GestionDesPublicitesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionDesPublicitesComponent]
    });
    fixture = TestBed.createComponent(GestionDesPublicitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
