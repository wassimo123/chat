import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartenaireComponent } from './partenaire.component';

describe('PartenaireComponent', () => {
  let component: PartenaireComponent;
  let fixture: ComponentFixture<PartenaireComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartenaireComponent]
    });
    fixture = TestBed.createComponent(PartenaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
