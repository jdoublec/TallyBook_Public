import { Injectable } from '@angular/core';
import { Tally, TallyHeader } from '../shared/tally.model';
import { Subject } from 'rxjs';
import { SurveyMathService } from '../shared/survey-math.service';

@Injectable({ providedIn: 'root' })
export class TallyService {
    tallyChanged = new Subject<Tally[]>();
    tallyTotalsChanged = new Subject<number[]>();
    tallyHeaderChanged = new Subject<TallyHeader>();
    tallyHeader: TallyHeader;// = {offset: 0, startingValue: 0};
    tallySurveyView: boolean = false;

    constructor(private surveyMathService: SurveyMathService) {}

    tally: Tally[] = [];

    setTallySurveyView(view: boolean) {
        this.tallySurveyView = view;
    }

    getTallySurveyView() {
        return this.tallySurveyView;
    }

    setTally(tally: Tally[]) {
        this.tally = tally;        
        this.tallyChanged.next(this.tally.slice());
    }

    getTally() {
        return this.tally.slice();
    }

    getTallyTotals() {
        return this.tally.map((tallyArr) => {
            return tallyArr.total;
        });        
    }

    setTallyHeader(tallyHeader: TallyHeader) {
        this.tallyHeader = tallyHeader;        
        this.tallyHeaderChanged.next(this.tallyHeader);
    }

    getTallyHeader() {
        return this.tallyHeader;
    }

    setOffset(value: number) {
        this.tallyHeader = {offset: value};
        this.tallyHeaderChanged.next(this.tallyHeader);
    }

    getOffset() { 
        if (this.tallyHeader) {       
            if (!('offset' in this.tallyHeader)) {
                this.setOffset(32);
            }
        } else {
            this.setOffset(32);
        }
        return this.tallyHeader['offset'];
    }

    setStartingValue(value: number) {
        this.tallyHeader['startingValue'] = value;
        this.tallyHeaderChanged.next(this.tallyHeader);
    }

    getStartingValue() {
        if (!('startingValue' in this.tallyHeader)) {
            this.setStartingValue(0);
        }
        return this.tallyHeader['startingValue'];
    }

    setRigType(rigType: string) {
        this.tallyHeader['rigType'] = rigType;
        this.tallyHeaderChanged.next(this.tallyHeader);
    }

    getRigType() {
        if (!('rigType' in this.tallyHeader)) {
            this.setRigType('Triple');
        }
        return this.tallyHeader['rigType'];
    }

    getSurveyMD(depth: number) {
        for (let i = (this.tally.length - 1); i >= 0; i--) {
            if (depth === Math.trunc(this.tally[i].total)) {
                return this.tally[i].survey;
            }
        }

        return '';
    }

    addTally(itemLength: number, offset: number) {
            const tallyStand = this.getStandCount(this.tally.length, this.tallyHeader['rigType']);
            const prevTallyTotal = this.tally.length > 0 ? this.tally[this.tally.length - 1].total : this.tallyHeader['startingValue'];
            // const tallyTotal = this.surveyMathService.setDecimalPlaces(+prevTallyTotal + itemLength);
            const tallyTotal = +prevTallyTotal + itemLength;
            const tallySurvey = Math.trunc(+tallyTotal - offset);

            const newTallyItem = new Tally(itemLength, tallyStand, tallyTotal, tallySurvey);        
            
            this.tally.push(newTallyItem);

            // if(this.tally[this.tally.length - 1].inc && this.tally[this.tally.length - 1].azm){
            //     this.updateDLS(this.tally.length - 1, true);
            // }
            this.tallyChanged.next(this.tally.slice());
            this.tallyTotalsChanged.next(this.tally.map(value => {
                return value['total'];
            }));
    }

    updateTally(index: number, itemLength: number, offset: number, 
                standNeeded: boolean) {
        let prevTotal = 0;
        this.tally[index].length = itemLength;
        let survey: number;
        if (index === 0) {            
            // this.tally[0].total = this.surveyMathService.setDecimalPlaces(this.tallyHeader['startingValue'] + this.tally[0].length);
            this.tally[0].total = this.tallyHeader['startingValue'] + this.tally[0].length;
            survey = this.tally[index].total - offset;
            this.tally[0].survey = survey >= 0 ? Math.trunc(survey) : 0;
            this.tally[0].stand = 'S';
            prevTotal = this.tally[index].total;
            index++;
        }
        else {
            prevTotal = this.tally[index - 1].total;
        }
        
        for (let i = index; i < this.tally.length; i++) {          
            // this.tally[i].total = this.surveyMathService.setDecimalPlaces(prevTotal + this.tally[i].length);
            this.tally[i].total = prevTotal + this.tally[i].length;
            survey = this.tally[i].total - offset;
            this.tally[i].survey = survey >= 0 ? Math.trunc(survey) : 0;
            if (standNeeded) {
                this.tally[i].stand = this.getStandCount(i, this.tallyHeader['rigType']);
            }
            prevTotal = this.tally[i].total;
        }   

        this.tallyChanged.next(this.tally.slice());
        this.tallyTotalsChanged.next(this.tally.map(value => {
            return value['total'];
        }));
    }

    removeTally(index: number, offset: number) {
        this.tally.splice(index, 1);
        index = index - 1;


        if ((index <  (this.tally.length - 2)) && index >=0) {
            this.updateTally(index, this.tally[index].length, offset, true);
        } else {
            this.tallyChanged.next(this.tally.slice());
        }
    }    

    removeAll() {
        // console.log('Tally Will be Deleted');
        this.tally.splice(0, this.tally.length);
        this.tallyChanged.next(this.tally.slice());
        console.log(this.tally);
    }

    getStandCount(index: number, rigType: string) {
        let standCount = '0';
        let total = index + 1;
        let remainder = 0;
        
        if (rigType == 'Quad') {
            remainder = total % 4;
            total = total / 4;
        } else if (rigType == 'Triple') {
            remainder = total % 3;
            total = total / 3;
        } else if (rigType == 'Double') {
            remainder = total % 2;
            total = total / 2;
        } 

        if (remainder === 0) {
            standCount = total.toString();
        } else if (remainder === 1) {
            standCount = 'S';
        } else if (remainder === 2) {
            standCount = 'D';
        } else {
            standCount = 'T';
        } 

        return standCount
    }

    offsetChanged(offset: number) {
        this.tallyHeader['offset'] = offset;
        this.tallyHeaderChanged.next(this.tallyHeader);
        this.tally.forEach(params => {            
                params.survey = (params.total - this.tallyHeader['offset']) > 0 ? Math.trunc(params.total - this.tallyHeader['offset']) : 0;
            } 
        );

        this.tallyChanged.next(this.tally.slice());
    }

    startingValueChanged(startingValue: number, offset: number) {
        this.tallyHeader['startingValue'] = startingValue;  
        this.tallyHeaderChanged.next(this.tallyHeader); 
        if (this.tally.length > 0) {
            this.updateTally(0, this.tally[0].length, offset, true);  
        }
    }

    rigTypeChanged(rigType: string) {
        this.tallyHeader['rigType'] = rigType;
        this.tallyHeaderChanged.next(this.tallyHeader);   
        
        for (let i = 0; i < this.tally.length; i++) {  
            // if (standNeeded) {
                this.tally[i].stand = this.getStandCount(i, this.tallyHeader['rigType']);
            // }
        }   

        this.tallyChanged.next(this.tally.slice());
    }

    
}