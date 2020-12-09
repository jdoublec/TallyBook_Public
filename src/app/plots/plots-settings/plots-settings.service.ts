import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { PlotsSettings, CameraSettings } from '../plot-data.model';

@Injectable ({providedIn: 'root'})

export class PlotsSettingsService { 
    showPlotsSettings = new BehaviorSubject<boolean>(false);
    plotListChanged = new BehaviorSubject<boolean>(false);
    plotsSettingsChanged = new Subject<PlotsSettings>();
    sphereSettingsChanged = new BehaviorSubject<boolean>(false);   
    planColorChanged = new BehaviorSubject<boolean>(false);
    wellSettingsChanged = new BehaviorSubject<boolean>(false);
    groundboxChanged = new BehaviorSubject<boolean>(false);
    cameraSettingsChanged = new Subject<CameraSettings>();
    // plotsSettings = new BehaviorSubject<PlotsSettings>({   
    
    plotsSettings: PlotsSettings = {
        sphereDiameter: 20,
        sphereColor: '#faf0e6', 
        wellColor: '#0000FF',
        planColor: '#00cd00',
        sphereMat: '',
        wellRatio: 1,
        wellMat: '',
        casingMat: '',
        groundboxName: "blueSpace",
        // skyboxName: "ground"
      }; 

    sphereDiameter: number = this.plotsSettings['sphereDiameter'];
    sphereColor: string = this.plotsSettings['sphereColor'];
    sphereMat: string = this.plotsSettings['sphereMat'];
    wellColor: string = this.plotsSettings['wellColor'];
    planColor: string = this.plotsSettings['planColor'];
    wellRatio: number = this.plotsSettings['wellRatio'];
    wellMat: string = this.plotsSettings['wellMat'];
    casingMat: string = this.plotsSettings['casingMat'];

    groundboxName: string = this.plotsSettings['groundboxName'];

    // cameraSettings = new BehaviorSubject<CameraSettings>({
    cameraSettings: CameraSettings = {
      cameraType: "Fly",
      cameraSpeed: 40,
      cameraLocation: 0,
    }

    constructor() {}

    onShowPlotsSettings() {
      this.showPlotsSettings.next(true);
    }

    onHidePlotsSettings() {
      this.showPlotsSettings.next(false);
    }

    onPlotListChanged(changed: boolean) {
      this.plotListChanged.next(changed);
    }

    getCameraSettings() {
      return this.cameraSettings;
    }

    setCameraSettings(cameraSettings: CameraSettings) {
      this.cameraSettings = cameraSettings;
      this.cameraSettingsChanged.next(cameraSettings);
    }    

    getPlotsSettings() {
      return this.plotsSettings;
    }

    setPlotsSettings(plotsSettings: PlotsSettings) {
      let sphereSettingsUpdated: boolean = false;
      let groundboxUpdated: boolean = false;
      let planColorUpdated: boolean = false;
      let wellSettingsUpdated: boolean = false;

      if ((this.sphereDiameter !== plotsSettings['sphereDiameter']) || (this.sphereColor !== plotsSettings['sphereColor']) || 
          (this.sphereMat !== plotsSettings['sphereMat'])) {
            this.sphereDiameter = plotsSettings['sphereDiameter'];
            this.sphereColor = plotsSettings['sphereColor'];  
            this.sphereMat = plotsSettings['sphereMat'];
            sphereSettingsUpdated = true;     
      } 

      if (this.planColor !== plotsSettings['planColor']) {
        this.planColor = plotsSettings['planColor'];
        planColorUpdated = true;
      }

      if ((this.wellColor !== plotsSettings['wellColor']) || (this.wellRatio !== plotsSettings['wellRatio']) || 
          (this.wellMat !== plotsSettings['wellMat']) || (this.casingMat !== plotsSettings['casingMat'])) {
            this.wellColor = plotsSettings['wellColor'];
            this.wellRatio = plotsSettings['wellRatio'];
            this.wellMat = plotsSettings['wellMat'];
            this.casingMat = plotsSettings['casingMat'];
            wellSettingsUpdated = true;
          }

      if (this.groundboxName !== plotsSettings['groundboxName']) {
        this.groundboxName = plotsSettings['groundboxName'];
        groundboxUpdated = true;
      }

      this.plotsSettings = plotsSettings; 
      this.plotsSettingsChanged.next(this.plotsSettings);

      if (sphereSettingsUpdated) {         
        this.sphereSettingsChanged.next(true);
      }

      if (planColorUpdated) {
        this.planColorChanged.next(true);
      }

      if (wellSettingsUpdated) {
        this.wellSettingsChanged.next(true);
      }

      if (groundboxUpdated) {
        this.groundboxChanged.next(true);
      }
    }

    getSphereDiameter() {
      return this.plotsSettings['sphereDiameter'];
    }

    getSphereColor() {
      return this.plotsSettings['sphereColor'];
    }

    getSphereMat() {
      return this.plotsSettings['sphereMat'];
    }

    getPlanColor() {
      return this.plotsSettings['planColor'];
    }

    getWellColor() {
      return this.plotsSettings['wellColor'];
    }

    getWellRatio() {
      return this.plotsSettings['wellRatio'];
    }

    getWellMat() {
      return this.plotsSettings['wellMat'];
    }

    getCasingMat() {
      return this.plotsSettings['casingMat'];
    }

    getGroundboxName() {
      return this.plotsSettings['groundboxName'];
    }
}