import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './home.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgbAlertModule, NgbCollapseModule, NgbProgressbarModule, NgbTypeaheadModule} from '@ng-bootstrap/ng-bootstrap';
import {AgGridModule} from 'ag-grid-angular';
import {HttpClientModule} from '@angular/common/http';
import { RegistrationDownloadButtonComponent } from './registration-download-button.component';



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
    NgbProgressbarModule
  ],
  declarations: [
    HomeComponent,
    RegistrationDownloadButtonComponent,
  ],
  exports : [
    CommonModule,
    HomeComponent
  ],
  providers: [],
  bootstrap: [HomeComponent]
})
export class HomeModule { }