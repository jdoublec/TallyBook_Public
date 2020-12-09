import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Observable, Subscription, fromEvent } from 'rxjs';
import { PlanHeader, Plans } from '../plans/plans.model';
import { PlansService } from '../plans/plans.service';
import { ApplicationStateService } from '../shared/application-state.service';
import { MembersService } from '../shared/members.service';
import { OrientationService } from '../shared/orientation.service';
import { SurveysService } from '../surveys/surveys.service';

@Component({
  selector: 'app-plans',
  templateUrl: './plans.component.html',
  styleUrls: ['../shared/scroll-table.component.css']
})
export class PlansComponent implements OnInit, OnDestroy {
  @ViewChild('planMD', {static: false}) mdElement: ElementRef;
  @ViewChild('scrollPlans', {static: false}) plansElement: ElementRef;
  resizeObservable$: Observable<Event>;
  resizeSub$: Subscription;
  tableHeightSub: Subscription;
  memberPermissionsChangedSub: Subscription;
  planHeaderSub: Subscription;
  plansSub: Subscription;    
  edittedIndex: number = -1;
  newPlanRow: boolean = false;   
  planHeader: PlanHeader; 
  plans: Plans[] = [];
  mdValue: number;
  incValue: number;
  azmValue: number;
  tvdValue: number;
  northValue: number;
  eastValue: number;
  vsDirectionValue: number;
  northingValue: number;
  eastingValue: number;
  elevationValue: number;
  groundElevationValue: number;
  selectedMD: number;
  editMode: boolean = false;
  editTieOnMode: boolean = false;
  okToAddUpdatePlan: boolean = false;
  mobileResolution: boolean = false;
  readOnlyAccess: boolean = true;
  tableView: string = 'tvd';
  tableHeight: number = 0;
  readWriteMobile: number = 320;
  readWriteDesktop: number = 229;
  readOnlyMobile: number = 95; 
  readOnlyDesktop: number = 75;
  intIncrement: number = 0.01;
  

  constructor(private applicationStateService: ApplicationStateService,
              private membersService: MembersService,
              private orientationService: OrientationService,              
              private plansService: PlansService,
              private surveysService: SurveysService) {}
  
  ngOnInit() {    

      this.mobileResolution = this.applicationStateService.getIsMobileResolution();    

      if (!this.mobileResolution) {
          this.tableView = 'all';
      }

      this.readOnlyAccess = this.membersService.getCurrentUserPermissions();
      this.memberPermissionsChangedSub = this.membersService.memberPermissionsChanged
      .subscribe((readOnlyAccess: boolean) => {
          this.readOnlyAccess = readOnlyAccess; 
      });  

      this.plansService.setupPlanHeader();
      this.planHeader = this.plansService.getPlanHeader();
      this.planHeaderSub = this.plansService.planHeaderChanged
          .subscribe((planHeader: PlanHeader) => {
              this.vsDirectionValue = 'vsDirection' in planHeader ? planHeader['vsDirection'] : 0;  
              this.northingValue = 'northing' in planHeader ? planHeader['northing'] : 0; 
              this.eastingValue = 'easting' in planHeader ? planHeader['easting'] : 0;   
              this.elevationValue = 'elevation' in planHeader ? planHeader['elevation'] : 0;
              this.groundElevationValue = 'groundElevation' in planHeader ? planHeader['groundElevation'] : 0;
          });
      
      this.vsDirectionValue = this.plansService.getVSDirection();
      this.northingValue = this.plansService.getNorthing();
      this.eastingValue = this.plansService.getEasting();
      this.elevationValue = this.plansService.getElevation();
      this.groundElevationValue = this.plansService.getGroundElevation();
      
      this.plans = this.plansService.getPlans();
      this.plansSub = this.plansService.plansChanged
          .subscribe((plans: Plans[]) => {
          this.plans = plans;
      }); 

      // this.applicationStateService.setCurrentTableHeight(this.readWriteMobile, this.readWriteDesktop, 
      //                                                  this.readOnlyMobile, this.readOnlyDesktop);
      this.onViewChanged();
      this.tableHeightSub = this.applicationStateService.currentTableHeightChanged
          .subscribe((height: number) => {
              this.tableHeight = height});
      
      this.resizeObservable$ = fromEvent(window, 'resize');
      this.resizeSub$ = this.resizeObservable$.subscribe(evt => {
          this.onViewChanged();
      })

      if (this.plans.length === 0) {
          this.editTieOnMode = true;
      }
  }

  onViewChanged() {
  this.applicationStateService.setCurrentTableHeight(this.readWriteMobile, this.readWriteDesktop, 
                                                   this.readOnlyMobile, this.readOnlyDesktop);
  this.tableHeight = this.applicationStateService.getCurrentTableHeight();
  }    

  viewChanged(view: string) {
      if (view === 'scroll') {
          this.scrollPlansToBottom(true);
      } else {
          this.tableView = view;
      }
  }

  scrollPlansToBottom(scroll: boolean = false) {
      try {
        if ((this.newPlanRow) || (scroll)) {
          this.plansElement.nativeElement.scrollTo({left: 0 , top: this.plansElement.nativeElement.scrollHeight, behavior: 'smooth'});            
          this.newPlanRow = false;
        }
      } catch (err) {
        console.log(err + ' Scroll did not work!');
      }
  }

  onPaste(event: ClipboardEvent) {
      let clipboardData = event.clipboardData.getData('text').split('\n').map(line => {
          return line.split('\t');
      });

      this.onClearInput();

      let batchComplete: boolean = false;
      let startPasteIndex: number = this.plans.length >= 1 ? this.plans.length : 1;

      if (clipboardData.length > 0) {
          this.mdValue = +clipboardData[0][0];
          this.incValue = +clipboardData[0][1];
          this.azmValue = +clipboardData[0][2];
          if (this.plans.length === 0) {
              this.editTieOnMode = true;
              if (clipboardData[0].length > 3) { 
                  this.tvdValue = +clipboardData[0][3];
                  this.northValue = +clipboardData[0][4];
                  this.eastValue = +clipboardData[0][5];
              } else {
                  this.tvdValue = 0;
                  this.northValue = 0;
                  this.eastValue = 0;
              }
          }       
          
          this.onPlanInputValueChanged();
          if (this.okToAddUpdatePlan) {
              this.onAddUpdatePlans();
          } 
      }

      for (let i = 1; i < clipboardData.length; i++) {
            if (i === (clipboardData.length - 2)) {
                batchComplete = true;
            }
          this.mdValue = +clipboardData[i][0];
          this.incValue = +clipboardData[i][1];
          this.azmValue = +clipboardData[i][2];

          this.onPlanInputValueChanged();
          if (this.okToAddUpdatePlan) {
            //   this.onAddUpdatePlans();
              this.plansService.batchAddPlans(this.mdValue, this.incValue, this.azmValue, startPasteIndex, batchComplete);
              this.updatePlanSurveyOrientation(startPasteIndex);
          } else {
              this.onClearInput();
              break;
          }
      }

      this.onClearInput();
  }

  onEditPlan(index: number) {
      this.edittedIndex = index;
      this.editMode = true;    
      this.mdValue = this.plans[this.edittedIndex].md;
      this.incValue = this.plans[this.edittedIndex].inc;
      this.azmValue = this.plans[this.edittedIndex].azm;
      this.selectedMD = this.mdValue;  
  
      if (index === 0) {
          this.editTieOnMode = true;
          this.tableView = 'all';
          this.tvdValue = this.plans[0].tvd;
          this.northValue = this.plans[0].north;
          this.eastValue = this.plans[0].east;
          this.vsDirectionValue = 'vsDirection' in this.planHeader ? this.planHeader['vsDirection'] : 0;  
          this.northingValue = 'northing' in this.planHeader ? this.planHeader['northing'] : 0; 
          this.eastingValue = 'easting' in this.planHeader ? this.planHeader['easting'] : 0;   
          this.elevationValue = 'elevation' in this.planHeader ? this.planHeader['elevation'] : 0;  
          this.groundElevationValue = 'groundElevation' in this.planHeader ? this.planHeader['groundElevation'] : 0;

      } else {
          this.editTieOnMode = false;
          this.tvdValue = null;
          this.northValue = null;
          this.eastValue = null;
      }

      this.plansElement.nativeElement.focus();
  }
  
  onAddUpdatePlans() {
    if ((this.editTieOnMode) || (this.plans.length === 0)) {
        console.log(this.planHeader);
        this.planHeader['vsDirection'] = this.vsDirectionValue;
        this.planHeader['northing'] = this.northingValue;
        this.planHeader['easting'] = this.eastingValue;
        this.planHeader['elevation'] = this.elevationValue;   
        this.planHeader['groundElevation'] = this.groundElevationValue;         
        this.plansService.setPlanHeader(this.planHeader);

        if (this.plans.length > 0) {
            this.plansService.updatePlanTieOn(this.mdValue, this.incValue, this.azmValue, this.tvdValue,
                                                this.northValue, this.eastValue, this.vsDirectionValue,
                                                this.northingValue, this.eastingValue, this.elevationValue,
                                                this.groundElevationValue);
            this.updatePlanSurveyOrientation(0);              
        } else {
            this.plansService.addPlanTieOn(this.mdValue, this.incValue, this.azmValue, this.tvdValue,
                                            this.northValue, this.eastValue, this.vsDirectionValue,
                                            this.northingValue, this.eastingValue, this.elevationValue,
                                            this.groundElevationValue);
            this.updatePlanSurveyOrientation(0);
        }
    } else if (this.editMode) {
        this.plansService.updatePlan(this.edittedIndex, this.mdValue, this.incValue, this.azmValue); 
        this.updatePlanSurveyOrientation(this.edittedIndex);
    } else {   
        this.newPlanRow = true;      
        this.plansService.addPlan(this.mdValue, this.incValue, this.azmValue);     
        this.updatePlanSurveyOrientation(this.plans.length - 1);
    }

    this.onClearInput();
  }

  updatePlanSurveyOrientation(startIndex: number) {
    if (startIndex > 0) {
        startIndex = startIndex - 1;
    }
    const surveys = this.surveysService.getSurveys();
    const surveyIndex: number = 
            this.orientationService.plansChangedUpdateOffsetValues(this.plans[startIndex].md, surveys);
    this.orientationService.updateOffsetValues(surveyIndex, this.intIncrement, surveys);    
  }
  
  onDeletePlan() {
      this.edittedIndex = this.plansService.removePlan(this.edittedIndex);
      this.updatePlanSurveyOrientation(this.edittedIndex);
      this.onClearInput();
  }
  
  onPlanInputValueChanged() {
      if (this.editMode || this.editTieOnMode) {
          if (this.edittedIndex > 0) {
              if (this.edittedIndex < (this.plans.length - 1)) {
                  if (this.mdValue > this.plans[this.edittedIndex - 1].md && this.mdValue < this.plans[this.edittedIndex + 1].md) {
                  this.checkIsokToAddUpdatePlan();
                  } else {
                  this.okToAddUpdatePlan = false;
                  }
              } else if (this.edittedIndex === (this.plans.length - 1)) {
                  if (this.mdValue > this.plans[this.edittedIndex - 1].md) {
                  this.checkIsokToAddUpdatePlan();
                  } else {
                  this.okToAddUpdatePlan = false;
                  }
              } else {
                  this.okToAddUpdatePlan = false;
              }
          } else if (this.edittedIndex === 0) {
              this.checkIsokToAddUpdatePlan();                
          } else if (this.plans.length === 0) { 
              if (this.mdValue >= 0) {
                  this.checkIsokToAddUpdatePlan();
              } else {
                  this.okToAddUpdatePlan = false;
              }
          } else {
              this.okToAddUpdatePlan = false;
          }
      } else if (this.plans.length > 0) {    
          if (this.mdValue > this.plans[this.plans.length - 1].md) {
          this.checkIsokToAddUpdatePlan();
          } else {
          this.okToAddUpdatePlan = false;
          }
      } else if (this.plans.length === 0) {
          if (this.mdValue > this.plansService.getTieOnMD()) {
          this.checkIsokToAddUpdatePlan();
          } else {
          this.okToAddUpdatePlan = false;
          }
      } else {
          this.okToAddUpdatePlan = false;
      }
  }
  
  checkIsokToAddUpdatePlan() {
      if (this.editTieOnMode) {   
          if (this.mdValue >= 0 && this.incValue >= 0 && this.azmValue >= 0 && this.tvdValue >= 0 &&
              !isNaN(this.northValue) && !isNaN(this.eastValue) && this.vsDirectionValue >= 0 &&
              !isNaN(this.northingValue) && !isNaN(this.eastingValue) && !isNaN(this.elevationValue) &&
              !isNaN(this.groundElevationValue)) {                
              this.okToAddUpdatePlan = true;
          }
      } else {
          if (this.mdValue > 0 && this.incValue >= 0 && this.azmValue >= 0) {
              this.okToAddUpdatePlan = true;
          }
      }
  }
  
  onEnterKeyPressed() {
      if (this.okToAddUpdatePlan) {
          this.onAddUpdatePlans();
          this.mdElement.nativeElement.focus();
      }
      
  }
  
  onClearInput() {
      this.edittedIndex = -1;
      this.editMode = false;
      this.editTieOnMode = false; 
      this.okToAddUpdatePlan = false;
      this.mdValue = null;
      this.incValue = null;
      this.azmValue = null;
      this.tvdValue = null;
      this.northValue = null;
      this.eastValue = null;
      this.selectedMD = null;
  }

  ngOnDestroy() {
      this.plansSub.unsubscribe();
      this.planHeaderSub.unsubscribe();
      this.tableHeightSub.unsubscribe();
      this.resizeSub$.unsubscribe();
      this.memberPermissionsChangedSub.unsubscribe();
  }
}
