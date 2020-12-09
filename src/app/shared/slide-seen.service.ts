import { Injectable } from "@angular/core";
import { Activity } from './activity.model';
import { ActivitiesService } from '../activities/activities.service';
import { SurveysService } from '../surveys/surveys.service';
import { Surveys } from '../surveys/surveys.model';


@Injectable({ providedIn: 'root' })
export class SlideSeenService {
    surveys: Surveys[];
    activities: Activity[];

    constructor(private activitiesService: ActivitiesService,
                private surveysService: SurveysService) {}     

    surveysChangedUpdateSlideSeen(index: number) {
        this.surveys = this.surveysService.getSurveys();
        if (this.surveys.length > 0) {
            this.getActivities();

            if (this.activities) {
                if (this.activities.length > 0) {
                    if (this.surveys[index].md < this.activities[this.activities.length - 1].endDepth) {
                        let surveyStartDepth: number;
                        if (index > 0) {
                            surveyStartDepth = this.surveys[index - 1].md;
                        } 
                        else {                            
                            surveyStartDepth = this.surveysService.getTieOnMD();
                        }                        
                        
                        if (surveyStartDepth < this.activities[0].endDepth) {
                            this.getStartingActivityRowInfo(0);
                        }
                        else {
                            for (let i = this.activities.length - 1; i >= 1; i--) {
                                if ((this.activities[i].endDepth > surveyStartDepth) && (this.activities[i - 1].endDepth <= surveyStartDepth)){ 
                                    this.getStartingActivityRowInfo(i - 1);
                                }
                            }     
                        }   
                    }
                } else {
                    if (index > 0) {
                        this.surveysService.clearSlideSeen(index - 1);
                    }
                    this.surveysService.clearSlideSeen(index);

                    if (index < (this.surveys.length - 1)) {
                        this.surveysService.clearSlideSeen(index + 1);
                    }
                }
            } 
        }
    }

    getActivities() {
        this.activities = this.activitiesService.getActivities();        
    }
    
    // activityChangedUpdateSlideSeen(index: number, changedDate: Date) {  
    //     if (changedDate) {
    //         const milliDate = Date.parse(changedDate.toString());    
    //         let dailyActivities = this.activitiesService.getDailyActivities();
    //         dailyActivities
    //         .filter(daily => Date.parse(daily.date.toString()) < milliDate)
    //         .map(daily => {                
    //             index = index + daily.activity.length;
    //         });
    //     }
        
    //     this.getActivities(); 
    //     this.surveys = this.surveysService.getSurveys(); 

    //     if (this.surveys.length > 0){            
    //         this.getStartingActivityRowInfo(index);
    //     }
    // }

    activityChangedUpdateSlideSeen(index: number, changedDateString: string) {  
        const changedDate: number = this.activitiesService.convertToNumberFormat(changedDateString);
        if (changedDate) {  
            let dailyActivities = this.activitiesService.getDailyActivities();
            dailyActivities
            .filter(daily => daily.date < changedDate)
            .map(daily => {                
                index = index + daily.activity.length;
            });
        }
        
        this.getActivities(); 
        this.surveys = this.surveysService.getSurveys(); 

        if (this.surveys.length > 0){            
            this.getStartingActivityRowInfo(index);
        }
    }

    getStartingActivityRowInfo(index: number) {
        // this.getActivities();
        let surveysStartRow;
        let surveysStartIndex: number;
        let surveysStartSurvey: number;    
        
        if (index > 0) { 
            surveysStartRow = this.getNeededStartSurveyDepth(this.activities[index - 1].endDepth);
            surveysStartIndex = surveysStartRow[0].index;
            surveysStartSurvey = surveysStartRow[0].md;
        }
        else {
            surveysStartRow = this.getNeededStartSurveyDepth(0);
            surveysStartIndex = 0;
            surveysStartSurvey = 0;
        }

        let indexPrevSlide = -1;
        let endDepthPrevSlide = -1;   
        let startDepthPrevSlide = -1;

        if (index > 0) {            
            const endDepthPrevSlideRow = this.getEndDepthPrevSlide(index, surveysStartSurvey);
            indexPrevSlide = endDepthPrevSlideRow[0].index;
            endDepthPrevSlide = endDepthPrevSlideRow[0].endDepth;  
            startDepthPrevSlide = endDepthPrevSlideRow[0].startDepth;   
            surveysStartIndex++;  
        }
        else {
            indexPrevSlide = 0;
            endDepthPrevSlide = this.activities[0].endDepth;   
            startDepthPrevSlide = this.surveysService.getTieOnMD();
        }

        if ((surveysStartIndex > -1) && (indexPrevSlide > -1)) {
            let comments: string = this.activities[indexPrevSlide].comments;            
            let toolface: string = comments.substring(comments.indexOf('tf') + 6, comments.indexOf('}'));
            if (this.activities[indexPrevSlide].activity === 'Sliding') {               
                surveysStartIndex = this.updateSlideSeenPrevSlide(surveysStartIndex, surveysStartSurvey, endDepthPrevSlide, 
                                                            startDepthPrevSlide, toolface);            
            }

            for(let i = indexPrevSlide + 1; i < this.activities.length; i++) {
                if (surveysStartIndex > -1) {
                    const startDepth: number = i > 0 ? this.activities[i - 1].endDepth : 0;
                    const endDepth: number = this.activities[i].endDepth;
                    comments = this.activities[i].comments;
                    toolface = comments.substring(comments.indexOf('{') + 1, comments.indexOf('}'));  

                    let isSliding = false;
                    if (this.activities[i].activity === "Sliding") {  
                        isSliding = true;
                    }
                        let endOfActivities = true;
                        if (i < (this.activities.length - 1)) {
                            endOfActivities = false;
                        }   
                        surveysStartIndex = 
                            this.updateSlideSeen(
                                surveysStartIndex, startDepth, endDepth, toolface, isSliding, endOfActivities);
                        
                }       
                else {
                    break;
                }
            }
        }
    }         
    
    getEndDepthPrevSlide(index: number, surveyStartDepth: number) {        
        if (index > 0){
            for (let i = index - 1; i >= 0; i--){
                if (this.activities[i].endDepth <= surveyStartDepth) {
                    i = (i + 1) < this.activities.length ? i + 1 : -1;
                    return [{ index: i, endDepth: this.activities[i].endDepth, startDepth: i > 0 ? this.activities[i - 1].endDepth : 0 }];
                }
            }
        }

        return [{ index: 0, endDepth: this.activities[0].endDepth, startDepth: 0 }];
    }    

    getNeededStartSurveyDepth(endDepthPrevSlide: number) {        
        if (endDepthPrevSlide <= this.surveys[this.surveys.length - 1].md) {
            for(let i = this.surveys.length - 1; i >= 0; i--) {
                this.surveysService.clearSlideSeen(i);                
                if (i > 0) {
                    if ((endDepthPrevSlide <= this.surveys[i].md) && (endDepthPrevSlide > this.surveys[i - 1].md)) {
                        i = i > 0 ? i - 1 : 0;
                        return [{index: i, md: this.surveys[i].md}];                
                    }           
                }     
                else {
                    return [{ index: -1, md: this.surveysService.getTieOnMD() }];
                }
            }
        }
        else {
            return [{ index: this.surveys.length, md: -1 }];
        }

        return [{ index: 0, md: 0 }];
    }

    updateSlideSeenPrevSlide(surveysStartIndex, surveysStartSurvey, endDepthPrevSlide, startDepthPrevSlide, toolface) {
        
        let startOfSlide: number;
        let endOfSlide: number;
        let slideUnfinished = false;

        if (surveysStartIndex < this.surveys.length) {          
            if (startDepthPrevSlide > surveysStartSurvey){
                startOfSlide = startDepthPrevSlide;                
            }
            else {
                startOfSlide = surveysStartSurvey;
            }

            if (endDepthPrevSlide > this.surveys[surveysStartIndex].md) {
                endOfSlide = this.surveys[surveysStartIndex].md;  
                slideUnfinished = true;                              
            }
            else {
                endOfSlide = endDepthPrevSlide;
            }

            this.surveysService.updateSlideSeen(surveysStartIndex, -1, (endOfSlide - startOfSlide), toolface);

            if (slideUnfinished) {
                surveysStartIndex++;       
                for (let i = surveysStartIndex; i < this.surveys.length; i++) {         
                    startOfSlide = endOfSlide;
                    if (this.surveys[i].md >= endDepthPrevSlide) {
                        endOfSlide = endDepthPrevSlide;
                        this.surveysService.updateSlideSeen(surveysStartIndex, -1, (endOfSlide - startOfSlide), toolface);

                        break;
                    }
                    else {
                        endOfSlide = this.surveys[i].md;
                        this.surveysService.updateSlideSeen(surveysStartIndex, -1, (endOfSlide - startOfSlide), toolface);
                        surveysStartIndex++;
                    }                                       
                }
            }
        }        

        return surveysStartIndex;
    }

    updateSlideSeen(surveysStartIndex: number, startDepth: number, endDepth: number, 
                                   toolface: string, isSliding: boolean, endOfActivities: boolean) {
        for (let i = surveysStartIndex; i < this.surveys.length; i++) {             
            if ((startDepth < this.surveys[i].md) && (startDepth > (i > 0 ? this.surveys[i - 1].md : this.surveysService.getTieOnMD()))){
                if (endDepth > this.surveys[i].md) {
                    if (isSliding) {
                        this.surveysService.updateSlideSeen(i, surveysStartIndex, (this.surveys[i].md - startDepth), toolface);
                        surveysStartIndex = this.updateSlideSeenFromEndIndex(i + 1, endDepth, toolface);
                    }
                    if (!endOfActivities) {
                        return surveysStartIndex;
                    }
                }
                else 
                {
                    if (isSliding) {
                        this.surveysService.updateSlideSeen(i, surveysStartIndex, (endDepth - startDepth), toolface);
                    }
                    if (!endOfActivities) {
                        return i;
                    }
                }
            }
            else if ((startDepth == this.surveys[i].md)) {
                if ((i + 1) < this.surveys.length) {
                    if (endDepth <= this.surveys[i + 1].md) {
                        if (isSliding) {
                            this.surveysService.updateSlideSeen(i + 1, surveysStartIndex, (endDepth - startDepth), toolface);
                        }
                        if (!endOfActivities) {
                            return i + 1;
                        }
                    } 
                    else {
                        if (isSliding) {
                            this.surveysService.updateSlideSeen(i + 1, surveysStartIndex, (this.surveys[i + 1].md - startDepth), toolface);
                        }
                        
                        if ((i + 2) < this.surveys.length) {
                            if (isSliding) {
                                surveysStartIndex = this.updateSlideSeenFromEndIndex(i + 2, endDepth, toolface);
                            }
                            if (!endOfActivities) {
                                return surveysStartIndex;
                            }
                        }

                        if (!endOfActivities) {
                            return i + 1;
                        }
                    }
                }
            }
        }        
        return -1;        
    }

    updateSlideSeenFromEndIndex(index: number, endDepth: number, slideTF: string) {     
        for (let i = index; i < this.surveys.length; i++){
            if (endDepth <= this.surveys[i].md) {
                this.surveysService.updateSlideSeen(i, -1, (endDepth - (i > 0 ? this.surveys[i - 1].md : this.surveysService.getTieOnMD())), slideTF);
                
                return i;
            }
            else {
                this.surveysService.updateSlideSeen(i, -1, (this.surveys[i].md - (i > 0 ? this.surveys[i - 1].md : this.surveysService.getTieOnMD())), slideTF);
            }
        }        
    }
}