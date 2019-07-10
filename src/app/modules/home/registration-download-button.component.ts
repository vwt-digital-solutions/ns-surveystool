import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  template: `<button [ngClass]="btnImageClass"
                     data-serial-number="serialNumber"
                     id="registrationButton"
                     style="height: 30px"
                     (click)="downloadRegistration()"
                     class="btn btn-outline-primary"
                     [disabled]="disableOnNoRegistrations"
                     [innerHTML]="btnImageInner">
            </button>`,
  styles: [
      `.btn {
      line-height: 0.5
    }`
  ]
})
export class RegistrationDownloadButtonComponent implements ICellRendererAngularComp {
  public params: any;
  public btnImageClass = 'error';
  public btnImageInner = '';
  public serialNumber = '';
  public disableOnNoRegistrations: boolean;

  agInit(params: any): void {
    this.params = params;
    this.btnImageClass = '';
    this.serialNumber = params.data.serialNumber;
    this.btnImageInner = 'Download <i class="fas fa-file-archive"></i>';
  }



  public downloadRegistration() {
    this.disableOnNoRegistrations = this.params.context.downloadNeverStarted;
    this.btnImageInner = 'Download <i class="fas fa-sync-alt fa-spin"></i>';
    this.btnImageClass = this.params.context.componentParent.downloadNoImagesFound ? 'success' : 'error';
    this.params.context.componentParent.downloadSurvey(this.params.data);
  }

  refresh(): boolean {
    return false;
  }
}
