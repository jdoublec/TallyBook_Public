import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TallyComponent } from './tally.component';
import { SharedModule } from '../shared/shared.module';
import { AuthGuard } from '../auth/auth.guard';
// import { ReversePipe } from '../shared/reverse.pipe';

const routes: Routes = [
    { path: '',
        component: TallyComponent,
        canActivate: [AuthGuard],
        children:[
            {path: '', redirectTo: '/tally', pathMatch: 'full'},            
        ]}
];

@NgModule({
    declarations: [
        TallyComponent,        
    ],
    imports: [
        SharedModule,
        RouterModule.forChild(routes)
        // RouterModule.forChild([                   
        //     { path: '', component: TallyComponent },
        // ])
        
        //SharedModule
    ],
    exports: [
        RouterModule
    ]
})

export class TallyModule {}