import {
  ApplicationRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import {
  ScannerServiceService,
  scanData,
} from 'src/app/services/scanner-service.service';
import {
  DocumentReader,
  DocumentReaderCompletion,
} from '@regulaforensics/ionic-native-document-reader/ngx';
import { Clipboard } from '@capacitor/clipboard';
import {  Subscription } from 'rxjs';
import { Platform, ToastController } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { AlertController } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';
import { Media, MediaSaveOptions } from '@capacitor-community/media';

@Component({
  selector: 'app-document-details',
  templateUrl: './document-details.page.html',
  styleUrls: ['./document-details.page.scss'],
})
export class DocumentDetailsPage implements OnInit {
  data!: scanData;
  mrzDetails!: any;
  nfcTagData!: any;
  clipboardString: string = '';
  subscriptions!: Subscription;
  error!:any ;
  @Output()
  updateSelection = new EventEmitter<any>();
  rfidData: any;

  constructor(
    private service: ScannerServiceService,
    private documentReader: DocumentReader,
    public appRef: ApplicationRef,
    public platform: Platform,
    private androidPermissions: AndroidPermissions,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  ngOnInit() {
    this.service.getLatestScanData().subscribe((data) => {
      this.data = data;
      this.mrzDetails = this.data.data;

      this.updateSelection.subscribe((response) => {
        console.log(response);

        this.rfidData = response;
        this.appRef.tick();
      });
    });
  }

  ionViewWillLeave() {
    this.updateSelection.emit();
  }

  openRFIDReader() {
    if(Capacitor.getPlatform() === 'android') {
      this.androidPermissions
      .checkPermission(this.androidPermissions.PERMISSION.NFC)
      .then(
        (result) => {
          if (result.hasPermission) {
            this.startRfidReader();
          } else {
            this.androidPermissions
              .requestPermissions([this.androidPermissions.PERMISSION.NFC])
              .then((result) => {
                if (result.hasPermission) {
                  this.startRfidReader();
                } else {
                  this.presentRequestPermissionAlert();
                }
              });
          }
        },
        (err) => {
          this.androidPermissions
            .requestPermission(this.androidPermissions.PERMISSION.NFC)
            .then((result) => {
              if (result.hasPermission) {
                this.startRfidReader();
              } else {
                this.presentRequestPermissionAlert();
              }
            });
        }
      );
    }
    else{
      this.startRfidReader();
    }
   
  }
  /**
   * It opens the RFID reader and prints the data to the screen.
   */
  startRfidReader() {
    try {
      this.documentReader.startRFIDReader().subscribe((m) => {
        const data = DocumentReaderCompletion.fromJson(JSON.parse(m))?.results;
  
        if (data?.rfidResult == 1) {
          console.log(data);
          const filteredData = data?.textResult?.fields?.filter((field) => {
            switch (field.fieldName) {
              case 'Surname':
                return false;
                break;
              case 'Given name':
                return false;
                break;
              case 'Document number':
                return false;
                break;
              case 'Nationality':
                return false;
                break;
              case 'Date of birth':
                return false;
                break;
              case 'Sex':
                return false;
                break;
              case 'Date of expiry':
                return false;
                break;
              case 'MRZ lines':
                return false;
                break;
              default:
                //return true;
                break;
            }
  
            switch (field.value) {
              case '':
                return false;
                break;
  
              default:
                break;
            }
            return true;
          });
          const obj = {
            base64Portrait: data?.graphicResult?.fields
              ? data?.graphicResult?.fields[0].value
              : null,
            fields: filteredData,
          };
  
          this.updateSelection.emit(obj);
        }
        //DocumentReader.stopRFIDReader()
      });
    } catch (error) {
      this.error = error
    }
    
  }
  async tryAgianRFIDReader() {
    this.openRFIDReader();
  }
  async presentRequestPermissionAlert() {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: 'NFC permission denied',
      message: 'Failed to open Nfc!',
      buttons: ['OK'],
    });

    await alert.present();
  }
  async writeToClipboard() {
    this.clipboardString += `Surname : ${this.mrzDetails.lastName}\n`;
    this.clipboardString += `Given Name : ${this.mrzDetails.firstName}\n`;
    this.clipboardString += `Passport Number : ${this.mrzDetails.documentNumber}\n`;
    this.clipboardString += `Nationality : ${this.mrzDetails.nationality}\n`;
    this.clipboardString += `Date of Birth : ${this.mrzDetails.birthDate}\n`;
    this.clipboardString += `Gender : ${this.mrzDetails.sex}\n`;
    this.clipboardString += `Date of Expiry : ${this.mrzDetails.expirationDate}\n`;
    this.clipboardString += `Line1 : ${
      this.mrzDetails.mrzLines.split('\n')[0]
    }\n`;
    this.clipboardString += `Line1 : ${
      this.mrzDetails.mrzLines.split('\n')[1]
    }`;

    await Clipboard.write({
      string: this.clipboardString,
    });
  }

  async saveImg() {
    let opts: MediaSaveOptions = {
      path: 'data:image/jpeg;base64,' + this.data.base64Img,
    };
    if (Capacitor.getPlatform() === 'android') opts['album'] = 'Others';
    await Media.savePhoto(opts)
      .then((result) => {
        this.presentToast();
      })
      .catch((err) => {
        console.log(err);
      });
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'The image has been saved in the gallery',
      duration: 1500,
      position: 'bottom',
    });

    await toast.present();
  }
}

