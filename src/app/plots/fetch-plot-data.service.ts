import { Injectable } from '@angular/core';
import { SharedPlotData, PlotList } from '../tally-book/new-tally-book/tally-book.model';
import { Subject } from 'rxjs';
import { DataStorageService } from '../shared/data-storage.service';
import { TallyBookService } from '../tally-book/new-tally-book/tally-book.service';
import { PlotDataService } from './plot-data.service';

@Injectable ({providedIn: 'root'})

export class FetchPlotDataService {          

    constructor(private dataStorageService: DataStorageService,
                private plotDataService: PlotDataService,
                private tallyBookService: TallyBookService) {}

    updateSharedPlotData(plotList: PlotList[]) {  
        let sharedPlotData: SharedPlotData[] = this.plotDataService.getSharedPlotData();
        let currentTallyBookName = this.tallyBookService.getCurrentTallyBookName();
        plotList.forEach(plotList => {
            let okToAddSurvey: boolean = true;
            let okToAddPlan: boolean = true;
            if (plotList.name !== currentTallyBookName) {
                for (let i = 0; i < sharedPlotData.length; i++) {                    
                    if (plotList.name === sharedPlotData[i].name) {
                        if (plotList.plotSurvey) {                            
                            if (sharedPlotData[i].type === 'surveys') {
                                console.log('okToAddSurvey set to false');
                                okToAddSurvey = false;
                            }
                        }
                        if (plotList.plotPlan) {
                            if (sharedPlotData[i].type === 'plans') {
                                console.log('okToAddPlan set to false');
                                okToAddPlan = false;
                            }
                        }
                    }
                }
                if (okToAddSurvey) {
                    if (plotList.plotSurvey) {                  
                        console.log('Surveys ' + plotList.name + ' Subscription Started');
                        this.dataStorageService.fetchSurveyHeaderPlotData(plotList.name)
                            .subscribe();    
                    } 
                    okToAddSurvey = false;
                } 
                if (okToAddPlan) {
                    if (plotList.plotPlan) {
                        console.log('Plans ' + plotList.name + ' Subscription Started');
                        this.dataStorageService.fetchPlanHeaderPlotData(plotList.name)
                            .subscribe();                             
                    }
                    okToAddPlan = false;
                }
            }
        }); 
    }
    
}