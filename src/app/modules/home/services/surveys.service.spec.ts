import { TestBed } from '@angular/core/testing';

import { SurveysService } from './surveys.service';

describe('SurveysService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SurveysService = TestBed.get(SurveysService);
    expect(service).toBeTruthy();
  });
});
