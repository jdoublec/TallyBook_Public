import { OnInit, Component, OnDestroy } from '@angular/core';
import { PlotList } from 'src/app/tally-book/new-tally-book/tally-book.model';
import { PlotsService } from '../plots.service';
import { TallyBookService } from 'src/app/tally-book/new-tally-book/tally-book.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { PlotsSettingsService } from './plots-settings.service';
import { Subscription } from 'rxjs';
import { PlotsSettings, CameraSettings } from '../plot-data.model';
import { FetchPlotDataService } from '../fetch-plot-data.service';
import { SurveysService } from 'src/app/surveys/surveys.service';



@Component({
    selector: 'app-plots-settings',
    templateUrl: './plots-settings.component.html'
})
export class PlotsSettingsComponenet implements OnInit, OnDestroy {
    plotsSettingsSub: Subscription;
    cameraSettingsSub: Subscription;
    plotListSub: Subscription;
    plotsSettings: PlotsSettings;
    cameraSettings: CameraSettings;
    plotList: PlotList[] = [];
    settingsForm: FormGroup;
    cameraForm: FormGroup;
    plotListChanged: boolean = false;
    mdValues;
    


    constructor(//private readonly fb: FormBuilder,
                private fetchPlotDataService: FetchPlotDataService,
                private plotsService: PlotsService,
                private plotsSettingsService: PlotsSettingsService,
                private surveysService: SurveysService,
                private tallyBookService: TallyBookService) {}


    ngOnInit() {        
        this.plotsSettings = this.plotsSettingsService.getPlotsSettings();
        this.plotsSettingsSub = this.plotsSettingsService.plotsSettingsChanged.subscribe(plotsSettings => {
            this.plotsSettings = plotsSettings;
        })

        this.cameraSettings = this.plotsSettingsService.getCameraSettings();
        this.cameraSettingsSub = this.plotsSettingsService.cameraSettingsChanged.subscribe(cameraSettings => {
            this.cameraSettings = cameraSettings;
        })

        this.initForm();

        this.mdValues = this.surveysService.getSurveyMDValues();

        this.plotList = this.plotsService.getPlotList();
        this.plotListSub = this.plotsService.plotListChanged
          .subscribe( 
            (plotList: PlotList[]) => {
              this.plotList = plotList;
            }
        );
    }

    initForm() {
        this.settingsForm = new FormGroup({
            'sphereDiameter': new FormControl(this.plotsSettings['sphereDiameter'], [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]),
            'sphereFont': new FormControl(this.plotsSettings['sphereFont'], Validators.required),
            'sphereColor': new FormControl(this.plotsSettings['sphereColor'], Validators.required),
            'wellColor': new FormControl(this.plotsSettings['wellColor'], Validators.required),
            'planColor': new FormControl(this.plotsSettings['planColor'], Validators.required),
            'sphereMat': new FormControl(this.plotsSettings['sphereMat'], Validators.required),
            'wellRatio': new FormControl(this.plotsSettings['wellRatio'], [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]),
            'wellMat': new FormControl(this.plotsSettings['wellMat'], Validators.required),
            'casingMat': new FormControl(this.plotsSettings['casingMat'], Validators.required),  
            'groundboxName': new FormControl(this.plotsSettings['groundboxName'], Validators.required),
        });

        this.cameraForm = new FormGroup({
            'cameraType': new FormControl(this.cameraSettings['cameraType'], Validators.required),
            'cameraSpeed': new FormControl(this.cameraSettings['cameraSpeed'], [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]),
            'cameraLocation': new FormControl(this.cameraSettings['cameraLocation'], [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)]),
        });
    }

    onSubmit() {
        if (this.plotListChanged) {        
            this.plotListChanged = false;
            this.fetchPlotDataService.updateSharedPlotData(this.plotList); 
            
        } 
        if (this.settingsForm.dirty) {
            this.plotsSettingsService.setPlotsSettings(this.settingsForm.value);
        }
        if (this.cameraForm.dirty) {
            this.plotsSettingsService.setCameraSettings(this.cameraForm.value);
            console.log("CameraSettings Updated");
        }

        this.plotsSettingsService.onHidePlotsSettings();
    }
    
    onPlotSurveyChanged(index: number) {
        const tallyBook = this.plotList[index].name;
        const plotSurvey: boolean = this.plotList[index].plotSurvey;
        const plotPlan: boolean = this.plotList[index].plotPlan;
        
        this.tallyBookService.changePlotSurveys(tallyBook, plotSurvey);
    
        this.plotsService.updatePlotList(index, plotSurvey, plotPlan);
        
        this.plotListChanged = true;    
    }
    
    onPlotPlanChanged(index: number) {
        const tallyBook = this.plotList[index].name;
        const plotSurvey: boolean = this.plotList[index].plotSurvey;
        const plotPlan: boolean = this.plotList[index].plotPlan;
        
        this.tallyBookService.changePlotPlan(tallyBook, plotPlan);
    
        this.plotsService.updatePlotList(index, plotSurvey, plotPlan);
    
        this.plotListChanged = true;
    }

    onCancel() {
        this.plotsSettingsService.onHidePlotsSettings();
    }

    ngOnDestroy() {
        this.plotsSettingsSub.unsubscribe();
        this.cameraSettingsSub.unsubscribe();
        this.plotListSub.unsubscribe();
    }

}