import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Platform } from '@ionic/angular';
import { CameraEnhancer, DrawingItem } from 'dynamsoft-camera-enhancer';
import {
  LabelRecognizer,
  EnumDLRImagePixelFormat,
} from 'dynamsoft-label-recognizer';

@Component({
  selector: 'app-mrz-scanner',
  templateUrl: './mrz-scanner.component.html',
  styleUrls: ['./mrz-scanner.component.scss'],
})
export class MrzScannerComponent implements OnInit {
  @Input() DLREngineResourcePath?: string;
  @Input() DCEEngineResourcePath?: string;
  @Input() license?: string;
  recognizer!: LabelRecognizer;
  cameraEnhancer!: CameraEnhancer;
  @Output() onMRZRead = new EventEmitter<string>();
  @ViewChild('container') container: any;
  constructor(public platform: Platform) {}

  ngOnInit() {
    this.startScanning();
  }

  async ngOnDestroy() {
    if (this.recognizer) {
      await this.recognizer.destroyContext();
      this.cameraEnhancer.dispose(false);
      //this.recognizer = null;
      //this.cameraEnhancer = null;
      console.log('VideoRecognizer Component Unmount');
    }
  }

  async startScanning() {
    try {
      this.configure();
      let cameraEnhancer = await CameraEnhancer.createInstance();
      await cameraEnhancer.setUIElement((this as any).container.nativeElement);

      LabelRecognizer.onResourcesLoadStarted = () => {
        console.log('load started...');
      };
      LabelRecognizer.onResourcesLoadProgress = (resourcesPath, progress) => {
        console.log(
          'Loading resources progress: ' +
            progress?.loaded +
            '/' +
            progress?.total
        );
      };
      LabelRecognizer.onResourcesLoaded = () => {
        console.log('load ended...');
      };
      let recognizer = await LabelRecognizer.createInstance();
      recognizer.ifSaveOriginalImageInACanvas = true;
      await recognizer.setImageSource(cameraEnhancer, {
        resultsHighlightBaseShapes: DrawingItem,
      });
      await recognizer.updateRuntimeSettingsFromString('video-mrz');
      // Callback to MRZ recognizing result
      recognizer.onMRZRead = (txt: string, results: any) => {
        if (this.onMRZRead) {
          const valid = this.validateMRZ(txt);
          if (valid === true) {
            this.onMRZRead.emit(txt);
          } else {
            console.log('Invalid mrz code.');
          }
        }
      };
      await recognizer.startScanning(true);

      let st = 0;
      recognizer.onImageRead = (img) => {
        st++;
        if (st < 8) {
        }
      };

      this.cameraEnhancer = cameraEnhancer;
      this.recognizer = recognizer;
    } catch (ex: any) {
      let errMsg: string;
      if (ex.message.includes('network connection error')) {
        errMsg =
          'Failed to connect to Dynamsoft License Server: network connection error. Check your Internet connection or contact Dynamsoft Support (support@dynamsoft.com) to acquire an offline license.';
      } else {
        errMsg = ex.message || ex;
      }
      console.error(errMsg);
      alert(errMsg);
    }
  }

  validateMRZ(mrzText: string) {
    const parse = require('mrz').parse;
    let mrz = mrzText.split('\n');
    const result = parse(mrz);
    return result.valid;
  }

  configure() {
    let pDLR: any = LabelRecognizer;
    if (pDLR._pLoad.isFulfilled === false) {
      if (this.DLREngineResourcePath) {
        LabelRecognizer.engineResourcePath = this.DLREngineResourcePath;
      } else {
        LabelRecognizer.engineResourcePath =
          this.getDefaultDLREngineResourcePath();
      }
      if (this.DCEEngineResourcePath) {
        CameraEnhancer.engineResourcePath = this.DCEEngineResourcePath;
      } else {
        CameraEnhancer.engineResourcePath =
          this.getDefaultDCEEngineResourcePath();
      }
      if (this.license) {
        LabelRecognizer.license = this.license;
      } else {
        LabelRecognizer.license =
          'DLS2eyJoYW5kc2hha2VDb2RlIjoiMjAwMDAxLTE2NDk4Mjk3OTI2MzUiLCJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSIsInNlc3Npb25QYXNzd29yZCI6IndTcGR6Vm05WDJrcEQ5YUoifQ==';
      }
    }
  }

  getDefaultDLREngineResourcePath(): string {
    return '/assets/dlr/';
  }

  getDefaultDCEEngineResourcePath(): string {
    return '/assets/dce/';
  }
}
