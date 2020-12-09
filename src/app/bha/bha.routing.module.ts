import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BHAComponent } from './bha.component';
import { BHAEditComponent } from './bha-edit/bha-edit.component';
import { BHAResolverService } from './bha-resolver.service';
import { BHADetailComponenet } from './bha-detail/bha-detail.component';
import { BHAStartComponent } from './bha-start/bha-start.component';
import { BHABitGradeComponent } from './bha-bit-grade/bha-bit-grade.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
    { path: '', 
        component: BHAComponent, 
        canActivate: [AuthGuard],
        children:[
        { path: '', component: BHAStartComponent},
        //new should be before :id because :id is a dynamic path and it will think that new needs an id
        //in the path if id comes first. 
        { path: 'new', component: BHAEditComponent},
        { 
            path: ':id', 
            component: BHADetailComponenet, 
            resolve: [BHAResolverService] },        
        { 
            path: ':id/edit', 
            component: BHAEditComponent, 
            resolve: [BHAResolverService]},
        { 
            path: ':id/bitGrade', 
            component: BHABitGradeComponent, 
            resolve: [BHAResolverService]},
    ] },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes)    
    ],
    exports: [
        RouterModule
    ]

})
export class BHARoutingModule {}