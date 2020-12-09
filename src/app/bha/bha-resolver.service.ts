import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DataStorageService } from 'src/app/shared/data-storage.service';
import { BHA } from './bha.model';
import { BHAService } from './bha.service';

@Injectable ({ providedIn: 'root'})
export class BHAResolverService implements Resolve<BHA[]> {

    constructor(private dataStorageService: DataStorageService,
                private bhaService: BHAService) {}
                      
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {        
        const bhas = this.bhaService.getBHAs();    

        if (bhas.length === 0){
            return null; //this.dataStorageService.fetchBHAs();
        } else {
            return bhas;
        }
    }
}