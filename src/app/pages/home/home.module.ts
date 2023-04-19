import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';

import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { DocumentReader } from '@regulaforensics/ionic-native-document-reader/ngx';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, HomePageRoutingModule],
  providers: [AndroidPermissions, DocumentReader],
  declarations: [HomePage],
})
export class HomePageModule {}
