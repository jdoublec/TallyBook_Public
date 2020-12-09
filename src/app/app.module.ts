import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { TallyModule } from './tally/tally.module';
import { BHAModule } from './bha/bha.module';
import { ActivitiesModule } from './activities/activities.module';
import { SharedModule } from './shared/shared.module';
import { ModelsComponent } from './models/models.component';
import { NotesComponent } from './notes/notes.component';
import { AuthInterceptorService } from './auth/auth-interceptor.service';
import { TallyBookComponent } from './tally-book/new-tally-book/tally-book.component';
import { ShareTallyBookComponent } from './tally-book/share-tally-book/share-tally-book.component';
// import { ReversePipe } from './shared/reverse.pipe';
import { SurveysComponent } from './surveys/surveys.component';
import { PlotsComponent } from './plots/plots.component';
import { PlansComponent } from './plans/plans.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PlotsSettingsComponenet } from './plots/plots-settings/plots-settings.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TargetWindowsComponent } from './plots/target-windows/target-windows.component';
import { MatIconModule, MatOptionModule, MatFormFieldModule, MatDatepickerModule, MatSelectModule, MatNativeDateModule, MatInputModule } from '@angular/material';
import { PlotsSurveysComponent } from './plots/plots-surveys/plots-surveys.component';

@NgModule({
  declarations: [
    AppComponent,
    TargetWindowsComponent,
    HeaderComponent,
    ModelsComponent,
    NotesComponent,
    PlotsComponent,
    PlotsSurveysComponent,
    PlotsSettingsComponenet,
    PlansComponent,    
    ShareTallyBookComponent,
    // ReversePipe,
    SurveysComponent,
    TallyBookComponent,
  ],
  imports: [    
    ActivitiesModule,
    AppRoutingModule,
    BHAModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    SharedModule,
    TallyModule,
    BrowserAnimationsModule,


    MatIconModule,
    MatOptionModule,
    MatFormFieldModule,    
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatInputModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, 
      useClass: AuthInterceptorService, 
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
