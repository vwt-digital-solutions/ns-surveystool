import { Component, ViewChild, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, merge } from 'rxjs';

import { RegistrationDownloadButtonComponent } from '../utils/registration-download-button.component';

import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

import { EnvService } from 'src/app/services/env.service';
import { throwError } from 'rxjs';

import { saveAs } from 'file-saver';
import { ProgressAwareButton } from '../download-button/download-button.component';

/**
 * Saves a file by opening file-save-as dialog in the browser
 * using file-save library.
 * @param blobContent file content as a Blob
 * @param fileName name file should be saved as
 */
export const saveFile = (blobContent: Blob, fileName: string) => {
  const blob = new Blob([blobContent], { type: 'application/octet-stream' });
  saveAs(blob, fileName);
};

export const getFileNameFromResponseContentDisposition = (res: Response) => {
  const contentDisposition = res.headers.get('content-disposition') || '';
  const matches = /filename=([^;]+)/ig.exec(contentDisposition);
  const fileName = (matches[1] || 'untitled').trim();
  return fileName;
};

interface Nonce {
  nonce: string;
  mime_type?: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @ViewChild('downloadCSV') downloadCSV: ProgressAwareButton;
  @ViewChild('downloadZIP') downloadZIP: ProgressAwareButton;
  model: any;

  private sucessIssued = new Subject<string>();

  public frameworkComponents;
  staticAlertClosed = false;
  successMessage: string;
  progressBar: number;
  public context;
  public rowData;
  public columnDefs;
  public defaultColDef;
  public rowSelection;
  public getRowNodeId: (data) => any;
  public downloadNoImagesFound;
  public showDownloadView = true;
  public registrations: { regIds: any[]; id: string; detail: any[] } = {
    id: '', detail: [], regIds: []
  };

  public gridApi;
  public gridColumnApi;

  constructor(
    private httpClient: HttpClient,
    private env: EnvService,
  ) {
    this.columnDefs = [
      { headerName: 'Download', field: 'download', sortable: true, filter: true, cellRenderer: 'childMessageRenderer', width: 180 },
      { headerName: 'S/N', field: 'serialNumber', sortable: true, filter: true, width: 100 },
      { headerName: 'Site no.', field: 'siteID', sortable: true, filter: true, width: 130 },
      { headerName: 'Date', field: 'date', sortable: true, filter: true, width: 200 },
      { headerName: 'Location', field: 'location', sortable: true, filter: true, width: 350 },
    ];
    this.rowSelection = 'single';
    this.defaultColDef = { resizable: true };
    this.getRowNodeId = data => data.serialNumber;
    this.rowData = this.registrations.id === '' ? [] : this.createRowData();
    this.frameworkComponents = {
      childMessageRenderer: RegistrationDownloadButtonComponent
    };
    this.context = {
      componentParent: this,
      downloadEnd: false,
      downloadNeverStarted: false,
    };
  }

  surveyName = () => !this.model ? '<i class=\'fas fa-sync-alt fa-spin\'></i>' : this.model.name;

  createRowData() {
    const api = this.gridApi;
    const rowData = [];
    this.registrations.regIds.map(reg => {
      rowData.push({
        serialNumber: reg.serial_number,
        siteID: reg.site_id,
        date: new Date(reg.date_of_registration).toLocaleString(),
        location: reg.site_location,
      });
    });
    api.setRowData(rowData);
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    params.api.sizeColumnsToFit();
  }

  // STYLING
  ngOnInit(): void {
    setTimeout(() => this.staticAlertClosed = true, 20);

    this.sucessIssued.subscribe((message) => this.successMessage = message);
    this.sucessIssued.pipe(
      debounceTime(5000)
    ).subscribe(() => this.successMessage = null);
  }

  public changeSuccessMessage(registrationId) {
    this.sucessIssued.next(`Registration images for >> ${registrationId} has been successfully downloaded`);
  }

  // END STYLING

  // CallBacks
  clearData() {
    // Empty RowData and registration ID
    const api = this.gridApi;
    const { regIds } = this.registrations;
    api.setRowData([]);
    regIds.splice(0, regIds.length);
  }

  public isClicked: (model) => void = model => {
    this.getSelectedSurvey(model);
    model && !!model.survey_id ?
      this.getSurveyRegistrations(model.survey_id) : model && model.length === 0 ?
        // tslint:disable-next-line: no-unused-expression
        this.clearData() : undefined;
  }

  downloadNoImages() {
    // TODO Needs rework on disabling the button
    return true;
  }

  public getSelectedSurvey(model) {
    // On focus, get the selected Survey id
    if (typeof model === 'string') {
      // tslint:disable-next-line: no-unused-expression
      model.length === 0 ? this.clearData() : undefined;
      // Capture string from search button
      const searchString = [];
      this.registrations.detail.filter(
        registration => registration.name === model ? searchString.push(registration) : undefined);
      this.model = searchString[0];
      this.registrations.id = searchString.length > 0 ? searchString[0].survey_id : undefined;
    } else {
      this.registrations.id = model ? model.survey_id : undefined;
    }
    setTimeout(() => { this.createRowData(); }, 1000);
  }

  public getSurveyRegistrations(surveyId: string) {
    const { regIds } = this.registrations;
    this.httpClient.get(
      this.env.apiUrl + `/surveys/${surveyId}/registrations`).subscribe(
        result => {
          const folders = Object.values(result).flat(1);
          // tslint:disable-next-line: no-unused-expressio
          this.model.survey_id ? (regIds.splice(0, regIds.length),
            regIds.push(...folders.map(regs => regs))) : console.warn('>> Refreshing >>');
        });
    setTimeout(() => { this.createRowData(); }, 1000);
  }

  public getSurveysCsv(surveyId: string) {
    const that = this;

    this.httpClient.get<Nonce>(this.env.apiUrl + `/surveys/${surveyId}/registrations/csvfiles`)
      .subscribe(nonce => {
        this.downloadCSV.stopProgress('Data ready, download started', true);
        const hiddenElement = document.createElement('a');
        hiddenElement.href = that.env.apiUrl + `/surveys/${nonce.nonce}`;
        hiddenElement.target = '_blank';
        hiddenElement.click();
      },
        reason => {
          console.log(JSON.stringify(reason));
          this.downloadCSV.stopProgress('Error preparing data, please contact support', false);
          return throwError(reason);
        });
  }

  public getSurveysZip(surveyId: string) {
    const that = this;

    this.httpClient.get<Nonce>(
      this.env.apiUrl + `/surveys/${surveyId}/registrations/archives`)
      .subscribe(
        nonce => {
          this.downloadZIP.stopProgress('Data ready, download started', true);
          const hiddenElement = document.createElement('a');
          hiddenElement.href = that.env.apiUrl + `/surveys/${nonce.nonce}`;
          hiddenElement.target = '_blank';
          hiddenElement.click();
        },
        reason => {
          this.downloadZIP.stopProgress('Error preparing data, please contact support', false);
          return throwError(reason);
        }
      );
  }

  getSurveysImagesZip(surveyId: string, registrationId: number) {
    const that = this;
    // @ts-ignore
    for (let index = 0; index < 10; index++) {
      this.registrations.detail.filter(registration => {
        return registration.survey_id === surveyId && registration.has_images ?
          this.httpClient.get<Nonce>(
            this.env.apiUrl +
            `/surveys/${surveyId}/registrations/${registrationId}/images/archives`).subscribe(
              nonce => {
                this.changeSuccessMessage(registrationId);
                try {
                  that.changeSuccessMessage(registrationId);
                  const hiddenElement = document.createElement('a');
                  hiddenElement.href = that.env.apiUrl + `/surveys/${nonce.nonce}`;
                  hiddenElement.target = '_blank';
                  hiddenElement.click();
                } catch {
                }
              },
              reason => {
                return throwError(reason);
              }
            ) : this.downloadNoImages();
      });
      }
  }
}
