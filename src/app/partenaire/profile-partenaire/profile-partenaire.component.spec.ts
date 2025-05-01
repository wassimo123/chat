import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePartenaireComponent } from './profile-partenaire.component';

describe('ProfilePartenaireComponent', () => {
  let component: ProfilePartenaireComponent;
  let fixture: ComponentFixture<ProfilePartenaireComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilePartenaireComponent]
    });
    fixture = TestBed.createComponent(ProfilePartenaireComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
