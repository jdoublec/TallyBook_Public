import { Injectable } from "@angular/core";
import { TallyBookList } from './tally-book.model';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root'})
export class TallyBookService {
    currentTallyBookName: string = 'Tally Book';
    tallyBookListChanged = new Subject<TallyBookList>();
    currentTallyBookChanged = new Subject<string>();
    tallyBookList: TallyBookList;

    changeCurrentTallyBook(currentTallyBook: string) {
        this.currentTallyBookName = currentTallyBook;
        this.currentTallyBookChanged.next(this.currentTallyBookName);
    }

    setTallyBookList(tallyBookList: TallyBookList[]) {
        this.tallyBookList = tallyBookList;
        this.tallyBookListChanged.next(this.tallyBookList);
        localStorage.setItem('tallyBookList', JSON.stringify(this.tallyBookList));
    }

    getCurrentTallyBookName() {
        return this.currentTallyBookName;
    }

    getTallyBookList() {
        let tallyBookListTemp = this.tallyBookList;
        return tallyBookListTemp;
    }
    
    addUpdateTallyBookList(newName: string, newTallyBook: boolean) {
        if ((this.currentTallyBookName in this.tallyBookList) && (!newTallyBook)) {
            this.tallyBookList = (
                changeTallyBookName = this.currentTallyBookName, newName,
                { [this.currentTallyBookName]: old, ...others }
              ) => {
                debugger;
                return {
                  [newName]: old,
                  ...others
                };
              };
        } else {
            if (this.tallyBookList) {
                this.tallyBookList[newName] = {['createDate']: new Date()};
            } else {
                this.tallyBookList = {[newName]: {['createDate']: new Date()}};
            }
        }
        

        this.changeCurrentTallyBook(newName);
        this.tallyBookListChanged.next(this.tallyBookList);    
        localStorage.setItem('tallyBookList', JSON.stringify(this.tallyBookList));    
    }

    changePlotSurveys(tallyBook: string, plotSurvey: boolean) {
        if (!('plotSurveys' in this.tallyBookList[this.currentTallyBookName])) {
            if (plotSurvey) {
                this.tallyBookList[this.currentTallyBookName]['plotSurveys'] = {[tallyBook]: tallyBook};
                console.log('Created plotSurveys')
            }
        } else if (tallyBook in this.tallyBookList[this.currentTallyBookName]['plotSurveys']) {
            if (!plotSurvey) {
                delete this.tallyBookList[this.currentTallyBookName]['plotSurveys'][tallyBook];
                if (Object.keys(this.tallyBookList[this.currentTallyBookName]['plotSurveys']).length === 0) {
                    delete this.tallyBookList[this.currentTallyBookName]['plotSurveys'];
                }
                console.log('deleted from plotSurveys');
            }
        } else {
            if (plotSurvey) {
                this.tallyBookList[this.currentTallyBookName]['plotSurveys'][tallyBook] = tallyBook;
                console.log('added to plotSurveys');
            }
        }    

          this.tallyBookListChanged.next(this.tallyBookList);
    }

    changePlotPlan(tallyBook: string, plotPlan) {
        if (!('plotPlan' in this.tallyBookList[this.currentTallyBookName])) {
            if (plotPlan) {
                this.tallyBookList[this.currentTallyBookName]['plotPlan'] = {[tallyBook]: tallyBook};
            }
        } else if (tallyBook in this.tallyBookList[this.currentTallyBookName]['plotPlan']) {
            if (!plotPlan) {
                delete this.tallyBookList[this.currentTallyBookName]['plotPlan'][tallyBook];
                if (Object.keys(this.tallyBookList[this.currentTallyBookName]['plotPlan']).length === 0) {
                    delete this.tallyBookList[this.currentTallyBookName]['plotPlan'];
                }
            }
        } else {
            if (plotPlan) {
                this.tallyBookList[this.currentTallyBookName]['plotPlan'][tallyBook] = tallyBook;
            }
        }

          this.tallyBookListChanged.next(this.tallyBookList);
    }

    removeTallyBookList(name: string) {
        delete this.tallyBookList[name];

        this.tallyBookListChanged.next(this.tallyBookList);
    }

    deleteTallyBook() {
        // this.tallyBookList = this.tallyBookList.filter(list => list.name != this.currentTallyBookName);
        delete this.tallyBookList[this.currentTallyBookName];
        this.tallyBookListChanged.next(this.tallyBookList);
        localStorage.setItem('tallyBookList', JSON.stringify(this.tallyBookList));
    }
}