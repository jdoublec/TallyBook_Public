import { Vector3 } from '@babylonjs/core';

export class TargetWindows {
    constructor(
        public startDepth: number,
        public endDepth: number,
        public above: number,
        public below: number,
        public right: number,
        public left: number,
    ) {}
}

export class TargetWindowsPath {
    constructor(
        public targetIndex: number,
        public md: number,
        public location: Vector3,
    ) {}    
}