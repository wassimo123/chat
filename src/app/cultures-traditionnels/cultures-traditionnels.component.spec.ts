import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CulturesTraditionnelsComponent } from './cultures-traditionnels.component';

describe('CulturesTraditionnelsComponent', () => {
  let component: CulturesTraditionnelsComponent;
  let fixture: ComponentFixture<CulturesTraditionnelsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CulturesTraditionnelsComponent]
    });
    fixture = TestBed.createComponent(CulturesTraditionnelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
