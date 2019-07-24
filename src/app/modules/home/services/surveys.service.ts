import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from 'src/app/services/env.service';
import { Observable } from 'rxjs';
import { Nonce } from 'src/app/models/nonce';

@Injectable({
  providedIn: 'root'
})
export class SurveysService {

  constructor(
    private httpClient: HttpClient,
    private env: EnvService
  ) { }

  public getSurveyRegistrations(surveyId: string): Observable<any> {
    return this.httpClient.get(
      this.env.apiUrl + `/surveys/${surveyId}/registrations`);
  }

  public getSurveysCsv(surveyId: string): Observable<Nonce> {
    return this.httpClient.get<Nonce>(this.env.apiUrl + `/surveys/${surveyId}/registrations/csvfiles`);
  }

  public getSurveysZip(surveyId: string): Observable<Nonce> {
    return this.httpClient.get<Nonce>(
      this.env.apiUrl + `/surveys/${surveyId}/registrations/archives`);
  }

  public getSurveysImagesZip(surveyId: string, registrationId: number): Observable<Nonce> {
    return this.httpClient.get<Nonce>(
      this.env.apiUrl +
      `/surveys/${surveyId}/registrations/${registrationId}/images/archives`);
  }

  public triggerDownload(nonce: Nonce) {
    const hiddenElement = document.createElement('a');
    hiddenElement.href = this.env.apiUrl + `/surveys/${nonce.nonce}`;
    hiddenElement.target = '_blank';
    hiddenElement.click();
  }
}
