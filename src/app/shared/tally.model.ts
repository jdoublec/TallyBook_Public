
export class TallyHeader {
    constructor(
    offset: number,
    startingValue: number,
    rigType: string,
    ) {}
}

export class Tally {
    constructor(        
        public length: number, 
        public stand: string, 
        public total: number,
        public survey: number,
        public type?: string,
        ) {}
}