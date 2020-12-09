import { Vector3, Mesh, Color3 } from '@babylonjs/core';
import { IntPlans } from '../plans/plans.model';
import { IntSurveys } from '../surveys/surveys.model';

export interface PlotsSettings {
    sphereDiameter: number,
    sphereColor: string,
    wellColor: string,
    planColor: string,   
    sphereMat: string,
    wellRatio: number,
    wellMat: string, 
    casingMat: string,  
    groundboxName: string,        
}

export interface CameraSettings {
    cameraType: string,
    cameraSpeed: number,
    cameraLocation: number,
}

export class IntSurveysList {
    constructor (
        intSurveys: IntSurveys[],
    ){}
}

export class Offsets {
    constructor(
        public name: string,
        public location: Vector3,
        public md: number,
        public inc: number,
        public azm: number,
        public north: number,
        public east: number,
    ){}
}

export class IntPlansList {
    constructor (
        intPlans: IntPlans[],
    ){}
}