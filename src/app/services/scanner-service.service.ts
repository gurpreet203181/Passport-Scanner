import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface scanData {
  data: any;
  base64Img: string | undefined | null;
}

@Injectable({
  providedIn: 'root',
})
export class ScannerServiceService {
  public scannedData = new BehaviorSubject<scanData>({
    data: '',
    base64Img: '',
  });

  constructor() {}

  getLatestScanData(): Observable<scanData> {
    return this.scannedData;
  }
}
