import { Injectable } from '@angular/core';
import { SharedPlotData } from '../tally-book/new-tally-book/tally-book.model';
import { Subject } from 'rxjs';
import { SurveyHeader, IntSurveys, Surveys } from '../surveys/surveys.model';
import { PlanHeader, IntPlans, Plans } from '../plans/plans.model';
import { InterpolationService } from '../shared/interpolation.service';

@Injectable ({providedIn: 'root'})

export class PlotDataService {  
    sharedPlotDataUpdatedChanged = new Subject<boolean>();
    sharedPlotDataChanged = new Subject<SharedPlotData[]>();
    sharedPlotData: SharedPlotData[] = [];
    updateAttempt: number = 0;    
    sharedPlotDataUpdated: boolean = false;

    constructor(private interpolationService: InterpolationService) {}

    getSharedPlotData() {
        return this.sharedPlotData.slice();
    }    

    setSharedPlotData(sharedPlotData: SharedPlotData[]) {
        if (sharedPlotData) {
            this.sharedPlotData = sharedPlotData;
            localStorage.setItem('sharedPlotData', JSON.stringify(this.sharedPlotData.slice()));
            this.sharedPlotDataChanged.next(this.sharedPlotData.slice());
        }
    }

    getSharedPlotDataUpdated() {
        return this.sharedPlotDataUpdated;
    }

    // addCurrentTallyBookToSharedPlotData(tallyBookName: string) {
    //     let currentSurveyHeader: SurveyHeader = this.surveysService.getSurveyHeader();
    //     let currentIntSurveys: IntSurveys[] = this.surveysService.getIntSurveys();
        
    //     const newSurveySPD = new SharedPlotData(tallyBookName, 'survey', currentSurveyHeader, currentIntSurveys, null, null);
    //     this.sharedPlotData.push(newSurveySPD);              
    //     this.sharedPlotDataUpdated = true;
    //     this.sharedPlotDataUpdatedChanged.next(this.sharedPlotDataUpdated);
    //     this.sharedPlotDataChanged.next(this.sharedPlotData.slice());

    //     let currentPlanHeader: PlanHeader = this.plansService.getPlanHeader();
    //     let currentIntPlan: IntPlans[] = this.plansService.getIntPlans();
    //     const newPlanSPD = new SharedPlotData(tallyBookName, 'plan', null, null, currentPlanHeader, currentIntPlan);
    //     this.sharedPlotData.push(newPlanSPD);              
    //     this.sharedPlotDataUpdated = true;
    //     this.sharedPlotDataUpdatedChanged.next(this.sharedPlotDataUpdated);
    //     this.sharedPlotDataChanged.next(this.sharedPlotData.slice());
    // }

    addSurveysToSharedPlotData(tallyBookName: string, surveys: Surveys[], surveyHeader: SurveyHeader) {
        if (surveys) {
            let intSurveys: IntSurveys[] = [];
            intSurveys = this.interpolationService.updateOffsetIntSurveys(0, surveys, intSurveys, surveyHeader['elevation'], 
                                        surveyHeader['northing'], surveyHeader['easting'], surveyHeader['vsDirection'], 10);
            const newSPD = new SharedPlotData(tallyBookName, 'surveys', surveyHeader, intSurveys, null, null);
            this.sharedPlotData.push(newSPD);              
            this.sharedPlotDataUpdated = true;
            this.sharedPlotDataUpdatedChanged.next(this.sharedPlotDataUpdated);
            this.sharedPlotDataChanged.next(this.sharedPlotData.slice());
        }
    }

    addPlansToSharedPlotData(tallyBookName: string, plans: Plans[], planHeader: PlanHeader) {
        if (plans) {
            let intPlans: IntPlans[] = [];
            intPlans = this.interpolationService.updateOffsetIntPlans(0, plans, intPlans, planHeader['elevation'], 
                                        planHeader['northing'], planHeader['easting'], planHeader['vsDirection'], 10);
            const newSPD = new SharedPlotData(tallyBookName, 'plans', null, null, planHeader, intPlans);
            this.sharedPlotData.push(newSPD);  
            this.sharedPlotDataUpdated = true;
            this.sharedPlotDataUpdatedChanged.next(this.sharedPlotDataUpdated);
            this.sharedPlotDataChanged.next(this.sharedPlotData.slice());
        }
    }  
}