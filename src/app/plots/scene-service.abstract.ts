import { Color3, CubeTexture, MeshBuilder, Engine, ArcRotateCamera, FlyCamera, Light, Scene, StandardMaterial, 
         Texture, Mesh, Vector3, AxesViewer, HemisphericLight, DeviceOrientationCamera, 
         UniversalCamera, 
         BackgroundMaterial,
         DynamicTexture,
         Axis} from '@babylonjs/core';
import { ElementRef } from '@angular/core';
import { CameraSettings } from './plot-data.model';
import { AdvancedDynamicTexture } from '@babylonjs/gui';
import { SurveyMathService } from '../shared/survey-math.service';

export class SceneServiceAbstract {
    protected engine: Engine;
    protected canvas: HTMLCanvasElement;
    protected camera: FlyCamera; //ArcRotateCamera | FlyCamera | UniversalCamera; // | DeviceOrientationCamera | ;
    protected light: Light;
    protected groundbox: Mesh;
    protected skybox: Mesh;
    // protected adt = AdvancedDynamicTexture.CreateFullscreenUI('interface', true);
    protected adt;

    scene: Scene;
    
    
    constructor(protected surveyMathService: SurveyMathService) {}


    createScene(canvasElement: ElementRef<HTMLCanvasElement>): void {
        this.canvas = canvasElement.nativeElement;        
        this.engine = new Engine(this.canvas, true);        
        this.scene = new Scene(this.engine);   
        // this.adt = AdvancedDynamicTexture.CreateFullscreenUI('interface', true);          
    }

    startTheEngine(): void {
        this.adt = AdvancedDynamicTexture.CreateFullscreenUI('interface', true);
        
        this.engine.runRenderLoop(() => {
            this.scene.render();        
        });
        // window.addEventListener('click', () => console.log(this.camera.rotation.x));
    }

    stopTheEngine(): void {
        this.scene.dispose();
        this.scene = null;
        this.engine.stopRenderLoop();
        this.engine.dispose();
        this.engine = null;
        this.camera.dispose();     
        this.camera = null;
        this.light.dispose();
        this.light = null;
        this.canvas = null;
    }

    updateGroundbox(skyboxPath: string, location: Vector3) {        
        this.addGroundbox(skyboxPath, location)
    }

    addGroundbox(groundboxPath: string, location: Vector3) {
        if (this.scene.getMeshByName('groundbox')) {            
            this.scene.getMeshByName('groundbox').dispose();
        }
        this.groundbox = MeshBuilder.CreateBox('groundbox_box', {size:30000.0}, this.scene); 
        let groundboxMaterial = new StandardMaterial('groundbox_mat', this.scene); 
               
        groundboxMaterial.backFaceCulling = false;
        this.groundbox.overlayColor = Color3.Black();
        let path: string = 'assets/' + groundboxPath + '/' + groundboxPath; //"assets/blue/bkg1";
        groundboxMaterial.reflectionTexture = new CubeTexture(path , this.scene);
        groundboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        groundboxMaterial.diffuseColor = new Color3(0, 0, 0);
        groundboxMaterial.specularColor = new Color3(0, 0, 0);        
        this.groundbox.material = groundboxMaterial;
        this.groundbox.position.x = location.x;
        this.groundbox.position.y = -15000 + location.y;
        this.groundbox.position.z = location.z;
    }

    addSkybox(skyboxPath: string, location: Vector3) {
        if (this.scene.getMeshByName('skybox')) {            
            this.scene.getMeshByName('skybox').dispose();
        }
        this.skybox = MeshBuilder.CreateBox('skybox_box', {size:60000.0}, this.scene); 
        let skyboxMaterial = new StandardMaterial('skybox_mat', this.scene); 
               
        skyboxMaterial.backFaceCulling = false;
        this.skybox.overlayColor = Color3.Black();
        let path: string = 'assets/' + skyboxPath + '/' + skyboxPath; //"assets/blue/bkg1";
        skyboxMaterial.reflectionTexture = new CubeTexture(path , this.scene);
        skyboxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
        skyboxMaterial.diffuseColor = new Color3(0, 0, 0);
        skyboxMaterial.specularColor = new Color3(0, 0, 0);        
        this.skybox.material = skyboxMaterial;
        this.skybox.position.x = location.x;
        this.skybox.position.y = -30000 + location.y;
        this.skybox.position.z = location.z;
    }

    updateLight() {
        this.light = new HemisphericLight('light', new Vector3(0, 1, 0), this.scene);
    }

    updateCamera(cameraSettings: CameraSettings, location: Vector3, target: Vector3, radius: number = 5000) {
        if ((!this.camera) || (!this.camera.name.includes(cameraSettings['cameraType']))) {            
            this.addCamera(cameraSettings['cameraType'], location, radius);
        }
        this.updateCameraSettings(cameraSettings, location, target);       

        this.camera.attachControl(this.canvas); 
        this.scene.activeCamera = this.camera;
    }

    private updateCameraSettings(cameraSettings: CameraSettings, location: Vector3, target: Vector3) {
        this.camera.speed = cameraSettings['cameraSpeed'];        
        this.camera.setTarget(target);
        this.camera.position.x = location.x;
        this.camera.position.y = location.y;
        this.camera.position.z = location.z; 
    }   

    private addCamera(type: string,location: Vector3, radius: number) {
        if (type === 'ArcRotate') {
            this.addArcRotateCamera(radius, location);
        } else if (type === 'DeviceOrientation') {
            this.addDeviceOrientationCamera(location);
        } else if (type === 'Universal') {
            this.addUniversalCamera(location);
        } else {
            this.addFlyCamera(location);
        }
    }

    private addFlyCamera(location: Vector3) {        
        this.camera = new FlyCamera('FlyCamera', location, this.scene); 
        this.camera.rollCorrect = 0;
        this.camera.bankedTurn = false;
        this.camera.bankedTurnLimit = 0;    
        
        
        this.camera.maxZ = 100000;            
    }    

    disableFlyCamera() {
        this.scene.activeCamera.dispose();
    }

    private addArcRotateCamera(radius: number, location: Vector3) {
        // this.camera = new ArcRotateCamera("ArcRotateCamera", 0, 0, radius, location, this.scene);
    }

    private addUniversalCamera(location: Vector3) {
        // this.camera = new UniversalCamera("UniversalCamera", location, this.scene);
    }

    private addDeviceOrientationCamera(location: Vector3) {
        // this.camera = new DeviceOrientationCamera("DevOrCamera", location, this.scene);
        // this.camera.angularSensibility = 10;
    }

    updateAxesViewer(size: number, location: Vector3) {
        // let axesViewer = new AxesViewer(this.scene, size);
        // axesViewer.update(location, this.camera.position, this.camera.position, this.camera.position); 
        // axesViewer.xAxis.position = this.camera.position.addInPlace(this.camera.getDirection(new Vector3(0, 0, 20)));
        let makeTextPlane = function(text, color, size, scene: Scene) {
            let dynamicTexture = new DynamicTexture("DynamicTexture", 150, scene, true);
            dynamicTexture.hasAlpha = true;
            dynamicTexture.drawText(text, 5, 40, "bold 36px Arial", color , "transparent", true);
            let plane = Mesh.CreatePlane("TextPlane", size, scene, true);
            let planeMaterial = new StandardMaterial("TextPlaneMaterial", scene);
            planeMaterial.backFaceCulling = false;
            planeMaterial.specularColor = new Color3(0, 0, 0);
            planeMaterial.diffuseTexture = dynamicTexture;
            plane.material = planeMaterial;
            return plane;
             };
        let axisX = Mesh.CreateLines("axisX", [ 
            location, new Vector3(location.x + size, location.y, location.z), new Vector3(location.x + size * 0.95, location.y + size * 0.05, location.z), 
            new Vector3(location.x + size, location.y, location.z), new Vector3(location.x + size * 0.95, location.y + size * (-0.05), location.z)
            ], this.scene);
        axisX.color = new Color3(1, 0, 0);
        let xChar = makeTextPlane("E", "red", size / 2, this.scene);
        xChar.rotate(Axis.Y, this.surveyMathService.degreesToRadians(180));
        xChar.position = new Vector3(location.x + size - size * 0.35, location.y - size * 0.05, location.z);
        let axisY = Mesh.CreateLines("axisY", [
            location, new Vector3(location.x, location.y + size, location.z), new Vector3( location.x - size * 0.05, location.y + size * 0.95, location.z), 
            new Vector3(location.x, location.y + size, location.z), new Vector3( location.x + size * 0.05, location.y + size * 0.95, location.z)
            ], this.scene);
        axisY.color = new Color3(0, 1, 0);
        let yChar = makeTextPlane("TVD", "green", size / 2, this.scene);
        yChar.rotate(Axis.Z, this.surveyMathService.degreesToRadians(90));
        yChar.rotate(Axis.X, this.surveyMathService.degreesToRadians(90));
        yChar.position = new Vector3(location.x - size * 0.05, location.y + size - size * 0.10, location.z);
        let axisZ = Mesh.CreateLines("axisZ", [
            location, new Vector3(location.x, location.y, location.z + size), new Vector3( location.x , location.y - size * 0.05, location.z + size * 0.95),
            new Vector3(location.x, location.y, location.z + size), new Vector3( location.x, location.y + size * 0.05, location.z + size * 0.95)
            ], this.scene);
        axisZ.color = new Color3(0, 0, 1);
        let zChar = makeTextPlane("N", "blue", size / 2, this.scene);
        zChar.rotate(Axis.Y, this.surveyMathService.degreesToRadians(90));
        zChar.position = new Vector3(location.x, location.y - size * 0.05, location.z + size - size * 0.35);
        
    }

}