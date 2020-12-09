import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { MembersService } from './members.service';

@Injectable({providedIn: 'root'})
export class ApplicationStateService {
  currentTableHeightChanged = new Subject<number>();
  currentTableHeight: number;
  readOnlyAccess: boolean = true;

  private isMobileResolution: boolean;

  constructor(private membersService: MembersService) {    
    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }    

    this.readOnlyAccess = membersService.getCurrentUserPermissions();
    this.setCurrentTableHeight(400, 300, 400, 300);
  }

  getIsMobileResolution(): boolean {
    return this.isMobileResolution;
  }

  setCurrentTableHeight(readWriteMobileReducer: number, readWriteDesktopReducer: number, 
                      readOnlyMobileReducer: number, readOnlyDesktopReducer: number,
                      readWritePlotSurveysViewReducer: number = 1000, plotMode: boolean = false) {

    this.readOnlyAccess = this.membersService.getCurrentUserPermissions();
    if (!this.readOnlyAccess) {
      if (this.isMobileResolution) {
        this.currentTableHeight = window.innerHeight - readWriteMobileReducer; 
      } else {
        if (!plotMode) {
          this.currentTableHeight = window.innerHeight - readWriteDesktopReducer;
        } else {          
          this.currentTableHeight = window.innerHeight - readWritePlotSurveysViewReducer;
          console.log(this.currentTableHeight);
        }
      }    
    } else {
      if (this.isMobileResolution) {
        this.currentTableHeight = window.innerHeight - readOnlyMobileReducer;
      } else {
        this.currentTableHeight = window.innerHeight - readOnlyDesktopReducer;
      };
    }
    this.currentTableHeightChanged.next(this.currentTableHeight);
  }

  getCurrentTableHeight() {
    return this.currentTableHeight;
  }
}