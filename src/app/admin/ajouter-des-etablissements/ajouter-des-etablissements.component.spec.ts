import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AjouterDesEtablissementsComponent } from './ajouter-des-etablissements.component';

describe('AjouterDesEtablissementsComponent', () => {
  let component: AjouterDesEtablissementsComponent;
  let fixture: ComponentFixture<AjouterDesEtablissementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AjouterDesEtablissementsComponent]
    });
    fixture = TestBed.createComponent(AjouterDesEtablissementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
