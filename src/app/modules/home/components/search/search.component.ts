import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { NgbTypeahead } from '@ng-bootstrap/ng-bootstrap';
import { Subject, Observable, merge } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { EnvService } from '../../../../services/env.service';
import { HomeComponent } from '../home/home.component';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
  @ViewChild('instance') instance: NgbTypeahead;
  @Input() handler: HomeComponent;

  focus$ = new Subject<string>();
  click$ = new Subject<string>();

  lookupLoaded = false;

  private folderContents: any;

  constructor(
    private httpClient: HttpClient,
    private env: EnvService,
  ) {
   }

  ngOnInit() {
    this.folderContents = this.getFolderContents();
  }

  public getFolderContents( ) {
    const { detail } = this.handler.registrations;
    const that = this; // eslint-disable-line @typescript-eslint/no-this-alias
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
        that.lookupLoaded = true;
      },
      reason => {
        console.error('Error', reason);
      }
    );
  }

  // SEARCH

  searchSurveyButton() {
    this.handler.clearData();
    this.handler.showDownloadView = false; // Show the drop Down
    this.handler.getSelectedSurvey(this.handler.model);
    this.handler.isClicked(this.handler.model);
    setTimeout(() => { this.handler.createRowData(); }, 500);

  }

  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;

    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (
        term === '' ? [] :
          this.handler.registrations.detail.filter(v => v.name.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 5))
    );
  }

  formatter = (survey: { name: string }) => survey.name;

  // END SEARCH
}
