import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './components/home/home.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbAlertModule, NgbCollapseModule, NgbProgressbarModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { AgGridModule } from 'ag-grid-angular';
import { HttpClientModule } from '@angular/common/http';
import { NgxSelectModule, INgxSelectOptions } from 'ngx-select-ex';
import { RegistrationDownloadButtonComponent } from './components/utils/registration-download-button.component';
import { SearchComponent } from './components/search/search.component';
import { DownloadButtonComponent } from './components/download-button/download-button.component';
import { SelectComponent } from './components/select/select.component';
import { SurveysService } from './services/surveys.service';

const customSelectOptions: INgxSelectOptions = { // Check the interface for more options
  keepSelectedItems: true
};



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgbTypeaheadModule,
    NgbCollapseModule,
    ReactiveFormsModule,
    HttpClientModule,
    AgGridModule.withComponents([RegistrationDownloadButtonComponent]),
    NgbAlertModule,
    NgbProgressbarModule,
    NgxSelectModule.forRoot(customSelectOptions)
  ],
  declarations: [
    HomeComponent,
    RegistrationDownloadButtonComponent,
    SearchComponent,
    DownloadButtonComponent,
    SelectComponent,
  ],
  exports: [
    CommonModule,
    HomeComponent
  ],
  providers: [
    SurveysService
  ],
  bootstrap: [HomeComponent]
})
export class HomeModule { }
