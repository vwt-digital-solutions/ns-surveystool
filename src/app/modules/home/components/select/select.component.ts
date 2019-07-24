import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnvService } from '../../../../services/env.service';
import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss']
})
export class SelectComponent implements OnInit {
  @Input() handler: HomeComponent;

  lookupLoaded = false;
  items: string[] = [];
  model: string;

  constructor(
    private httpClient: HttpClient,
    private env: EnvService,
  ) {
  }

  ngOnInit() {
    this.getFolderContents();
  }

  public getFolderContents( ) {
    const { detail } = this.handler.registrations;
    const that = this;
    this.httpClient.get(
      this.env.apiUrl + `/surveys`
    ).subscribe(
      result => {
        // Include detail in registration Object
        const formsData = Object.values(result);
        for (const formDetail of formsData) {
          for (const det of formDetail) {
            detail.push(det);
            this.items.push(det.name);
          }
        }
        that.lookupLoaded = true;
      },
      reason => {
        console.error('Error', reason);
      }
    );
  }

  searchSurveyButton() {
    this.handler.clearData();
    const that = this;
    // let new_survey = this.handler.registrations.detail.find(det => det.name === that.model );
    this.handler.showDownloadView = false; // Show the drop Down
    // this.handler.getSelectedSurvey(this.model);
    this.handler.isClicked(this.model);
    setTimeout(() => { this.handler.createRowData(); }, 500);

  }

  public doSelect = (value: any) => console.log('SingleDemoComponent.doSelect', value);
}
