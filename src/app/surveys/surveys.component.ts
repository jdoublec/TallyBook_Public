import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Host, Output, EventEmitter } from '@angular/core';
import { SlideSeenService } from '../shared/slide-seen.service';
import { Surveys, SurveyHeader } from './surveys.model';
import { SurveysService } from './surveys.service';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { ApplicationStateService } from '../shared/application-state.service';
import { MembersService } from '../shared/members.service';
import { ProjectionsService } from './projections/projections.service';

@Component({
    selector: 'app-surveys',
    templateUrl: './surveys.component.html',
    styleUrls: ['../shared/scroll-table.component.css']
  })
  export class SurveysComponent implements OnInit, OnDestroy {
    @ViewChild('firstParamElem', {static: false}) firstParamElement: ElementRef;
    @ViewChild('scrollSurveys', {static: false}) surveysElement: ElementRef;
    resizeObservable$: Observable<Event>;
    resizeSub$: Subscription;
    tableHeightSub: Subscription;
    memberPermissionsChangedSub: Subscription;
    surveyHeaderSub: Subscription;
    surveysSub: Subscription;    
    edittedIndex: number = -1;
    newSurveyRow: boolean = false;      
    surveyHeader: SurveyHeader; 
    surveys: Surveys[] = [];
    firstParam: number;
    secondParam: number;
    thirdParam: number;
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
    surveyMode: boolean = true;
    okToAddUpdate: boolean = false;
    mobileResolution: boolean = false;
    readOnlyAccess: boolean = true;
    tableView: string = 'tvd';
    tableHeight: number = 0;
    readWriteMobile: number = 320;
    readWriteDesktop: number = 229;
    readOnlyMobile: number = 95; 
    readOnlyDesktop: number = 75;
    // plotMode: boolean = false;

    //Projection Variables
    modeMDIncAzm: boolean = true;
    modeIncAzmTVD: boolean = false;
    modeMDDLSTF: boolean = false;
    modeCLDLSTF: boolean = false;
    modeCLBRTR: boolean = false;
    modeCLIncAzm: boolean = false;
    firstParamName: string = 'MD';
    secondParamName: string = 'Inc';
    thirdParamName: string = 'Azm';

    constructor(protected applicationStateService: ApplicationStateService,
                protected membersService: MembersService,
                protected projectionsService: ProjectionsService,
                protected slideSeenService: SlideSeenService,
                protected surveysService: SurveysService,) {}
    
    ngOnInit() {   
        // this.plotMode = this.surveysService.getPlotMode();

        this.mobileResolution = this.applicationStateService.getIsMobileResolution();    

        if (!this.mobileResolution) {
            this.tableView = 'all';
        }
            
        this.readOnlyAccess = this.membersService.getCurrentUserPermissions();
        this.memberPermissionsChangedSub = this.membersService.memberPermissionsChanged
        .subscribe((readOnlyAccess: boolean) => {
            this.readOnlyAccess = readOnlyAccess; 
        });  

        // if (this.mobileResolution) {
        // this.tableHeight = window.innerHeight - 280; //window.innerHeight - this.mobileSubheaderTop;
        // } else {
        // this.tableHeight = window.innerHeight - 219; //window.innerHeight - this.desktopSubheaderTop;
        // }

        this.surveysService.setupSurveyHeader();
        this.surveyHeader = this.surveysService.getSurveyHeader();
        this.surveyHeaderSub = this.surveysService.surveyHeaderChanged
            .subscribe((surveyHeader: SurveyHeader) => {
                this.vsDirectionValue = 'vsDirection' in surveyHeader ? surveyHeader['vsDirection'] : 0;  
                this.northingValue = 'northing' in surveyHeader ? surveyHeader['northing'] : 0; 
                this.eastingValue = 'easting' in surveyHeader ? surveyHeader['easting'] : 0;   
                this.elevationValue = 'elevation' in surveyHeader ? surveyHeader['elevation'] : 0;
            });
        
        this.vsDirectionValue = this.surveysService.getVSDirection();
        this.northingValue = this.surveysService.getNorthing();
        this.eastingValue = this.surveysService.getEasting();
        this.elevationValue = this.surveysService.getElevation();
        this.groundElevationValue = this.surveysService.getGroundElevation();
        
        this.surveys = this.surveysService.getSurveys();
        this.surveysSub = this.surveysService.surveysChanged
            .subscribe((surveys: Surveys[]) => {
            this.surveys = surveys;
        }); 

        // this.applicationStateService.setCurrentTableHeight(this.readWriteMobile, this.readWriteDesktop, 
        //                                                  this.readOnlyMobile, this.readOnlyDesktop);
        this.onViewChanged();
        this.tableHeightSub = this.applicationStateService.currentTableHeightChanged
            .subscribe((height: number) => {
                // if (!this.plotMode) {
                    this.tableHeight = height
                // } else {
                    // this.tableHeight = 200;
                // }
            });
        
        this.resizeObservable$ = fromEvent(window, 'resize');
        this.resizeSub$ = this.resizeObservable$.subscribe(evt => {
            this.onViewChanged();
        })

        if (this.surveys.length === 0) {
            this.editTieOnMode = true;
        }
    }

    public getSurveysTableElement() {
        return this.surveysElement;
    }

    onViewChanged() {
    this.applicationStateService.setCurrentTableHeight(this.readWriteMobile, this.readWriteDesktop, 
                                                     this.readOnlyMobile, this.readOnlyDesktop);
    this.tableHeight = this.applicationStateService.getCurrentTableHeight();
    }    

    viewChanged(view: string) {
        if (view === 'scroll') {
            this.scrollSurveysToBottom(true);
        } else {
            this.tableView = view;
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

    onPaste(event: ClipboardEvent) {
        let clipboardData = event.clipboardData.getData('text').split('\n').map(line => {
            return line.split('\t');
        });

        this.onClearInput();

        let batchComplete: boolean = false;
        let startPasteIndex: number = this.surveys.length >= 1 ? this.surveys.length : 1;

        if (clipboardData.length > 0) {
            this.firstParam = +clipboardData[0][0];
            this.secondParam = +clipboardData[0][1];
            this.thirdParam = +clipboardData[0][2];
            if (this.surveys.length === 0) {
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
            
            this.onSurveyInputValueChanged();
            if (this.okToAddUpdate) {
                this.onAddUpdateSurveys();
            } 
        }
        
        for (let i = 1; i < clipboardData.length; i++) {
            if (i === (clipboardData.length - 2)) {
                batchComplete = true;
            }

            this.firstParam = +clipboardData[i][0];
            this.secondParam = +clipboardData[i][1];
            this.thirdParam = +clipboardData[i][2];

            this.onSurveyInputValueChanged();
            if (this.okToAddUpdate) {
                this.surveysService.batchAddSurveys(this.firstParam, this.secondParam, this.thirdParam, startPasteIndex, batchComplete);
            } else {
                this.onClearInput();
                break;
            }
        }

        this.slideSeenService.surveysChangedUpdateSlideSeen(startPasteIndex);

        this.onClearInput();
    }

    onEditSurvey(index: number) {
        if (this.surveyMode) {
            this.edittedIndex = index;
            this.editMode = true; 
            this.firstParam = this.surveys[this.edittedIndex].md;
            this.secondParam = this.surveys[this.edittedIndex].inc;
            this.thirdParam = this.surveys[this.edittedIndex].azm;
            this.selectedMD = this.firstParam;  
        
            if (index === 0) {
                this.editTieOnMode = true;
                this.tableView = 'all';
                this.tvdValue = this.surveys[0].tvd;
                this.northValue = this.surveys[0].north;
                this.eastValue = this.surveys[0].east;
                this.vsDirectionValue = 'vsDirection' in this.surveyHeader ? this.surveyHeader['vsDirection'] : 0;  
                this.northingValue = 'northing' in this.surveyHeader ? this.surveyHeader['northing'] : 0; 
                this.eastingValue = 'easting' in this.surveyHeader ? this.surveyHeader['easting'] : 0;   
                this.elevationValue = 'elevation' in this.surveyHeader ? this.surveyHeader['elevation'] : 0;  
                this.groundElevationValue = 'groundElevation' in this.surveyHeader ? this.surveyHeader['groundElevation'] : 0;

            } else {
                this.editTieOnMode = false;
                this.tvdValue = null;
                this.northValue = null;
                this.eastValue = null;
            }

            this.surveysElement.nativeElement.focus();
        }
    }

    onAddUpdateProject() {
        if (this.surveyMode) {
            this.onAddUpdateSurveys();
        } else {
            this.onAddProjection();
        }
    }
    
    onAddUpdateSurveys(projection: boolean = false) {
        if (this.surveys[this.surveys.length - 1].projection) {
            projection = true;
        }

        if ((this.editTieOnMode) || (this.surveys.length === 0)) {
            this.surveyHeader['vsDirection'] = this.vsDirectionValue;
            this.surveyHeader['northing'] = this.northingValue;
            this.surveyHeader['easting'] = this.eastingValue;
            this.surveyHeader['elevation'] = this.elevationValue;  
            this.surveyHeader['groundElevation'] = this.groundElevationValue;          
            this.surveysService.setSurveyHeader(this.surveyHeader);

            if (this.surveys.length > 0) {
                this.surveysService.updateSurveyTieOn(this.firstParam, this.secondParam, this.thirdParam, this.tvdValue,
                                                    this.northValue, this.eastValue, this.vsDirectionValue,
                                                    this.northingValue, this.eastingValue, this.elevationValue,
                                                    this.groundElevationValue);

                this.surveys.forEach((survey, index) => {
                    this.slideSeenService.surveysChangedUpdateSlideSeen(index);
                })
            } else {
                this.surveysService.addSurveyTieOn(this.firstParam, this.secondParam, this.thirdParam, this.tvdValue,
                    this.northValue, this.eastValue, this.vsDirectionValue,
                    this.northingValue, this.eastingValue, this.elevationValue,
                    this.groundElevationValue);

                this.slideSeenService.surveysChangedUpdateSlideSeen(0);
            }
        }
        else if (this.editMode) {
            this.surveysService.updateSurvey(this.edittedIndex, this.firstParam, this.secondParam, 
                                              this.thirdParam); 
            this.slideSeenService.surveysChangedUpdateSlideSeen(this.edittedIndex);
        }
        else {   
            console.log('survey added');
            this.newSurveyRow = true;  
            this.surveysService.addSurvey(this.firstParam, this.secondParam, this.thirdParam, false, projection);          
            this.slideSeenService.surveysChangedUpdateSlideSeen(this.surveys.length - 1);  
        }

        this.onClearInput();
    }
    
    onDeleteSurvey() {        
        this.surveysService.removeSurvey(this.edittedIndex);
        const prevIndex = this.edittedIndex > 0 ? this.edittedIndex - 1 : this.edittedIndex;
        this.slideSeenService.surveysChangedUpdateSlideSeen(prevIndex);
        this.onClearInput();
    }
    
    onSurveyInputValueChanged() {
        if (this.surveyMode || this.modeMDIncAzm){
            if (this.editMode || this.editTieOnMode) {
                if (this.edittedIndex > 0) {
                    if (this.edittedIndex < (this.surveys.length - 1)) {
                        if (this.firstParam > this.surveys[this.edittedIndex - 1].md && this.firstParam < this.surveys[this.edittedIndex + 1].md) {
                        this.checkIsOkToAddUpdateSurvey();
                        } else {
                        this.okToAddUpdate = false;
                        }
                    } else if (this.edittedIndex === (this.surveys.length - 1)) {
                        if (this.firstParam > this.surveys[this.edittedIndex - 1].md) {
                        this.checkIsOkToAddUpdateSurvey();
                        } else {
                        this.okToAddUpdate = false;
                        }
                    } else {
                        this.okToAddUpdate = false;
                    }
                } else if (this.edittedIndex === 0) {
                    this.checkIsOkToAddUpdateSurvey();                
                } else if (this.surveys.length === 0) { 
                    if (this.firstParam >= 0) {
                        this.checkIsOkToAddUpdateSurvey();
                    } else {
                        this.okToAddUpdate = false;
                    }
                } else {
                    this.okToAddUpdate = false;
                }
            } else if (this.surveys.length > 0) {    
                if (this.firstParam > this.surveys[this.surveys.length - 1].md) {
                    this.checkIsOkToAddUpdateSurvey();
                } else {
                    this.okToAddUpdate = false;
                }
            } else if (this.surveys.length === 0) {
                if (this.firstParam > this.surveysService.getTieOnMD()) {
                    this.checkIsOkToAddUpdateSurvey();
                } else {
                    this.okToAddUpdate = false;
                }
            } else {
                this.okToAddUpdate = false;
            }
        } else {
            this.checkIsOkToAddProjection();
        }
    }
    
    checkIsOkToAddUpdateSurvey() {
        if (this.editTieOnMode) {   
            if (this.firstParam >= 0 && this.secondParam >= 0 && this.thirdParam >= 0 && this.tvdValue >= 0 &&
                !isNaN(this.northValue) && !isNaN(this.eastValue) && this.vsDirectionValue >= 0 &&
                !isNaN(this.northingValue) && !isNaN(this.eastingValue) && !isNaN(this.elevationValue) &&
                !isNaN(this.groundElevationValue)) {                
                this.okToAddUpdate = true;
            }
        } else {
            if (this.firstParam > 0 && this.secondParam >= 0 && this.thirdParam >= 0) {
                this.okToAddUpdate = true;
            } else {
                this.okToAddUpdate = false;
            }
        }
    }

    checkIsOkToAddProjection() {   
        if ((this.firstParam != null) && (this.secondParam != null) && (this.thirdParam != null)) {
            if (this.modeIncAzmTVD) {
                if (this.firstParam >= 0 && this.secondParam >= 0 && this.thirdParam >= 0) {
                    this.okToAddUpdate = true;
                } else {
                    this.okToAddUpdate = false;
                }
            } else if (this.modeMDDLSTF || this.modeCLDLSTF || this.modeCLIncAzm) {
                if (this.firstParam > 0 && this.secondParam >= 0 && this.thirdParam >= 0) {
                    this.okToAddUpdate = true;
                } else {
                    this.okToAddUpdate = false;
                }
            } else if (this.modeCLBRTR) {
                if (this.firstParam > 0) {
                    this.okToAddUpdate = true;
                } else {
                    this.okToAddUpdate = false;
                }
            } else {
                this.okToAddUpdate = false;
            }
        } else {
            this.okToAddUpdate = false;
        }
    }
    
    onEnterKeyPressed() {
        if (this.okToAddUpdate) {
            this.onAddUpdateProject();
            this.firstParamElement.nativeElement.focus();
        }        
    }
    
    onClearInput() {
        this.edittedIndex = -1;
        this.editMode = false;
        this.editTieOnMode = false; 
        this.okToAddUpdate = false;
        this.firstParam = null;
        this.secondParam = null;
        this.thirdParam = null;
        this.tvdValue = null;
        this.northValue = null;
        this.eastValue = null;
        this.selectedMD = null;
    }

    onTieOnChanged() {        
        this.slideSeenService.surveysChangedUpdateSlideSeen(0);
    }

    ngOnDestroy() {
        this.surveysSub.unsubscribe();
        this.surveyHeaderSub.unsubscribe();
        this.tableHeightSub.unsubscribe();
        this.resizeSub$.unsubscribe();
        this.memberPermissionsChangedSub.unsubscribe();
    }

    //Projection Section.

    onSurveyMode() {
        this.firstParamName = 'MD';
        this.secondParamName = 'Inc';
        this.thirdParamName = 'Azm';        
        this.falsifyAllModes();     
        this.onClearInput();
        this.surveyMode = true;
    }

    onProjectMDIncAzm() {
        this.firstParamName = 'MD';
        this.secondParamName = 'Inc';
        this.thirdParamName = 'Azm';        
        this.falsifyAllModes();     
        this.onClearInput();
        this.modeMDIncAzm = true;   
    }

    onProjectIncAzmTVD() {
        this.firstParamName = 'Inc';
        this.secondParamName = 'Azm';
        this.thirdParamName = 'TVD';
        this.falsifyAllModes();
        this.onClearInput();
        this.modeIncAzmTVD = true;
    }

    onProjectMDDLSTF() {
        this.firstParamName = 'MD';
        this.secondParamName = 'DLS';
        this.thirdParamName = 'TF';
        this.falsifyAllModes();
        this.onClearInput();
        this.modeMDDLSTF = true;
    }

    onProjectCLDLSTF() {
        this.firstParamName = 'CL';
        this.secondParamName = 'DLS';
        this.thirdParamName = 'TF';
        this.falsifyAllModes();
        this.onClearInput();
        this.modeCLDLSTF = true;
    }

    onProjectCLBRTR() {
        this.firstParamName = 'CL';
        this.secondParamName = 'BR';
        this.thirdParamName = 'TR';
        this.falsifyAllModes();
        this.onClearInput();
        this.modeCLBRTR = true;
    }

    onProjectCLIncAzm() {
        this.firstParamName = 'CL';
        this.secondParamName = 'Inc';
        this.thirdParamName = 'Azm';
        this.falsifyAllModes();
        this.onClearInput();
        this.modeCLIncAzm = true;
    }

    falsifyAllModes() {
        this.modeMDIncAzm = false;
        this.modeIncAzmTVD = false;
        this.modeMDDLSTF = false;
        this.modeCLDLSTF = false;
        this.modeCLBRTR = false;
        this.modeCLIncAzm = false;
        this.surveyMode = false;
    }

    // onParamsChanged() {    
    //     if ((this.modeMDDLSTF) || (this.modeMDIncAzm)) {
    //         if (this.firstParam > this.surveys[this.surveys.length - 1].md) {
    //             this.okToProject = true;
    //         } else {
    //             this.okToProject = false;
    //         }
    //     } else {
    //         this.okToProject = true;
    //     }

    //     this.editMode = false;
    // }

    onAddProjection() {
        const currentMD = this.surveys[this.surveys.length -1].md;
        const currentInc = this.surveys[this.surveys.length - 1].inc;
        const currentAzm = this.surveys[this.surveys.length - 1].azm;
        const currentTVD = this.surveys[this.surveys.length - 1].tvd;
        let projection;
        if (this.modeMDIncAzm) {            
            projection = { md: this.firstParam, inc: this.secondParam, azm: this.thirdParam };
        } else if (this.modeIncAzmTVD) {
            projection = this.projectionsService.getProjectionIncAzmTVD(currentMD, currentInc, currentAzm, currentTVD, 
                                                     this.firstParam, this.secondParam, this.thirdParam);
        } else if (this.modeMDDLSTF) {
            projection = this.projectionsService.getProjectionMDDLSTF(currentMD, currentInc, currentAzm, 
                                                   this.firstParam, this.secondParam, this.thirdParam);
        } else if (this.modeCLDLSTF) {
            projection = this.projectionsService.getProjectionCLDLTF(currentMD, currentInc, currentAzm, 
                                                  this.firstParam, this.secondParam, this.thirdParam);
        } else if (this.modeCLBRTR) {
            projection = this.projectionsService.getProjectionCLBRTR(currentMD, currentInc, currentAzm, 
                                                  this.firstParam, this.secondParam, this.thirdParam);
        } else if (this.modeCLIncAzm) {
            projection = this.projectionsService.getProjectionCLIncAzm(currentMD, this.firstParam, this.secondParam, this.thirdParam);
        }
        
        this.addProjection(projection['md'], projection['inc'], projection['azm']);
    }

    onProjectToBit() {

    }

    addProjection(md: number, inc: number, azm: number) {
        this.firstParam = md;
        this.secondParam = inc;
        this.thirdParam = azm;

        this.onAddUpdateSurveys(true);      
    }    

    onDeleteProjections() {
        this.surveysService.removeProjections();
    }    

   }