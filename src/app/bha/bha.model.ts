export class BHA {
    public name: string;
    public section: string;
    public startDate: Date;
    public endDate: Date;
    public startDepth: number;
    public endDepth: number;
    public offset: number;
    public motorYield: number;
    public items?: Inventory[];
    public bitGrade?: BitGrade[];

        constructor(  
            name: string, 
            section: string,
            startDate: Date,
            endDate: Date,
            startDepth: number,
            endDepth: number,
            offset: number,
            motorYield: number,
            items: Inventory[],
            bitGrade: BitGrade[]) 
            {
                this.name = name;
                this.section = section;
                this.startDate = startDate;
                this.endDate = endDate;
                this.startDepth = startDepth;
                this.endDepth = endDepth;
                this.offset = offset;
                this.motorYield = motorYield;
                this.items = items;
                this.bitGrade = bitGrade;
            }
}

export class Inventory {
    constructor(
        public name: string,
        public sn: string,
        public model: string,
        public id: number,
        public od: number,
        public length: number,
        public specSheetPath: string,
    ) {}
}

export class BitGrade {
    constructor(
        public innerRows: string,
        public outerRows: string,
        public majorDullChars: string,
        public location: string,
        public bearingSeal: string,
        public gauge: string,
        public otherDullChars: string,
        public reasonPulled: string
    ) {}
}