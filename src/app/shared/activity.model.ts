
export class Activity {
    constructor(  
        public endTime: Date, 
        public activity: string,
        public endDepth: number,
        public comments: string,
        public bha?: string,
        ) {}
}

export class DailyActivity {
    constructor(
        public date: number,
        public activity: Activity[],
    ) {}
}

export class FilteredActivity {
    constructor(
        public date: number,
        public startTime: Date,
        public endTime: Date, 
        public activity: string,
        public startDepth: number,
        public endDepth: number,
        public comments: string,
        public bha?: string,
    ) {}
}

export class ActivitiesList {
    constructor(
        public activity: string,
    ) {}
}