import { TestBed } from '@angular/core/testing';

import { HeritageService } from './heritage.service';

describe('HeritageService', () => {
  let service: HeritageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeritageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
