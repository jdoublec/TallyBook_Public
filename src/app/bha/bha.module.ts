import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BHAComponent } from './bha.component';
import { BHAListComponent } from './bha-list/bha-list.component';
import { BHAItemComponent } from './bha-list/bha-item/bha-item.component';
import { BHAEditComponent } from './bha-edit/bha-edit.component';
import { BHARoutingModule } from './bha.routing.module';
import { BHADetailComponenet } from './bha-detail/bha-detail.component';
import { CommonModule } from '@angular/common';
import { BHAStartComponent } from './bha-start/bha-start.component';
import { FormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { BHABitGradeComponent } from './bha-bit-grade/bha-bit-grade.component';

@NgModule({
    declarations: [ 
    BHAComponent,
    BHAListComponent,
    BHAItemComponent,
    BHAEditComponent,
    BHADetailComponenet,
    BHAStartComponent,
    BHABitGradeComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        BHARoutingModule,
        FormsModule,
        SharedModule,
    ],
})
export class BHAModule {

}