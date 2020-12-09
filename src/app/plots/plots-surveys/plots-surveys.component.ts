import { Component, OnInit, OnDestroy } from "@angular/core";
import { SurveysComponent } from 'src/app/surveys/surveys.component';
import { SurveysService } from 'src/app/surveys/surveys.service';
import { SlideSeenService } from 'src/app/shared/slide-seen.service';
import { ApplicationStateService } from '../../shared/application-state.service';
import { MembersService } from 'src/app/shared/members.service';
import { PlotsService } from '../plots.service';
import { PlansService } from 'src/app/plans/plans.service';
import { SurveyMathService } from 'src/app/shared/survey-math.service';
import { ProjectionsService } from 'src/app/surveys/projections/projections.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-plots-surveys',
    templateUrl: './plots-surveys.component.html',
    styleUrls: ['../../shared/scroll-table.component.css']
})
export class PlotsSurveysComponent extends SurveysComponent implements OnInit, OnDestroy {
    projSphereShowingSub: Subscription;
    projSphereSub: Subscription;
    viewRL: boolean;
    viewMD: number = 0;
    viewDistance: number = 0;
    projSphere: boolean = false;
    plotsSurveysJustOpened = true;
    
    horView: boolean = false;
    perpView: boolean = false;
    vertView: boolean = false;   

    constructor(protected applicationStateService: ApplicationStateService,
                protected membersService: MembersService,
                protected plansService: PlansService,
                protected plotsService: PlotsService,
                protected projectionsService: ProjectionsService,
                protected slideSeenService: SlideSeenService,
                protected surveyMathService: SurveyMathService,
                protected surveysService: SurveysService,) {

                super(applicationStateService, membersService, projectionsService, slideSeenService, surveysService);
        
    }     

    ngOnInit() {
        super.ngOnInit();

        this.projSphereShowingSub = this.plotsService.projSphereShowing.subscribe(showing => {
            this.projSphere = showing;
        })

        this.projSphereSub = this.plotsService.projSphereChanged.subscribe(elevation => {
            this.updateProjection(elevation);
        })
        this.viewRL = this.plotsService.getViewRL();
        this.viewMD = this.plotsService.getViewMD();
        this.viewDistance = this.plotsService.getViewDistance();
        this.plotsSurveysJustOpened = false;
    }

    onSelectSurvey(index: number) {      
        if (index === this.edittedIndex) {
            if (this.vertView) {
                this.horView = true;
                this.vertView = false;
            } else if (this.horView) {
                this.perpView = true;
                this.horView = false;
            } else if (this.perpView) {
                this.vertView = true;
                this.perpView = false;
            }
        } else {
            this.horView = true;
            this.perpView = false;
            this.vertView = false;
        }    
        this.onEditSurvey(index);
        this.plotsService.updateView(this.horView, this.perpView, this.vertView);
        this.plotsService.updateViewMD(this.surveys[index].md);
    }

    onAddUpdatePlotsSurveys(projection: boolean = false) {
        // let newSurvey = !this.editMode;
        let currentIndex = this.edittedIndex;
        // this.onAddUpdateSurveys(projection);     
        this.onAddUpdateProject();   
        if (this.newSurveyRow) {
            this.surveysAddedUpdatePlots();
            this.onClearInput();
        } else {
            this.plotsService.updatePrimarySpheres(true, currentIndex, this.surveys.length - 1);
            this.plotsService.createSurveyPath();
            this.onSelectSurvey(currentIndex);
        }
    }

    onDeletePlotsSurvey() {
        let currentIndex = this.edittedIndex;        
        this.onDeleteSurvey();

        this.plotsService.updatePrimarySpheres(true, currentIndex, this.surveys.length);
        
        if (currentIndex = this.surveys.length) {
            currentIndex -= 1;
        } 
        
        let survMD = this.surveys[currentIndex].md
        if (currentIndex > 0) {
            survMD = this.surveys[currentIndex - 1].md;
        }
        this.plotsService.createSurveyPath(survMD);
        if (currentIndex < this.surveys.length) {
            this.onSelectSurvey(currentIndex);
        }
    }

    surveysAddedUpdatePlots() {
        this.plotsService.createSurveySpheres(this.surveys.length - 1);
        this.plotsService.createSurveyPath(this.surveys[this.surveys.length - 1].md);
        this.onSelectSurvey(this.surveys.length - 1);
    }

    onPSEnterKeyPressed() {
        if (this.okToAddUpdate) {
            this.onAddUpdatePlotsSurveys();
            this.firstParamElement.nativeElement.focus();
        } 
    }

    onPlotSurveysPaste(event: ClipboardEvent) {
        const startIndex = this.surveys.length;
        this.onPaste(event);        
        this.plotsService.createSurveySpheres(startIndex);        
        this.plotsService.createSurveyPath(this.surveys[startIndex].md);
        this.onSelectSurvey(this.surveys.length - 1);
    }

    closePlotsSurveys() {
        this.plotsService.onHidePlotsSurveys();
    }    

    onThirdParamChanged() {
        if (this.modeIncAzmTVD && this.projSphere) {
            this.plotsService.showProjSphere(this.thirdParam);
        }
    }

    onShowProjSphere() {
        if (this.projSphere) {
            if (!this.modeIncAzmTVD) {
                this.onProjectIncAzmTVD();
            }
            console.log('GotHere')
            console.log(this.thirdParam);
            if (this.thirdParam > 0) {
                this.plotsService.showProjSphere(this.thirdParam);
            }
        } else {
            this.plotsService.hideProjSphere();
        }
    }

    updateProjection(elevation: number) {
        if ((this.projSphere) && (!this.plotsSurveysJustOpened)) {            
            let inc = this.surveys[this.surveys.length - 1].inc;
            let azm = this.surveys[this.surveys.length - 1].azm;            
            let newTVD = this.surveys[this.surveys.length - 1].tvd + this.surveys[this.surveys.length - 1].elevation - elevation;
            
            if (this.surveys[this.surveys.length - 1].projection) {
                this.edittedIndex = this.surveys.length - 1;
                this.onDeletePlotsSurvey();

            } else {
                inc = this.firstParam
                azm = this.secondParam
                newTVD = Math.abs(elevation - this.surveyHeader['elevation']);
            }


            const projection = this.projectionsService.getProjectionIncAzmTVD(this.surveys[this.surveys.length - 1].md, 
                                                                            this.surveys[this.surveys.length - 1].inc,
                                                                            this.surveys[this.surveys.length - 1].azm,
                                                                            this.surveys[this.surveys.length - 1].tvd,
                                                                            inc, azm, newTVD);

            this.addProjection(projection['md'], projection['inc'], projection['azm']);
            this.surveysAddedUpdatePlots();
        }
    }

    onUpdateView(viewName: string) {
        this.horView = false;
        this.perpView = false;
        this.vertView = false;
        if (viewName === 'hor') {
            this.horView = true;
            this.plotsService.updateView(true, false, false)
        } else if (viewName === 'perp') {
            this.perpView = true;
            this.plotsService.updateView(false, true, false)
        } else if (viewName = 'vert') {
            this.vertView = true;
            this.plotsService.updateView(false, false, true)
        }
    }    

    onUpdateViewRightLeft() {
        this.plotsService.updateViewRightLeft(this.viewRL);
    }

    onUpdateViewMD() {
        this.plotsService.updateViewMD(this.viewMD);
    }

    onUpdateViewDistance() {
        this.plotsService.updateViewDistance(this.viewDistance);
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.projSphereShowingSub.unsubscribe();
        this.projSphereSub.unsubscribe();
    }
    
}