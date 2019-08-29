import { TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { EnvService } from 'src/app/services/env.service';
import { EnvServiceProvider } from '../../../services/env.service.provider';

import { SurveysService } from './surveys.service';

describe('SurveysService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      HttpClientModule,
    ],
    providers: [
      EnvServiceProvider,
    ]}));

  it('should be created', () => {
    const service: SurveysService = TestBed.get(SurveysService);
    expect(service).toBeTruthy();
  });
});
