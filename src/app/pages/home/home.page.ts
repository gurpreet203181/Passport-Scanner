import {
  Component,
  OnInit,
  EventEmitter,
  Output,
  NgZone,
  ApplicationRef,
} from '@angular/core';
import { Router } from '@angular/router';
import { Platform, ToastController } from '@ionic/angular';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import {
  DocumentReader,
  DocumentReaderCompletion,
  ScenarioIdentifier,
} from '@regulaforensics/ionic-native-document-reader/ngx';
import { ScannerServiceService } from 'src/app/services/scanner-service.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  initialized: boolean = false;
  @Output()
  updateSelection = new EventEmitter<any>(false);
  constructor(
    private route: Router,
    public platform: Platform,
    private androidPermissions: AndroidPermissions,
    private documentReader: DocumentReader,
    private service: ScannerServiceService,
    private toastController: ToastController,
    public appRef: ApplicationRef
  ) {}

  async ngOnInit() {
    this.updateSelection.subscribe((value) => {
      console.log(value);
      this.initialized = value;
      this.appRef.tick();
    });
  }
  async ionViewWillEnter() {
    var app = this;
    app.platform.ready().then(() => {
      readFile((license: any) => {
        this.documentReader.prepareDatabase('Full').subscribe((r) => {
          if (r != 'database prepared') {
          } else {
            this.documentReader
              .initializeReader({
                license: license,
                delayedNNLoad: true,
              })
              .then((m) => {
                console.log('initialized');
                this.onInitialized();
              })
              .catch((error1) => console.log('error', error1));
          }
        });
      });
    });

    /**
     * It reads a file from the assets folder, converts it to a blob, and then converts the blob to a
     * base64 string
     */
    async function readFile(callback: any) {
      var reader = new FileReader();

      //get blob from local file
      let blob = await fetch('./assets/regula.license').then((r) => r.blob());

      const realFileReader = (reader as any)._realReader;
      realFileReader.readAsDataURL(blob);

      realFileReader.onloadend = (e: any) => {
        var data = e.target.result;
        data = data.substring(data.indexOf(',') + 1);

        callback(data);
      };
      realFileReader.onerror = function (error: any) {
        console.log(error);
        console.log('reader fail');
      };
    }
  }
  async onInitialized() {
    await this.documentReader.setConfig({
      processParams: {
        scenario: ScenarioIdentifier.SCENARIO_MRZ,
      },
    });
    this.updateSelection.emit(true);
  }

  /**
   * The function scanMRZCode() is called when the user clicks on the button with the text "Scan MRZ
   * Code" on the home page. The function then navigates to the scanner page
   */
  async scanMRZCode() {
    let data: any;

    this.documentReader.showScanner().subscribe((m) => {
      /* Converting the JSON string to a JSON object and then converting the JSON object to a
      DocumentReaderCompletion object. */
      data = DocumentReaderCompletion.fromJson(JSON.parse(m))?.results;
      if (data != undefined) {
        let dataFields: any = {};

        const result = data?.textResult?.fields;
        console.log(result);
        const documentType = result.find(
          (field: any) => field.fieldName == 'Document class code'
        );
        console.log(result);

       // if (documentType.value == 'P') {
          result.map((field: any) => {
            switch (field.fieldName) {
              case 'Surname':
                dataFields['lastName'] = field.value;

                break;
              case 'Given name':
                dataFields['firstName'] = field.value;

                break;
              case 'Document number':
                dataFields['documentNumber'] = field.value;

                break;
              case 'Nationality code':
                dataFields['nationality'] = field.value;

                break;
              case 'Date of birth':
                dataFields['birthDate'] = field.value;

                break;
              case 'Sex':
                if (field.value == 'M') {
                  dataFields['sex'] = 'MALE';
                } else if (field.value == 'F') {
                  dataFields['sex'] = 'FEMALE';
                } else dataFields['sex'] = 'X';

                break;
              case 'Date of expiry':
                dataFields['expirationDate'] = field.value;

                break;
              case 'MRZ lines':
                dataFields['mrzLines'] = field.value.replaceAll('^', '\n');

                break;
              default:
                break;
            }
          });

          let dataObject = {
            data: dataFields,
            base64Img: data?.graphicResult?.fields
              ? data.graphicResult.fields[0].value
              : null,
          };
          /* A service that is used to pass data between pages. */
          this.service.scannedData.next(dataObject);
          /* Navigating to the document-details page. */
          this.route.navigate(['document-details']);
        //}
      } else {
        this.presentToast();
      }
    });
  }
  async presentToast() {
    const toast = await this.toastController.create({
      message: 'Passport required',
      duration: 1500,
      position: 'middle',
    });

    await toast.present();
  }
}
