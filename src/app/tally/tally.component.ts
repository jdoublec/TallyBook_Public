import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { TallyService } from './tally.service';
import { Tally, TallyHeader } from '../shared/tally.model';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { SlideSeenService } from '../shared/slide-seen.service';
import { SurveysService } from '../surveys/surveys.service';
import { Surveys } from '../surveys/surveys.model';
import { ApplicationStateService } from '../shared/application-state.service';
import { MembersService } from '../shared/members.service';

@Component({
  selector: 'app-tally',  
  templateUrl: './tally.component.html',
  styleUrls: ['./tally.component.css']
})
export class TallyComponent implements OnInit, OnDestroy {
  @ViewChild('length', {static: false}) lengthElement: ElementRef;
  @ViewChild('surveyMD', {static: false}) mdElement: ElementRef;
  @ViewChild('scrollSurveys', {static: false}) surveysElement: ElementRef;
  @ViewChild('scrollTally', {static: true}) tallyElement: ElementRef;
  memberPermissionsChangedSub: Subscription;
  tableHeightSub: Subscription;  
  resizeObservable$: Observable<Event>;
  resizeSub$: Subscription;
  tallySub: Subscription;
  tallyHeaderSub: Subscription;
  surveysSub: Subscription;
  totalTally: Tally[];
  surveys: Surveys[];
  editTallyMode: boolean = false;
  editSurveyMode: boolean = false;
  okToAddUpdateTally: boolean = false;
  okToAddUpdateSurvey: boolean = false;
  newTallyRow: boolean = false;
  newSurveyRow: boolean = false;
  showTallySurveyView: boolean = false;
  readOnlyAccess: boolean = true;
  // deleteAll: boolean = false;
  edittedTallyIndex: number = -1;
  edittedSurveyIndex: number = -1;
  lengthValue: number;
  offset: number;
  startingValue: number;
  rigType: string = 'Triple';
  rigTypes: string[] = ['Single', 'Double', 'Triple', 'Quad'];
  mdValue: number;
  incValue: number;
  azmValue: number;  
  selectedTotal: number;
  selectedMD: number;
  noFraction: string = '1.0-0'
  mobileResolution: boolean = false;  
  tableHeight: number;
  mobileSubheaderTop: number = 0;
  desktopSubheaderTop: number = 0;
  testString: string; 
  readWriteMobile: number = 300;
  readWriteDesktop: number = 219;
  readOnlyMobile: number = 95; 
  readOnlyDesktop: number = 75;

  deleteAllMessage: string = null;
  

  constructor(private tallyService: TallyService,
              private slideSeenService: SlideSeenService,
              private surveysService: SurveysService,
              private applicationStateService: ApplicationStateService,
              private membersService: MembersService) {}

  ngOnInit() {
    
    this.mobileResolution = this.applicationStateService.getIsMobileResolution();    

    this.readOnlyAccess = this.membersService.getCurrentUserPermissions();
    this.memberPermissionsChangedSub = this.membersService.memberPermissionsChanged
       .subscribe((readOnlyAccess: boolean) => {
         this.readOnlyAccess = readOnlyAccess; 
       });  

    this.totalTally = this.tallyService.getTally();
   
    this.tallySub = this.tallyService.tallyChanged    
      .subscribe(
        (tally: Tally[]) => {
          this.totalTally = tally;
          }
        );
      
    this.tallyHeaderSub = this.tallyService.tallyHeaderChanged
          .subscribe((tallyHeader: TallyHeader) => {
            this.offset = tallyHeader['offset'];
            this.startingValue = tallyHeader['startingValue'];
            this.rigType = tallyHeader['rigType'];
          })

    this.offset = this.tallyService.getOffset();
    this.startingValue = this.tallyService.getStartingValue();
    this.rigType = this.tallyService.getRigType();  

    this.surveys = this.surveysService.getSurveys();
    this.surveysSub = this.surveysService.surveysChanged
          .subscribe((surveys: Surveys[]) => {
            this.surveys = surveys 
          }); 
          
    this.showTallySurveyView = this.tallyService.getTallySurveyView() ? this.tallyService.getTallySurveyView() : false;

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
  }

  onViewChanged() {
    this.applicationStateService.setCurrentTableHeight(this.readWriteMobile, this.readWriteDesktop, 
                                                     this.readOnlyMobile, this.readOnlyDesktop);
    this.tableHeight = this.applicationStateService.getCurrentTableHeight();
  }

  scrollTallyToBottom(scroll: boolean = false) {
    try {
      if ((this.newTallyRow) || (scroll)) {
        this.tallyElement.nativeElement.scrollTo({left: 0 , top: this.tallyElement.nativeElement.scrollHeight, behavior: 'smooth'});
        this.newTallyRow = false;
      }
    } catch (err) {
      console.log(err + ' Tally Scroll did not work!');
    }
  }

  scrollSurveysToBottom(scroll: boolean = false) {
    try {
      if ((this.newSurveyRow) || (scroll)) {
        this.surveysElement.nativeElement.scrollTo({left: 0 , top: this.surveysElement.nativeElement.scrollHeight, behavior: 'smooth'});
        this.newSurveyRow = false;
      }
    } catch (err) {
      console.log(err + ' Scroll did not work!');
    }
  }

  trackByCount(index, item) {
    return index + 1;
  }

  onPaste(event: ClipboardEvent) {
    let clipboardData = event.clipboardData.getData('text').split('\n').map(line => {
        return line.split('\t');
    });

    this.onClearInput();

    for (let i = 0; i < clipboardData.length; i++) {
        this.lengthValue = +clipboardData[i][0];

        this.onLengthChanged();
        if (this.okToAddUpdateTally) {
            this.onAddUpdateTally();
        } else {
            this.onClearInput();
            break;
        }
    }

    this.onClearInput();
}

  onAddUpdateTally() {
    if (this.editTallyMode) {
      this.tallyService.updateTally(this.edittedTallyIndex, this.lengthValue, this.offset, 
                                    false);       
    }
    else if (this.lengthValue > 0) {   
      this.newTallyRow = true;
      this.tallyService.addTally(this.lengthValue, this.offset);      
    }    
    this.onClearInput();
  }  

  onEditTally(index: number) {
    this.edittedTallyIndex = index;
    this.editTallyMode = true;    
    this.lengthValue = this.totalTally[this.edittedTallyIndex].length;

    this.selectedTotal = this.totalTally[this.edittedTallyIndex].total;

    this.lengthElement.nativeElement.focus();
  }

  onLengthChanged() {
    if (this.lengthValue > 0) {
      this.onTallyInputValueChanged();
    }
  }

  onOffsetChanged() {
    this.tallyService.offsetChanged(this.offset);   
    this.onTallyInputValueChanged();
  }

  onStartingValueChanged() {
    this.tallyService.startingValueChanged(this.startingValue, this.offset);
    this.onTallyInputValueChanged();
  }  

  onRigTypeChanged(){
    this.tallyService.rigTypeChanged(this.rigType);
  }

  onTallyInputValueChanged() {
    if (this.lengthValue > 0 && this.offset >= 0 && this.startingValue >= 0 && this.rigType != null) {// this.surveyInfoValid()) {
      this.okToAddUpdateTally = true;
    } else {
      this.okToAddUpdateTally = false;
    }
  }     

  onDeleteTally() {
    this.tallyService.removeTally(this.edittedTallyIndex, this.offset);
    this.onClearInput();
  }  

  onDeleteAllSelected() {
    this.deleteAllMessage = "Delete All Tally?  Press Yes to Delete!!!";
    // this.deleteAll = true;
    // return false;
  }

  onDeleteAll(deleteAll: boolean) {
    if (deleteAll) {
      this.tallyService.removeAll();
    }
    this.deleteAllMessage = null;
  }

  onDeleteNone() {
    this.deleteAllMessage = null;
  }

  onEditSurvey(index: number) {
    this.edittedSurveyIndex = index;
    this.editSurveyMode = true;    
    this.mdValue = this.surveys[this.edittedSurveyIndex].md;
    this.incValue = this.surveys[this.edittedSurveyIndex].inc;
    this.azmValue = this.surveys[this.edittedSurveyIndex].azm;
    this.selectedMD = this.mdValue;    

    this.surveysElement.nativeElement.focus();
  }

  // desktopBrowser(){
  //   var ua = navigator.userAgent;
    
  //   if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS/i.test(ua)){
  //      return false;
  //   } 
  //   // else if (/Chrome/i.test(ua)){
  //   //    $('a.chrome').show();
  //   // } 
  //   else {
  //      return true;
  //   }
  // }
  onAddUpdateSurveys() {
    if (this.editSurveyMode) {
      this.surveysService.updateSurvey(this.edittedSurveyIndex, this.mdValue, this.incValue, 
                                       this.azmValue); 
      this.slideSeenService.surveysChangedUpdateSlideSeen(this.edittedSurveyIndex);
    }
    else {   
      this.newSurveyRow = true;      
      this.surveysService.addSurvey(this.mdValue, this.incValue, this.azmValue);          
      this.slideSeenService.surveysChangedUpdateSlideSeen(this.surveys.length - 1);  
    }    
    this.onClearInput();
  }

  onDeleteSurvey() {
    this.surveysService.removeSurvey(this.edittedSurveyIndex);
    this.slideSeenService.surveysChangedUpdateSlideSeen(this.edittedSurveyIndex);
    this.onClearInput();
  }

  onSurveyInputValueChanged() {
    if (this.editSurveyMode) {
      if (this.edittedSurveyIndex > 0) {
        if (this.edittedSurveyIndex < (this.surveys.length - 1)) {
          if (this.mdValue > this.surveys[this.edittedSurveyIndex - 1].md && this.mdValue < this.surveys[this.edittedSurveyIndex + 1].md) {
            this.checkIsOkToAddUpdateSurvey();
          } else {
            this.okToAddUpdateSurvey = false;
          }
        } else if (this.edittedSurveyIndex === (this.surveys.length - 1)) {
          if (this.mdValue > this.surveys[this.edittedSurveyIndex - 1].md) {
            this.checkIsOkToAddUpdateSurvey();
          } else {
            this.okToAddUpdateSurvey = false;
          }
        } else {
          this.okToAddUpdateSurvey = false;
        }
      } else if (this.edittedSurveyIndex === 0) {
        if (this.mdValue > this.surveysService.getTieOnMD()) {
          this.checkIsOkToAddUpdateSurvey();
        } else {
          this.okToAddUpdateSurvey = false;
        }
      } else {
        this.okToAddUpdateSurvey = false;
      }
    } else if (this.surveys.length > 0) {    
      if (this.mdValue > this.surveys[this.surveys.length - 1].md) {
        this.checkIsOkToAddUpdateSurvey();
      } else {
        this.okToAddUpdateSurvey = false;
      }
    } else if (this.surveys.length === 0) {
      if (this.mdValue > this.surveysService.getTieOnMD()) {
        this.checkIsOkToAddUpdateSurvey();
      } else {
        this.okToAddUpdateSurvey = false;
      }
    } else {
      this.okToAddUpdateSurvey = false;
    }
  }

  checkIsOkToAddUpdateSurvey() {
    if (this.mdValue > 0 && this.incValue >= 0 && this.azmValue >= 0) {
      this.okToAddUpdateSurvey = true;
    }
  }

  onEnterKeyPressed(tallyEnter: boolean) {
    if (tallyEnter) {
      if (this.okToAddUpdateTally) {
        this.onAddUpdateTally();
        this.lengthElement.nativeElement.focus();
      }
    } else {
      if (this.okToAddUpdateSurvey) {
        this.onAddUpdateSurveys();
        this.mdElement.nativeElement.focus();
      }
    }
  }

  onClearInput() {
    this.edittedTallyIndex = -1;
    this.editTallyMode = false;
    this.edittedSurveyIndex = -1;
    this.editSurveyMode = false;
    this.okToAddUpdateTally = false;
    this.okToAddUpdateSurvey = false;
    this.lengthValue = null;
    this.mdValue = null;
    this.incValue = null;
    this.azmValue = null;
    this.selectedTotal = null;
  }

  ngOnDestroy() {
    this.tallySub.unsubscribe();
    this.tallyHeaderSub.unsubscribe();
    this.surveysSub.unsubscribe();
    this.memberPermissionsChangedSub.unsubscribe();
    this.resizeSub$.unsubscribe();
    this.tableHeightSub.unsubscribe();
  }
}
