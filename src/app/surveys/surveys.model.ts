import { Offsets } from '../plots/plot-data.model';

export class SurveyHeader {
    constructor(
    vsDirection: number,
    northing: number,
    easting: number,
    elevation: number,
    groundElevation?: number,
    ) {}
}

export class Surveys {
    constructor(
        public md: number,
        public inc: number,
        public azm: number,
        public tvd: number,
        public north: number,
        public east: number,
        public vs: number,
        public survTF: number,
        public dls: number,
        public slide: string,
        public slideTF: string,
        public motorOutput: number,   
        public distPlan?: number,      
        public abPlan?: number,
        public rlPlan?: number,           
        public tvdToPlan?: number,
        public tfToPlan?: number,
        public elevation?: number,
        public northing?: number,
        public easting?: number,
        public offsets?: Offsets[],   
        public projection?: boolean,
    ) {}
}

export class IntSurveys {
    constructor(
        public md: number,
        public inc: number,
        public azm: number,
        public tvd: number,
        public north: number,
        public east: number,
        public vs: number,
        public survTF: number,
        public dls: number,
        public slide: string,
        public slideTF: string,
        public motorOutput: number,  
        public distPlan?: number,      
        public abPlan?: number,
        public rlPlan?: number,           
        public tvdToPlan?: number,
        public tfToPlan?: number,
        public elevation?: number,
        public northing?: number,
        public easting?: number,
        public intValue?: boolean,
        public offsets?: Offsets[],
    ) {}
}
