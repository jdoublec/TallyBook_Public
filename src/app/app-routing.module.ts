import { NgModule } from "@angular/core";
import { Routes, RouterModule, PreloadAllModules } from "@angular/router";
import { ModelsComponent } from './models/models.component';
import { NotesComponent } from './notes/notes.component';
import { AuthGuard } from './auth/auth.guard';
import { TallyBookComponent } from './tally-book/new-tally-book/tally-book.component';
import { ShareTallyBookComponent } from './tally-book/share-tally-book/share-tally-book.component';
import { SurveysComponent } from './surveys/surveys.component';
import { PlotsComponent } from './plots/plots.component';
import { PlansComponent } from './plans/plans.component';
import { CommonModule } from '@angular/common';

const appRoutes: Routes = [    
    { 
        path: '', redirectTo: '/models', pathMatch: 'full'        
    }, 
    {
        path: 'tally', loadChildren: './tally/tally.module#TallyModule'
    },
    {
        path: 'surveys', component: SurveysComponent, canActivate: [AuthGuard]
    },  
    {
        path: 'plots', component: PlotsComponent, canActivate: [AuthGuard]
    },  
    {
        path: 'plans', component: PlansComponent, canActivate: [AuthGuard]
    },
    {
        path: 'activities', loadChildren: './activities/activities.module#ActivitiesModule'
    },
    { 
        path: 'bha', loadChildren: './bha/bha.module#BHAModule' 
    },  
    {
        path: 'models', component: ModelsComponent, canActivate: [AuthGuard]
    },
    {
        path: 'notes', component: NotesComponent, canActivate: [AuthGuard]
    },
    {
        path: 'tallyBook/share', component: ShareTallyBookComponent, canActivate: [AuthGuard]
    },
    {
        path: 'tallyBook/:state', component: TallyBookComponent, canActivate: [AuthGuard]
    },   
    { 
        path: 'auth', loadChildren: './auth/auth.module#AuthModule'
    }, 
];

@NgModule({
    imports: [    
        // RouterModule.forRoot(appRoutes, {useHash: true})
        //Preloading used with lazy loading loads the pages that aren't needed in the background for future use.
        RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules})
        //RouterModule.forRoot(appRoutes)
    ],
    exports: [
        RouterModule
    ]
})

export class AppRoutingModule{

}