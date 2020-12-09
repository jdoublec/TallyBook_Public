import { Injectable } from '@angular/core';
import { SurveyMathService } from 'src/app/shared/survey-math.service';
import { SurveysService } from '../surveys.service';

@Injectable({ providedIn: 'root'})
export class ProjectionsService {

    constructor(private surveyMathService: SurveyMathService,) {}

    // projectMDIncAzm(md: number, inc: number, azm: number) {
    //     this.surveysService.addSurvey(md, inc, azm, false, true);        
    // }

    getProjectionIncAzmTVD(currentMD: number, currentInc: number, currentAzm: number, currentTVD: number, 
                     inc: number, azm: number, tvd: number) {
        let chInMD = this.surveyMathService.getProjectedChInMDwithTVDIncAzm(currentTVD,
            tvd, currentInc, inc, currentAzm, azm);
        
        
        let newMD = currentMD + chInMD;

        return { md: newMD, inc: inc, azm: azm };
    }

    getProjectionMDDLSTF(currentMD: number, currentInc: number, currentAzm: number, md: number, dls: number, toolface: number) {
        
        const courseLength = md - currentMD;
        const newInc = this.surveyMathService.getProjChangeInIncDLegTFMD(currentInc, dls, courseLength, toolface);                                 
        const chInAzm: number = this.surveyMathService.getProjChangeInAzimuthDLegTFMD(dls, currentInc, newInc, courseLength, toolface);    
        const newAzm: number = this.surveyMathService.getCorrectAzimuthNear360(currentAzm + chInAzm);                                                

        return { md: md, inc: newInc, azm: newAzm };
    }

    getProjectionCLDLTF(currentMD: number, currentInc: number, currentAzm: number, courseLength: number, dls: number, toolface: number ) {
        const newMD = currentMD + courseLength;
        const newInc = this.surveyMathService.getProjChangeInIncDLegTFMD(currentInc, dls, courseLength, toolface);                                 
        const chInAzm: number = this.surveyMathService.getProjChangeInAzimuthDLegTFMD(dls, currentInc, newInc, courseLength, toolface);    
        const newAzm: number = this.surveyMathService.getCorrectAzimuthNear360(currentAzm + chInAzm);                                        

        return { md: newMD, inc: newInc, azm: newAzm };
    }

    getProjectionCLBRTR(currentMD: number, currentInc: number, currentAzm: number, courseLength: number, buildRate: number, turnRate: number) {
        const chInInc = this.surveyMathService.getProjChangeInIncByBuildRate(buildRate, courseLength);
        const chInAzm = this.surveyMathService.getProjChangeInAzmTurnRate(turnRate, courseLength);

        const newInc = chInInc + currentInc;
        const newAzm = chInAzm + currentAzm;
        const newMD = courseLength + currentMD;
        
        return { md: newMD, inc: newInc, azm: newAzm };
    }    

    getProjectionCLIncAzm(currentMD: number, courseLength: number, inc: number, azm: number) {
        const newMD = courseLength + currentMD;
        
        return { md: newMD, inc: inc, azm: azm };
    }

    // projectDoubleCurve() {        
    //     let svy = this.surveysService.getSurveys();
    //     for (let i = 0; i < 2; i++) {
    //         let slMD = svy[svy.length - 1].md + 100;
    //         let slInc = svy[svy.length - 1].inc;
    //         let slAzm = svy[svy.length - 1].azm;
    //         let slTVD = svy[svy.length - 1].tvd + this.surveyMathService.getChangeInTVD(svy[svy.length - 1].md, svy[svy.length - 1].md + 100, 
    //                                                                                     slInc, slInc, slAzm, slAzm);
    //         let slNorth = svy[svy.length - 1].north + this.surveyMathService.getChangeInNorth(svy[svy.length - 1].md, svy[svy.length - 1].md + 100, 
    //                                                                                         slInc, slInc, slAzm, slAzm);
    //         let slEast =   svy[svy.length - 1].east + this.surveyMathService.getChangeInEast(svy[svy.length - 1].md, svy[svy.length - 1].md + 100, 
    //                                                                                         slInc, slInc, slAzm, slAzm);
    //         let slTF = 0;
    //         let slElev = this.surveyHeader['elevation'] - slTVD;
    //         let slNorthing = slNorth + this.surveyHeader['northing'];
    //         let slEasting = slEast + this.surveyHeader['easting'];
    //         const vsDirection: number = 'vsDirection' in this.surveyHeader ? this.surveyHeader['vsDirection'] : 0; 
    //         let slVS = this.surveyMathService.getVSect(vsDirection, slNorth, slEast);

    //         let newSvy = new Surveys(slMD, slInc, slAzm, slTVD, slNorth, slEast, slVS, slTF, 0, '', '', 0, 0, 0, 0, 0, 0, slElev, slNorthing, slEasting);

    //         svy.push(newSvy);
    //     }

    //     let start = new Vector3(svy[svy.length - 3].easting, svy[svy.length - 3].elevation, svy[svy.length - 3].northing);
    //     let path3d = new Path3D(svy.map(surv => {
    //         return new Vector3(surv.easting, surv.elevation, surv.northing);
    //     }), new Vector3(0, -1, 0));

    //     svy.splice(0, svy.length - 3);
    //     path3d.update(svy.map(surv => {
    //         return new Vector3(surv.easting, surv.elevation, surv.northing);
    //     }), new Vector3(0, -1, 0));
    //     let survTangents = path3d.getTangents();

    //     let plans = this.plansService.getPlans();
    //     plans.splice(plans.length - 1, 1);
    //     for (let i = 0; i < 2; i++) {
    //         let slMD = plans[plans.length - 1].md + 100;
    //         let slInc = plans[plans.length - 1].inc;
    //         let slAzm = plans[plans.length - 1].azm;
    //         let slTVD = plans[plans.length - 1].tvd + this.surveyMathService.getChangeInTVD(plans[plans.length - 1].md, plans[plans.length - 1].md + 100, 
    //                                                                                     slInc, slInc, slAzm, slAzm);
    //         let slNorth = plans[plans.length - 1].north + this.surveyMathService.getChangeInNorth(plans[plans.length - 1].md, plans[plans.length - 1].md + 100, 
    //                                                                                         slInc, slInc, slAzm, slAzm);
    //         let slEast =   plans[plans.length - 1].east + this.surveyMathService.getChangeInEast(plans[plans.length - 1].md, plans[plans.length - 1].md + 100, 
    //                                                                                         slInc, slInc, slAzm, slAzm);
    //         let slTF = 0;
    //         let slElev = this.surveyHeader['elevation'] - slTVD;
    //         let slNorthing = slNorth + this.surveyHeader['northing'];
    //         let slEasting = slEast + this.surveyHeader['easting'];
    //         const vsDirection: number = 'vsDirection' in this.surveyHeader ? this.surveyHeader['vsDirection'] : 0; 
    //         let slVS = this.surveyMathService.getVSect(vsDirection, slNorth, slEast);

    //         let newplans = new Plans(slMD, slInc, slAzm, slTVD, slNorth, slEast, slVS, slTF, 0, slElev, slNorthing, slEasting);

    //         plans.push(newplans);
    //     }
    //     let end = new Vector3(plans[plans.length - 3].easting, plans[plans.length - 3].elevation, plans[plans.length - 3].northing);
    //     path3d = new Path3D(plans.map(plan => {
    //         return new Vector3(plan.east, plan.elevation, plan.northing);            
    //     }), new Vector3(0, -1, 0));

    //     plans.splice(0, plans.length - 3)
    //     path3d.update(plans.map(plan => {
    //         return new Vector3(plan.east, plan.elevation, plan.northing); 
    //     }), new Vector3(0, -1, 0));
    //     let planTangents = path3d.getTangents();   
    //     console.log(plans);
                
    //     console.log(survTangents[survTangents.length - 2]);
    //     console.log(survTangents[survTangents.length - 1]);
    //     console.log(planTangents[planTangents.length - 2]);
    //     console.log(planTangents[planTangents.length - 1]);
        

    //     let sTan = survTangents[survTangents.length - 1];

    //     let pTan = planTangents[planTangents.length - 1];

    //     // console.log(sTan.normalize());
    //     // console.log(pTan.normalize());

    //     let distance = Vector3.Distance(start, end);
        
    //     // let rad1: number = Math.cos(this.surveyMathService.degreesToRadians(9.31)) * 481.30;
    //     // let rad2: number = 1085.91 / Math.cos(this.surveyMathService.degreesToRadians(9.26));
    //     let chInEasting = Math.abs(Math.abs(svy[svy.length - 3].easting) - Math.abs(plans[plans.length - 3].easting));
    //     console.log(chInEasting);
    //     let chInElevation = Math.abs(Math.abs(svy[svy.length - 3].elevation) - Math.abs(plans[plans.length - 3].elevation));
    //     console.log(chInElevation);
    //     let chInNorthing = Math.abs(Math.abs(svy[svy.length -3].northing) - Math.abs(plans[plans.length - 3].northing));
    //     console.log(chInNorthing);
    //     // let rad1: number = 48.55 + 556.06;
    //     let rad1: number = chInEasting + chInNorthing;
    //     // let rad2: number = 481.30 + 556.06;
    //     let rad2: number = chInElevation + chInNorthing;

    //     let projection = Curve3.CreateHermiteSpline(
    //         start,
    //         new Vector3(rad1 * sTan.x, rad1 * sTan.y, rad1 * sTan.z),
    //         end,
    //         new Vector3(rad2 * pTan.x, rad2 * pTan.y, rad2 * pTan.z),
    //     distance);

    //     // let newPath3d = new Path3D(projection.getPoints());
    //     console.log(projection);
    //     // let midProj = projection.getPoints();
    //     // midProj.splice(0, Math.round(distance / 2));
    //     let newPath3d = new Path3D(projection.getPoints(), new Vector3(0, -1, 0));
    //     let distances = newPath3d.getCurve();
    //     let projTan = newPath3d.getTangents()
    //     let length = projection.length();
    //     let pointCount = projection.getPoints().length
    //     let ftPerPoint = length / pointCount;
    //     // let totalFt = ftPerPoint;
    //     let totalFt = Vector3.Distance(new Vector3(this.surveys[this.surveys.length - 1].easting, this.surveys[this.surveys.length - 1].elevation,
    //                                                this.surveys[this.surveys.length - 1].northing), distances[1])
    //     let avgDLS = 0;
    //     let avgTF = 0;
    //     svy.splice(1, 2);
    //     let tfTotalCos = 0;
    //     let tfTotalSin = 0;
    //     let firstAvgTF = 0;
    //     let md = 0;
    //     let tfChanged: boolean = false;
    //     let interval = 10;
    //     let iterationCount = 0;
    //     let intervalDist = 0;
    //     let firstDist = 0;
    //     let firstDLS = 0;
    //     let firstTF = 0;
    //     let secondDist = 0;
    //     let secondDLS = 0;
    //     let secondTF = 0;
    //     let currentTF = 0;
    //     let prevTF = 0;
    //     let firstFound = false;
    //     let posTF: boolean = false;
    //     let negTF: boolean = false;
    //     let tfSwitched: boolean = false;
    //     let totalIntervalDist = 0;
    //     for (let i = 0; i < pointCount; i++) {  
                      
    //         // let midmd = projection.length() / 2 + svy[svy.length - 2].md;
    //         // let md = totalFt + svy[svy.length - 3].md;
    //         if (i < (pointCount - 1)) {
    //            intervalDist = Vector3.Distance(distances[i], distances[i + 1]);;
    //            md = svy[svy.length - 1].md + intervalDist;
    //         } else {
    //             intervalDist = Vector3.Distance(distances[i - 1], distances[i]) * 2;
    //             md = svy[svy.length - 1].md + intervalDist;
    //         }

    //         totalIntervalDist += intervalDist;
    //         // totalFt += ftPerPoint;
    //         // if (i < (pointCount - 1)) {
    //         //     totalFt += Vector3.Distance(distances[i], distances[i + 1]);
    //         // }
    //         // let midPoint = Math.round(distance / 2);
    //         let midInc = 90 + this.surveyMathService.radiansToDegrees(Math.atan(projTan[i].y / Math.sqrt(Math.pow(projTan[i].x, 2) + Math.pow(projTan[i].z, 2))));
    //         let midAzm = 180 + this.surveyMathService.radiansToDegrees(Math.atan(projTan[i].x / projTan[i].z));

    //         // console.log(md + ' ' + midInc + ' ' + midAzm);
    //         // this.surveysService.addSurvey(md, midInc, midAzm);
            
    //         const newSurvey = new Surveys(md, midInc, midAzm, null, null, null, null, null, null, '', '', null, null, null, null);        
    //         const dls = this.surveyMathService.getDLS(svy[svy.length - 1].md, md, svy[svy.length - 1].inc, midInc, 
    //                                                       svy[svy.length - 1].azm, midAzm);
    //         const tf = this.surveyMathService.getToolFace(svy[svy.length - 1].inc, midInc, 
    //                                                       svy[svy.length - 1].azm, midAzm)
    //         svy.push(newSurvey); 

            

    //         // avgDLS += this.surveys[this.surveys.length -1].dls;   
    //         avgDLS += dls;         
    //         // avgTF += this.surveys[this.surveys.length - 1].survTF
    //         avgTF += tf;    
    //         // console.log(md + ' ' + midInc + ' ' + midAzm);
    //         // console.log(tf);          
    //         currentTF = tf;

    //         let tfVal = Math.sin(this.surveyMathService.degreesToRadians(currentTF));

    //         if (tfVal > 0) {
    //             posTF = true;
    //         } else {
    //             negTF = true;
    //         }

            

           

    //         tfTotalCos = tfTotalCos + Math.cos(this.surveyMathService.degreesToRadians(tf));
    //         tfTotalSin = tfTotalSin + Math.sin(this.surveyMathService.degreesToRadians(tf));

    //         iterationCount += 1;
    //         if (!firstFound) {
    //             if (posTF && negTF) {
    //                     console.log('TF Switched');
    //                     firstDist = totalIntervalDist
    //                     console.log(avgDLS);
    //                     console.log(iterationCount);
    //                     // firstDLS = avgDLS / iterationCount;                        
    //                     firstTF = this.surveyMathService.radiansToDegrees(Math.atan2(tfTotalSin, tfTotalCos));
    //                     if (firstTF < 0) {
    //                         firstTF = 360 + firstTF;
    //                     }
    //                     tfTotalCos = 0;
    //                     tfTotalSin = 0;
    //                     // avgDLS = 0;
    //                     firstFound = true;
    //                     // intervalDist = 0;
    //                     iterationCount = 0;     
                        
    //                     // console.log(firstDist);
    //                     // console.log(firstDLS);
    //                     // console.log(firstTF);
    //             }
    //         }

    //         // console.log('cTF ' + currentTF + ' pTF ' + prevTF);

    //         prevTF = currentTF;


    //         if (i === (pointCount - 1)) {
    //             secondDist = totalIntervalDist;
    //             secondTF = this.surveyMathService.radiansToDegrees(Math.atan2(tfTotalSin, tfTotalCos));
    //             if (secondTF < 0) {
    //                 secondTF = 360 + secondTF;
    //             }
    //             // secondDist = avgDLS / iterationCount;                
    //         }
            
            
    //         // if ((iterationCount === interval) || (i === (pointCount - 1))) {
    //         //     console.log('survey pushed. @ ' + i);
    //         //     avgDLS = avgDLS / iterationCount;
    //         //     let intervalTF = this.surveyMathService.radiansToDegrees(Math.atan2(tfTotalSin, tfTotalCos));
    //         //     if (intervalTF < 0) {
    //         //         intervalTF = 360 + intervalTF;
    //         //     }

    //         //     this.projectDLTFMD(10.18, intervalTF, intervalDist);
    //         //     intervalDist = 0;
    //         //     tfTotalCos = 0;
    //         //     tfTotalSin = 0;
    //         //     avgDLS = 0;
    //         //     iterationCount = 0;
    //         // }

    //         // if (i >= (pointCount / 2)) {
    //         //     if (!tfChanged) {
    //         //         firstAvgTF = this.surveyMathService.radiansToDegrees(Math.atan2(tfTotalSin, tfTotalCos));
    //         //         tfTotalCos = 0;
    //         //         tfTotalSin = 0;
    //         //         tfChanged = true;
    //         //     }
    //         // }
    //     }

    //     console.log(avgDLS);
    //     console.log(pointCount - 1);
    //     let totalDLSAvg = avgDLS / (pointCount - 1);

    //     this.projectDLTFMD(10, 12, firstDist);
    //     this.projectDLTFMD(10, 347, secondDist);

    //     // avgDLS = avgDLS / pointCount;
    //     // avgTF = avgTF / pointCount;
    //     // console.log('AvgDLS = ' + avgDLS);
    //     // console.log('AvgTF ' + avgTF);
        
    //     // let calcAvgTF = this.surveyMathService.radiansToDegrees(Math.atan2(tfTotalSin, tfTotalCos));
    //     // console.log(firstAvgTF);
    //     // console.log(calcAvgTF);

    //     // if (firstAvgTF < 0) {
    //     //     firstAvgTF = 360 + firstAvgTF;
    //     // }
        
    //     // if (calcAvgTF < 0) {
    //     //     calcAvgTF = 360 + calcAvgTF;
    //     // }
    //     // this.surveysService.addSurvey(midmd, midInc, midAzm);
    //     // this.projectDLTFMD(avgDLS, firstAvgTF, projection.length() / 2);
    //     // this.projectDLTFMD(avgDLS, calcAvgTF, projection.length() / 2);
    //     this.surveyAddedUpdatePlots();
    //    this.plotsService.insertProjection(projection, start, end, survTangents[survTangents.length - 1], planTangents[planTangents.length - 2]); 
    // }
}