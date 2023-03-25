import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ScannerPageRoutingModule } from './scanner-routing.module';

import { ScannerPage } from './scanner.page';
import { MrzScannerComponent } from 'src/app/components/mrz-scanner/mrz-scanner.component';
@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, ScannerPageRoutingModule],
  declarations: [ScannerPage, MrzScannerComponent],
})
export class ScannerPageModule {}
