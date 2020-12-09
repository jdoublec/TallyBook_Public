import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { ActivitiesService } from './activities.service';
import { TallyService } from '../tally/tally.service';
import { Activity, DailyActivity, ActivitiesList, FilteredActivity } from '../shared/activity.model';
import { SlideSeenService } from '../shared/slide-seen.service';
import { BHAService } from '../bha/bha.service';
import { ApplicationStateService } from '../shared/application-state.service';
import { MembersService } from '../shared/members.service';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['../shared/scroll-table.component.css']
})
export class ActivitiesComponent implements OnInit, OnDestroy {
  @ViewChild('endTime', {static: false}) endTimeElement: ElementRef;
  @ViewChild('scrollTable', {static: false}) tableElement: ElementRef;
  @ViewChild('comments', {static: false}) commentsElement: ElementRef;
  resizeObservable$: Observable<Event>;
  resizeSub$: Subscription;
  activitiesSub: Subscription;
  prevDayLastEndDepthSub: Subscription;
  nextDayFirstEndDepthSub: Subscription;
  activitiesListSub: Subscription;
  tallyTotalsSub: Subscription;  
  memberPermissionsChangedSub: Subscription;
  tableHeightSub: Subscription;
  bhasSub: Subscription;
  activities: Activity[];
  dailyActivities: DailyActivity[];
  filteredActivities: FilteredActivity[];
  prevDayLastEndDepth: number;
  nextDayFirstEndDepth: number;
  activitiesList: ActivitiesList[];
  tallyTotals: number[];
  okToUpdateAdd: boolean = false;
  dateValid: boolean = false;
  endTimeGood: boolean = false;
  endDepthGood: boolean = false;
  commentsGood: boolean = false;
  newRow: boolean = false;
  editMode = false;
  edittedIndex: number = -1;
  dateValue: string;
  endTimeValue: Date;
  selectedEndTime: Date;
  activityValue: string;
  endDepthValue: number;
  bhaValue: string;
  bhas: string[];
  commentsValue: string = '';
  showAllActivities: boolean = false;
  filterByActDateBHA: boolean = false;
  mobileResolution: boolean = false;
  readOnlyAccess: boolean = true;
  tableHeight: number = 0; 
  readWriteMobile: number = 490;
  readWriteDesktop: number = 230;
  readOnlyMobile: number = 490; 
  readOnlyDesktop: number = 230;

  tempActivities: Activity[];

  constructor(private activitiesService: ActivitiesService,
              private tallyService: TallyService,
              private slideSeenService: SlideSeenService,
              private bhaService: BHAService,
              private applicationStateService: ApplicationStateService,
              private membersService: MembersService,) { }
  
  ngOnInit() {    
    this.mobileResolution = this.applicationStateService.getIsMobileResolution();
    
    this.readOnlyAccess = this.membersService.getCurrentUserPermissions();
        this.memberPermissionsChangedSub = this.membersService.memberPermissionsChanged
        .subscribe((readOnlyAccess: boolean) => {
            this.readOnlyAccess = readOnlyAccess; 
        }); 

    this.activities = this.activitiesService.getActivitiesByDate(this.dateValue);
    this.activitiesSub = this.activitiesService.activitiesChanged
      .subscribe
        (
          (activities: Activity[]) => {
          this.activities = activities; 
            }       
        );
    
    this.prevDayLastEndDepth = -1;
    this.prevDayLastEndDepthSub = this.activitiesService.activityDateChanged
      .subscribe
      (
        (endDepth: number[]) => {
          this.prevDayLastEndDepth = endDepth[0];
        }
      )
    
    this.nextDayFirstEndDepth = Infinity;
    this.nextDayFirstEndDepthSub = this.activitiesService.activityDateChanged
    .subscribe
    (
      (startDepth: number[]) => {
        this.nextDayFirstEndDepth = startDepth[1];
      }
    )

    this.activitiesList = this.activitiesService.getActivitiesList();
    this.activitiesListSub = this.activitiesService.activitiesListChanged
      .subscribe(
        (activitiesList: ActivitiesList[]) => {
          this.activitiesList = activitiesList;
          }
        );

    this.tallyTotals = this.tallyService.getTallyTotals();
    this.tallyTotalsSub = this.tallyService.tallyTotalsChanged
      .subscribe(      
        (tallyTotals: number[]) => {
          this.tallyTotals = tallyTotals;
          }
        );         
        
    this.bhas = this.bhaService.getBHANames();
    this.bhasSub = this.bhaService.bhaNamesChanged
      .subscribe(      
        (bhas: string[]) => {
          this.bhas = bhas;
          }
        );      
        
    this.dateValue = this.activitiesService.getSelectedDate() ? this.activitiesService.getSelectedDate() : null;
    
    if (this.dateValue) {
      this.onDateChanged();
    }

    this.onViewChanged();
    this.tableHeightSub = this.applicationStateService.currentTableHeightChanged
        .subscribe((height: number) => {
            this.tableHeight = height});
    
    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeSub$ = this.resizeObservable$.subscribe(evt => {
        this.onViewChanged();
    });
    }

  onViewChanged() {
    this.applicationStateService.setCurrentTableHeight(this.readWriteMobile, this.readWriteDesktop, 
                                                     this.readOnlyMobile, this.readOnlyDesktop);
    this.tableHeight = this.applicationStateService.getCurrentTableHeight();
    }

  onCommentsGotFocus() {
    if (this.activityValue === 'Sliding') {
      if (this.commentsElement.nativeElement.setSelectionRange) {
        this.commentsElement.nativeElement.setSelectionRange(6, 6);
      }
    }
  }

  scrollToBottom(scroll: boolean = false) {
    try {
      if ((this.newRow) || (scroll)) {
        this.tableElement.nativeElement.scrollTo({left: 0 , top: this.tableElement.nativeElement.scrollHeight, behavior: 'smooth'});
        this.newRow = false;
      }
    } catch (err) {
      console.log(err + ' Scroll did not work!');
    }
  }

  onAddUpdateActivity() {   
    if (this.commentsValue.substring(6, 7) != '}') {
      if (this.editMode) {
        this.activitiesService.updateActivity(this.edittedIndex, this.dateValue, this.endTimeValue, this.activityValue, this.endDepthValue, this.commentsValue, this.bhaValue)        
        this.slideSeenService.activityChangedUpdateSlideSeen(this.edittedIndex, this.dateValue);       
      } else {
        this.activitiesService.addActivity(this.dateValue, this.endTimeValue, this.activityValue, this.endDepthValue, this.commentsValue, this.bhaValue)       
          this.slideSeenService.activityChangedUpdateSlideSeen(this.activities.length - 1, this.dateValue); 
          this.newRow = true;
      }
      this.onClearInput();
    }
    else {
      this.commentsGood = false;      
      window.alert('A toolface must be entered when sliding!');
    }
  }

  onEditActivity(index: number) {
    this.edittedIndex = index;
    this.editMode = true;
    this.endTimeValue = this.activities[this.edittedIndex].endTime;
    this.activityValue = this.activities[this.edittedIndex].activity;
    this.endDepthValue = this.activities[this.edittedIndex].endDepth;
    this.commentsValue = this.activities[this.edittedIndex].comments;
    this.endTimeGood = true;
    this.endDepthGood = true;
    this.bhaValue = this.activities[this.edittedIndex].bha;

    this.selectedEndTime = this.activities[this.edittedIndex].endTime;
  }

  onDeleteActivity() {
    this.activitiesService.removeActivity(this.edittedIndex, this.dateValue);
    this.onClearInput();

    const prevIndex = this.edittedIndex > 0 ? this.edittedIndex - 1 : this.edittedIndex;
    this.slideSeenService.activityChangedUpdateSlideSeen(prevIndex, this.dateValue);  
  }

  onEndTimeChanged() {
    if (this.endTimeValue) {
      if (this.activities.length > 0) {   
        if (this.editMode) {
           if (((this.edittedIndex > 0 ? this.activities[this.edittedIndex - 1].endTime : '00:00') 
              < this.endTimeValue) && 
              this.endTimeValue < 
              (this.edittedIndex < (this.activities.length - 1) ? this.activities[this.edittedIndex + 1].endTime : Infinity)) {
                this.endTimeGood = true;
            } else if (this.edittedIndex === (this.activities.length - 1)) {
                       if (this.isEndTimeMidnight()) {
                         this.endTimeGood = true;
                       } else if (this.edittedIndex === 0) {
                         this.endTimeGood = true;
                       } else if ((this.edittedIndex > 0) && (this.activities[this.edittedIndex - 1].endTime < this.endTimeValue)) {
                        this.endTimeGood = true;
                       } else {
                         this.endTimeGood = false;
                       }
            } else {
              this.endTimeGood = false;
            }
        }
        else if ((!this.editMode) && (!this.isEndTimeMidnight(this.activities[this.activities.length - 1].endTime)) && 
                ((this.endTimeValue > this.activities[this.activities.length - 1].endTime) || (this.isEndTimeMidnight()))) {
          this.endTimeGood = true;          
        }
        else {
          this.endTimeGood = false;
        }
      }
      else {
        // let time: number = +(this.endTimeValue[0].toString() + this.endTimeValue[1].toString() + 
        //                      this.endTimeValue[3].toString() + this.endTimeValue[4].toString());        

        // if (time > 0) {
        //   this.endTimeGood = true;
        // }
        // else {
        //   this.endTimeGood = false;
        // }
        this.endTimeGood = true;
      }
    }
    else {
      this.endTimeGood = false;
    }
    this.onInputValueChanged();
  }

  isEndTimeMidnight(endTimeValue: Date = this.endTimeValue) {
    let time: number = +(endTimeValue[0].toString() + endTimeValue[1].toString() + 
                         endTimeValue[3].toString() + endTimeValue[4].toString());

    if (time === 0) {
      return true;
    }
    return false;
  }

  onActivityChanged() {    
    if (!this.filterByActDateBHA) {
      if (this.activityValue == 'Sliding') {
        if (!this.commentsValue.includes('tf @ {')) {
          this.commentsValue = 'tf @ { GTF}' + (this.commentsValue != null ? this.commentsValue : '');
        }
      }
      else if (this.commentsValue != null) {
        if (this.commentsValue.includes('tf @ {')) {
          this.commentsValue = this.commentsValue.slice(this.commentsValue.indexOf('}') + 1, this.commentsValue.length);
        }
      } else {
        this.commentsValue = ' ';
      }
      this.onInputValueChanged();
    } else {        
      this.filteredActivities = this.activitiesService.getFilteredActivities(this.activityValue, this.dateValue, this.bhaValue);
    }       
    if (this.mobileResolution) {
      this.checkForPrevActivityDepth();
    }
  }

  checkForPrevActivityDepth() {
    if ((this.edittedIndex > 0 || this.edittedIndex === -1) && this.endDepthValue == null && this.activityValue != null) {
      let conditions = ['Rotat', 'Slid', 'Drill'];
      let useNewDepth = conditions.some(activity => this.activityValue.includes(activity));
      if (this.edittedIndex < 0) {
        this.edittedIndex = this.activities.length -1;
      }

      if (!useNewDepth) {
        if (this.activities.length > 0) {
        this.endDepthValue = this.activities[this.edittedIndex].endDepth;
        } else {
          this.endDepthValue = this.activitiesService.getLastActivityDepth();
          this.onEndDepthChanged();
        }
      }
      this.edittedIndex = -1;
    }    
    this.onInputValueChanged();
  }

  onAddToActivityList() {
    this.activitiesService.addToActivityList(this.activityValue);
  }

  onRemoveFromActivityList() {
    this.activitiesService.removeFromActivityList(this.activityValue);
  }

  onEndDepthChanged() { 
    if (this.endDepthValue > -1) {      
      if ((this.prevDayLastEndDepth <= this.endDepthValue) && (this.endDepthValue <= this.nextDayFirstEndDepth)) {
        if (this.activities.length > 0) {        
          if (this.editMode) {  
            if (this.edittedIndex === 0){
              if (this.prevDayLastEndDepth) {  
                if ((this.prevDayLastEndDepth <= this.endDepthValue) &&
                    (this.endDepthValue <= 
                    (this.edittedIndex < (this.activities.length - 1) ? this.activities[this.edittedIndex + 1].endDepth : Infinity))){
                      this.endDepthGood = true;
                }
              } else if (this.endDepthValue >= 0){
                if (this.endDepthValue <= 
                  (this.edittedIndex < (this.activities.length - 1) ? this.activities[this.edittedIndex + 1].endDepth : Infinity)){
                    this.endDepthGood = true;
                } else {
                  this.endDepthGood = false;
                }
              }
            } else if (((this.edittedIndex > 0 ? this.activities[this.edittedIndex - 1].endDepth : 0) 
              <= this.endDepthValue) && 
              (this.endDepthValue <= 
              (this.edittedIndex < (this.activities.length - 1) ? this.activities[this.edittedIndex + 1].endDepth : Infinity))) {
                this.endDepthGood = true;
            } else {
              this.endDepthGood = false;
            }
          } else if ((!this.editMode) && (this.endDepthValue >= this.activities[this.activities.length - 1].endDepth)) {
            this.endDepthGood = true;
          } else {
            this.endDepthGood = false;
          }
        } else {
          this.endDepthGood = true;
        }
      } else {
        this.endDepthGood = false;
      }
    } else {
      this.endDepthGood = false;
    }
    this.onInputValueChanged();
  }  

  onCheckForSurveyDepth() {
    if (this.endDepthGood) {
      if (this.activityValue === 'Circulate/Survey') { 
        const surveyMD = this.tallyService.getSurveyMD(this.endDepthValue);
        if (surveyMD !== '') {
          if (!this.commentsValue.includes('@ ' + surveyMD)){
            this.commentsValue = '@ ' + surveyMD + ' ' + this.commentsValue;
          }
        } else {
          const offset = this.tallyService.getOffset();
          const surveyMD = this.endDepthValue - offset;
          if (!this.commentsValue.includes('@')) {
            this.commentsValue = 'Checkshot @ ' + surveyMD + ' ' + this.commentsValue;
          }
        }
      }
    }
  }

  incrementDay(increment: number) {
    increment += 1;
    let prevDate = new Date(this.dateValue);
    prevDate.setDate(prevDate.getDate() + increment);
    let year: string = prevDate.getFullYear().toString();
    let month: string = prevDate.getMonth() > 8 ? (prevDate.getMonth() + 1).toString() : '0' + (prevDate.getMonth() + 1).toString();
    let day: string = prevDate.getDate() > 9 ? prevDate.getDate().toString() : '0' + prevDate.getDate().toString();
    this.dateValue = year + '-' + month + '-' + day;
    this.onDateChanged();
  }

  onDateChanged() {    
    this.showAllActivities = false;
    if (!this.filterByActDateBHA) {
      if (this.dateValue) {
        this.dateValid = true;
        this.activities = this.activitiesService.getActivitiesByDate(this.dateValue);
        this.activitiesService.dateChanged(this.dateValue);
        this.activitiesService.setSelectedDate(this.dateValue);
      }
      else {
        this.dateValid = false;
      }
      this.onClearInput();  
    } else {
      this.filteredActivities = this.activitiesService.getFilteredActivities(this.activityValue, this.dateValue, this.bhaValue);
    }
  }

  goToNextDay() {
    
  }

  onInputValueChanged() {
    if (this.endTimeGood && this.activityValue && this.endDepthGood && this.dateValue && this.commentsValid()) {
      this.okToUpdateAdd = true;
    } else {
      this.okToUpdateAdd = false;
    }    
  }

  commentsValid() {
    if (this.activityValue == 'Sliding') {      
      if (this.commentsValue.substring(0, 6) == 'tf @ {') {       
          return true;
      }              
      else {
        window.alert('Comments must start with tf @ { if the activity is Sliding!');
        return false; 
      }
    }
    else {
      return true;
    }
  }

  onShowAllChecked() {    
    this.dateValue = null;   
    this.bhaValue = null; 
    if (this.showAllActivities){ 
      this.filterByActDateBHA = false;   
      this.filteredActivities = this.activitiesService.getFilteredActivities(null, this.dateValue, this.bhaValue);
      this.onClearInput();
    } else {
      this.dailyActivities = [];
      this.activities = [];      
    }
  }

  onFilterByChecked() {
    this.onClearInput();
    this.dailyActivities = [];
    this.activities = [];  
    this.dateValue = null;
    this.bhaValue = null;
    if (this.filterByActDateBHA) {
      this.showAllActivities = false;  
    }     
  }  

  onBHAChanged() {
    if (this.filterByActDateBHA) {
      this.filteredActivities = this.activitiesService.getFilteredActivities(this.activityValue, this.dateValue, this.bhaValue);
    } else {
      this.onInputValueChanged();
    }
  }

  onEnterKeyPressed() {
    if (this.okToUpdateAdd) {
      this.onCheckForSurveyDepth();
      this.onAddUpdateActivity();
      this.endTimeElement.nativeElement.focus();
   }
  }

  onClearInput() {
    this.edittedIndex = -1;
    this.editMode = false;
    this.okToUpdateAdd = false;
    this.endTimeGood = false;
    this.endDepthGood = false;
    this.endTimeValue = null;
    this.activityValue = null;
    this.endDepthValue = null;
    this.commentsValue = null;
    this.selectedEndTime = null;
  }

  ngOnDestroy() {
    this.activitiesSub.unsubscribe();
    this.prevDayLastEndDepthSub.unsubscribe();
    this.nextDayFirstEndDepthSub.unsubscribe();
    this.activitiesListSub.unsubscribe();
    this.tallyTotalsSub.unsubscribe();
    this.bhasSub.unsubscribe();
    this.memberPermissionsChangedSub.unsubscribe();
    this.tableHeightSub.unsubscribe();
    this.resizeSub$.unsubscribe();
  }

}
