import { Injectable } from '@angular/core';
import { DomService } from 'src/app/infrastructure/services/dom.service';
import { ConfirmUploadComponent } from '../confirm-upload/confirm-upload.component';
import { UploadItem } from '../upload-item';
import { ElectronService } from 'src/app/infrastructure/services/electron.service';
import { S3Service } from './s3.service';

@Injectable({
  providedIn: 'root'
})
export class RequestUploadService {

  toPrompt = true;
  constructor(
    private dom: DomService,
    private s3: S3Service,
    private electron: ElectronService
  ) { }
  init() {
    this.electron.onCD('Settings-SettingsChanged', (event: string, arg: any) => {
      this.toPrompt = arg['prompt-upload'];
    });
  }

  requestUpload(account: string, bucket: string, prefix: string, items: UploadItem[]) {
    if (this.toPrompt) {
      let comp = this.dom.appendComponentToBody(ConfirmUploadComponent);
      comp.instance.account = account;
      comp.instance.bucket = bucket;
      comp.instance.prefix = prefix;
      comp.instance.Items = items;
      comp.instance.promptSetting = this.toPrompt;
      comp.instance.toClose.subscribe(_ => {
        comp.destroy();
      });
    } else {
      items.forEach(it => {
        this.s3.requestUpload(account, bucket, it.path, prefix + it.newName);
      });
    }
  }
}
