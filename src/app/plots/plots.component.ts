import { Component, ElementRef, ViewChild, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { SharedPlotData, TallyBookList } from '../tally-book/new-tally-book/tally-book.model';
import { ApplicationStateService } from '../shared/application-state.service';
import { PlotsService } from './plots.service';
import { PlotDataService } from './plot-data.service';
import { TallyBookService } from '../tally-book/new-tally-book/tally-book.service';
import { LoadingService } from '../shared/loading-spinner/loading.service';
import { PlotsSettingsService } from './plots-settings/plots-settings.service';
import { PlotsSettings, CameraSettings } from './plot-data.model';
import { SurveysService } from '../surveys/surveys.service';
import { Vector3 } from '@babylonjs/core';
import { TargetWindowsService } from './target-windows/target-windows.service';
import { Surveys } from '../surveys/surveys.model';

@Component({
  selector: 'app-engine',
  templateUrl: './plots.component.html'
})
export class PlotsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('renderCanvas', { static: true })
  renderCanvas: ElementRef<HTMLCanvasElement>;
  tallyBookListSub: Subscription;
  sharedPlotDataSub: Subscription;
  sharedPlotDataUpdatedSub: Subscription;
  showPlotsSettingsSub: Subscription;
  showPlotsSurveysSub: Subscription;
  showTargetWindowsSub: Subscription;
  sphereSettingsSub: Subscription;
  surveysSub: Subscription;
  planSettingsSub: Subscription;
  wellSettingsSub: Subscription;
  groundboxSettingsSub: Subscription;
  cameraSettingsSub: Subscription;
  plotListSub: Subscription;
  targetWindowsSub: Subscription;
  viewRLSub: Subscription;
  viewDistanceSub: Subscription;
  viewMDSub: Subscription;
  // plotHeightSub: Subscription;
  resizeSub$: Subscription;
  resizeObservable$: Observable<Event>;
  plotsSettings: PlotsSettings;
  cameraSettings: CameraSettings;
  sharedPlotData: SharedPlotData[] = [];  
  surveys: Surveys[] = [];
  plotHeight: number = 0;
  readWriteMobile: number = 75;
  readWriteDesktop: number = 75;
  readOnlyMobile: number = 75; 
  readOnlyDesktop: number = 75;
  // readWritePlotSurveys: number = 1000;
  cameraSpeed: number = 50;
  type: string = 'Fly';
  tallyBookList: TallyBookList;
  currentTallyBookName: string;
  showPlotsSettings: boolean = false;
  showPlotsSurveys: boolean = false;
  showTargetWindows: boolean = false;
  // plotSurvey: boolean = false;
  sharedPlotDataUpdated: boolean = false; 
  viewRL: boolean = true;
  viewDistance: number = 500;
  viewMD: number = 0;
  rideThePlan: boolean = false;
  rideTheWell: boolean = false;
  horView: boolean = false;
  perpView: boolean = false;
  vertView: boolean = false;

  constructor(private applicationStateService: ApplicationStateService,
              private targetWindowsService: TargetWindowsService,
              private loadingService: LoadingService,
              private plotsService: PlotsService,
              private plotsSettingsService: PlotsSettingsService,
              private plotDataService: PlotDataService,
              private surveysService: SurveysService,
              private tallyBookService: TallyBookService,) {}

  ngOnInit() {    
    this.plotsService.updateCoord(0);
    this.onViewChanged();

    this.showPlotsSettingsSub = this.plotsSettingsService.showPlotsSettings.subscribe(showSettings => {
      this.showPlotsSettings = showSettings;
    });     

    this.showPlotsSurveysSub = this.plotsService.showPlotsSurveys.subscribe(showPlotsSurveys => {
      this.showPlotsSurveys = showPlotsSurveys;
    });

    this.showTargetWindowsSub = this.targetWindowsService.showTargetWindows.subscribe(showTargetWindows => {
      this.showTargetWindows = showTargetWindows;
    });
    
    this.cameraSettings = this.plotsSettingsService.getCameraSettings();
    this.cameraSettingsSub = this.plotsSettingsService.cameraSettingsChanged.subscribe(cameraSettings => {
      const coord = this.surveysService.getCoord(cameraSettings['cameraLocation']);
      const target = new Vector3(coord.easting, coord.elevation, coord.northing)
      const location = this.plotsService.getCameraLocation(coord.easting, coord.elevation, coord.northing);
      this.plotsService.updateCamera(cameraSettings, location, target, this.viewDistance);
    });

    this.plotListSub = this.plotsSettingsService.plotListChanged.subscribe(changed => {
      if (changed) {
        this.onCreateScene();
        this.plotsSettingsService.onPlotListChanged(false);
      }
    });

    this.sphereSettingsSub = this.plotsSettingsService.sphereSettingsChanged.subscribe(changed => {
      if (changed) {
        this.onSphereSettingsChanged();
      }
    });    

    this.surveys = this.surveysService.getSurveys();
    this.surveysSub = this.surveysService.surveysChanged.subscribe(surveys => {
      this.surveys = surveys; 
    })

    this.planSettingsSub = this.plotsSettingsService.planColorChanged.subscribe(changed => {
      if (changed) {
        this.onPlanColorChanged();
      }
    });

    this.wellSettingsSub = this.plotsSettingsService.wellSettingsChanged.subscribe(changed => {
      if (changed) {
        this.onWellSettingsChanged();        
      }
    });

    this.groundboxSettingsSub = this.plotsSettingsService.groundboxChanged.subscribe(changed => {
      if (changed) {        
        this.onGroundboxChanged();
      }
    });

    this.targetWindowsSub = this.targetWindowsService.targetWindowsChanged.subscribe(changed => {
      if (changed) {
        this.onTargetWindowsChanged();
      }
    });

    this.viewRLSub = this.plotsService.viewRLChanged.subscribe(viewRL => {
      this.viewRL = viewRL;
    });

    this.viewDistance = this.plotsService.getViewDistance();
    this.viewDistanceSub = this.plotsService.viewDistanceChanged.subscribe(distance => {
      this.viewDistance = distance;
    });

    this.viewMD = this.plotsService.getViewMD();
    this.viewMDSub = this.plotsService.viewMDChanged.subscribe(md => {
      this.viewMD = md;
    });

    // this.plotHeightSub = this.applicationStateService.currentTableHeightChanged
    //     .subscribe((height: number) => {
    //         this.plotHeight = height});

    this.tallyBookList = this.tallyBookService.getTallyBookList();
    this.tallyBookListSub = this.tallyBookService.tallyBookListChanged.subscribe(
        (tallyBookList: TallyBookList[]) => {
          this.tallyBookList = tallyBookList;
          }
        );      

    this.sharedPlotData = this.plotDataService.getSharedPlotData();
    this.sharedPlotDataSub = this.plotDataService.sharedPlotDataChanged.subscribe(
              (sharedPlotData: SharedPlotData[]) => {
                this.sharedPlotData = sharedPlotData;
                this.plotsService.setSharedPlotData(this.sharedPlotData);
                this.loadingService.message$.next('Updating Plots ...');
                this.onCreateScene();
                this.loadingService.message$.next(null);
              }
            );

    this.sharedPlotDataUpdated = this.plotDataService.getSharedPlotDataUpdated();
    this.sharedPlotDataUpdatedSub = this.plotDataService.sharedPlotDataUpdatedChanged.subscribe(
            (sharedPlotDataUpdated: boolean) => {
              this.sharedPlotDataUpdated = sharedPlotDataUpdated;
            }
          );

    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeSub$ = this.resizeObservable$.subscribe(evt => {
        this.onViewChanged();
    });
    this.currentTallyBookName = this.tallyBookService.getCurrentTallyBookName();
  }

  onViewChanged() {
    // this.applicationStateService.setCurrentTableHeight(this.readWriteMobile, this.readWriteDesktop, 
    //                                                  this.readOnlyMobile, this.readOnlyDesktop, this.readWritePlotSurveys);
    this.plotHeight = this.applicationStateService.getCurrentTableHeight();
  }  

  ngAfterViewInit() {  
    this.onCreateScene();
  }

  onCreateScene() {    
    this.loadingService.message$.next('Loading Plots ...');
    this.plotsService.createScene(this.renderCanvas);
    this.plotsService.startTheEngine();
    
    this.loadingService.message$.next(null);    
  }

  onSphereSettingsChanged() {
    this.plotsService.updateSphereSettings();
  }

  onPlanColorChanged() {
    this.plotsService.updatePlanPathSettings();
  }

  onWellSettingsChanged() {
    this.plotsService.createSurveyPath();
  }

  onGroundboxChanged() {
    const easting: number = this.surveysService.getEasting();
    const groundElevation: number = this.surveysService.getGroundElevation();
    const northing: number = this.surveysService.getNorthing();
    const location = new Vector3(easting, groundElevation, northing);

    this.plotsService.updateGroundbox(this.plotsSettingsService.getGroundboxName(), location);
  }

  onTargetWindowsChanged() {
    if (this.plotsService.scene) {
      this.plotsService.createTargetWindows();
    }
  }

  onShowPlotsSettings() {
    this.plotsSettingsService.onShowPlotsSettings();
    // this.plotsService.updateCameraSpeed(10);
  }

  onShowSurveys() {
    // this.applicationStateService.setCurrentTableHeight(this.readWriteMobile, this.readWriteDesktop, 
    //                         this.readOnlyMobile, this.readOnlyDesktop, this.readWritePlotSurveys, true);
    this.showPlotsSurveys ? this.plotsService.onHidePlotsSurveys() : this.plotsService.onShowPlotsSurveys();
  }

  onShowTargetWindows() {
    this.targetWindowsService.onShowTargetWindows();
  }

  onNewButtonSelected() {
    this.rideThePlan = false;
    this.rideTheWell = false;
    this.horView = false;
    this.perpView = false;
    this.vertView = false;
  }

  onUpdateView(viewName: string) {
    this.onNewButtonSelected();
    if (viewName === 'hor') {
      this.horView = true;
      this.plotsService.updateView(true, false, false)
    } else if (viewName === 'perp') {
      this.perpView = true;
      this.plotsService.updateView(false, true, false)
    } else if (viewName = 'vert') {
      this.vertView = true;
      this.plotsService.updateView(false, false, true)
    }
  }

  onUpdateViewMD() {
    this.plotsService.updateViewMD(this.viewMD);
  }

  onUpdateViewDistance() {
    this.plotsService.updateViewDistance(this.viewDistance);
  }

  onUpdateViewRightLeft() {
    this.plotsService.updateViewRightLeft(this.viewRL);
  }

  followWellPath(well: boolean) {
    this.onNewButtonSelected();
    if (well) {
      this.rideTheWell = true;
    } else {
      this.rideThePlan = true;
    }
    this.plotsService.followWellPath(well);    
  }  

  ngOnDestroy() {
    console.log("Destroy Called.");
    this.plotsService.connectionsMade = false;
    this.plotsService.stopTheEngine();
    this.plotsService.closePlots();
    this.resizeSub$.unsubscribe();
    // this.plotHeightSub.unsubscribe();
    this.tallyBookListSub.unsubscribe();
    this.sharedPlotDataSub.unsubscribe();
    this.sharedPlotDataUpdatedSub.unsubscribe();
    this.showPlotsSettingsSub.unsubscribe();
    this.showPlotsSurveysSub.unsubscribe();
    this.showTargetWindowsSub.unsubscribe();
    this.sphereSettingsSub.unsubscribe();
    this.surveysSub.unsubscribe();
    this.groundboxSettingsSub.unsubscribe();
    this.plotListSub.unsubscribe();
    this.targetWindowsSub.unsubscribe();
    this.planSettingsSub.unsubscribe();
    this.wellSettingsSub.unsubscribe();
    this.cameraSettingsSub.unsubscribe();
    this.viewRLSub.unsubscribe();
    this.viewDistanceSub.unsubscribe();
    this.viewMDSub.unsubscribe();
    this.showPlotsSettings = false;
    this.showPlotsSurveys = false;
    this.showTargetWindows = false;
  }
}
