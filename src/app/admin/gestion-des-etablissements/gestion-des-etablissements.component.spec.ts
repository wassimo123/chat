import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDesEtablissementsComponent } from './gestion-des-etablissements.component';

describe('GestionDesEtablissementsComponent', () => {
  let component: GestionDesEtablissementsComponent;
  let fixture: ComponentFixture<GestionDesEtablissementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionDesEtablissementsComponent]
    });
    fixture = TestBed.createComponent(GestionDesEtablissementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
