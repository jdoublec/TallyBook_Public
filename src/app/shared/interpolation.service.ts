import { Injectable } from '@angular/core';
import { Plans, IntPlans } from '../plans/plans.model';
import { SurveyMathService } from './survey-math.service';
import { Surveys, IntSurveys } from '../surveys/surveys.model';

@Injectable({ providedIn: 'root'})
export class InterpolationService {
    defaultInterval: number = 1;  

    constructor(private surveyMathService: SurveyMathService) {}

    updateIntSurveys(index: number, surveys: Surveys[], intSurveys: IntSurveys[], tieOnElevation: number,
                     tieOnNorthing: number, tieOnEasting: number, tieOnVS: number, interval: number = this.defaultInterval) {
        if (surveys.length > 0) {
            let startIndex = index > 0 ? index - 1 : 0;
            let intStartIndex = startIndex > 0 ? intSurveys.findIndex(plan => plan.md === surveys[startIndex].md) : 0;

            intSurveys = intSurveys.slice(0, intStartIndex);     

            for (let i = startIndex; i < surveys.length; i++) {         
                if (i < (surveys.length - 1)) {
                    let dls = surveys[i + 1].dls;
                    let currentMD = surveys[i].md;
                    let currentInc = surveys[i].inc;
                    let currentAzm = surveys[i].azm;

                    let nextMD = surveys[i + 1].md;   
                    let nextInc = surveys[i + 1].inc;
                    let nextAzm = surveys[i + 1].azm;                            
                    let toolface = surveys[i + 1].survTF;      
                    let interpolatedCount = Math.floor((nextMD - currentMD) / interval);                                                 

                    const newIntSurv = new IntSurveys(surveys[i].md, surveys[i].inc, surveys[i].azm, surveys[i].tvd,
                                                   surveys[i].north, surveys[i].east, surveys[i].vs, surveys[i].survTF, 
                                                   surveys[i].dls, surveys[i].slide, surveys[i].slideTF, 
                                                   surveys[i].motorOutput, surveys[i].distPlan, surveys[i].abPlan, 
                                                   surveys[i].rlPlan, surveys[i].tvdToPlan, surveys[i].tfToPlan, 
                                                   surveys[i].elevation, surveys[i].northing, surveys[i].easting, 
                                                   false, surveys[i].offsets);

                    intSurveys.push(newIntSurv);
                        for (let j = 0; j < (interpolatedCount - 1); j ++) {                                                
                            const newMD = currentMD + interval;
                            const newInc = this.surveyMathService.getProjChangeInIncDLegTFMD(currentInc, dls, interval, toolface);                                 
                            const chInAzm: number = this.surveyMathService.getProjChangeInAzimuthDLegTFMD(dls, currentInc, newInc, interval, toolface);    
                            const newAzm: number = this.surveyMathService.getCorrectAzimuthNear360(currentAzm + chInAzm);                                
                            const newTVD: number = intSurveys[intSurveys.length - 1].tvd + 
                                            this.surveyMathService.getChangeInTVD(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                            const newNorth: number = intSurveys[intSurveys.length - 1].north + 
                                            this.surveyMathService.getChangeInNorth(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                            const newEast: number = intSurveys[intSurveys.length - 1].east +
                                            this.surveyMathService.getChangeInEast(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                            const newElevation: number = tieOnElevation - newTVD;
                            const newNorthing: number = newNorth + tieOnNorthing;
                            const newEasting: number = newEast + tieOnEasting;
                            const newVS: number = this.surveyMathService.getVSect(tieOnVS, newNorth, newEast);                                        
                            const newTF: number = this.surveyMathService.getToolFace(currentInc, newInc, currentAzm, newAzm);
                            
                            const newIntSurv = new IntSurveys(newMD, newInc, newAzm, newTVD, newNorth, newEast, newVS, newTF, 
                                                          dls, null, null, null, null, null, null, null, null, newElevation, newNorthing, newEasting, true);

                            intSurveys.push(newIntSurv);
                            
                            currentMD = newMD;
                            currentInc = newInc;
                            currentAzm = newAzm;
                            toolface = this.surveyMathService.getToolFace(newInc, nextInc, newAzm, nextAzm);
                        }                        
                } else if (i = (surveys.length - 1)) {
                    const newIntSurv = new IntSurveys(surveys[i].md, surveys[i].inc, surveys[i].azm, surveys[i].tvd, 
                        surveys[i].north, surveys[i].east, surveys[i].vs, surveys[i].survTF, surveys[i].dls, 
                        surveys[i].slide, surveys[i].slideTF, surveys[i].motorOutput, surveys[i].distPlan, 
                        surveys[i].abPlan, surveys[i].rlPlan, surveys[i].tvdToPlan, surveys[i].tfToPlan, 
                        surveys[i].elevation, surveys[i].northing, surveys[i].easting, false, 
                        surveys[i].offsets);

                    intSurveys.push(newIntSurv);                                
                }
            }

            return intSurveys;
        }
    }

    updateIntPlans(index: number, plans: Plans[], intPlans: IntPlans[], tieOnElevation: number, 
                   tieOnNorthing: number, tieOnEasting: number, tieOnVS: number, interval: number = this.defaultInterval) {  
                       
        if (plans.length > 0) {
            let startIndex = index > 0 ? index - 1 : 0;
            let intStartIndex = startIndex > 0 ? intPlans.findIndex(plan => plan.md === plans[startIndex].md) : 0;
            
            intPlans = intPlans.slice(0, intStartIndex); 

            for (let i = startIndex; i < plans.length; i++) {                
                if (i < (plans.length - 1)) {
                    let dls = plans[i + 1].dls;
                    let currentMD = plans[i].md;
                    let currentInc = plans[i].inc;
                    let currentAzm = plans[i].azm;

                    let nextMD = plans[i + 1].md;   
                    let nextInc = plans[i + 1].inc;
                    let nextAzm = plans[i + 1].azm;                            
                    let toolface = plans[i + 1].survTF;                     
                    let interpolatedCount = Math.floor((nextMD - currentMD) / interval);

                    const newIntPlan = new IntPlans(plans[i].md, plans[i].inc, plans[i].azm, plans[i].tvd, 
                                                    plans[i].north, plans[i].east, plans[i].vs, plans[i].survTF, 
                                                    plans[i].dls, plans[i].elevation, plans[i].northing, 
                                                    plans[i].easting, false, plans[i].offsets);

                    intPlans.push(newIntPlan); 
                        for (let j = 0; j < (interpolatedCount - 1); j ++) {
                            const newMD: number = currentMD + interval;
                            const newInc: number =this.surveyMathService.getProjChangeInIncDLegTFMD(currentInc, dls, interval, toolface);                                      
                            const chInAzm: number = this.surveyMathService.getProjChangeInAzimuthDLegTFMD(dls, currentInc, newInc, interval, toolface);    
                            const newAzm: number = this.surveyMathService.getCorrectAzimuthNear360(currentAzm + chInAzm);                                
                            const newTVD: number = intPlans[intPlans.length - 1].tvd + 
                                            this.surveyMathService.getChangeInTVD(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                            const newNorth: number = intPlans[intPlans.length - 1].north + 
                                            this.surveyMathService.getChangeInNorth(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                            const newEast: number = intPlans[intPlans.length - 1].east +
                                            this.surveyMathService.getChangeInEast(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                            const newElevation: number = tieOnElevation - newTVD;
                            const newNorthing: number = newNorth + tieOnNorthing;
                            const newEasting: number = newEast + tieOnEasting;
                            const newVS: number = this.surveyMathService.getVSect(tieOnVS, newNorth, newEast);
                            const newTF: number = this.surveyMathService.getToolFace(currentInc, newInc, currentAzm, newAzm);
                            
                            const newIntPlan = new IntPlans(newMD, newInc, newAzm, newTVD, newNorth, newEast, newVS, newTF, dls, 
                                                            newElevation, newNorthing, newEasting, true);

                            intPlans.push(newIntPlan);
                            
                            currentMD = newMD;
                            currentInc = newInc;
                            currentAzm = newAzm;
                            toolface = this.surveyMathService.getToolFace(newInc, nextInc, newAzm, nextAzm);
                        }                                    
                } else if (i === (plans.length - 1)) {                                  
                    const newIntPlan = new IntPlans(plans[i].md, plans[i].inc, plans[i].azm, plans[i].tvd, 
                        plans[i].north, plans[i].east, plans[i].vs, plans[i].survTF, plans[i].dls, 
                        plans[i].elevation, plans[i].northing, plans[i].easting, false, plans[i].offsets);

                    intPlans.push(newIntPlan);
                }
            } 
            return intPlans;
        }
    }

    updateOffsetIntSurveys(index: number, surveys: Surveys[], intSurveys: IntSurveys[], tieOnElevation: number,
        tieOnNorthing: number, tieOnEasting: number, tieOnVS: number, interval: number = this.defaultInterval) {
        if (surveys.length > 0) {
            let startIndex = index > 0 ? index - 1 : 0;
            let intStartIndex = startIndex > 0 ? intSurveys.findIndex(plan => plan.md === surveys[startIndex].md) : 0;

            intSurveys = intSurveys.slice(0, intStartIndex);     

            for (let i = startIndex; i < surveys.length; i++) {         
            if (i < (surveys.length - 1)) {
                let dls = surveys[i + 1].dls;
                let currentMD = surveys[i].md;
                let currentInc = surveys[i].inc;
                let currentAzm = surveys[i].azm;

                let nextMD = surveys[i + 1].md;   
                let nextInc = surveys[i + 1].inc;
                let nextAzm = surveys[i + 1].azm;                            
                let toolface = surveys[i + 1].survTF;      
                let interpolatedCount = 0;
                    if ((Math.abs(currentInc - nextInc) > 0.01) || (Math.abs(currentAzm - nextAzm) > 0.01)) {        
                        interpolatedCount = Math.floor((nextMD - currentMD) / interval);
                    }                                                

                const newIntSurv = new IntSurveys(surveys[i].md, surveys[i].inc, surveys[i].azm, surveys[i].tvd,
                                                surveys[i].north, surveys[i].east, surveys[i].vs, surveys[i].survTF, 
                                                surveys[i].dls, surveys[i].slide, surveys[i].slideTF, 
                                                surveys[i].motorOutput, surveys[i].distPlan, surveys[i].abPlan, 
                                                surveys[i].rlPlan, surveys[i].tvdToPlan, surveys[i].tfToPlan, 
                                                surveys[i].elevation, surveys[i].northing, surveys[i].easting, 
                                                false, surveys[i].offsets);

                intSurveys.push(newIntSurv);
                    for (let j = 0; j < (interpolatedCount - 1); j ++) {                                                
                        const newMD = currentMD + interval;
                        const newInc = this.surveyMathService.getProjChangeInIncDLegTFMD(currentInc, dls, interval, toolface);                                 
                        const chInAzm: number = this.surveyMathService.getProjChangeInAzimuthDLegTFMD(dls, currentInc, newInc, interval, toolface);    
                        const newAzm: number = this.surveyMathService.getCorrectAzimuthNear360(currentAzm + chInAzm);                                
                        const newTVD: number = intSurveys[intSurveys.length - 1].tvd + 
                                        this.surveyMathService.getChangeInTVD(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                        const newNorth: number = intSurveys[intSurveys.length - 1].north + 
                                        this.surveyMathService.getChangeInNorth(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                        const newEast: number = intSurveys[intSurveys.length - 1].east +
                                        this.surveyMathService.getChangeInEast(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                        const newElevation: number = tieOnElevation - newTVD;
                        const newNorthing: number = newNorth + tieOnNorthing;
                        const newEasting: number = newEast + tieOnEasting;
                        const newVS: number = this.surveyMathService.getVSect(tieOnVS, newNorth, newEast);                                        
                        const newTF: number = this.surveyMathService.getToolFace(currentInc, newInc, currentAzm, newAzm);
                        
                        const newIntSurv = new IntSurveys(newMD, newInc, newAzm, newTVD, newNorth, newEast, newVS, newTF, 
                                                        dls, null, null, null, null, null, null, null, null, newElevation, newNorthing, newEasting, true);

                        intSurveys.push(newIntSurv);
                        
                        currentMD = newMD;
                        currentInc = newInc;
                        currentAzm = newAzm;
                        toolface = this.surveyMathService.getToolFace(newInc, nextInc, newAzm, nextAzm);
                    }                        
            } else if (i = (surveys.length - 1)) {
                const newIntSurv = new IntSurveys(surveys[i].md, surveys[i].inc, surveys[i].azm, surveys[i].tvd, 
                    surveys[i].north, surveys[i].east, surveys[i].vs, surveys[i].survTF, surveys[i].dls, 
                    surveys[i].slide, surveys[i].slideTF, surveys[i].motorOutput, surveys[i].distPlan, 
                    surveys[i].abPlan, surveys[i].rlPlan, surveys[i].tvdToPlan, surveys[i].tfToPlan, 
                    surveys[i].elevation, surveys[i].northing, surveys[i].easting, false, 
                    surveys[i].offsets);

                intSurveys.push(newIntSurv);                                
            }
        }

        return intSurveys;
    }
}

    updateOffsetIntPlans(index: number, plans: Plans[], intPlans: IntPlans[], tieOnElevation: number, 
            tieOnNorthing: number, tieOnEasting: number, tieOnVS: number, interval: number = this.defaultInterval) {  
                
        if (plans.length > 0) {
        let startIndex = index > 0 ? index - 1 : 0;
        let intStartIndex = startIndex > 0 ? intPlans.findIndex(plan => plan.md === plans[startIndex].md) : 0;
        
            intPlans = intPlans.slice(0, intStartIndex); 

            for (let i = startIndex; i < plans.length; i++) {                
                if (i < (plans.length - 1)) {
                    let dls = plans[i + 1].dls;
                    let currentMD = plans[i].md;
                    let currentInc = plans[i].inc;
                    let currentAzm = plans[i].azm;

                    let nextMD = plans[i + 1].md;   
                    let nextInc = plans[i + 1].inc;
                    let nextAzm = plans[i + 1].azm;                            
                    let toolface = plans[i + 1].survTF;                     
                    let interpolatedCount = 0;
                    if ((Math.abs(currentInc - nextInc) > 0.01) || (Math.abs(currentAzm - nextAzm) > 0.01)) {        
                        interpolatedCount = Math.floor((nextMD - currentMD) / interval);
                    }

                    const newIntPlan = new IntPlans(plans[i].md, plans[i].inc, plans[i].azm, plans[i].tvd, 
                                                    plans[i].north, plans[i].east, plans[i].vs, plans[i].survTF, 
                                                    plans[i].dls, plans[i].elevation, plans[i].northing, 
                                                    plans[i].easting, false, plans[i].offsets);

                    intPlans.push(newIntPlan); 
                        for (let j = 0; j < (interpolatedCount - 1); j ++) {
                            const newMD: number = currentMD + interval;
                            const newInc: number =this.surveyMathService.getProjChangeInIncDLegTFMD(currentInc, dls, interval, toolface);                                      
                            const chInAzm: number = this.surveyMathService.getProjChangeInAzimuthDLegTFMD(dls, currentInc, newInc, interval, toolface);    
                            const newAzm: number = this.surveyMathService.getCorrectAzimuthNear360(currentAzm + chInAzm);                                
                            const newTVD: number = intPlans[intPlans.length - 1].tvd + 
                                            this.surveyMathService.getChangeInTVD(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                            const newNorth: number = intPlans[intPlans.length - 1].north + 
                                            this.surveyMathService.getChangeInNorth(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                            const newEast: number = intPlans[intPlans.length - 1].east +
                                            this.surveyMathService.getChangeInEast(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                            const newElevation: number = tieOnElevation - newTVD;
                            const newNorthing: number = newNorth + tieOnNorthing;
                            const newEasting: number = newEast + tieOnEasting;
                            const newVS: number = this.surveyMathService.getVSect(tieOnVS, newNorth, newEast);
                            const newTF: number = this.surveyMathService.getToolFace(currentInc, newInc, currentAzm, newAzm);
                            
                            const newIntPlan = new IntPlans(newMD, newInc, newAzm, newTVD, newNorth, newEast, newVS, newTF, dls, 
                                                            newElevation, newNorthing, newEasting, true);

                            intPlans.push(newIntPlan);
                            
                            currentMD = newMD;
                            currentInc = newInc;
                            currentAzm = newAzm;
                            toolface = this.surveyMathService.getToolFace(newInc, nextInc, newAzm, nextAzm);
                        }                                    
                } else if (i === (plans.length - 1)) {                                  
                    const newIntPlan = new IntPlans(plans[i].md, plans[i].inc, plans[i].azm, plans[i].tvd, 
                        plans[i].north, plans[i].east, plans[i].vs, plans[i].survTF, plans[i].dls, 
                        plans[i].elevation, plans[i].northing, plans[i].easting, false, plans[i].offsets);

                    intPlans.push(newIntPlan);
                }
            } 
            return intPlans;
        }
    }
}