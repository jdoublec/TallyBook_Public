import { Injectable } from "@angular/core";
import { Subject } from 'rxjs';
import { Surveys, SurveyHeader, IntSurveys } from './surveys.model';
import { SurveyMathService } from '../shared/survey-math.service';
import { OrientationService } from '../shared/orientation.service';
import { InterpolationService } from '../shared/interpolation.service';

@Injectable ({ providedIn: 'root' })

export class SurveysService {    
    surveyHeaderChanged = new Subject<SurveyHeader>();
    surveysChanged = new Subject<Surveys[]>();    
    intSurveysChanged = new Subject<IntSurveys[]>();
    surveyHeader: SurveyHeader;
    surveys: Surveys[] = [];    
    intSurveys: Surveys[] = [];
    edittedIndex: number;
    intIncrement: number = 0.01;
    // plotMode: boolean = false;

    constructor(protected interpolationService: InterpolationService,
                protected orientationService: OrientationService,
                protected surveyMathService: SurveyMathService,) {}

    
    // setPlotMode(mode: boolean) {
    //     this.plotMode = mode;
    // }

    // getPlotMode() {
    //     return this.plotMode;
    // }

    setupSurveyHeader() {
        if (!this.surveyHeader) {           
            this.surveyHeader = {vsDirection: 0};
            this.surveyHeader = {northing: 0};
            this.surveyHeader = {easting: 0};
            this.surveyHeader = {elevation: 0};
        }
    }

    getSurveyHeader() {
        return this.surveyHeader;
    }

    setSurveyHeader(surveyHeader: SurveyHeader) {
        this.surveyHeader = surveyHeader;
        this.surveyHeaderChanged.next(this.surveyHeader);
    }

    setVSDirection(value: number) {
        this.surveyHeader = {vsDirection: value};
        this.surveyHeaderChanged.next(this.surveyHeader);
    }

    getVSDirection() {
        if (this.surveyHeader) {       
            if (!('vsDirection' in this.surveyHeader)){
                this.setVSDirection(0);
            }
        } else {
            this.setVSDirection(0);
        }
        return this.surveyHeader['vsDirection'];
    }

    setNorthing(value: number) {
        this.surveyHeader['northing'] = value;
        this.surveyHeaderChanged.next(this.surveyHeader);
    }

    getNorthing() {
        if (!('northing' in this.surveyHeader)){
            this.setNorthing(0);
        }
        return this.surveyHeader['northing'];
    }

    setEasting(value: number) {
        this.surveyHeader['easting'] = value;
        this.surveyHeaderChanged.next(this.surveyHeader);
    }

    getEasting() {
        if (!('easting' in this.surveyHeader)){
            this.setEasting(0);
        }
        return this.surveyHeader['easting'];
    }

    setElevation(value: number) {
        this.surveyHeader['elevation'] = value;
        this.surveyHeaderChanged.next(this.surveyHeader);
    }

    getElevation() {
        if (!('elevation' in this.surveyHeader)){
            this.setElevation(0);
        }
        return this.surveyHeader['elevation'];
    }

    setGroundElevation(value: number) {
        this.surveyHeader['groundElevation'] = value;
        this.surveyHeaderChanged.next(this.surveyHeader);
    }

    getGroundElevation() {
        if (!('groundElevation' in this.surveyHeader)){
            if (!('elevation' in this.surveyHeader)) {
                this.setGroundElevation(0);
            } else {
                this.setGroundElevation(this.surveyHeader['elevation']);
            }
        }
        return this.surveyHeader['groundElevation'];
    }

    getTieOnMD() {
        if (this.surveys.length > 0){
            return this.surveys[0].md;
        }
        return 0;
    }    

    setSurveys(surveys: Surveys[]) {  
        this.surveys = surveys;
        this.updateIntSurveys(0);        
        this.surveysChanged.next(this.surveys.slice());       
    }

    getSurveys() {        
        return this.surveys.slice();
    }

    setIntSurveys(intSurveys: IntSurveys[]) {
        this.intSurveys = intSurveys;
    }

    getIntSurveys() {        
        return this.intSurveys.slice();        
    }

    getSurveyMDValues() {
        return this.surveys.reduce((newArr, surveys) => {
            return [...newArr, surveys.md];
        }, []);
    }

    getAzm(md: number) {
        for (let surv of this.surveys) {
            if (surv.md >= md) {
                return surv.azm;
            }
        }
        return this.getVSDirection();
    }

    getSectionViewDistance() {
        let minVS: number = this.surveys.reduce((min, surv) => surv.vs < min ? surv.vs : min, this.surveys[0].vs);
        let maxVS: number = this.surveys.reduce((max, surv) => surv.vs > max ? surv.vs : max, this.surveys[0].vs); 

        return Math.abs(maxVS - minVS);
    }

    getCoord(md: number) {
        for (let surv of this.surveys) {
            if (surv.md >= md) {
                return {easting: surv.easting, elevation: surv.elevation, northing: surv.northing};
            }
        }
        return {easting: this.getEasting(), elevation: this.getElevation(), northing: this.getNorthing()}
    }

    getLastSurveyMD() {
        if (this.surveys.length > 0) {
            return this.surveys[this.surveys.length - 1].md;
        }

        return 0;
    }

    addSurvey(md: number, inc: number, azm: number, batchSurvey: boolean=false, projection?: boolean) {
        const newSurvey = new Surveys(md, inc, azm, null, null, null, null, null, null, '', '', null, null, null, null);        
        
        this.surveys.push(newSurvey);   
        
        if (projection) {
            this.surveys[this.surveys.length - 1].projection = projection;
        }
        
        if (!batchSurvey) {
            this.updateAllSurveys(this.surveys.length - 1);        
        }
    }

    updateSurvey(index: number, md: number, inc: number, azm: number) {
        this.surveys[index].md = md;
        this.surveys[index].inc = inc;
        this.surveys[index].azm = azm;

        this.updateAllSurveys(index);        
    }

    removeSurvey(index: number) {
        this.surveys.splice(index, 1);
        if ((index) < this.surveys.length) {
            if (this.surveys.length === 1) {
                index = 0;
            }
            this.updateSurvey(index, this.surveys[index].md, this.surveys[index].inc, this.surveys[index].azm);
        } else {
            index = index - 1
            this.updateIntSurveys(index);
            this.surveys = this.orientationService.updateOffsetValues(index, this.intIncrement, this.surveys.slice())
            this.surveysChanged.next(this.surveys.slice());
        }
    }    

    removeProjections() {
        let index = this.surveys.length;
        for (let i = this.surveys.length - 1; i >= 0; i--) {
            if (!this.surveys[i].projection) {
                index = i + 1;
                break;
            }
        }

        this.surveys.splice(index, this.surveys.length - index);        
        index = index - 1
        this.updateIntSurveys(index);
        this.surveys = this.orientationService.updateOffsetValues(index, this.intIncrement, this.surveys.slice())
        this.surveysChanged.next(this.surveys.slice());
        
    }

    updateAllSurveys(index: number) {
        this.updateSurveyCalculations(index);
        this.updateDLS(index); 
        this.updateIntSurveys(index);           
        this.surveys = this.orientationService.updateOffsetValues(index - 1, this.intIncrement, this.surveys.slice()) 
        this.surveysChanged.next(this.surveys.slice());
    }

    batchAddSurveys(md: number, inc: number, azm: number, startIndex: number, batchComplete: boolean=false) {
        this.addSurvey(md, inc, azm, true);
        if (batchComplete) {
            this.updateSurveyCalculations(startIndex);
            for (let i = startIndex; i < this.surveys.length; i++) {
                this.updateDLS(i);
            }       
            this.updateIntSurveys(startIndex - 1);
            this.surveys = this.orientationService.updateOffsetValues(startIndex - 1, this.intIncrement, this.surveys.slice())

            this.surveysChanged.next(this.surveys.slice());
        }
    }

    addSurveyTieOn(md: number, inc: number, azm: number, tvd: number,
        north: number, east: number, vsDirection: number,
        northing: number, easting: number, elevation: number,
        groundElevation: number) {
        
        const newSurvey = new Surveys(md, inc, azm, tvd, north, east, null, null, null, '', '', null, null, null, null); 
        this.surveys.push(newSurvey);           
            
        this.surveyHeader['vsDirection'] = vsDirection;
        this.surveyHeader['northing'] = northing;
        this.surveyHeader['easting'] = easting;
        this.surveyHeader['elevation'] = elevation;
        this.surveyHeader['groundElevation'] = groundElevation;

        this.surveyHeaderChanged.next(this.surveyHeader);        
            
        this.updateSurveyCalculations(0);
        this.updateDLS(0);
            
        this.updateIntSurveys(0);

        this.surveys = this.orientationService.updateOffsetValues(0, this.intIncrement, this.surveys.slice())      

        this.surveysChanged.next(this.surveys.slice());
    }

    updateSurveyTieOn(md: number, inc: number, azm: number, tvd: number,
                      north: number, east: number, vsDirection: number,
                      northing: number, easting: number, elevation: number,
                      groundElevation: number) {
            this.surveys[0].md = md;
            this.surveys[0].inc = inc;
            this.surveys[0].azm = azm;
            this.surveys[0].tvd = tvd;
            this.surveys[0].north = north;
            this.surveys[0].east = east;
            this.surveys[0].elevation = elevation - tvd;
            this.surveys[0].northing = north + northing;
            this.surveys[0].easting = east + easting;
            
            this.surveyHeader['vsDirection'] = vsDirection;
            this.surveyHeader['northing'] = northing;
            this.surveyHeader['easting'] = easting;
            this.surveyHeader['elevation'] = elevation;
            this.surveyHeader['groundElevation'] = groundElevation;

            this.surveyHeaderChanged.next(this.surveyHeader);

            this.updateAllSurveys(1);
    }

    updateSlideSeen(index: number, surveysStartIndex: number, slideSeen: number, toolface: string) { 
        let totalSlideSeen = slideSeen.toString();      
        if ((index == surveysStartIndex) && (this.surveys[surveysStartIndex].slide !== '')) {
            totalSlideSeen = (this.surveys[surveysStartIndex].slide ? this.surveys[surveysStartIndex].slide + '\n' : '') + totalSlideSeen;
            
            const tfTemp = this.surveys[surveysStartIndex].slideTF ? this.surveys[surveysStartIndex].slideTF : '';
            
            if (toolface) {                
                toolface = tfTemp + '\n' + toolface;
            }
            else if (tfTemp) {
                toolface = tfTemp;
            }
        }
        this.surveys[index].slide = totalSlideSeen;
        this.surveys[index].slideTF = toolface;

        this.updateDLS(index);
        this.surveysChanged.next(this.surveys.slice());        
    }        

    clearSlideSeen(index: number) {
        this.surveys[index].slide = '';
        this.surveys[index].slideTF = '';
        this.surveysChanged.next(this.surveys.slice());
    }
    
    updateSurveyCalculations(index: number) {   
        let startMD, endMD, startInc, endInc, startAzm, endAzm, startTVD, startNorth, 
                startEast, startElevation, startNorthing, startEasting: number;     
        for (let i = index; i < this.surveys.length; i++) {
            if (i > 0) {
                startMD = this.surveys[i - 1].md;                
                startInc = this.surveys[i - 1].inc;               
                startAzm = this.surveys[i - 1].azm;                    
                startTVD =  this.surveys[i - 1].tvd;   
                startNorth = this.surveys[i - 1].north;
                startEast = this.surveys[i - 1].east;
                startElevation = this.surveys[i -1].elevation;
                startNorthing = this.surveys[i - 1].northing;
                startEasting = this.surveys[i - 1].easting;             

                endMD = this.surveys[i].md;
                endInc = this.surveys[i].inc;
                endAzm = this.surveys[i].azm;                   
                
                this.surveys[i].tvd = startTVD + this.surveyMathService.getChangeInTVD(startMD, endMD, startInc, endInc, startAzm, endAzm);
                this.surveys[i].north = startNorth + this.surveyMathService.getChangeInNorth(startMD, endMD, startInc, endInc, startAzm, endAzm);
                this.surveys[i].east = startEast + this.surveyMathService.getChangeInEast(startMD, endMD, startInc, endInc, startAzm, endAzm);
                this.surveys[i].survTF = this.surveyMathService.getToolFace(startInc, endInc, startAzm, endAzm);
                this.surveys[i].elevation = this.surveyHeader['elevation'] - this.surveys[i].tvd;
                this.surveys[i].northing = this.surveys[i].north + this.surveyHeader['northing'];
                this.surveys[i].easting = this.surveys[i].east + this.surveyHeader['easting'];

                const north: number = this.surveys[i].north;
                const east: number = this.surveys[i].east;
                const vsDirection: number = 'vsDirection' in this.surveyHeader ? this.surveyHeader['vsDirection'] : 0;  

                this.surveys[i].vs = this.surveyMathService.getVSect(vsDirection, north, east);                
            } else {
                let endInc: number = this.surveys[0].inc;
                let endAzm: number = this.surveys[0].azm;
                this.surveys[0].survTF = this.surveyMathService.getToolFace(0, endInc, 0, endAzm);

                const north: number = this.surveys[0].north;
                const east: number = this.surveys[0].east;
                const vsDirection: number = 'vsDirection' in this.surveyHeader ? this.surveyHeader['vsDirection'] : 0;  
            
                this.surveys[0].vs = this.surveyMathService.getVSect(vsDirection, north, east);
                this.surveys[0].elevation = this.surveyHeader['elevation'] - this.surveys[0].tvd;
                this.surveys[0].northing = this.surveys[0].north + this.surveyHeader['northing'];
                this.surveys[0].easting = this.surveys[0].east + this.surveyHeader['easting'];
            }
        }
    }

    updateDLS(index: number) {
        let currentMD: number = this.surveys[index].md;
        let currentInc: number = this.surveys[index].inc;
        let currentAzm: number = this.surveys[index].azm;
        let prevMD: number = -1;
        let prevInc: number = -1;
        let prevAzm: number = -1;
        let nextMD: number = -1; 
        let nextInc: number = -1;
        let nextAzm: number = -1;
        let currentDLS: number = -1;
        let nextDLS: number = -1

        if (index > 0) {
            prevMD = this.surveys[index - 1].md;
            prevInc = this.surveys[index - 1].inc;
            prevAzm = this.surveys[index - 1].azm;
            
        } else {
            prevMD = this.surveys[0].md;;
            prevInc = this.surveys[0].inc;;
            prevAzm = this.surveys[0].azm;;
        }
        
        currentDLS = this.surveyMathService.getDLS(prevMD, currentMD, prevInc, currentInc, prevAzm, currentAzm);
        this.surveys[index].dls = currentDLS;
        
        if (index < (this.surveys.length - 1)) {
            nextMD = this.surveys[index + 1].md;
            nextInc = this.surveys[index + 1].inc;
            nextAzm = this.surveys[index + 1].azm;    

            nextDLS = this.surveyMathService.getDLS(currentMD, nextMD, currentInc, nextInc, currentAzm, nextAzm);
            this.surveys[index + 1].dls = nextDLS
        }        

        let slideSeenString: string;
        let slideSeenSubstring: string;
        let totalSlideSeen: number = 0;
                    
        slideSeenString = this.surveys[index].slide ? this.surveys[index].slide : '';                                                
        
        if (slideSeenString !== '') {
            let slideCount = 0; 
            
            slideCount = slideSeenString.split('\n').length;
            if (slideCount > 0) {                                           
                for (let i = 0; i < slideCount; i++) {
                    
                    slideSeenSubstring = slideSeenString.substring(0, slideSeenString.includes('\n') ? slideSeenString.indexOf('\n') : slideSeenString.length);
                    
                    totalSlideSeen = totalSlideSeen + +slideSeenSubstring;      
                    slideSeenString = slideSeenString.substring(slideSeenString.includes('\n') ? slideSeenString.indexOf('\n') + 2 : slideSeenString.length, slideSeenString.length);
                }
            } else {                
                totalSlideSeen = totalSlideSeen + +slideSeenString;
            }
            this.surveys[index].motorOutput = (currentDLS / totalSlideSeen) * (currentMD - prevMD);
        } else {
            this.surveys[index].motorOutput = 0;
        }
            
        
        if (index < (this.surveys.length - 1)) {
            slideSeenString = this.surveys[index + 1].slide ? this.surveys[index + 1].slide : '';  
       
            if (slideSeenString !== '') {
                let slideCount = 0;                 
                slideCount = slideSeenString.split('\n').length;
                if (slideCount > 0){             
                    for (let i = 0; i < slideCount; i++) {
                        slideSeenSubstring = slideSeenString.substring(0, slideSeenString.includes('\n') ? slideSeenString.indexOf('\n') : slideSeenString.length);                                           
                        totalSlideSeen = totalSlideSeen + +slideSeenSubstring;      
                        slideSeenString = slideSeenString.substring(slideSeenString.includes('\n') ? slideSeenString.indexOf('\n') + 2 : slideSeenString.length, slideSeenString.length);
                    }
                } else {
                    totalSlideSeen = totalSlideSeen + +slideSeenString;
                }   
                this.surveys[index + 1].motorOutput = (nextDLS / totalSlideSeen) * (nextMD - currentMD); 
            } else {
                this.surveys[index + 1].motorOutput = 0;
            }
        }   
    }     

    updateIntSurveys(index: number) {
        
        if (this.surveys.length > 0) {
            this.intSurveys = this.interpolationService.updateIntSurveys(index, this.surveys.slice(), this.intSurveys, this.getElevation(),
                                                                     this.getNorthing(), this.getEasting(), this.getVSDirection());
        } else {
            this.setIntSurveys([]);
        }

        if (this.intSurveys) {
            this.intSurveysChanged.next(this.intSurveys.slice());
        }
    }
}