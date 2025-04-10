import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionDesEvenementsComponent } from './gestion-des-evenements.component';

describe('GestionDesEvenementsComponent', () => {
  let component: GestionDesEvenementsComponent;
  let fixture: ComponentFixture<GestionDesEvenementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GestionDesEvenementsComponent]
    });
    fixture = TestBed.createComponent(GestionDesEvenementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
