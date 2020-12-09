import { Offsets } from '../plots/plot-data.model';

export class PlanHeader {
    constructor(
    vsDirection: number,
    northing: number,
    easting: number,
    elevation: number,
    groundElevation?: number,
    ) {}
}

export class Plans {
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
        public elevation?: number,
        public northing?: number,
        public easting?: number,
        public offsets?: Offsets[],
    ) {}
}

export class IntPlans {
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
        public elevation: number,
        public northing: number,
        public easting: number,
        public intValue?: boolean,
        public offsets?: Offsets[],
    ) {}
}