import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivitiesComponent } from './activities.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from '../auth/auth.guard';
import { FormatDatePipe } from './format-date.pipe';

@NgModule({
    declarations: [
        ActivitiesComponent,
        FormatDatePipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        SharedModule,
        RouterModule.forChild([                   
            { path: '', component: ActivitiesComponent, canActivate: [AuthGuard] },
        ]),
    ]
})

export class ActivitiesModule {}