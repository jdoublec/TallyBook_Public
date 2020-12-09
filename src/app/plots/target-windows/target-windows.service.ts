import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TargetWindows } from './target-windows.model';



@Injectable({ providedIn: 'root' })

export class TargetWindowsService {
    showTargetWindows = new BehaviorSubject<boolean>(false);
    targetWindowsChanged = new BehaviorSubject<boolean>(false);
    targetWindows: TargetWindows[] = [
        // {
        //     startDepth: 0,
        //     endDepth: 2300,
        //     above: 20,
        //     below: 20,
        //     right: 20,
        //     left: 20,

        // },
        // {
        //     startDepth: 2300,
        //     endDepth: 13763,
        //     above: 50,
        //     below: 50,
        //     right: 50,
        //     left: 50,

        // },
        // {
        //     startDepth: 13763,
        //     endDepth: 26730,
        //     above: 10,
        //     below: 20,
        //     right: 50,
        //     left: 50,

        // },
    ];

    setTargetWindows(targetWindows: TargetWindows[]) {
        this.targetWindows = targetWindows;
        this.targetWindowsChanged.next(true);        
    }

    getTargetWindows() {
        return this.targetWindows.slice();
    }

    onShowTargetWindows() {
        this.showTargetWindows.next(true);
    }

    onHideTargetWindows() {
        this.showTargetWindows.next(false);
    }
}