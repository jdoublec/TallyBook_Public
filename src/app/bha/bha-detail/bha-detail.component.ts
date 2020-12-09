import { Component, OnInit } from '@angular/core';
import { BHA } from '../bha.model';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { BHAService } from '../bha.service';
import { ActivitiesService } from 'src/app/activities/activities.service';

@Component({
    selector: "app-bha-detail",
    templateUrl: './bha-detail.component.html',
    styleUrls: ['./bha-detail.component.css']
})
export class BHADetailComponenet implements OnInit {
    bha: BHA;
    id: number;

    constructor(private bhaService: BHAService,
                private activitiesService: ActivitiesService, 
                private route: ActivatedRoute,
                private router: Router) {}
            
    ngOnInit() {      
        this.route.params.subscribe(
            (params: Params) => {
                this.id = +params['id'];
                this.bha = this.bhaService.getBHA(this.id);               
            }
        )   
    }
        
    getAccumLength(index: number) {
        return this.bhaService.getAccumLength(this.bha, this.id, index);
    }

    onSelectItem(index: number) {
        //Show Spec Sheet.
    }
    
    onEditBHA() {
        this.router.navigate(['edit'], {relativeTo: this.route, queryParamsHandling: 'preserve'});
    }

    onDeleteBHA() {
        this.activitiesService.removeBHAFromActivities(this.bha.name);
        this.bhaService.deleteBHA(this.id);
        this.router.navigate(['../'], {relativeTo: this.route})
    }

    onGradeBit() {
        this.router.navigate(['bitGrade'], {relativeTo: this.route, queryParamsHandling: 'preserve'});
    }

    hasSpecSheet(index: number) {
        if (this.bha.items[index].specSheetPath !== '') {
          return true;
        } 
        return false;
      }
}