import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecouvrirSfaxComponent } from './decouvrir-sfax.component';

describe('DecouvrirSfaxComponent', () => {
  let component: DecouvrirSfaxComponent;
  let fixture: ComponentFixture<DecouvrirSfaxComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DecouvrirSfaxComponent]
    });
    fixture = TestBed.createComponent(DecouvrirSfaxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
