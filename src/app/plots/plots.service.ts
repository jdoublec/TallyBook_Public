import { Injectable, ElementRef } from '@angular/core';
import { SurveysService } from '../surveys/surveys.service';
import { IntPlans } from '../plans/plans.model';
import { TallyBookList, PlotList, SharedPlotData } from '../tally-book/new-tally-book/tally-book.model';
import { TallyBookService } from '../tally-book/new-tally-book/tally-book.service';
import { IntPlansList } from './plot-data.model';
import { Vector3, MeshBuilder, StandardMaterial, Color3, DynamicTexture, ActionManager, 
         ExecuteCodeAction, Mesh, Path3D, Curve3, PointerDragBehavior  } from '@babylonjs/core';
import { Control, Rectangle, TextBlock, StackPanel } from '@babylonjs/gui';
import { PlansService } from '../plans/plans.service';
import { Subject, BehaviorSubject } from 'rxjs';
import { IntSurveys } from '../surveys/surveys.model';
import { BHAService } from '../bha/bha.service';
import { SurveyMathService } from '../shared/survey-math.service';
import { SceneServiceAbstract } from './scene-service.abstract';
import { PlotsSettingsService } from './plots-settings/plots-settings.service';
import { TargetWindowsService } from './target-windows/target-windows.service';
import { TargetWindowsPath } from './target-windows/target-windows.model';
import { ActivitiesService } from '../activities/activities.service';
// import { MatPaginatedTabHeader } from '@angular/material/tabs/typings/paginated-tab-header';

@Injectable ({providedIn: 'root'})

export class PlotsService extends SceneServiceAbstract {   
    plotListChanged = new Subject<PlotList[]>();
    viewDistanceChanged = new Subject<number>();
    viewMDChanged = new Subject<number>();
    viewRLChanged = new BehaviorSubject<boolean>(true);
    showPlotsSurveys = new BehaviorSubject<boolean>(false);
    projSphereShowing = new BehaviorSubject<boolean>(false);
    projSphereChanged = new BehaviorSubject<number>(0);
    tallyBookList: TallyBookList;
    plotList: PlotList[] = [];    
    survPlanDivergePoint: number = 0;
    intPlansList: IntPlansList;
    connectionsMade: boolean = false;
    currentTallyBookName: string;
    tubeRadius: number = 0.25;     
    horView: boolean = false;
    perpView: boolean = false;
    vertView: boolean = false;
    viewRL: boolean = true;
    viewMD: number = 0;
    viewDist: number = 500;
    surveyBox = new Rectangle;    
    coord;    
    projSpherePos: Vector3;
    cameraPos: Vector3;

    
    sharedPlotData: SharedPlotData[] = [];    

    constructor(readonly activitiesService: ActivitiesService,
                readonly bhaService: BHAService,
                readonly targetWindowsService: TargetWindowsService,
                readonly plansService: PlansService,
                readonly surveyMathService: SurveyMathService,
                readonly plotsSettingsService: PlotsSettingsService,
                readonly surveysService: SurveysService,
                readonly tallyBookService: TallyBookService) {

                     super(surveyMathService)
                 }

    // setPlotsSettings(plotsSettings: PlotsSettings) {
    //     this.plotsSettings = plotsSettings;
    // }

    getViewRL() {
        return this.viewRL;
    }

    getViewDistance() {
        return this.viewDist;
    }

    getViewMD() {
        return this.viewMD;
    }

    onShowPlotsSurveys() {
        this.showPlotsSurveys.next(true);
    }

    onHidePlotsSurveys() {
        this.showPlotsSurveys.next(false);
    }
    
    setPlotList(plotList: PlotList[]) {
        if (plotList) {
            this.plotList = plotList;
            localStorage.setItem('plotList', JSON.stringify(this.plotList.slice()));
        }
    }

    getPlotList() {
        return this.plotList.slice();
    }

    setSharedPlotData(sharedPlotData: SharedPlotData[]){
        this.sharedPlotData = sharedPlotData;
    }

    updatePlotList(index: number, plotSurvey: boolean, plotPlan: boolean) {
        this.plotList[index].plotSurvey = plotSurvey;
        this.plotList[index].plotPlan = plotPlan;

        this.plotListChanged.next(this.plotList.slice());
    }

    createPlotList() {    
        let currentTallyBookName = this.tallyBookService.getCurrentTallyBookName();
        this.tallyBookList = this.tallyBookService.getTallyBookList();
        this.plotList = [];        
        Object.keys(this.tallyBookList).forEach(tallyBook => {
            let okToPlotSurvey: boolean = false;
            let okToPlotPlan: boolean = false;
            if (tallyBook !== currentTallyBookName) {                                     
                if ('plotSurveys' in this.tallyBookList[currentTallyBookName]) {
                okToPlotSurvey = Object.keys(this.tallyBookList[currentTallyBookName]['plotSurveys']).some(plotSurveyList => {
                                if (plotSurveyList === tallyBook) {
                                    return true;                                                    
                                }
                            });
                }
                if ('plotPlan' in this.tallyBookList[currentTallyBookName]) {
                okToPlotPlan = Object.keys(this.tallyBookList[currentTallyBookName]['plotPlan']).some(plotPlanList => {
                                if (plotPlanList === tallyBook) {
                                    return true;                                                    
                                }
                            });          
                }
                const plotTallyBook = new PlotList(tallyBook, okToPlotSurvey, okToPlotPlan);
                this.plotList.push(plotTallyBook);            
            } else {
                const plotTallyBook = new PlotList(tallyBook, true, true);
                this.plotList.push(plotTallyBook);     
            }
        });    
        this.plotListChanged.next(this.plotList.slice()); 
        return this.plotList.slice();
        // this.plotDataService.updateSharedPlotData(this.plotList, this.sharedPlotData);
        
    }      

    getCameraLocation(easting: number, elevation: number, northing: number) {

        const vsDir: number = this.surveysService.getVSDirection();

        let posX = easting - Math.sin(this.surveyMathService.degreesToRadians(vsDir)) * this.viewDist;
        let posY = elevation;
        let posZ = northing - Math.cos(this.surveyMathService.degreesToRadians(vsDir)) * this.viewDist;
        return new Vector3(posX, posY, posZ);
    }    
      
    createScene(canvas: ElementRef<HTMLCanvasElement>) {  
        if (!this.scene) {
            this.currentTallyBookName = this.tallyBookService.getCurrentTallyBookName();   

            super.createScene(canvas);
            // this.scene.blockfreeActiveMeshesAndRenderingGroups = true;

            const easting = this.surveysService.getEasting();
            const groundElevation = this.surveysService.getGroundElevation();
            const northing = this.surveysService.getNorthing();

            const groundboxLocation = new Vector3(easting, groundElevation, northing);

            const cameraLocation = this.getCameraLocation(easting, groundElevation, northing);           
            super.updateGroundbox(this.plotsSettingsService.getGroundboxName(), groundboxLocation);

            const skyboxElevation = groundElevation + 60000;
            const skyboxLocation = new Vector3(easting, skyboxElevation, northing);
            super.addSkybox('arid2', skyboxLocation);

            super.updateCamera(this.plotsSettingsService.getCameraSettings(), cameraLocation, groundboxLocation);
            
            super.updateLight();

            const axesElevation = this.surveysService.getElevation();
            const axesLocation = new Vector3(easting, axesElevation, northing);

            super.updateAxesViewer(50, axesLocation);

            
          
            this.survPlanDivergePoint = this.createSurveySpheres();
            this.createSurveyPath();
            this.createPlanSpheres();
            this.createPlanPath(); 
            this.createTargetWindows();
        
        } else {
        
            let plotSharedSurveys: boolean = false
            let plotSharedPlans: boolean = false;

            for (let i = 0; i < this.plotList.length; i++) {
                if (this.plotList[i].name !== this.currentTallyBookName) {
                    if (this.plotList[i].plotPlan) {
                        plotSharedPlans = true;
                    }
                    if (this.plotList[i].plotSurvey) {
                        plotSharedSurveys = true;
                    }
                }
            } 

            if (plotSharedPlans) {
                this.sharedPlotData.forEach((tallyBook: SharedPlotData) => { 
                    if ((tallyBook.plans !== undefined) && (tallyBook.type === 'plans')) {                  
                        let offsetIntPlans: IntPlans[] = tallyBook.plans;
                        this.createOffsetPlanSpheres(offsetIntPlans, tallyBook.name);
                        this.createOffsetPlanPath(offsetIntPlans, tallyBook.name);
                    }
                });
            }
            if (plotSharedSurveys) {
                this.sharedPlotData.forEach((tallyBook: SharedPlotData) => {
                    if ((tallyBook.surveys !== undefined) && (tallyBook.type === 'surveys')) {                 
                        let offsetIntSurveys: IntSurveys[] = tallyBook.surveys;
                        this.createOffsetSurveySpheres(offsetIntSurveys, tallyBook.name);
                        this.createOffsetSurveyPath(offsetIntSurveys, tallyBook.name);
                    }
                });
            }  
        }      
        // this.scene.blockfreeActiveMeshesAndRenderingGroups = false;         
    }    

    insertProjection(projectionPath: Curve3, start: Vector3, end: Vector3, tan1: Vector3, tan2: Vector3) {
        console.log(projectionPath);        
        let path = [];
        path.push(start);
        path.push(end);
        let HermiteSpline = MeshBuilder.CreateTube("hermite", { path: projectionPath.getPoints(), radius: 1 },  this.scene);
        let survPlotsPathMaterial = new StandardMaterial('hermite', this.scene);
            survPlotsPathMaterial.diffuseColor = Color3.Yellow();
            HermiteSpline.material = survPlotsPathMaterial;
        // HermiteSpline.position.x = projectionPath.getPoints()[0].x;
        // HermiteSpline.position.y = projectionPath.getPoints()[0].y;
        // HermiteSpline.position.z = projectionPath.getPoints()[0].z;
        // console.log(HermiteSpline.position);
        // this.camera.position.x = HermiteSpline.position.x;
        // this.camera.position.y = HermiteSpline.position.y;
        // this.camera.position.z = HermiteSpline.position.z;
    }

    createSurveySpheres(startIndex: number = 0) {  
        let clickSurvPoint = (event) => {    
            this.surveyBox = this.survPlanPointClicked(event, true, this.surveyBox);   
            this.adt.addControl(this.surveyBox);
            this.surveyBox.linkWithMesh(null);
            this.surveyBox.isVisible = true;
            this.surveyBox.linkWithMesh(event.meshUnderPointer);
            this.surveyBox.linkOffsetX = 200;             
        };

        let clickOffSurvPoint = () => {
            this.surveyBox.isVisible = false;
            this.surveyBox.linkWithMesh(null);
        }

        this.skybox.actionManager = new ActionManager(this.scene);
        this.skybox.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, clickOffSurvPoint));
        this.groundbox.actionManager = new ActionManager(this.scene);
        this.groundbox.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, clickOffSurvPoint));

        let surveys = this.surveysService.getSurveys();
        let survPlanDivergePoint = 0;
        for (let i = startIndex; i < surveys.length; i++) {
            const sphereDiameter = this.plotsSettingsService.getSphereDiameter();
            const sphereFont = 'bold ' + sphereDiameter + 'px monospace';
            const sphereColor = !surveys[i].projection ? this.plotsSettingsService.getSphereColor() : '#0275d8';
            const fontColor = !surveys[i].projection ? 'darkslategray' : 'linen'
            let sphereTexture = new DynamicTexture(this.currentTallyBookName, {width: 360, height: 360}, this.scene, false);
            sphereTexture.drawText('MD:' + surveys[i].md.toFixed(2), 220, 160, sphereFont, fontColor, sphereColor);
            sphereTexture.drawText('Inc:' + surveys[i].inc.toFixed(2), 220, 180, sphereFont, fontColor, 'transparent'); 
            sphereTexture.drawText('Azm:' + surveys[i].azm.toFixed(2), 220, 200, sphereFont, fontColor, 'transparent'); 
            sphereTexture.hasAlpha = true;
            
            let newSphere = MeshBuilder.CreateSphere(surveys[i].md.toString(), {diameter: sphereDiameter}, this.scene);
            let sphereMaterial = new StandardMaterial(this.currentTallyBookName, this.scene);                    
            sphereMaterial.diffuseTexture = sphereTexture;
            sphereMaterial.backFaceCulling = false;

            newSphere.id = this.currentTallyBookName + '_surv_sphere_' + i;
            
            newSphere.rotation.x = 3.14;                 
            newSphere.material = sphereMaterial;
            newSphere.position.x = surveys[i].easting;
            newSphere.position.y = surveys[i].elevation;
            newSphere.position.z = surveys[i].northing;
            newSphere.billboardMode = Mesh.BILLBOARDMODE_ALL;  

            

            newSphere.actionManager = new ActionManager(this.scene);
            newSphere.actionManager.registerAction(
                                            new ExecuteCodeAction(
                                                ActionManager.OnPickDownTrigger, clickSurvPoint));              
            
            if (survPlanDivergePoint === 0) {
                if (surveys[i].distPlan > 0) {
                    if (i > 0) {
                        survPlanDivergePoint = surveys[i - 1].md;
                    } else {
                        survPlanDivergePoint = surveys[0].md;
                    }
                } else if (i === (surveys.length - 1)) {
                    survPlanDivergePoint = surveys[surveys.length - 1].md;
                }
            }
        }

        return survPlanDivergePoint;

        surveys = [];
    }

    showProjSphere(tvd: number) {
        this.projSphereShowing.next(true);
        let mouseDownProjSphere = (event) => {    
            console.log('down Event')
            this.camera.inputs.remove(this.camera.inputs.attached.mouse);

        };

        let mouseUpProjSphere = (event) => {    
            console.log('up Event')
            this.camera.inputs.addMouse();  
            console.log(projSphere.position.y);
            this.projSphereChanged.next(projSphere.position.y);
        };

        console.log('projSphere Called')
        console.log(tvd);
        let intPlans = this.plansService.getIntPlans();
        let startVector = new Vector3();
        let path: Vector3[] = [];
        for (let i = intPlans.length - 1; i > 0; i--) {
            if ((intPlans[i - 1].tvd <= tvd) && (tvd <= intPlans[i].tvd)) {
                console.log('Vector Found @ ' + intPlans[i].md);
                startVector = new Vector3(intPlans[i].easting, intPlans[i].elevation, intPlans[i].northing);
                console.log(startVector);
                path.push(new Vector3(intPlans[i].easting, intPlans[i].elevation, intPlans[i].northing));
                path.push(new Vector3(intPlans[i - 1].easting, intPlans[i - 1].elevation, intPlans[i - 1].northing));
                break;
            }
        }

        let path3d;        
        let tangents;
        let normals;
        let binormals;
        if (path.length > 0) {
            // path3d = new Path3D(path, new Vector3(0, 1, 0));
            path3d = new Path3D(path);
            tangents = path3d.getTangents();
            // path3d.update(path, tangents[1])
            normals = path3d.getNormals();
            binormals = path3d.getBinormals();
        }

        let projSphere = MeshBuilder.CreateSphere('Proj_Sphere', { diameter: 50, updatable: true }, this.scene);

        projSphere.position.x = startVector.x;
        projSphere.position.y = startVector.y;
        projSphere.position.z = startVector.z;

        this.projSpherePos = projSphere.position;
        this.cameraPos = this.scene.activeCamera.position;
        
        const sphereDiameter = this.plotsSettingsService.getSphereDiameter();
        const sphereFont = 'bold ' + sphereDiameter + 'px monospace';
        
        let sphereTexture = new DynamicTexture(this.currentTallyBookName, {width: 360, height: 360}, this.scene, false);
        sphereTexture.drawText('Test', 220, 180, sphereFont, 'linen', 'purple');
        sphereTexture.hasAlpha = true;
        let sphereMaterial = new StandardMaterial('projSphereMat', this.scene); 
        sphereMaterial.diffuseTexture = sphereTexture;
        sphereMaterial.backFaceCulling = false;      
        // sphereMaterial.diffuseColor = Color3.Purple();  
        projSphere.material = sphereMaterial;
        projSphere.billboardMode = Mesh.BILLBOARDMODE_ALL;  

        projSphere.actionManager = new ActionManager(this.scene);
        projSphere.actionManager.registerAction(
                                        new ExecuteCodeAction(
                                            ActionManager.OnPickDownTrigger, mouseDownProjSphere));
        projSphere.actionManager.registerAction(
                                        new ExecuteCodeAction(
                                            ActionManager.OnPickUpTrigger, mouseUpProjSphere));

        let pointerDragBehavior = new PointerDragBehavior({dragAxis: normals[1]});
       

        // Use drag plane in world space
        pointerDragBehavior.useObjectOrienationForDragging = false;

        // Listen to drag events
        pointerDragBehavior.onDragStartObservable.add((event)=>{
            // console.log("dragStart");
            // console.log(event);
        })
        pointerDragBehavior.onDragObservable.add((event)=>{
            // console.log("drag");
            // console.log(event);
        })
        pointerDragBehavior.onDragEndObservable.add((event)=>{
            // console.log("dragEnd");
            // console.log(event);
        })

        projSphere.addBehavior(pointerDragBehavior);

        this.coord = {easting: startVector.x, elevation: startVector.y, northing: startVector.z};     
        if (!this.horView && !this.perpView && !this.vertView) {
            if (this.viewRL) {
                this.showPerpViewLeft();
            } else {
                this.showPerpViewRight();
            }
        } else {
            this.showView();
        } 
    }

    hideProjSphere() {
        if (this.scene.getMeshByName('Proj_Sphere')) {
            this.scene.getMeshByName('Proj_Sphere').dispose();
        }
        this.projSphereShowing.next(false);
    }

    createSurveyPath(startMD: number = 0) {                
        let intSurveys = this.surveysService.getIntSurveys(); 
        let slides = this.activitiesService.getFilteredActivities('Sliding', null, null);
        let bhas = this.bhaService.getBHADepths();      
        // let start: number = 0;
        const wellRatio: number = this.plotsSettingsService.getWellRatio();
        let bhasLength = bhas.length;
        let bhasFound = true;        

        if (bhasLength === 0) {
            bhasFound = false;
            bhasLength = 1;
        }
        let slideStart: number = 0;
        let slideEnd: number = 0;
        let slidesIndex: number = 0;
        let newSlideFound: boolean = false;        

        let startIndex: number = 0;        
        let meshStartingMD: number = Infinity;

        for (let mesh of this.scene.meshes) {
            if (mesh.name.includes(this.currentTallyBookName + '_surv_path_')) {
                let staticStrLength: number = (this.currentTallyBookName + '_surv_path_').length                
               
                let meshEndMD = +mesh.name.substring(staticStrLength, mesh.name.length - staticStrLength);                
                if (meshEndMD >= startMD) {
                    meshStartingMD = +mesh.id < meshStartingMD ? +mesh.id : meshStartingMD;
                    mesh.dispose();
                }
            }
        }

        if (meshStartingMD < Infinity) {
            for (let i = intSurveys.length - 1; i >= 0; i--) {
                if (intSurveys[i].md <= meshStartingMD) {
                    startIndex = i;
                    break;
                }
            }
        

            if (slidesIndex < slides.length) {
                for (let i = 0; i < slides.length; i++) {
                    slideStart = slides[slidesIndex].startDepth;
                    slideEnd = slides[slidesIndex].endDepth;
                    if (slideEnd > intSurveys[startIndex].md) {
                        break;
                    }
                }
            }
        }

        for (let i = 0; i < bhasLength; i++) {
            let sectionRadius: number = 1;            
            let bhaName: string = '1';
            let pathStartMD: number = 0;
            let pathEndMD: number = 0;
            if (bhasFound) {
                bhaName = bhas[i].name;
                bhas[i].size / 24;            
            }

            // if (this.scene.getMeshByName(this.currentTallyBookName + '_surv_path_' + bhaName + '_' + meshIndex)) {
            //     this.scene.getMeshByName(this.currentTallyBookName + '_surv_path_' + bhaName + '_' + meshIndex).dispose();
            // }
            
            let section: {easting: number, elevation: number, northing: number}[] = [];    

            

            for (let j = startIndex; j < intSurveys.length; j++) {
                if ((!bhasFound) || (intSurveys[j].md <= bhas[i].endDepth) || (i === (bhas.length - 1))) {
                    if ((slideStart <= intSurveys[j].md) && (intSurveys[j].md <= slideEnd)) {
                        newSlideFound = true;
                        section.push( { easting: intSurveys[j].easting, elevation: intSurveys[j].elevation, northing: intSurveys[j].northing });                        
                        pathEndMD = intSurveys[j].md;
                    } else if (!newSlideFound) {
                        section.push( { easting: intSurveys[j].easting, elevation: intSurveys[j].elevation, northing: intSurveys[j].northing });
                        pathEndMD = intSurveys[j].md;
                        if (j < (intSurveys.length - 1)) {
                            if (slideStart <= intSurveys[j + 1].md) {
                                if (section.length > 0) {
                                    section.push( { easting: intSurveys[j + 1].easting, elevation: intSurveys[j + 1].elevation, northing: intSurveys[j + 1].northing });
                                    pathEndMD = intSurveys[j + 1].md;
                                }
                                startIndex = j + 1;
                                if (intSurveys[j].md < bhas[i].endDepth) {
                                    i -= 1;
                                }                        
                                break;
                            }
                        }
                    } else {       
                        if (slidesIndex < (slides.length - 1)) {
                            slidesIndex += 1;
                            slideStart = slides[slidesIndex].startDepth;
                            slideEnd = slides[slidesIndex].endDepth;
                        }                
                        if (section.length > 0) {
                            section.push( { easting: intSurveys[j].easting, elevation: intSurveys[j].elevation, northing: intSurveys[j].northing });
                            pathEndMD = intSurveys[j].md;
                        }
                        startIndex = j;
                        if (intSurveys[j].md < bhas[i].endDepth) {
                            i -= 1;
                        }
                        break;
                    }
                } else {    
                    if (section.length > 0) {
                        if (j < (intSurveys.length - 1)){
                            section.push( { easting: intSurveys[j + 1].easting, elevation: intSurveys[j + 1].elevation, northing: intSurveys[j + 1].northing });
                            pathEndMD = intSurveys[j + 1].md;
                        }
                    }
                    startIndex = j + 1;
                    if (intSurveys[j].md < bhas[i].endDepth) {
                        i -= 1;
                    }
                    break;
                }
            }

            if (section.length > 1) {
                let survPlotsPath = MeshBuilder.CreateTube(this.currentTallyBookName + '_surv_path_' + bhaName + '_' + pathEndMD, {path: section.map(vector => {
                                                return new Vector3(vector.easting, vector.elevation, vector.northing);
                                                                            }), radius: sectionRadius * wellRatio, updatable: true }, this.scene);      
                    
                let wellPathColor: string;
                if (!newSlideFound) {          
                    wellPathColor = this.plotsSettingsService.getWellColor();
                } else {                
                    newSlideFound = false;  
                    wellPathColor = '#FF0000';
                }                

                let survPlotsPathMaterial = new StandardMaterial(this.currentTallyBookName + '_surv_mat_' + bhaName + '_' + pathEndMD, this.scene);
                survPlotsPathMaterial.diffuseColor = Color3.FromHexString(wellPathColor);
                survPlotsPath.material = survPlotsPathMaterial;
                
                survPlotsPath.id = pathStartMD.toString();

            }

            pathStartMD = pathEndMD;
            
        }        

        intSurveys = []; 
        bhas = [];
        slides = [];
    }
    
    createPlanSpheres(startIndex: number = 0) {
        let clickPlanPoint = (event) => {  
            this.surveyBox = this.survPlanPointClicked(event, false, this.surveyBox);   
            this.adt.addControl(this.surveyBox);
            this.surveyBox.linkWithMesh(null);
            this.surveyBox.linkWithMesh(event.meshUnderPointer);
            this.surveyBox.isVisible = true;
            this.surveyBox.linkOffsetX = 200;             
        };

        let clickOffPlanPoint = () => {
            this.surveyBox.isVisible = false;
            this.surveyBox.linkWithMesh(null);
        }

        this.skybox.actionManager = new ActionManager(this.scene);
        this.skybox.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, clickOffPlanPoint));
        this.groundbox.actionManager = new ActionManager(this.scene);
        this.groundbox.actionManager.registerAction(new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, clickOffPlanPoint));

        let plans = this.plansService.getPlans();           
            
        for (let i = startIndex; i < plans.length; i++) {
            if (plans[i].md >= this.survPlanDivergePoint) {
                const sphereDiameter = this.plotsSettingsService.getSphereDiameter();
                const sphereFont = 'bold ' + sphereDiameter + 'px monospace';
                const sphereColor = this.plotsSettingsService.getSphereColor();
                let sphereTexture = new DynamicTexture(this.currentTallyBookName, {width: 360, height: 360}, this.scene, false);
                sphereTexture.drawText('MD:' + plans[i].md.toFixed(2), 220, 160, sphereFont, 'darkslategray', sphereColor);
                sphereTexture.drawText('Inc:' + plans[i].inc.toFixed(2), 220, 180, sphereFont, 'darkslategray', 'transparent'); 
                sphereTexture.drawText('Azm:' + plans[i].azm.toFixed(2), 220, 200, sphereFont, 'darkslategray', 'transparent'); 
                sphereTexture.hasAlpha = true;
                
                let newSphere = MeshBuilder.CreateSphere(plans[i].md.toString(), {diameter: sphereDiameter}, this.scene);
                let sphereMaterial = new StandardMaterial(this.currentTallyBookName, this.scene);                    
                sphereMaterial.diffuseTexture = sphereTexture;
                sphereMaterial.backFaceCulling = false;

                newSphere.id = this.currentTallyBookName + '_plan_sphere_' + i;
                
                newSphere.rotation.x = 3.14;                 
                newSphere.material = sphereMaterial;
                newSphere.position.x = plans[i].easting;
                newSphere.position.y = plans[i].elevation;
                newSphere.position.z = plans[i].northing;
                newSphere.billboardMode = Mesh.BILLBOARDMODE_ALL;  

                newSphere.actionManager = new ActionManager(this.scene);
                newSphere.actionManager.registerAction(
                        new ExecuteCodeAction(
                            ActionManager.OnPickDownTrigger, clickPlanPoint));    
            }     
        } 

        plans = [];    
    }

    createPlanPath() {     
        if (this.scene.getMeshByName(this.currentTallyBookName + '_Plans_Path')) {
            this.scene.getMeshByName(this.currentTallyBookName + '_Plans_Path').dispose();
        }
        let intPlans = this.plansService.getIntPlans(this.survPlanDivergePoint);
        let plansPlotsPath = MeshBuilder.CreateTube(this.currentTallyBookName + '_Plans_Path', {path: intPlans.map(vector => {
            return new Vector3(vector.easting, vector.elevation, vector.northing);
                                        }), radius: 1, updatable: true }, this.scene);     
        
        let plansPlotsPathMaterial = new StandardMaterial(this.currentTallyBookName + '_Plans_Mat', this.scene);
        plansPlotsPathMaterial.diffuseColor = Color3.Green();
        plansPlotsPath.material = plansPlotsPathMaterial;

        intPlans = [];             
    }    

    updatePrimarySpheres(survey: boolean, startIndex: number, endIndex: number) {
        let id: string;
        if (survey) {
            id = this.currentTallyBookName + '_surv_sphere_';
        } else {
            id = this.currentTallyBookName + '_plan_sphere_';
        }

        for (let i = startIndex; i <= endIndex; i++) {
            if (this.scene.getMeshByID(id + i)) {
                this.scene.getMeshByID(id + i).dispose();
            }
        }

        if (survey) {
            this.createSurveySpheres(startIndex);
        } else {
            this.createPlanSpheres(startIndex);
        }
    }

    createTargetWindows() {
        if (this.scene.getMeshByName('line45')) {
            this.scene.getMeshByName('line45').dispose();
        }
        if (this.scene.getMeshByName('line135')) {
            this.scene.getMeshByName('line135').dispose();
        }
        if (this.scene.getMeshByName('line225')) {
            this.scene.getMeshByName('line225').dispose();
        }
        if (this.scene.getMeshByName('line315')) {
            this.scene.getMeshByName('line315').dispose();
        }
        if (this.scene.getMeshByName('windowBottom')) {
            this.scene.getMeshByName('windowBottom').dispose();
        }
        if (this.scene.getMeshByName('windowRight')) {
            this.scene.getMeshByName('windowRight').dispose();
        }
        if (this.scene.getMeshByName('windowTop')) {
            this.scene.getMeshByName('windowTop').dispose();
        }
        if (this.scene.getMeshByName('windowLeft')) {
            this.scene.getMeshByName('windowLeft').dispose();
        }

        let intPlans = this.plansService.getIntPlans(this.survPlanDivergePoint);
        let targetWindows = this.targetWindowsService.getTargetWindows(); 
        let startIndex: number = 0;                 
        let targetWindowsPath: TargetWindowsPath[] = [];
        let currentInc = intPlans[0].inc;
        let prevInc = -1;
        let currentAzm = intPlans[0].azm;
        let prevAzm = -1;
        let increment = 1;

        for (let i = 0; i < targetWindows.length; i++) {
            let targetStartDepth: number = targetWindows[i].startDepth;
            if (targetWindows[i].endDepth > this.survPlanDivergePoint) {
                if (targetStartDepth < this.survPlanDivergePoint) {                
                    targetStartDepth = this.survPlanDivergePoint;
                } 
                for (let j = startIndex; j < intPlans.length; j = j + increment) {  
                    if ((targetStartDepth <= intPlans[j].md) && (intPlans[j].md <= targetWindows[i].endDepth)) {    
                        currentInc = intPlans[j].inc;                                          
                        currentAzm = intPlans[j].azm;
                        if ((currentInc !== prevInc) || (currentAzm !== prevAzm) || (j === (intPlans.length - 1)) || 
                            (targetStartDepth === intPlans[j].md) || (intPlans[j].md === targetWindows[i].endDepth)) {
                            targetWindowsPath.push( new TargetWindowsPath( i, intPlans[j].md, new Vector3(intPlans[j].easting, intPlans[j].elevation, intPlans[j].northing) ));                                    
                        }
                        
                        prevInc = currentInc;
                        prevAzm = currentAzm;

                        if ((targetWindows[i].endDepth === intPlans[j].md) || (j === (intPlans.length - 1))) {
                            startIndex = j;
                            increment = 1;
                            break;
                        } 
                    } else if (targetWindows[i].endDepth < intPlans[j].md) {
                        if ((j > 0) && (intPlans[j - increment].md !== targetWindowsPath[targetWindowsPath.length - 1].md)) {
                            targetWindowsPath.push( new TargetWindowsPath( i, intPlans[j - increment].md, new Vector3(intPlans[j - increment].easting, intPlans[j - increment].elevation, intPlans[j - increment].northing) ));
                        }

                        if (i < (targetWindows.length - 1)) {
                            startIndex = j;
                            prevInc = -1;
                            prevAzm = -1;
                            increment = 1;
                            break;
                        } else {
                            break;  
                        }
                    }

                    if (j < (intPlans.length - 21)) {
                        if (((currentInc !== intPlans[j + 20].inc)) || ((currentAzm !== intPlans[j + 20].azm))) {
                            increment = 20;
                        } else {
                            increment = 1;
                        }
                    } else {
                        increment = 1;
                    }
                }                
            }      
                
        } 
        
        if (targetWindowsPath.length > 0) {
            this.createTargetWindowsPath(targetWindowsPath);
        }
        
    }
        
    private createTargetWindowsPath(targetWindowsPath: TargetWindowsPath[]) {
        let targetWindows = this.targetWindowsService.getTargetWindows();        
        let path3d = new Path3D(targetWindowsPath.map(path => {return path.location}), new Vector3(0, -1, 0));
        let startIndex = 0;
        let pathLength = targetWindowsPath.length;
        let targetStartDepth = 0;

        // let vcNorm45;

        let points45 = [];
        let points135 = [];
        let points225 = [];
        let points315 = [];        

        let point = 0; 
        for (var i = startIndex; i < pathLength; i++) {   
            let curve = path3d.getCurve();
            let tangents = path3d.getTangents();        
            let norms = path3d.getNormals();                  
            const targetIndex = targetWindowsPath[0].targetIndex;
            const brSize = Math.sqrt(Math.pow(targetWindows[targetIndex].below, 2) + Math.pow(targetWindows[targetIndex].right, 2));
            const brAngle = Math.atan(targetWindows[targetIndex].right / targetWindows[targetIndex].below);
            const arSize = Math.sqrt(Math.pow(targetWindows[targetIndex].above, 2) + Math.pow(targetWindows[targetIndex].right, 2));
            const arAngle = this.surveyMathService.degreesToRadians(180) - Math.atan(targetWindows[targetIndex].right / targetWindows[targetIndex].above);
            const alSize = Math.sqrt(Math.pow(targetWindows[targetIndex].above, 2) + Math.pow(targetWindows[targetIndex].left, 2));
            const alAngle = this.surveyMathService.degreesToRadians(180) + Math.atan(targetWindows[targetIndex].left / targetWindows[targetIndex].above);
            const blSize = Math.sqrt(Math.pow(targetWindows[targetIndex].below, 2) + Math.pow(targetWindows[targetIndex].left, 2));
            const blAngle = this.surveyMathService.degreesToRadians(360) - Math.atan(targetWindows[targetIndex].left / targetWindows[targetIndex].below);     

            targetStartDepth = targetWindows[targetIndex].startDepth;

            const pivotAxis = tangents[point].normalize();
            const pivotPoint = curve[point];

            let boxPos45, boxPos135, boxPos225, boxPos315;
            boxPos45 = curve[point].add(norms[point].scale(brSize));         
            boxPos135 = curve[point].add(norms[point].scale(arSize));
            boxPos225 = curve[point].add(norms[point].scale(alSize));
            boxPos315 = curve[point].add(norms[point].scale(blSize));
            
            let box45 = Mesh.CreateBox('box45'+i, 1, this.scene);
            box45.position = boxPos45;
            box45.rotateAround(pivotPoint, pivotAxis, brAngle);
            points45.push(box45.position);    
            box45.dispose();

            let box135 = Mesh.CreateBox('box135'+i, 1, this.scene);
            box135.position = boxPos135;
            box135.rotateAround(pivotPoint, pivotAxis, arAngle);
            points135.push(box135.position);
            box135.dispose();
            
            let box225 = Mesh.CreateBox('box225'+i, 1, this.scene);
            box225.position = boxPos225;
            box225.rotateAround(pivotPoint, pivotAxis, alAngle);
            points225.push(box225.position);
            box225.dispose();

            let box315 = Mesh.CreateBox('box315'+i, 1, this.scene);
            box315.position = boxPos315;
            box315.rotateAround(pivotPoint, pivotAxis, blAngle);
            points315.push(box315.position);
            box315.dispose();

            // vcNorm45 = MeshBuilder.CreateLines("norm"+i, { points: [curve[point], curve[point].add(norms[point].scale(brSize))] }, this.scene);
            
            if (i < (pathLength - 2)) {
                targetWindowsPath.splice(0, 1);
                path3d.update(targetWindowsPath.map(path => {return path.location}), new Vector3(0, -1, 0));
            } else {                
                point = 1;
            }
        }
        
        let line45 = MeshBuilder.CreateLines('line45', { points: points45 }, this.scene);
        let line135 = MeshBuilder.CreateLines('line135', { points: points135 }, this.scene);
        let line225 = MeshBuilder.CreateLines('line225', { points: points225 }, this.scene);
        let line315 = MeshBuilder.CreateLines('line315', { points: points315 }, this.scene);

        line45.color = Color3.White();
        line135.color = Color3.White();
        line225.color = Color3.White();
        line315.color = Color3.White();       

        let windowMaterial = new StandardMaterial(this.currentTallyBookName + '_Window_Mat', this.scene);
        windowMaterial.diffuseColor = Color3.White();
        windowMaterial.backFaceCulling = false;
        windowMaterial.alpha = 0.2;

        let windowBottom = MeshBuilder.CreateRibbon('windowBottom', { pathArray: [ points315, points45 ] }, this.scene);
        windowBottom.material = windowMaterial;
        windowBottom.isPickable = false;

        let windowRight = MeshBuilder.CreateRibbon('windowRight', { pathArray: [ points45, points135 ] }, this.scene);
        windowRight.material = windowMaterial;
        windowRight.isPickable = false;

        let windowTop = MeshBuilder.CreateRibbon('windowTop', { pathArray: [ points135, points225 ] }, this.scene);
        windowTop.material = windowMaterial;
        windowTop.isPickable = false;

        let windowLeft = MeshBuilder.CreateRibbon('windowLeft', { pathArray: [ points225, points315 ] }, this.scene);
        windowLeft.material = windowMaterial;
        windowLeft.isPickable = false;         
    }

    createOffsetPlanSpheres(offsetIntPlans: IntPlans[], tallyBookName: string) {
        for (let i = 0; i < offsetIntPlans.length; i++) {                        
            if (!offsetIntPlans[i].intValue) {
                const sphereDiameter = this.plotsSettingsService.getSphereDiameter();
                const sphereFont = 'bold ' + sphereDiameter + 'px monospace';
                const sphereColor = this.plotsSettingsService.getSphereColor();
                let sphereTexture = new DynamicTexture(tallyBookName, {width: 360, height: 360}, this.scene, false);
                sphereTexture.drawText('MD:' + offsetIntPlans[i].md.toFixed(2), 220, 160, sphereFont, 'darkslategray', sphereColor);
                sphereTexture.drawText('Inc:' + offsetIntPlans[i].inc.toFixed(2), 220, 180, sphereFont, 'darkslategray', 'transparent'); 
                sphereTexture.drawText('Azm:' + offsetIntPlans[i].azm.toFixed(2), 220, 200, sphereFont, 'darkslategray', 'transparent'); 
                sphereTexture.hasAlpha = true;
                
                let newSphere = MeshBuilder.CreateSphere(offsetIntPlans[i].md.toString(), {diameter: sphereDiameter}, this.scene);
                let sphereMaterial = new StandardMaterial(tallyBookName, this.scene);                    
                sphereMaterial.diffuseTexture = sphereTexture;
                sphereMaterial.backFaceCulling = false;                                
                
                newSphere.id = tallyBookName + '_plan_sphere_' + i;

                newSphere.rotation.x = 3.14;                 
                newSphere.material = sphereMaterial;
                newSphere.position.x = offsetIntPlans[i].easting;
                newSphere.position.y = offsetIntPlans[i].elevation;
                newSphere.position.z = offsetIntPlans[i].northing;
                newSphere.billboardMode = Mesh.BILLBOARDMODE_ALL;  

                // newSphere.actionManager = new ActionManager(this.scene);
                // newSphere.actionManager.registerAction(
                //         new ExecuteCodeAction(
                //             ActionManager.OnPickDownTrigger, clickPlanPoint));    
            }               
        }             
    }

    createOffsetPlanPath(offsetIntPlans: IntPlans[], tallyBookName: string) {
        let plansPlotPath = MeshBuilder.CreateLines(tallyBookName + '_Plan_Line', { points: offsetIntPlans.map(plan => {
            return new Vector3(plan.easting, plan.elevation, plan.northing)
        }), updatable: true }, this.scene);
        plansPlotPath.color = Color3.Green();           
    }

    createOffsetSurveySpheres(offsetIntSurveys: IntSurveys[], tallyBookName: string) {
        for (let i = 0; i < offsetIntSurveys.length; i++) {                        
            if (!offsetIntSurveys[i].intValue) {
                const sphereDiameter = this.plotsSettingsService.getSphereDiameter();
                const sphereFont = 'bold ' + sphereDiameter + 'px monospace';
                const sphereColor = this.plotsSettingsService.getSphereColor();
                let sphereTexture = new DynamicTexture(tallyBookName, {width: 360, height: 360}, this.scene, false);
                sphereTexture.drawText('MD:' + offsetIntSurveys[i].md.toString(), 220, 160, sphereFont, 'darkslategray', sphereColor);
                sphereTexture.drawText('Inc:' + offsetIntSurveys[i].inc.toString(), 220, 180, sphereFont, 'darkslategray', 'transparent'); 
                sphereTexture.drawText('Azm:' + offsetIntSurveys[i].azm.toString(), 220, 200, sphereFont, 'darkslategray', 'transparent'); 
                sphereTexture.hasAlpha = true;
                
                let newSphere = MeshBuilder.CreateSphere(offsetIntSurveys[i].md.toString(), {diameter: sphereDiameter}, this.scene);
                let sphereMaterial = new StandardMaterial(tallyBookName, this.scene);                    
                sphereMaterial.diffuseTexture = sphereTexture;
                sphereMaterial.backFaceCulling = false;

                newSphere.id = tallyBookName + '_surv_sphere_' + i;
                
                newSphere.rotation.x = 3.14;                 
                newSphere.material = sphereMaterial;
                newSphere.position.x = offsetIntSurveys[i].easting;
                newSphere.position.y = offsetIntSurveys[i].elevation;
                newSphere.position.z = offsetIntSurveys[i].northing;
                newSphere.billboardMode = Mesh.BILLBOARDMODE_ALL;  

                // newSphere.actionManager = new ActionManager(this.scene);
                // newSphere.actionManager.registerAction(
                //         new ExecuteCodeAction(
                //             ActionManager.OnPickDownTrigger, clickPlanPoint));    
            }               
        }
    }

    createOffsetSurveyPath(offsetIntSurveys: IntSurveys[], tallyBookName: string) {
        let plansPlotPath = MeshBuilder.CreateLines(tallyBookName + '_Surveys_Line', { points: offsetIntSurveys.map(survey => {
            return new Vector3(survey.easting, survey.elevation, survey.northing)
         }), updatable: true }, this.scene);
        plansPlotPath.color = Color3.Blue();     
    }

    // updateCameraSpeed(speed: number) {
    //     this.camera.speed = speed;
    // }

    updateSphereSettings() {
        for (let i = this.scene.meshes.length - 1; i >= 0; i--) {
            if (this.scene.meshes[i].id.includes('sphere')) {
                this.scene.meshes[i].dispose();
            }
        }
        this.survPlanDivergePoint =this.createSurveySpheres();
        this.createPlanSpheres();

        let plotSharedSurveys: boolean = false
            let plotSharedPlans: boolean = false;

            for (let i = 0; i < this.plotList.length; i++) {
                if (this.plotList[i].name !== this.currentTallyBookName) {
                    if (this.plotList[i].plotPlan) {
                        plotSharedPlans = true;
                    }
                    if (this.plotList[i].plotSurvey) {
                        plotSharedSurveys = true;
                    }
                }
            } 

            if (plotSharedPlans) {
                this.sharedPlotData.forEach((tallyBook: SharedPlotData) => { 
                    if ((tallyBook.plans !== undefined) && (tallyBook.type === 'plans')) {                  
                        let offsetIntPlans: IntPlans[] = tallyBook.plans;
                        this.createOffsetPlanSpheres(offsetIntPlans, tallyBook.name);
                    }
                });
            }
            if (plotSharedSurveys) {
                this.sharedPlotData.forEach((tallyBook: SharedPlotData) => {
                    if ((tallyBook.surveys !== undefined) && (tallyBook.type === 'surveys')) {                 
                        let offsetIntSurveys: IntSurveys[] = tallyBook.surveys;
                        this.createOffsetSurveySpheres(offsetIntSurveys, tallyBook.name);
                    }
                });
            }  
    }

    updateWellPathSettings() {
        // const wellPathColor = this.plotsSettingsService.getWellColor();        
        // let bhas = this.bhaService.getBHADepths();     
        // const wellRatio: number = this.plotsSettingsService.getWellRatio();        

        // let getRadius = () => {
        //     return 10;
        // };
        // for (let j = 0; j < bhas.length; j++) {            
        //     const sectionRadius: number = bhas[j].size / 24;                       
        //     const newScale = sectionRadius * wellRatio;
        //     console.log('New Scale ' + newScale);
                                            
        //     const wellPathColor = this.plotsSettingsService.getWellColor();
        //     let survPlotsPathMaterial = new StandardMaterial(this.currentTallyBookName + '_' + bhas[j].name + '_Surveys_Mat', this.scene);
        //     survPlotsPathMaterial.diffuseColor = Color3.FromHexString(wellPathColor);     
        //     this.scene.getMeshByName(this.currentTallyBookName + '_' + bhas[j].name + '_Surveys_Path').material = survPlotsPathMaterial;
        //     let newTube = this.scene.getMeshByName(this.currentTallyBookName + '_' + bhas[j].name + '_Surveys_Path');
        //     newTube = MeshBuilder.CreateTube(null, {path:null, radiusFunction: getRadius }, this.scene);
        //     // this.scene.getMeshByName(this.currentTallyBookName + '_' + bhas[j].name + '_Surveys_Path') = changedTube;
        // }
    }

    updatePlanPathSettings() {
        const planPathColor = this.plotsSettingsService.getPlanColor();
        let planPlotsPathMaterial = new StandardMaterial(this.currentTallyBookName + '_Plans_Mat', this.scene);
        planPlotsPathMaterial.diffuseColor = Color3.FromHexString(planPathColor);
        this.scene.getMeshByName(this.currentTallyBookName + '_Plans_Path').material = planPlotsPathMaterial;
    }

    updateCoord(mdValue: number) {
        this.coord = this.surveysService.getCoord(mdValue);
    }

    updateView(horizontalView: boolean, perpendicularView: boolean, verticalView: boolean) {
        this.horView = horizontalView;
        this.perpView = perpendicularView;
        this.vertView = verticalView;
        
        this.showView();
    }

    updateViewMD(viewMD: number) {
        if (!this.horView && !this.perpView && !this.vertView) {
            this.horView = true;            
        }
        this.viewMD = viewMD;
        this.updateCoord(viewMD);
        this.showView();
        this.viewMDChanged.next(this.viewMD);
    }

    updateViewDistance(viewDist: number) {
        this.viewDist = viewDist;
        this.showView();
        this.viewDistanceChanged.next(this.viewDist);
    }

    updateViewRightLeft(right: boolean) {
        this.viewRL = right;
        this.showView();
        this.viewRLChanged.next(this.viewRL);
    }

    showView() {                
        this.horView ? (this.viewRL ? this.showHorViewRight() : this.showHorViewLeft()) : null;        
        this.perpView ? (this.viewRL ? this.showPerpViewRight() : this.showPerpViewLeft()) : null;        
        this.vertView ? this.showVertViewTop() : null;     
    }

    showHorViewRight() {
        const vsDir: number = this.surveysService.getVSDirection();
        const easting = this.coord.easting;
        const elevation = this.coord.elevation;
        const northing = this.coord.northing;
        const newEasting = easting + (Math.cos(this.surveyMathService.degreesToRadians(vsDir)) * this.viewDist);
        const newNorthing = northing - (Math.sin(this.surveyMathService.degreesToRadians(vsDir)) * this.viewDist);
        this.camera.position.x = newEasting;
        this.camera.position.y = elevation;
        this.camera.position.z = newNorthing;
        this.camera.setTarget(new Vector3(easting, elevation, northing));
    }

    showHorViewLeft() {
        const vsDir: number = this.surveysService.getVSDirection();
        const easting = this.coord.easting;
        const elevation = this.coord.elevation;
        const northing = this.coord.northing;
        const newEasting = easting - (Math.cos(this.surveyMathService.degreesToRadians(vsDir)) * this.viewDist);
        const newNorthing = northing + (Math.sin(this.surveyMathService.degreesToRadians(vsDir)) * this.viewDist);
        this.camera.position.x = newEasting;
        this.camera.position.y = elevation;
        this.camera.position.z = newNorthing;
        this.camera.setTarget(new Vector3(easting, elevation, northing));
    }

    showPerpViewRight() {        
        const azm: number = this.surveysService.getAzm(this.viewMD);
        const easting = this.coord.easting;
        const elevation = this.coord.elevation;
        const northing = this.coord.northing;
        const newEasting = easting + (Math.cos(this.surveyMathService.degreesToRadians(azm)) * this.viewDist);
        const newNorthing = northing - (Math.sin(this.surveyMathService.degreesToRadians(azm)) * this.viewDist);
        this.camera.position.x = newEasting;
        this.camera.position.y = elevation;
        this.camera.position.z = newNorthing;
        this.camera.setTarget(new Vector3(easting, elevation, northing));
    }

    showPerpViewLeft() {
        const azm: number = this.surveysService.getAzm(this.viewMD);
        const easting = this.coord.easting;
        const elevation = this.coord.elevation;
        const northing = this.coord.northing;
        const newEasting = easting - (Math.cos(this.surveyMathService.degreesToRadians(azm)) * this.viewDist);
        const newNorthing = northing + (Math.sin(this.surveyMathService.degreesToRadians(azm)) * this.viewDist);
        this.camera.position.x = newEasting;
        this.camera.position.y = elevation;
        this.camera.position.z = newNorthing;
        this.camera.setTarget(new Vector3(easting, elevation, northing));
    }

    showVertViewTop() {        
        const easting = this.coord.easting;
        const elevation = this.coord.elevation;
        const northing = this.coord.northing;
        const newElevation = elevation + this.viewDist;
        this.camera.position.x = easting;
        this.camera.position.y = newElevation;
        this.camera.position.z = northing;
        this.camera.setTarget(new Vector3(easting, elevation, northing));
    }

    followWellPath(well: boolean) {   
        let intData;
        let sectionViewDist: number;
        if (well) {
            intData = this.surveysService.getIntSurveys();            
            sectionViewDist = this.surveysService.getSectionViewDistance();
        } else {
            intData = this.plansService.getIntPlans();
            sectionViewDist = this.plansService.getSectionViewDistance();
        }
        let above = 250
        let prox = 150
        let i = 0; 
        let viewAngle = 70;
        this.camera.rotation.x = this.surveyMathService.degreesToRadians(viewAngle); 
        
        
        this.camera.position.x = intData[0].easting;
        this.camera.position.y = intData[0].elevation + above;
        this.camera.position.z = intData[0].northing + prox;
        this.camera.setTarget(new Vector3(intData[0].easting, intData[0].elevation, intData[0].northing));
       
        setInterval(() => {
            if (i < intData.length) {
                this.camera.position.x = intData[i].easting;
                this.camera.position.y = intData[i].elevation + above;
                this.camera.position.z = intData[i].northing + prox;
                
                if (i < (intData.length - 1)) {
                    let chInRotation = intData[i + 1].inc - intData[i].inc;
                    let totalRotation = viewAngle - chInRotation;
                    if ((totalRotation > 10) && (totalRotation < 70)) {                                                                                           
                        this.camera.rotation.x = this.surveyMathService.degreesToRadians(viewAngle);
                        viewAngle = totalRotation;
                    } else if (totalRotation < 10) {
                        viewAngle = 10;
                    } else if (totalRotation > 70) {
                        viewAngle = 70;
                    }
                    if (intData[i].inc > 20){
                        if (above > 50) {
                            above = above - (intData[i + 1].inc - intData[i].inc) * 3;
                        }
                    }
                }            
                if (i === (intData.length - 1)){
                    if (this.viewRL) {
                        this.panToHorizontalViewRight(1, intData[i].easting, intData[i].elevation, intData[i].northing, 
                                                      sectionViewDist, above, prox);
                    } else {
                        this.panToHorizontalViewLeft(1, intData[i].easting, intData[i].elevation, intData[i].northing, 
                                                     sectionViewDist, above, prox);
                    }
                }    
            }
            i++;
        }, 0.001);       
    }

    panToHorizontalViewRight(speed: number, easting: number, elevation: number, northing, 
                             sectionViewDist: number, above: number, prox: number) {
        const vsDir = this.surveysService.getVSDirection();
        const targetEasting = easting + (Math.cos(this.surveyMathService.degreesToRadians(vsDir)) * sectionViewDist);
        const targetNorthing = northing - (Math.sin(this.surveyMathService.degreesToRadians(vsDir)) * sectionViewDist);
        const pathDist = Math.sqrt(Math.pow(targetEasting - easting, 2) + Math.pow(targetNorthing - northing, 2));
        let i = 0;
        // this.camera.position.y = elevation;
        let eastingIncrement = (targetEasting - easting) / pathDist;
        let northingIncrement = ((targetNorthing - northing) + (pathDist / prox)) / pathDist;
        let elevationIncrement = above / pathDist;
        // let proxIncrement = pathDist / prox;
        let newEasting = easting;
        let newElevation = elevation;
        let newNorthing = northing;

        setInterval(() => {
            if (i < pathDist) {
                newEasting += eastingIncrement;
                newElevation += elevationIncrement;
                newNorthing += northingIncrement;
                
                this.camera.position.x = newEasting;    
                this.camera.position.y = newElevation;        
                this.camera.position.z = newNorthing;
                this.camera.setTarget(new Vector3(easting, elevation, northing));
                i++;
            }
        }, speed);
    }

    panToHorizontalViewLeft(speed: number, easting: number, elevation: number, northing, 
                            sectionViewDist: number, above: number, prox: number) {
        const vsDir = this.surveysService.getVSDirection();
        const targetEasting = easting - (Math.cos(this.surveyMathService.degreesToRadians(vsDir)) * sectionViewDist);
        const targetNorthing = northing + (Math.sin(this.surveyMathService.degreesToRadians(vsDir)) * sectionViewDist);
        const pathDist = Math.sqrt(Math.pow(targetEasting - easting, 2) + Math.pow(targetNorthing - northing, 2));
        let i = 0;
        // this.camera.position.y = elevation;
        let eastingIncrement = (targetEasting - easting) / pathDist;
        let northingIncrement = ((targetNorthing - northing) + (pathDist / prox)) / pathDist;
        let elevationIncrement = above / pathDist;
        // let proxIncrement = pathDist / prox;
        let newEasting = easting;
        let newElevation = elevation;
        let newNorthing = northing;

        setInterval(() => {
            if (i < pathDist) {
                newEasting += eastingIncrement;
                newElevation += elevationIncrement;
                newNorthing += northingIncrement;
                
                this.camera.position.x = newEasting;    
                this.camera.position.y = newElevation;        
                this.camera.position.z = newNorthing;
                this.camera.setTarget(new Vector3(easting, elevation, northing));
                i++;
            }
        }, speed);
    }

    closePlots(): void {
        this.tallyBookList = null;
        this.intPlansList = [];   
        this.sharedPlotData = [];
        this.projSphereShowing.next(false);
    }

    survPlanPointClicked(event, isSurvey: boolean, surveyBox: Rectangle): Rectangle { 
        let blockColor: string = 'darkslategrey';    
        let textColor: string = 'silver';    
        let blockCount: number = 0;
        surveyBox.clearControls();
        surveyBox.width = "20%"; 
        surveyBox.paddingRight = "2px"; 
        surveyBox.cornerRadius = 4;
        surveyBox.color = blockColor;
        surveyBox.background = "gray";
        surveyBox.thickness = 8;
        surveyBox.isVisible = false;
        surveyBox.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT; 
        
        let selected;
        if (isSurvey) {
            const surveys = this.surveysService.getSurveys();        
            selected = surveys.filter(surv => {
                return surv.md === +event.source.name;
            });

            if (!this.connectionsMade) {
                for (let i = 0; i < surveys.length; i++){
                    if ((surveys[i].offsets) !== undefined) {                                
                        let vector = surveys[i].offsets.filter(offset => {
                            return offset.name === event.meshUnderPointer.material.name
                        });

                        const vectors: Vector3[] = [ 
                            new Vector3(surveys[i].easting, surveys[i].elevation, surveys[i].northing),
                            new Vector3(vector[0].location.x, vector[0].location.y, vector[0].location.z),                        
                        ];

                        let closestPath = MeshBuilder.CreateTube(event.meshUnderPointer.material.name + 'survey->plan', 
                                                                        {path: vectors.map(vector => {
                                                                            return new Vector3(vector.x, vector.y, vector.z);
                                                                                                        }), radius: this.tubeRadius, updatable: true }, this.scene);
                    }
                }
                this.connectionsMade = true;
            }
        } else {   
                     
            selected = this.plansService.getPlans().filter(plan => {
                return plan.md === +event.source.name;
            }); 
        }

        let contentPanel = new StackPanel('contentPanel');
        contentPanel.isVisible = true;

        let block = (textValue: string) => {
            let block = new Rectangle();
            if (textValue.length < 39) {               
                block.height = "20px";
                blockCount += 1;
            } else {
                block.height = "40px";
                blockCount += 2;
            }
            block.color = "gray";
            block.width = "96%";
            block.left = "0%";
            block.cornerRadius = 4;
            block.thickness = 1;
            block.background = blockColor;     
            block.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;         
            let textBlock = new TextBlock();
            textBlock.name = 'Text';
            textBlock.fontSize = 12;
            textBlock.color = textColor;
            textBlock.textWrapping = true;
            textBlock.text = textValue;
            block.addControl(textBlock);
            return block;
        }

        if (isSurvey) {
            contentPanel.addControl(block('Survey - ' + event.meshUnderPointer.material.name));
        } else {
            contentPanel.addControl(block('Plan - ' + event.meshUnderPointer.material.name));
        }
        contentPanel.addControl(block('MD: ' + selected[0].md.toFixed(2)));
        // contentPanel.addControl(block('Offset MD ' + offsetMD));
        contentPanel.addControl(block('Inc: ' + selected[0].inc.toFixed(2)));
        contentPanel.addControl(block('Azm: ' + selected[0].azm.toFixed(2)));
        contentPanel.addControl(block('TVD: ' + selected[0].tvd.toFixed(2)));
        contentPanel.addControl(block('North: ' + selected[0].north.toFixed(2)));
        contentPanel.addControl(block('East: ' + selected[0].east.toFixed(2)));
        contentPanel.addControl(block('VS: ' + selected[0].vs.toFixed(2))); 
        contentPanel.addControl(block('Survey TF: ' + selected[0].survTF.toFixed(2)));
        contentPanel.addControl(block('DLS: ' + selected[0].dls.toFixed(2)));
        if (isSurvey) {
            contentPanel.addControl(block('Slide Seen: ' + (selected[0].slide !== undefined ? selected[0].slide.replace(/\n/g, ' / ') : '')));
            contentPanel.addControl(block('Slide TF: ' + (selected[0].slideTF !== undefined ? selected[0].slideTF.replace(/\n/g, ' / ') : '')));
            contentPanel.addControl(block('Motor Ouput: ' + (selected[0].motorOutput !== undefined ? selected[0].motorOutput.toFixed(2) : 0)));
        }
        contentPanel.addControl(block('Elevation: ' + selected[0].elevation.toFixed(2)));
        contentPanel.addControl(block('Northing: ' + selected[0].northing.toFixed(2)));
        contentPanel.addControl(block('Easting: ' + selected[0].easting.toFixed(2)));
        if (isSurvey) {
            contentPanel.addControl(block('Dist to Line: ' + selected[0].distPlan.toFixed(2)));
            contentPanel.addControl(block('R/L Line +/-: ' + selected[0].rlPlan.toFixed(2)));
            contentPanel.addControl(block('A/B Line +/-: ' + selected[0].abPlan.toFixed(2)));
            contentPanel.addControl(block('TVD to Line: ' + selected[0].tvdToPlan.toFixed(2)));
            contentPanel.addControl(block('TF to Line: ' + selected[0].tfToPlan.toFixed(2)));
        }
         
        surveyBox.height = (blockCount * 20 + 30).toString() + 'px';

        this.surveyBox.addControl(contentPanel);

        return this.surveyBox;
    };
}