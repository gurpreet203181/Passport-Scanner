import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-document-details',
  templateUrl: './document-details.page.html',
  styleUrls: ['./document-details.page.scss'],
})
export class DocumentDetailsPage implements OnInit {
  mrzRawText!: string;
  constructor() {}

  ngOnInit() {}
  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    if (history.state.mrzRawText) {
      this.mrzRawText = history.state.mrzRawText;
      console.log('result:' + this.mrzRawText);
    }
  }
}
