import { Injectable } from '@angular/core';
import { Activity, DailyActivity, ActivitiesList, FilteredActivity } from '../shared/activity.model';
import { Subject } from 'rxjs';
import { SurveysService } from '../surveys/surveys.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Time } from '@angular/common';

@Injectable({ providedIn: 'root'})
export class ActivitiesService  {
    activitiesChanged = new Subject<Activity[]>();
    activitiesListChanged = new Subject<ActivitiesList[]>();
    activityDateChanged = new Subject<number[]>();
    selectedDate: number;

    constructor(private surveysService: SurveysService) {}

    activities: Activity[] = [];
    dailyActivities: DailyActivity[] = [];

    activitiesList: ActivitiesList[] = [];
    
    setSelectedDate(dateString: string) {
        const date: number = this.convertToNumberFormat(dateString);
        this.selectedDate = date;
    }

    getSelectedDate() {      
        if (this.selectedDate) {
            return this.convertToDateFormat(this.selectedDate);
        }
    }

    convertToDateFormat(date: number) {
        const formattedDate: string = date.toString().substring(0, 4) + '-' + 
                                      date.toString().substring(4, 6) + '-' + 
                                      date.toString().substring(6, 8);
        return formattedDate;
    }

    convertToNumberFormat(date: string) {
        const formattedDate: number = +(date.replace(/-/g, ''));
        return formattedDate;
    }

    setDailyActivities(dailyActivities: DailyActivity[]) {
        this.dailyActivities = dailyActivities;
    }

    getDailyActivities() {
        return this.dailyActivities.slice();
    }   

    getActivities() {
            return this.dailyActivities
                .reduce((newArr , dailyAct) => {
                    return [...newArr, ...dailyAct.activity];               
                }, []);
    } 

    getActivitiesByDate(dateString: string) {
        if (dateString) {  
            const date = this.convertToNumberFormat(dateString);          
            if (this.dailyActivities.filter(day => day.date === date).length > 0)
            {
                return (this.dailyActivities            
                    .filter(day => {
                        return (day.date === date)
                    }))[0].activity.slice();
            }
            else {
                return this.activities;
            }
        }
    }

    getLastActivityDepth() {
        if (this.dailyActivities.length > 0) {
            return this.dailyActivities[this.dailyActivities.length - 1].
                        activity[this.dailyActivities[this.dailyActivities.length - 1].
                        activity.length - 1].endDepth;
        } else {
            return this.surveysService.getTieOnMD();
        }
    }

    getActivitiesList() {
        return this.activitiesList.slice();        
    }    

    setActivitiesList(activitiesList: ActivitiesList[]) {
        this.activitiesList = activitiesList;
        localStorage.setItem('activitiesList', JSON.stringify(this.activitiesList.slice()));
    }

    // getFilteredDailyActivities(activityFilter: string, dateFilterString: string, bhaFilter: string) {        
    //     const dateFilter: number =  dateFilterString ? this.convertToNumberFormat(dateFilterString) : 0;
    //     if (activityFilter && dateFilter && bhaFilter) {        
    //         return this.dailyActivities
    //             .filter(daily => daily.date === dateFilter)
    //             .map(daily => {                
    //                 return {...daily, activity: daily.activity.filter(activity => {
    //                                             return (activity.activity === activityFilter &&
    //                                             activity.bha === bhaFilter)
    //                                         })}
    //             }).slice();
    //     } else if (activityFilter && dateFilter) {
    //             return this.dailyActivities
    //                 .filter(daily => daily.date === dateFilter)
    //                 .map(daily => {                
    //                     return {...daily, activity: daily.activity.filter(activity => {
    //                                                 return (activity.activity === activityFilter)
    //                                             })}
    //                 }).slice();
    //     } else if (activityFilter && bhaFilter) {
    //         return this.dailyActivities
    //         .map(daily => {                
    //             return {...daily, activity: daily.activity.filter(activity => {
    //                                         return (activity.activity === activityFilter &&
    //                                         activity.bha === bhaFilter)
    //                                     })}
    //         }).slice();
    //     } else if (dateFilter && bhaFilter) {
    //         return this.dailyActivities
    //             .filter(daily => daily.date === dateFilter)
    //             .map(daily => {                
    //                 return {...daily, activity: daily.activity.filter(activity => {
    //                                             return (activity.bha === bhaFilter)
    //                                         })}
    //             }).slice();
    //     } else if (activityFilter) {
    //         // return this.dailyActivities
    //         //     .map(daily => {                
    //         //         return {...daily, activity: daily.activity.filter(activity => {
    //         //                                     return (activity.activity === activityFilter)
    //         //                                 })}
    //             // }).slice();
    //         // return this.getFilteredActivity;
    //     } else if (dateFilter) {
    //         return this.dailyActivities
    //             .filter(daily => daily.date === dateFilter).slice();
    //     } else if (bhaFilter) {
    //         return this.dailyActivities
    //             .map(daily => {                
    //                 return {...daily, activity: daily.activity.filter(activity => {
    //                                             return (activity.bha === bhaFilter)
    //                                         })}
    //             }).slice();
    //     }
    // } 

    getFilteredActivities(activityFilter: string, dateFilterString: string, bhaFilter: string): FilteredActivity[] {
        const dateFilter: number =  dateFilterString ? this.convertToNumberFormat(dateFilterString) : 0;
        let filteredActivities: FilteredActivity[] = [];
        let startTime: Date;        
        let startDepth = 0;
        for (let i = 0; i < this.dailyActivities.length; i ++) {
            if ((!dateFilter) || (dateFilter === this.dailyActivities[i].date)) {
                for (let j = 0; j < this.dailyActivities[i].activity.length; j++){
                    if ((!bhaFilter) || (bhaFilter === this.dailyActivities[i].activity[j].bha)) {
                        if ((!activityFilter) || (this.dailyActivities[i].activity[j].activity === activityFilter)) {
                            filteredActivities.push({date: this.dailyActivities[i].date, startTime: startTime, endTime: this.dailyActivities[i].activity[j].endTime,
                                                    activity: this.dailyActivities[i].activity[j].activity, startDepth: startDepth,
                                                    endDepth: this.dailyActivities[i].activity[j].endDepth, comments: this.dailyActivities[i].activity[j].comments,
                                                    bha: this.dailyActivities[i].activity[j].bha});                            
                        }
                    }
                    startTime = this.dailyActivities[i].activity[j].endTime;
                    startDepth = this.dailyActivities[i].activity[j].endDepth;
                }
            }
        }

        return filteredActivities;
    }

    addActivity(dateString: string, endTime: Date, activity: string, endDepth: number, comments: string = '', bha: string = '') {
       
        const date: number = this.convertToNumberFormat(dateString);

        if (this.dailyActivities.filter(day => day.date === date).length > 0) { 
            const newActivity = new Activity(endTime, activity, endDepth, comments, bha);
            this.dailyActivities
                .filter(day => day.date === date)[0].activity     
                .push(newActivity);
        }        
        else 
        {
            const newActivity: Activity[] = [
            new Activity(
                endTime,
                activity, 
                endDepth, 
                comments,
                bha,
            )];    

            const newDailyActivity = new DailyActivity(
                date, 
                newActivity
            );

            if (this.dailyActivities.length === 0) {
                this.dailyActivities.push(newDailyActivity);
            } else if (this.dailyActivities[this.dailyActivities.length - 1].date < date) {
                this.dailyActivities.push(newDailyActivity);
            } else if (date < this.dailyActivities[0].date) {
                this.dailyActivities.splice(0, 0, newDailyActivity);
            }
            else {
                // let insertIndex = this.dailyActivities.findIndex(daily => {
                //     return daily.date < date
                // });

                let insertIndex = 0;

                for (let i = 0; i < (this.dailyActivities.length - 1); i++) {
                    if ((this.dailyActivities[i].date < date) && (date < this.dailyActivities[i + 1].date)) {
                        insertIndex = i;
                        break;
                    }
                }
                
                this.dailyActivities.splice(insertIndex + 1, 0, newDailyActivity);
            }
        }  
        this.activitiesChanged
            .next((this.dailyActivities            
                    .filter(day => day.date === date))[0].activity.slice());        
    }

    updateActivity(index: number, dateString: string, endTime: Date, activity: string, endDepth: number, comments: string = '', bha: string = '') {
        const date: number = this.convertToNumberFormat(dateString);
        let updateIndex = this.dailyActivities.findIndex(daily => daily.date === date);

        this.dailyActivities[updateIndex].activity[index] = {
            endTime: endTime,
            activity: activity,            
            endDepth: endDepth,
            comments: comments,
            bha: bha,
        }

        this.activitiesChanged
             .next(this.dailyActivities       
                .filter(day => day.date === date)[0].activity.slice());
    }

    addToActivityList(newActivity: string) {
        let newItem = true;
        this.activitiesList.forEach(currentActivity => {
            if (newActivity === currentActivity.activity){
                newItem = false;
            }
        });

        if (newItem) {
            this.activitiesList.push(new ActivitiesList(newActivity));
            this.activitiesListChanged.next(this.activitiesList.slice());
            localStorage.setItem('activitiesList', JSON.stringify(this.activitiesList.slice()));
        }
    }

    removeFromActivityList(activity: string) {
        for (let i = 0; i < this.activitiesList.length; i++) {
            if (activity === this.activitiesList[i].activity) {
                this.activitiesList.splice(i, 1);
                this.activitiesListChanged.next(this.activitiesList.slice());
                localStorage.setItem('activitiesList', JSON.stringify(this.activitiesList.slice()));
                break;
            }
        }
    }

    dateChanged(dateString: string) {
        const date: number = this.convertToNumberFormat(dateString);
        if (this.dailyActivities.length > 0) {  

            const yesterdayEndDepth = this.getPrevDayEndDepth(date);
            const tomorrowStartDepth = this.getNextDayStartDepth(date);                         
            
            this.activityDateChanged.next([yesterdayEndDepth, tomorrowStartDepth]);    
        }    
    }

    getPrevDayEndDepth(date: number) {        
        for (let i = 0; i < this.dailyActivities.length; i++) {
            if ((this.dailyActivities[i].date === date) || (this.dailyActivities[i].date > date)) {
                if (i > 0) {
                    return this.dailyActivities[i - 1].activity[this.dailyActivities[i - 1].activity.length - 1].endDepth;
                } else {
                    return -1;
                }
            } else if (i === (this.dailyActivities.length - 1)) {
                return this.dailyActivities[i].activity[this.dailyActivities[i].activity.length - 1].endDepth;
            }
        }

        return -1;
    }

    getNextDayStartDepth(date: number) {
        for (let i = (this.dailyActivities.length - 1); i >= 0; i--) {
            if ((this.dailyActivities[i].date === date) || (this.dailyActivities[i].date < date)) {
                if (i < (this.dailyActivities.length - 1)) {
                    return this.dailyActivities[i + 1].activity[0].endDepth;
                } else {
                    return Infinity;
                }
            } else if (i === 0) {
                return this.dailyActivities[0].activity[0].endDepth;
            }
        }

        return Infinity;
    }

    removeActivity(index: number, dateString: string) {  
        const date: number = this.convertToNumberFormat(dateString);
        let dailyIndex = this.dailyActivities.findIndex(daily => daily.date === date);

        if (dailyIndex > -1){
            if (this.dailyActivities[dailyIndex].activity.length > 1) {
                this.dailyActivities[dailyIndex].activity.splice(index, 1);
                this.activitiesChanged
                    .next((this.dailyActivities            
                            .filter(day => day.date === date))[0].activity.slice());    
            } 
            else if (this.dailyActivities[dailyIndex].activity.length === 1) {
                this.dailyActivities.splice(dailyIndex, 1);
                this.activitiesChanged
                    .next([]);    
            }
        } 
    }    

    removeBHAFromActivities(bhaName: string) {
        this.dailyActivities.forEach(daily => {
                            daily.activity.forEach(activity => {
                                if (activity.bha === bhaName) {
                                    activity.bha = '';
                                }
                            });
                        });
    }    
}