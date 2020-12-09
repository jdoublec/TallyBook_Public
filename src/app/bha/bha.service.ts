import { Injectable } from '@angular/core';
import { BHA, Inventory, BitGrade } from './bha.model';
import { Subject } from 'rxjs';
import { SurveyMathService } from '../shared/survey-math.service';

@Injectable({ providedIn: 'root'})
export class BHAService  {
    bhaChanged = new Subject<BHA[]>();
    bhaNamesChanged = new Subject<string[]>();
    bha: BHA[] = [];

    // model: Model[] = [
    //     new Model("Motor", "QLE6750", "WFT", 2.5, 6.75, ''),
    //     new Model("Bit", "DD306S", "Hughes", 2.5, 8.5, ''),
    // ]

    // inventory: Inventory[] = [
    //     new Inventory("Slick Motor", "675-3423", "QLE6750", 2.5, 6.75, 31.45),
    //     new Inventory("PDC Bit", "1324321", "DD306S", 2.5, 8.5, 1),

    // ]

    // bha: BHA[] = [
    //     new BHA("1", "Surface", new Date(), new Date(), 800, 4300, 35, 0, [this.inventory[0], this.inventory[1]], []),
    //     new BHA("2", "Intermediate", new Date(), new Date(), 800, 4300, 35, 0, [this.inventory[1]], []),
    // ];

    constructor(private surveyMathService: SurveyMathService) {}

    setBHAs(bha: BHA[]) {
        this.bha = bha;
    }

    getBHA(id: number) {
        return this.bha[id];
    }

    getBHAs() {
        return this.bha.slice();
    }

    getBHANames() {
        return this.bha.map((bhaArr) => {
            return bhaArr.name;
        });        
    }

    getBHADepths() {
        return this.bha.map(bha => {
            let maxOD = Math.max.apply(Math, bha.items.map(item => item.od));
            return { name: bha.name, startDepth: bha.startDepth, endDepth: bha.endDepth, size: maxOD}
        });
    }

    getBitGrade(bhaIndex: number) {
        return this.bha[bhaIndex].bitGrade[0];
    }

    addBHA(name: string, offset: number, startDepth: number, endDepth: number, 
           section: string, startDate: Date, endDate: Date, itemName: string, 
           itemSN: string, itemModel: string, itemID: number, itemOD: number, 
           itemLength: number, specSheetPath: string) {        

        const newInventory: Inventory[] = [
            new Inventory(itemName, itemSN, itemModel, itemID, itemOD, itemLength, specSheetPath),
    
        ];

        const newBitGrade: BitGrade[] = [
            new BitGrade( '', '', '', '', '', '', '', '' )
        ];

        const newBHA = new BHA(
            name,
            section,
            startDate,
            endDate,
            startDepth,
            endDepth,
            offset,
            0,
            [newInventory[0]],
            [newBitGrade[0]]
        );                       
            
        this.bha.push(newBHA);

        this.bhaChanged.next(this.bha.slice());
        this.bhaNamesChanged.next(this.bha.map((bhaArr) => {
                                    return bhaArr.name;
                                }).slice());
    }

    updateBHA(index: number, name: string, offset: number, startDepth: number, 
              endDepth: number, section: string, startDate: Date, endDate: Date) {

        let nameChanged: boolean = false;

        if (this.bha[index].name === name) {
            nameChanged = true;
        }

        this.bha[index].name = name;
        this.bha[index].offset = offset;
        this.bha[index].startDepth = startDepth;
        this.bha[index].endDepth = endDepth;
        this.bha[index].section = section;
        this.bha[index].startDate = startDate;
        this.bha[index].endDate = endDate;

        this.bhaChanged.next(this.bha.slice());
        if (nameChanged) {
            this.bhaNamesChanged.next(this.bha.map((bhaArr) => {
                return bhaArr.name;
            }).slice());
        }
    }

    updateBitGrade(bhaIndex: number, bitGrade: BitGrade){ //, inner: string, outer: string, major: string, location: string, bearing: string, gauge: string, other: string, reason: string) {
        // const newBitGrade: BitGrade[] = [
        //     new BitGrade(inner, outer, major, location, bearing, gauge, other, reason)
        // ];
        this.bha[bhaIndex].bitGrade.splice(0, 1, bitGrade);
        //this.bha[bhaIndex].bitGrade.push(newBitGrade[0]);
    }

    deleteBHA(index: number) {
        this.bha.splice(index, 1);

        this.bhaChanged.next(this.bha.slice());
        this.bhaNamesChanged.next(this.bha.map((bhaArr) => {
            return bhaArr.name;
        }).slice());
    }

    addItem(bhaIndex: number, itemName: string, sn: string, model: string, id: number, od: number, length: number, specSheetPath: string) {
        const newInventory = [
            new Inventory(
                itemName,
                sn,
                model,
                id,
                od,
                length,
                specSheetPath,
        )];

        
        this.bha[this.bha.length - 1].items.push(newInventory[0]); 

        this.bhaChanged.next(this.bha.slice());
    }

    updateItem(bhaIndex: number, itemIndex: number, itemName: string, sn: string, 
               model: string, id: number, od: number, length: number, specSheetPath: string) {
        
        const newInventory =
        new Inventory(
            itemName,
            sn,
            model,
            id,
            od,
            length,
            specSheetPath,
        );

        this.bha[bhaIndex].items.splice(itemIndex, 1, newInventory);

        this.bhaChanged.next(this.bha.slice());
    }

    deleteItem(bhaIndex: number, itemIndex: number) {
        this.bha[bhaIndex].items.splice(itemIndex, 1);

        this.bhaChanged.next(this.bha.slice());
    }

    getAccumLength(bha: BHA, bhaIndex: number, itemIndex: number) {
        return (this.bha[bhaIndex].items
                    .filter((bha , currentIndex) => currentIndex <= itemIndex)
                    .map(item => item.length)
                    .reduce((totalSum, current) => +current + +totalSum, 0));
                    // .reduce((totalSum, current) => this.surveyMathService.setDecimalPlaces(+current + +totalSum), 0));
    }

}