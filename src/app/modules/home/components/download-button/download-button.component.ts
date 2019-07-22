import { Component, OnInit, Input, HostListener } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface ProgressAwareButton {
  startProgress(message: string);
  stopProgress(message: string, success: boolean);
}

@Component({
  selector: 'app-download-button',
  templateUrl: './download-button.component.html',
  styleUrls: ['./download-button.component.scss']
})
export class DownloadButtonComponent implements OnInit {

  @Input() title: string;
  @Input() handler: HomeComponent;
  @Input() buttonTitle: string;
  @Input() kind: string;

  public buttonClass = '';
  public buttonInner = '';
  public statusMessage = '';
  public statusClass = '';

  private status$ = new Subject<string>();

  constructor() { }

  ngOnInit() {
    this.buttonInner = this.buttonTitle + `&nbsp;<i class="fas fa-file-${this.kind}"></i>&nbsp;<i class="fas fa-save"></i>`;

    this.status$.subscribe((message: string) => this.statusMessage = message );
    this.status$.pipe(debounceTime(5000)).subscribe(() => this.statusMessage = '' );
  }

  @HostListener('click')
  public startProgress(message: string) {
    this.buttonInner = this.buttonTitle + '&nbsp;<i class="fas fa-sync-alt fa-spin"></i>';
    this.statusMessage = 'Start Preparing Data';
    this.statusClass = 'progress';
  }

  public stopProgress(message: string, success: boolean) {
    this.buttonInner = this.buttonTitle + `&nbsp;<i class="fas fa-file-${this.kind}"></i>&nbsp;`
     + (success ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>');
    this.statusClass = success ? 'success' : 'failure';
    this.finalStatusSet(message);
  }

  private finalStatusSet(message: string) {
    this.status$.next(message);
  }
}
