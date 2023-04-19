import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DocumentDetailsPageRoutingModule } from './document-details-routing.module';
import { DocumentReader } from '@regulaforensics/ionic-native-document-reader/ngx';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

import { DocumentDetailsPage } from './document-details.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DocumentDetailsPageRoutingModule,
  ],
  providers: [DocumentReader, AndroidPermissions],
  declarations: [DocumentDetailsPage],
})
export class DocumentDetailsPageModule {}
