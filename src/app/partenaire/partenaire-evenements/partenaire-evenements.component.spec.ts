import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartenaireEvenementsComponent } from './partenaire-evenements.component';

describe('PartenaireEvenementsComponent', () => {
  let component: PartenaireEvenementsComponent;
  let fixture: ComponentFixture<PartenaireEvenementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartenaireEvenementsComponent]
    });
    fixture = TestBed.createComponent(PartenaireEvenementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
