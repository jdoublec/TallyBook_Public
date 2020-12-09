import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { Plans, PlanHeader, IntPlans } from './plans.model';
import { SurveyMathService } from '../shared/survey-math.service';
import { InterpolationService } from '../shared/interpolation.service';

@Injectable ({ providedIn: 'root' })

export class PlansService {
    planHeaderChanged = new Subject<PlanHeader>();
    plansChanged = new Subject<Plans[]>(); 
    intPlansChanged = new Subject<Plans[]>();
    planHeader: PlanHeader;
    plans: Plans[] = [];    
    intPlans: IntPlans[] = [];
    edittedIndex: number;
    // intInterval: number = 0.01;
    intInterval: number = 1;

    constructor(private surveyMathService: SurveyMathService,
                private interpolationService: InterpolationService) {}

    setupPlanHeader() {
        if (!this.planHeader) {           
            this.planHeader = {vsDirection: 0};
            this.planHeader = {northing: 0};
            this.planHeader = {easting: 0};
            this.planHeader = {elevation: 0};
        }
    }

    getPlanHeader() {
        return this.planHeader;
    }

    setPlanHeader(planHeader: PlanHeader) {
        this.planHeader = planHeader;
        this.planHeaderChanged.next(this.planHeader);
    }

    setVSDirection(value: number) {
        this.planHeader = {vsDirection: value};
        this.planHeaderChanged.next(this.planHeader);
    }

    getVSDirection() {
        if (this.planHeader) {       
            if (!('vsDirection' in this.planHeader)){
                this.setVSDirection(0);
            }
        } else {
            this.setVSDirection(0);
        }
        return this.planHeader['vsDirection'];
    }

    setNorthing(value: number) {
        this.planHeader['northing'] = value;
        this.planHeaderChanged.next(this.planHeader);
    }

    getNorthing() {
        if (!('northing' in this.planHeader)){
            this.setNorthing(0);
        }
        return this.planHeader['northing'];
    }

    setEasting(value: number) {
        this.planHeader['easting'] = value;
        this.planHeaderChanged.next(this.planHeader);
    }

    getEasting() {
        if (!('easting' in this.planHeader)){
            this.setEasting(0);
        }
        return this.planHeader['easting'];
    }

    setElevation(value: number) {
        this.planHeader['elevation'] = value;
        this.planHeaderChanged.next(this.planHeader);
    }

    setGroundElevation(value: number) {
        this.planHeader['groundElevation'] = value;
        this.planHeaderChanged.next(this.planHeader);
    }

    getElevation() {
        if (!('elevation' in this.planHeader)){
            this.setElevation(0);
        }
        return this.planHeader['elevation'];
    }

    getGroundElevation() {
        if (!('groundElevation' in this.planHeader)){
            if (!('elevation' in this.planHeader)) {
                this.setGroundElevation(0);
            } else {
                this.setGroundElevation(this.planHeader['elevation']);
            }
        }
        return this.planHeader['groundElevation'];
    }

    getTieOnMD() {
        if (this.plans.length > 0){
            return this.plans[0].md;
        }
        return 0;
    }

    getSectionViewDistance() {
        let minVS: number = this.plans.reduce((min, surv) => surv.vs < min ? surv.vs : min, this.plans[0].vs);
        let maxVS: number = this.plans.reduce((max, surv) => surv.vs > max ? surv.vs : max, this.plans[0].vs); 

        return Math.abs(maxVS - minVS);
    }

    getIntPlans(startMD: number = 0) {        
        return this.intPlans.filter(plan => {
            return plan.md >= startMD;
        }).slice();     
    }

    setIntPlans(intPlans: IntPlans[]) {  
        this.intPlans = intPlans;
    }

    getPlans() {
        return this.plans.slice();
    }

    setPlans(plans: Plans[]) {  
        this.plans = plans;
        this.updateIntPlans(0);
        this.plansChanged.next(this.plans.slice());  
    }

    addPlan(md: number, inc: number, azm: number, batchPlan: boolean=false) {
        const newPlan = new Plans(md, inc, azm, null, null, null, null, null, null, null, null, null);        
        
        this.plans.push(newPlan);

        if (!batchPlan) {
            this.updateAllPlans(this.plans.length - 1);
        }
    }

    removePlan(index: number) {
        this.plans.splice(index, 1);   
        if ((index) < this.plans.length) {
            if (this.plans.length === 1) {
                index = 0;
            }
            this.updatePlan(index, this.plans[index].md, this.plans[index].inc, this.plans[index].azm);
        } else {
            index = index - 1;
            this.updateIntPlans(index - 1);
            this.plansChanged.next(this.plans.slice());
        }

        return index;
    }   

    updatePlan(index: number, md: number, inc: number, azm: number) {
        this.plans[index].md = md;
        this.plans[index].inc = inc;
        this.plans[index].azm = azm;

        this.updateAllPlans(index);        
    } 

    updateAllPlans(index: number) {
        this.updatePlanCalculations(index);
        this.updateDLS(index);
        
        this.updateIntPlans(index);

        this.plansChanged.next(this.plans.slice());        
    }

    batchAddPlans(md: number, inc: number, azm: number, startIndex: number, batchComplete: boolean=false) {
        this.addPlan(md, inc, azm, true);
        if (batchComplete) {
            this.updatePlanCalculations(startIndex);
                    
            for (let i = startIndex; i < this.plans.length; i++) {
                this.updateDLS(i);
            }

            this.updateIntPlans(startIndex - 1)

            this.plansChanged.next(this.plans.slice());           
        }
    }

    addPlanTieOn(md: number, inc: number, azm: number, tvd: number,
        north: number, east: number, vsDirection: number,
        northing: number, easting: number, elevation: number,
        groundElevation: number) {
        
        const newPlan = new Plans(md, inc, azm, tvd, north, east, null, null, null, null, null, null);        
        
        this.plans.push(newPlan);                   
            
        this.planHeader['vsDirection'] = vsDirection;
        this.planHeader['northing'] = northing;
        this.planHeader['easting'] = easting;
        this.planHeader['elevation'] = elevation;
        this.planHeader['groundElevation'] = groundElevation;

        this.planHeaderChanged.next(this.planHeader);

        this.updatePlanCalculations(0);
        this.updateDLS(0);

        this.updateIntPlans(0);

        this.plansChanged.next(this.plans.slice());   
    }

    updatePlanTieOn(md: number, inc: number, azm: number, tvd: number,
        north: number, east: number, vsDirection: number,
        northing: number, easting: number, elevation: number,
        groundElevation: number) {
            this.plans[0].md = md;
            this.plans[0].inc = inc;
            this.plans[0].azm = azm;
            this.plans[0].tvd = tvd;
            this.plans[0].north = north;
            this.plans[0].east = east;
            this.plans[0].elevation = elevation - tvd;            
            this.plans[0].northing = north + northing;
            this.plans[0].easting = east + easting;
            
            this.planHeader['vsDirection'] = vsDirection;
            this.planHeader['northing'] = northing;
            this.planHeader['easting'] = easting;
            this.planHeader['elevation'] = elevation;
            this.planHeader['groundElevation'] = groundElevation;

            this.planHeaderChanged.next(this.planHeader);

            this.updateAllPlans(1);
    }
    
    updatePlanCalculations(index: number) {  
        let startMD, endMD, startInc, endInc, startAzm, endAzm, startTVD, startNorth, 
            startEast, startElevation, startNorthing, startEasting: number;                     
        for (let i = index; i < this.plans.length; i++) {
            if (index > 0) {  
                startMD = this.plans[i - 1].md;                
                startInc = this.plans[i - 1].inc;               
                startAzm = this.plans[i - 1].azm;                    
                startTVD =  this.plans[i - 1].tvd;   
                startNorth = this.plans[i - 1].north;
                startEast = this.plans[i - 1].east;
                startElevation = this.plans[i -1].elevation;
                startNorthing = this.plans[i - 1].northing;
                startEasting = this.plans[i - 1].easting;        

                endMD = this.plans[i].md;
                endInc = this.plans[i].inc;
                endAzm = this.plans[i].azm;
                                
                this.plans[i].tvd = startTVD + this.surveyMathService.getChangeInTVD(startMD, endMD, startInc, endInc, startAzm, endAzm);
                this.plans[i].north = startNorth + this.surveyMathService.getChangeInNorth(startMD, endMD, startInc, endInc, startAzm, endAzm);
                this.plans[i].east = startEast + this.surveyMathService.getChangeInEast(startMD, endMD, startInc, endInc, startAzm, endAzm);
                this.plans[i].survTF = this.surveyMathService.getToolFace(startInc, endInc, startAzm, endAzm);
                this.plans[i].elevation = this.planHeader['elevation'] - this.plans[i].tvd;
                this.plans[i].northing = this.plans[i].north + this.planHeader['northing'];
                this.plans[i].easting = this.plans[i].east + this.planHeader['easting'];

                const north: number = this.plans[i].north;
                const east: number = this.plans[i].east;
                const vsDirection: number = 'vsDirection' in this.planHeader ? this.planHeader['vsDirection'] : 0;  

                this.plans[i].vs = this.surveyMathService.getVSect(vsDirection, north, east);            
            } else {
                let endInc: number = this.plans[0].inc;
                let endAzm: number = this.plans[0].azm;
                this.plans[0].survTF = this.surveyMathService.getToolFace(0, endInc, 0, endAzm);

                const north: number = this.plans[0].north;
                const east: number = this.plans[0].east;
                const vsDirection: number = 'vsDirection' in this.planHeader ? this.planHeader['vsDirection'] : 0;  
            
                this.plans[0].vs = this.surveyMathService.getVSect(vsDirection, north, east);
                this.plans[0].elevation = this.planHeader['elevation'] - this.plans[0].tvd;
                this.plans[0].northing = this.plans[0].north + this.planHeader['northing'];
                this.plans[0].easting = this.plans[0].east + this.planHeader['easting'];
            }
        }
    }

    updateDLS(index: number) {
        let currentMD: number = this.plans[index].md;
        let currentInc: number = this.plans[index].inc;
        let currentAzm: number = this.plans[index].azm;
        let prevMD: number = -1;
        let prevInc: number = -1;
        let prevAzm: number = -1;
        let nextMD: number = -1; 
        let nextInc: number = -1;
        let nextAzm: number = -1;
        let currentDLS: number = -1;
        let nextDLS: number = -1

        if (index > 0) {
            prevMD = this.plans[index - 1].md;
            prevInc = this.plans[index - 1].inc;
            prevAzm = this.plans[index - 1].azm;
            
        } else {
            prevMD = this.plans[0].md;;
            prevInc = this.plans[0].inc;;
            prevAzm = this.plans[0].azm;;
        }

        currentDLS = this.surveyMathService.getDLS(prevMD, currentMD, prevInc, currentInc, prevAzm, currentAzm);
        this.plans[index].dls = currentDLS;
        
        if (index < (this.plans.length - 1)) {
            nextMD = this.plans[index + 1].md;
            nextInc = this.plans[index + 1].inc;
            nextAzm = this.plans[index + 1].azm;    

            nextDLS = this.surveyMathService.getDLS(currentMD, nextMD, currentInc, nextInc, currentAzm, nextAzm);
            this.plans[index + 1].dls = nextDLS
        }          
    }    

    // getInterpolatedPlan(md: number) {

    //     let intPlans: Plans[] = [];

    //     for (let i = 0; i < this.plans.length; i++)
    //     {            
    //         if (md === this.plans[i]['md']) {
    //             intPlans.push(this.plans[i]);
    //             break;
    //         } else if (i > 0) {
    //             if ((md > this.plans[i - 1]['md']) && (i < this.plans.length)) {
    //                 if (md < this.plans[i]['md']) {
    //                     const prevRowIndex: number = i - 1;
    //                     const previousMD: number = this.plans[prevRowIndex]['md'];
    //                     const previousInc: number = this.plans[prevRowIndex]['inc'];
    //                     const previousAzm: number = this.plans[prevRowIndex]['azm'];                           
    //                     const courseLength: number = md - previousMD;
    //                     const dogLeg: number = this.plans[i]['dLs'];
    //                     const toolFace: number = this.plans[i]['survTF'];
    //                     let projInc: number = 0;                           
    //                     let changeInAzm: number = 0;
    //                     let newAzm: number = 0;
    //                     //This If Statement had to be added because when interpolating between points where the Inc is the same before and after
    //                     //at times the interpolation doesn't give the correct Inc due to Interpolation error at Lower Inc where the toolface
    //                     //causes the error.  I.E. 10 Inc and a tool face of 116 will give an Interpolated Inc of 9.94 when it should be 10. 
    //                     if (((this.plans.length - 1) >= (prevRowIndex + 1)) &&
    //                         (previousInc == this.plans[prevRowIndex + 1]['inc'])) {
    //                         // projInc = previousInc;
    //                         projInc = this.surveyMathService.getProjChangeInIncDLegTFMD(previousInc, dogLeg, courseLength, toolFace);
    //                     } else {
    //                         projInc = this.surveyMathService.getProjChangeInIncDLegTFMD(previousInc, dogLeg, courseLength, toolFace);
    //                     }

    //                     changeInAzm = this.surveyMathService.getProjChangeInAzimuthDLegTFMD(dogLeg, previousInc, projInc, courseLength, toolFace);

    //                     //dNewAzm = clsSurvCalc.GetCorrectAzmFromChangeInAzm(dPreviousInc, dToolFace, dProjInc, dPreviousAzm, dChangeInAzm);

    //                     newAzm = this.surveyMathService.getCorrectAzimuthNear360(previousAzm + changeInAzm);

    //                     //dNewAzm = GetCorrectAzimuthNear360(dNewAzm);

    //                     if (previousInc > 0) {
    //                         // intPlans.push(this.updatePlanInfo(i, 0, true, true, md, projInc, newAzm));
    //                     }
    //                     else
    //                     {
    //                         // intPlans.push(updatePlanInfo(i, 0, true, true, md, projInc, changeInAzm));
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     return intPlans;
    // }
    
    // getInterpolatedStartingIndex(md: number) {
    //     for (let i = 0; i < this.intPlans.length; i++){
    //         if (this.intPlans[i].md === md) {
    //             return i;
    //         }
    //     }

    //     return 0;        
    // }

    updateIntPlans(index: number) {  
        if (this.plans.length > 0) {
            this.intPlans = this.interpolationService.updateIntPlans(index, this.plans.slice(), this.intPlans, this.getElevation(), 
                                                                    this.getNorthing(), this.getEasting(), this.getVSDirection());
        } else {
            this.setIntPlans([]);
        }
        
        if (this.intPlans) {
            this.intPlansChanged.next(this.intPlans.slice());  
        }
    //     if (this.plans.length > 0) {
    //         let startIndex = index > 0 ? index - 1 : 0;
    //         let intStartIndex = startIndex > 0 ? this.intPlans.findIndex(plan => plan.md === this.plans[startIndex].md) : 0;
            
    //         this.intPlans = this.intPlans.slice(0, intStartIndex);            
            
    //         const tieOnElevation = this.getElevation();
    //         const tieOnNorthing = this.getNorthing();
    //         const tieOnEasting = this.getEasting();
    //         const tieOnVS = this.getVSDirection();
    //         for (let i = startIndex; i < this.plans.length; i++) {                
    //             if (i < (this.plans.length - 1)) {
    //                 let dls = this.plans[i + 1].dls;
    //                 let currentMD = this.plans[i].md;
    //                 let currentInc = this.plans[i].inc;
    //                 let currentAzm = this.plans[i].azm;

    //                 let nextMD = this.plans[i + 1].md;   
    //                 let nextInc = this.plans[i + 1].inc;
    //                 let nextAzm = this.plans[i + 1].azm;                            
    //                 let toolface = this.plans[i + 1].survTF;                     
    //                 let interpolatedCount = (nextMD - currentMD);

    //                 const newIntPlan = new IntPlans(this.plans[i].md, this.plans[i].inc, this.plans[i].azm, this.plans[i].tvd, 
    //                                                 this.plans[i].north, this.plans[i].east, this.plans[i].vs, this.plans[i].survTF, 
    //                                                 this.plans[i].dls, this.plans[i].elevation, this.plans[i].northing, 
    //                                                 this.plans[i].easting, false, this.plans[i].offsets);

    //                 this.intPlans.push(newIntPlan); 
    //                     for (let j = 0; j < (interpolatedCount - 1); j ++) {
    //                         const newMD: number = currentMD + this.intInterval;
    //                         const newInc: number =this.surveyMathService.getProjChangeInIncDLegTFMD(currentInc, dls, this.intInterval, toolface);                                      
    //                         const chInAzm: number = this.surveyMathService.getProjChangeInAzimuthDLegTFMD(dls, currentInc, newInc, this.intInterval, toolface);    
    //                         const newAzm: number = this.surveyMathService.getCorrectAzimuthNear360(currentAzm + chInAzm);                                
    //                         const newTVD: number = this.intPlans[this.intPlans.length - 1].tvd + 
    //                                         this.surveyMathService.getChangeInTVD(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
    //                         const newNorth: number = this.intPlans[this.intPlans.length - 1].north + 
    //                                         this.surveyMathService.getChangeInNorth(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
    //                         const newEast: number = this.intPlans[this.intPlans.length - 1].east +
    //                                         this.surveyMathService.getChangeInEast(currentMD, newMD, currentInc, newInc, currentAzm, newAzm);
    //                         const newElevation: number = tieOnElevation - newTVD;
    //                         const newNorthing: number = newNorth + tieOnNorthing;
    //                         const newEasting: number = newEast + tieOnEasting;
    //                         const newVS: number = this.surveyMathService.getVSect(tieOnVS, newNorth, newEast);
    //                         const newTF: number = this.surveyMathService.getToolFace(currentInc, newInc, currentAzm, newAzm);
                            
    //                         const newIntPlan = new IntPlans(newMD, newInc, newAzm, newTVD, newNorth, newEast, newVS, newTF, dls, 
    //                                                         newElevation, newNorthing, newEasting, true);

    //                         this.intPlans.push(newIntPlan);
                            
    //                         currentMD = newMD;
    //                         currentInc = newInc;
    //                         currentAzm = newAzm;
    //                         toolface = this.surveyMathService.getToolFace(newInc, nextInc, newAzm, nextAzm);
    //                     }                                    
    //             } else if (i === (this.plans.length - 1)) {                                  
    //                 const newIntPlan = new IntPlans(this.plans[i].md, this.plans[i].inc, this.plans[i].azm, this.plans[i].tvd, 
    //                     this.plans[i].north, this.plans[i].east, this.plans[i].vs, this.plans[i].survTF, this.plans[i].dls, 
    //                     this.plans[i].elevation, this.plans[i].northing, this.plans[i].easting, false, this.plans[i].offsets);

    //                 this.intPlans.push(newIntPlan);
    //             }
    //         } 

            
    //         this.intPlansChanged.next(this.intPlans.slice());  
    //     }
    }
}