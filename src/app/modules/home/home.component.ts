import { Component, ViewChild, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, merge } from 'rxjs';

import { RegistrationDownloadButtonComponent } from './registration-download-button.component';

import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

import { EnvService } from 'src/app/services/env.service';
import { throwError } from 'rxjs';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { error } from '@angular/compiler/src/util';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  model: any;
  @ViewChild('instance') instance: NgbTypeahead;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
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
  public buttonCsvInner = 'Registrations <i class="fas fa-file-csv"></i>';
  public buttonCsvClass = '';
  public showDownloadView = true;
  public buttonZipInner = 'Registrations and Subforms <i class="fas fa-file-archive"></i>';
  public buttonZipClass = '';
  public registrations: { regIds: any[]; id: string; detail: any[] } = {
    id: '', detail: [], regIds: []
  };

  public gridApi;
  public gridColumnApi;

  private folderContents: any;

  constructor(
    private httpClient: HttpClient,
    private env: EnvService,
  ) {
    this.folderContents = this.getFolderContents();
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

  // SEARCH

  searchSurveyButton() {
    this.clearData();
    this.showDownloadView = false; // Show the drop Down
    this.getSelectedSurvey(this.model);
    this.isClicked(this.model);
    setTimeout(() => { this.createRowData(); }, 500);

  }

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (
        term === '' ? [] :
          this.registrations.detail.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 5))
    );
  }

  formatter = (survey: { name: string }) => survey.name;
  surveyName = () => !this.model ? '<i class=\'fas fa-sync-alt fa-spin\'></i>' : this.model.name;

  // END SEARCH

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
    !!model.survey_id ?
      this.getSurveyRegistrations(model.survey_id) : model.length === 0 ?
        // tslint:disable-next-line: no-unused-expression
        this.clearData() : undefined;
  }

  downloadSurvey(ctx) {
    this.isClicked(this.model);
    this.getSurveysImagesZip(this.registrations.id, ctx.serialNumber);
  }

  downloadNoImages() {
    // TODO Needs rework on disabling the button
    return true;
  }

  public getFolderContents() {
    const { detail } = this.registrations;
    this.httpClient.get(
      this.env.apiUrl + `/surveys`
    ).subscribe(
      result => {
        // Include detail in registration Object
        const formsData = Object.values(result);
        for (const formDetail of formsData) {
          for (const det of formDetail) {
            detail.push(det);
          }
        }
      },
      reason => {
        console.error('Error', reason);
      }
    );
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

  public setDownloadStatus(status: boolean, button: string, registration?: number) {
    const that = this;
    if (status) {
      if (button === 'csv') {
        this.buttonCsvInner = 'Downloaded <i class="fas fa-check"></i>';
        this.buttonCsvClass = 'success';
      } else {
        this.buttonZipInner = 'Downloaded <i class="fas fa-check"></i>';
        this.buttonZipClass = 'success';
      }

      setTimeout(() => {
        if (button === 'csv') {
          that.buttonCsvInner = 'Just the results <i class="fas fa-file-csv"></i>';
          that.buttonCsvClass = '';
        } else {
          that.buttonZipInner = 'All files <i class="fas fa-file-archive"></i>';
          that.buttonZipClass = '';
        }
      }, 2000);
    } else {
      if (button === 'csv') {
        this.buttonCsvInner = 'An error occurred. Try again <i class="fas fa-exclamation-triangle"></i>';
        this.buttonCsvClass = 'error';
      } else {
        this.buttonZipInner = 'An error occurred. Try again <i class="fas fa-exclamation-triangle"></i>';
        this.buttonZipClass = 'error';
      }
    }
  }

  public getSurveysCsv(surveyId: string) {
    const that = this;
    this.buttonCsvInner = 'Downloading <i class="fas fa-sync-alt fa-spin"></i>';

    this.httpClient.get(this.env.apiUrl + `/surveys/${surveyId}/registrations/csvfiles`, { responseType: 'blob' }).subscribe(
      result => {
        try {
          const blob = new Blob([result], { type: 'text/csv' });
          const url = window.URL.createObjectURL(blob);
          const hiddenElement = document.createElement('a');

          hiddenElement.href = url;
          hiddenElement.target = '_blank';
          hiddenElement.download = new Date().getTime() + '.csv';

          hiddenElement.click();
          that.setDownloadStatus(true, 'csv');
        } catch {
          that.setDownloadStatus(false, 'csv');
        }
      },
      reason => {
        that.setDownloadStatus(false, 'csv');
        return throwError(reason);
      }
    );
  }

  public getSurveysZip(surveyId: string) {
    const that = this;
    this.buttonZipInner = 'Downloading <i class="fas fa-sync-alt fa-spin"></i>';

    this.httpClient.get(
      this.env.apiUrl + `/surveys/${surveyId}/registrations/archives`, { responseType: 'blob' }).subscribe(
        result => {
          try {
            const url = window.URL.createObjectURL(result);
            const hiddenElement = document.createElement('a');

            hiddenElement.href = url;
            hiddenElement.target = '_blank';
            hiddenElement.download = new Date().getTime() + '.zip';

            hiddenElement.click();
            that.setDownloadStatus(true, 'zip');
          } catch {
            that.setDownloadStatus(false, 'zip');
          }
        },
        reason => {
          that.setDownloadStatus(false, 'zip');
          return throwError(reason);
        }
      );
  }

  getSurveysImagesZip(surveyId: string, registrationId: number) {
    // @ts-ignore
    this.registrations.detail.filter(registration => {
      return registration.survey_id === surveyId && registration.has_images ?
        this.httpClient.get(
          this.env.apiUrl +
          `/surveys/${surveyId}/registrations/${registrationId}/images/archives`, { responseType: 'blob' }).subscribe(
            result => {
              this.changeSuccessMessage(registrationId);
              try {
                this.changeSuccessMessage(registrationId);
                const url = window.URL.createObjectURL(result);
                const hiddenElement = document.createElement('a');
                hiddenElement.href = url;
                hiddenElement.target = '_blank';
                hiddenElement.download = new Date().getTime() + '.zip';

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
