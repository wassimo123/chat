import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartenaireEtablissementsComponent } from './partenaire-etablissements.component';

describe('PartenaireEtablissementsComponent', () => {
  let component: PartenaireEtablissementsComponent;
  let fixture: ComponentFixture<PartenaireEtablissementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartenaireEtablissementsComponent]
    });
    fixture = TestBed.createComponent(PartenaireEtablissementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
