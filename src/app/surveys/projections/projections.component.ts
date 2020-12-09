// import { Component, OnInit, AfterViewInit, } from '@angular/core';
// import { SurveysService } from '../surveys.service';
// import { ProjectionsService } from './projections.service';
// import { PlotsService } from 'src/app/plots/plots.service';
// import { SurveysComponent } from '../surveys.component';
// import { ApplicationStateService } from 'src/app/shared/application-state.service';
// import { MembersService } from 'src/app/shared/members.service';
// import { SlideSeenService } from 'src/app/shared/slide-seen.service';
// import { PlansService } from 'src/app/plans/plans.service';
// import { SurveyMathService } from 'src/app/shared/survey-math.service';
// import { Router } from '@angular/router';

// @Component({
//     selector: 'app-projections',
//     templateUrl: './projections.component.html',
//   })
//   export class ProjectionsComponent extends SurveysComponent implements AfterViewInit { 
//     okToProject: boolean = false;
//     modeMDIncAzm: boolean = true;
//     modeIncAzmTVD: boolean = false;
//     modeMDDLSTF: boolean = false;
//     modeDLSTFCL: boolean = false;
//     modeBRTRCL: boolean = false;
//     modeIncAzmCL: boolean = false;
//     firstParamName: string = 'MD';
//     secondParamName: string = 'Inc';
//     thirdParamName: string = 'Azm';

//     firstParam: number = 0;
//     secondParam: number = 0;
//     thirdParam: number = 0;
//     plotsMode: boolean = false;

//     constructor(readonly applicationStateService: ApplicationStateService,
//                 readonly membersService: MembersService,
//                 readonly plansService: PlansService,
//                 protected plotsService: PlotsService,
//                 readonly projectionsService: ProjectionsService,
//                 private router: Router,
//                 readonly slideSeenService: SlideSeenService,
//                 readonly surveyMathService: SurveyMathService,
//                 readonly surveysService: SurveysService,) {                    
//                     super(applicationStateService, membersService, slideSeenService, surveysService);    
//                 }    

//     ngAfterViewInit() {
//         if (this.router.url === '/plots') {
//             this.plotsMode = true;
//         }
//     }

//     isEditMode(): boolean {
//         return this.editMode;
//     }

//     onSurveyMode() {
//         this.firstParamName = 'MD';
//         this.secondParamName = 'Inc';
//         this.thirdParamName = 'Azm';        
//         this.falsifyAllModes();     

//         this.surveyMode = true;
//     }

//     onProjectMDIncAzm() {
//         this.firstParamName = 'MD';
//         this.secondParamName = 'Inc';
//         this.thirdParamName = 'Azm';        
//         this.falsifyAllModes();     

//         this.modeMDIncAzm = true;
//         this.onParamsChanged();        
//     }

//     onProjectIncAzmTVD() {
//         this.firstParamName = 'Inc';
//         this.secondParamName = 'Azm';
//         this.thirdParamName = 'TVD';
//         this.falsifyAllModes();
//         this.modeIncAzmTVD = true;
//         this.onParamsChanged(); 
//     }

//     onProjectMDDLSTF() {
//         this.firstParamName = 'MD';
//         this.secondParamName = 'DLS';
//         this.thirdParamName = 'TF';
//         this.falsifyAllModes();
//         this.modeMDDLSTF = true;
//         this.onParamsChanged(); 
//     }

//     onProjectDLSTFCL() {
//         this.firstParamName = 'DLS';
//         this.secondParamName = 'TF';
//         this.thirdParamName = 'CL';
//         this.falsifyAllModes();
//         this.modeDLSTFCL = true;
//         this.onParamsChanged(); 
//     }

//     onProjectBRTRCL() {
//         this.firstParamName = 'BR';
//         this.secondParamName = 'TR';
//         this.thirdParamName = 'CL';
//         this.falsifyAllModes();
//         this.modeBRTRCL = true;
//         this.onParamsChanged(); 
//     }

//     onProjectIncAzmCL() {
//         this.firstParamName = 'Inc';
//         this.secondParamName = 'Azm';
//         this.thirdParamName = 'CL';
//         this.falsifyAllModes();
//         this.modeIncAzmCL = true;
//         this.onParamsChanged(); 
//     }

//     falsifyAllModes() {
//         this.modeMDIncAzm = false;
//         this.modeIncAzmTVD = false;
//         this.modeMDDLSTF = false;
//         this.modeDLSTFCL = false;
//         this.modeBRTRCL = false;
//         this.modeIncAzmCL = false;
//         this.surveyMode = false;
//     }

//     onParamsChanged() {        
//         // console.log(this.routeSnap.pathFromRoot);
//         if ((this.modeMDDLSTF) || (this.modeMDIncAzm)) {
//             // if (this.firstParam > this.surveysService.getLastSurveyMD()) {
//             if (this.firstParam > this.surveys[this.surveys.length - 1].md) {
//                 this.okToProject = true;
//             } else {
//                 this.okToProject = false;
//             }
//         } else {
//             this.okToProject = true;
//         }

//         this.editMode = false;
//     }

//     onProject() {
//         const currentMD = this.surveys[this.surveys.length -1].md;
//         const currentInc = this.surveys[this.surveys.length - 1].inc;
//         const currentAzm = this.surveys[this.surveys.length - 1].azm;
//         const currentTVD = this.surveys[this.surveys.length - 1].tvd;
//         let projection;
//         if (this.modeMDIncAzm) {            
//             projection = { md: this.firstParam, inc: this.secondParam, azm: this.thirdParam };
//         } else if (this.modeIncAzmTVD) {
//             projection = this.projectionsService.getProjectionIncAzmTVD(currentMD, currentInc, currentAzm, currentTVD, 
//                                                      this.firstParam, this.secondParam, this.thirdParam);
//         } else if (this.modeMDDLSTF) {
//             projection = this.projectionsService.getProjectionMDDLSTF(currentMD, currentInc, currentAzm, 
//                                                    this.firstParam, this.secondParam, this.thirdParam);
//         } else if (this.modeDLSTFCL) {
//             projection = this.projectionsService.getProjectionDLTFCL(currentMD, currentInc, currentAzm, 
//                                                   this.firstParam, this.secondParam, this.thirdParam);
//         } else if (this.modeBRTRCL) {
//             projection = this.projectionsService.getProjectionBRTRCL(currentMD, currentInc, currentAzm, 
//                                                   this.firstParam, this.secondParam, this.thirdParam);
//         } else if (this.modeIncAzmCL) {
//             projection = this.projectionsService.getProjectionIncAzmCL(currentMD, this.firstParam, this.secondParam, this.thirdParam);
//         }      

//         this.addProjection(projection['md'], projection['inc'], projection['azm']);
//     }

//     onProjectToBit() {

//     }

//     addProjection(md: number, inc: number, azm: number) {
//         this.mdValue = md;
//         this.incValue = inc;
//         this.azmValue = azm;

//         this.onAddUpdateSurveys(true);
//         this.surveyAddedUpdatePlots();        
//     }    

//     onDeleteProjections() {
//         this.surveysService.removeProjections();
//         this.surveyAddedUpdatePlots();
//     }

//     surveyAddedUpdatePlots() {
//         if (this.plotsMode) {
//             // this.plotsService.createSurveySpheres(this.surveys.length - 1);
//             this.plotsService.createSurveyPath();
//             this.plotsService.updateViewMD(this.surveysService.getLastSurveyMD());
//         }
//     }
//   }