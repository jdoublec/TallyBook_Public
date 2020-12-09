import { Injectable } from "@angular/core";
import { Vector3 } from '@babylonjs/core';
import { Surveys } from '../surveys/surveys.model';
import { PlansService } from '../plans/plans.service';
import { Offsets } from '../plots/plot-data.model';
import { TallyBookService } from '../tally-book/new-tally-book/tally-book.service';
import { SurveyMathService } from './survey-math.service';
import { IntPlans } from '../plans/plans.model';

@Injectable({ providedIn: 'root'})
export class OrientationService {
    intPlans: IntPlans[] = [];
    
    constructor(private plansService: PlansService,
                private tallyBookService: TallyBookService,
                private surveyMathService: SurveyMathService) {}

    plansChangedUpdateOffsetValues(startPlanMD: number, surveys: Surveys[]) {
        const currentPlanName: string = this.tallyBookService.getCurrentTallyBookName();
        let surveyIndex: number = 0;

        for (let i = surveys.length - 1; i >= 0; i--) {
            if (surveys[i].offsets != undefined) {
                let offsetIndex = surveys[i].offsets.findIndex(offset => offset.name === currentPlanName);
                if (offsetIndex > -1) {
                    if (surveys[i].offsets[offsetIndex].md < startPlanMD) {
                        surveyIndex = i;
                        break;
                    }
                }
            }
        }

        return surveyIndex;
    }    

    updateOffsetValues(startIndex: number, increment: number, surveys: Surveys[]) { 
        let intPlans = this.plansService.getIntPlans();

        let closestPlanIndex = this.getOffsetValuesFromIntPlan(startIndex, increment, surveys, intPlans);

        this.intPlans = [];
        return surveys;
    }

    getOffsetValuesFromIntPlan(startIndex: number, increment: number, surveys: Surveys[], offsetWell: IntPlans[]) {
        let planIndex = 0;
        let endOfOffset: boolean = false;
        let endVector: Vector3; 
        const currentPlanName = this.tallyBookService.getCurrentTallyBookName();
        for (let i = startIndex; i < surveys.length; i++) {         
            if (!endOfOffset) {                                
                const refVector = new Vector3(surveys[i].easting, surveys[i].elevation, surveys[i].northing);
                const closestPoint = this.getClosestPointToRefVector(refVector, increment, planIndex, offsetWell);
                const closestVector: Vector3 = closestPoint['location'];
                planIndex = closestPoint['index']; 
                let offsets: Offsets[] = [
                    new Offsets(currentPlanName, closestPoint['location'], closestPoint['md'], 
                                closestPoint['inc'], closestPoint['azm'], closestPoint['north'], closestPoint['east']),
                ]
                if (surveys[i].offsets === undefined) {
                    surveys[i].offsets = offsets;
                } else {  
                    let offsetIndex = surveys[i].offsets.findIndex(offset => offset.name === currentPlanName)
                    if (offsetIndex > -1) {
                        surveys[i].offsets[offsetIndex] = offsets[0];
                    } else {    
                        surveys[i].offsets.push(offsets[0]);                    
                    }
                }                
                surveys = this.updateOrientationToLine(surveys, offsets, i, currentPlanName);
                if (planIndex >= offsetWell.length) {
                    endOfOffset = true;
                    endVector = closestVector;
                }
            } else {
                let offsets: Offsets[] = [
                    new Offsets(currentPlanName, endVector, offsetWell[planIndex].md, 
                        offsetWell[planIndex].inc, offsetWell[planIndex].azm,
                        offsetWell[planIndex].north, offsetWell[planIndex].east),
                ]
                if (surveys[i].offsets === undefined) {
                    const offsets: Offsets[] = [
                        new Offsets(currentPlanName, endVector, offsetWell[planIndex].md, 
                            offsetWell[planIndex].inc, offsetWell[planIndex].azm,
                            offsetWell[planIndex].north, offsetWell[planIndex].east),                        
                    ]
                    surveys[i].offsets = offsets;
                } else { 
                    let offsetIndex = surveys[i].offsets.findIndex(offset => offset.name === currentPlanName)
                    if (offsetIndex > -1) {
                        surveys[i].offsets[offsetIndex] = offsets[0];
                    } else {    
                        surveys[i].offsets.push(offsets[0]);                    
                    }
                    surveys = this.updateOrientationToLine(surveys, offsets, i, currentPlanName);
                }            
            }        
        }       
    }

    private updateOrientationToLine(surveys: Surveys[], offsets: Offsets[], surveyIndex: number, currentPlanName: string) {       
        const primInc: number = surveys[surveyIndex].inc;
        const primAzm: number = surveys[surveyIndex].azm;
        const primNorthing: number = surveys[surveyIndex].northing;                
        const primElevation: number = surveys[surveyIndex].elevation;                
        const primEasting: number = surveys[surveyIndex].easting;
        const offset: Offsets[] = surveys[surveyIndex].offsets.filter(offset => offset.name === currentPlanName); 
        const secInc: number = offset[0].inc;   
        const secEasting: number = offset[0].location.x;
        const secElevation: number = offset[0].location.y;
        const secNorthing: number = offset[0].location.z;
        const orientation = this.surveyMathService.getOrientationToLine(primInc, primAzm, primEasting, primElevation, 
                                                                        primNorthing, secInc, secEasting, secElevation, secNorthing);

        surveys[surveyIndex].distPlan = orientation['distToLine'];
        surveys[surveyIndex].abPlan = orientation['abLine'];
        surveys[surveyIndex].rlPlan = orientation['rlLine'];
        surveys[surveyIndex].tvdToPlan = orientation['tvdToLine'];
        surveys[surveyIndex].tfToPlan = orientation['tfToLine']

        return surveys;
    }
    
    private getClosestPointToRefVector(refVector: Vector3, increment: number,  startIndex: number, offsetWell: IntPlans[]) {
        let distance: number = Vector3.Distance(refVector, 
                                    new Vector3(offsetWell[startIndex].easting, 
                                                offsetWell[startIndex].elevation, offsetWell[startIndex].northing));
        let closestVector: Vector3;
        let closestVectorIndex: number;
        let countPastLowest: number = 0;  
        let reverse: boolean = false; 
        for (let i = (startIndex); i < offsetWell.length; i=i+100) {
            let offsetVector = new Vector3(offsetWell[i].easting, offsetWell[i].elevation, offsetWell[i].northing);            
            if (i < (offsetWell.length - 1)) {                
                let newDistance = Vector3.Distance(refVector, offsetVector);
                if (newDistance < distance) {
                    closestVector = offsetVector;
                    closestVectorIndex = i;
                    distance = newDistance;
                } else {
                    if (newDistance === 0) {                  
                        return { location: offsetVector, index: i, md: offsetWell[i].md, inc: offsetWell[i].inc, 
                                 azm: offsetWell[i].azm, north: offsetWell[i].north, east: offsetWell[i].east };
                    }
                    countPastLowest = countPastLowest + 1;
                }
            } else {
                closestVector = offsetVector;
                closestVectorIndex = i;
                distance = Vector3.Distance(refVector, offsetVector);
            }

            if (countPastLowest > 1) {
                reverse = true;                
            }        

            if (reverse) {
                countPastLowest = 0;
                for (let j = i; j >= 0; j--) {
                    let offsetVector = new Vector3(offsetWell[j].easting, offsetWell[j].elevation, offsetWell[j].northing);
                    
                    if (j < (offsetWell.length - 1)) {                
                        let newDistance = Vector3.Distance(refVector, offsetVector);
                        if (newDistance < distance) {
                            closestVector = offsetVector;
                            closestVectorIndex = j;
                            distance = newDistance;
                        } else {
                            if (newDistance === 0) {
                                return { location: offsetVector, index: i, md: offsetWell[i].md, inc: offsetWell[i].inc, 
                                         azm: offsetWell[i].azm, north: offsetWell[i].north, east: offsetWell[i].east };
                            }
                            countPastLowest = countPastLowest + 1;
                        }
                    } else {
                        return this.getClosestPointToInterpolatedRange(distance, refVector, closestVector, increment, closestVectorIndex, offsetWell);
                    }
                    if (countPastLowest > 300) {
                        if (closestVector === undefined) {
                            closestVector = offsetVector;
                            closestVectorIndex = j;
                        }
                        return this.getClosestPointToInterpolatedRange(distance, refVector, closestVector, increment, closestVectorIndex, offsetWell);
                    }
                }
            }
            
        }
        let offsetVector = new Vector3(offsetWell[offsetWell.length - 1].easting, offsetWell[offsetWell.length - 1].elevation, offsetWell[offsetWell.length - 1].northing);        
        
        return this.getClosestPointToInterpolatedRange(distance, refVector, offsetVector, increment, offsetWell.length - 1, offsetWell);
    }
    
    private getClosestPointToInterpolatedRange(lowestDistance: number, refVector: Vector3, offsetVector: Vector3,
                                               increment: number, startIndex: number, offsetWell: IntPlans[]) {
        let tieOnElevation: number = this.plansService.getElevation();
        let tieOnNorthing: number = this.plansService.getNorthing();
        let tieOnEasting: number = this.plansService.getEasting();
        let lowestMD: number = offsetWell[startIndex].md;
        let lowestInc: number = offsetWell[startIndex].inc;
        let lowestAzm: number = offsetWell[startIndex].azm;
        let lowestTVD: number = offsetWell[startIndex].tvd;
        let lowestNorth: number = offsetWell[startIndex].north;
        let lowestEast: number = offsetWell[startIndex].east;
        let lowestEasting: number = offsetWell[startIndex].easting;
        let lowestNorthing: number = offsetWell[startIndex].northing;
        let lowestElevation: number = offsetWell[startIndex].elevation;
        let lowestVector: Vector3 = offsetVector;

        if (startIndex < (offsetWell.length - 1)) {
            let dls = offsetWell[startIndex + 1].dls;
            let currentMD = offsetWell[startIndex].md;
            let currentInc = offsetWell[startIndex].inc;
            let currentAzm = offsetWell[startIndex].azm;
            let currentTVD = offsetWell[startIndex].tvd;
            let currentNorth = offsetWell[startIndex].north;
            let currentEast = offsetWell[startIndex].east;
                                      
            let toolface = offsetWell[startIndex + 1].survTF;               
            let interpolatedCount = ((1 / increment) - 1) * 2; 
            let prevDistance = lowestDistance;    
            let sign: number = 1;  
            let correctSignFound: boolean = false;
            let signValueChanged: boolean = false;
            let interval = increment;
            let chInMD;

            for (let i = 0; i < interpolatedCount; i++) {
                chInMD = interval * sign;
                const newMD: number = currentMD + chInMD; 
                const newInc: number =this.surveyMathService.getProjChangeInIncDLegTFMD(currentInc, dls, chInMD, toolface);   
                const chInAzm: number = this.surveyMathService.getProjChangeInAzimuthDLegTFMD(dls, currentInc, newInc, chInMD, toolface);                
                const newAzm: number = this.surveyMathService.getCorrectAzimuthNear360(currentAzm + chInAzm); 
                const newTVD: number = currentTVD + 
                this.surveyMathService.getChangeInTVD(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                const newNorth: number = currentNorth + 
                this.surveyMathService.getChangeInNorth(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
                const newEast: number = currentEast +
                this.surveyMathService.getChangeInEast(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);

                const newEasting: number = newEast + tieOnEasting;
                const newNorthing: number = newNorth + tieOnNorthing;                
                const newElevation: number = tieOnElevation - newTVD;

                let distance: number = Vector3.Distance(refVector, 
                new Vector3(newEasting, newElevation, newNorthing));                                      
                
                if (distance < lowestDistance) {
                    lowestDistance = distance;                 
                    lowestMD = newMD;
                    lowestInc = newInc;
                    lowestAzm = newAzm;
                    lowestTVD = newTVD;
                    lowestNorth = newNorth;
                    lowestEast = newEast;
                    lowestEasting = newEasting;
                    lowestElevation = newElevation;
                    lowestNorthing = newNorthing;
                    lowestVector = new Vector3(newEasting, newElevation, newNorthing);
                } else {                
                    if (correctSignFound) { 
                        return { location: lowestVector, index: startIndex, md: lowestMD, inc: lowestInc, azm: lowestAzm, 
                                north: lowestNorth, east: lowestEast };  
                    }                                         
                }

                if ((prevDistance < distance) && signValueChanged && !correctSignFound) {
                    sign = sign * (-1);                  
                    correctSignFound = true;              
                    interpolatedCount = interpolatedCount / 2 - i + 1;
                }

                prevDistance = distance;

                lowestDistance = distance < lowestDistance ? distance : lowestDistance;     
                
                if (!correctSignFound) {
                    if (sign < 0) {
                        interval = interval + increment;
                    }
                } else {
                    interval = interval + increment;
                }                

                if (!correctSignFound) {
                    sign = sign * (-1);
                    signValueChanged = true;
                }
            }
            return { location: lowestVector, index: startIndex, md: lowestMD, inc: lowestInc, azm: lowestAzm, north: lowestNorth, east: lowestEast };
        } else {
            return { location: lowestVector, index: startIndex, md: lowestMD, inc: lowestInc, azm: lowestAzm, north: lowestNorth, east: lowestEast };
        }
    }
}