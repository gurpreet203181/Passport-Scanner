import { Component, OnInit } from '@angular/core';
import { CameraEnhancer } from 'dynamsoft-camera-enhancer';
import { LabelRecognizer } from 'dynamsoft-label-recognizer';
import { Router } from '@angular/router';

@Component({
  selector: 'app-scanner',
  templateUrl: './scanner.page.html',
  styleUrls: ['./scanner.page.scss'],
})
export class ScannerPage implements OnInit {
  constructor(private route: Router) {}

  ngOnInit() {}

  getMrzCode(txt: string) {
    this.route.navigate(['/document-details'], {
      state: {
        mrzRawText: txt,
      },
    });
  }
}
