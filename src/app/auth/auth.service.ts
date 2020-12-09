import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, BehaviorSubject } from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { TallyBookService } from '../tally-book/new-tally-book/tally-book.service';
import { DataStorageService } from '../shared/data-storage.service';
import { ActivitiesService } from '../activities/activities.service';
import { ModelsService } from '../shared/models.service';
import { BHAService } from '../bha/bha.service';
import { TallyService } from '../tally/tally.service';
import { NotesService } from '../notes/notes.service';
import { PlotDataService } from '../plots/plot-data.service';
import { PlotsService } from '../plots/plots.service';
import { PlansService } from '../plans/plans.service';
import { SurveysService } from '../surveys/surveys.service';

export interface AuthResponseData {
    kind: string;
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;
}

@Injectable({ providedIn: 'root'})
export class AuthService {
    userSubject = new BehaviorSubject<User>(null); 
    private tokenExpirationTimer: any; 

    constructor(private http: HttpClient, 
                private router: Router,
                private activitiesService: ActivitiesService,
                private bhaService: BHAService,
                private dataStorageService: DataStorageService,                
                private modelService: ModelsService,
                private noteService: NotesService,
                private planService: PlansService,
                private plotDataService: PlotDataService,    
                private plotService: PlotsService, 
                private surveyService: SurveysService,             
                private tallyService: TallyService,
                private tallyBookService: TallyBookService,
                ){}

    signup(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            // 'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyDFfgj6empw8APfu9TYsfiBau8z6TM4tc0',
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
            {
                email: email, 
                password: password,
                returnSecureToken: true
            }
            ).pipe(catchError(this.handleError), 
            tap(resData => {
                this.handleAuthentication(
                    resData.email, 
                    resData.localId, 
                    resData.idToken, 
                    +resData.expiresIn,
                );
                this.dataStorageService.storeNewUser(resData.email, resData.localId);
                
            })
        );
    }

    login(email: string, password: string) {
        return this.http.post<AuthResponseData>(
            // 'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyDFfgj6empw8APfu9TYsfiBau8z6TM4tc0',
            'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
            {
                email: email, 
                password: password,
                returnSecureToken: true
            }
        )
        .pipe(catchError(this.handleError), 
        tap(resData => {
                this.handleAuthentication(
                    resData.email, 
                    resData.localId, 
                    resData.idToken, 
                    +resData.expiresIn
                );
            })
        );        
    }

    logout() {
        this.userSubject.next(null);
        this.router.navigate(['/auth']);
        this.activitiesService.setActivitiesList([]);
        this.modelService.setModels([]);        
        this.plotDataService.setSharedPlotData([]);
        this.plotService.setPlotList([]);       
        this.tallyBookService.setTallyBookList([]);
        localStorage.removeItem('userData');
        localStorage.removeItem('tallyBookList');
        localStorage.removeItem('activitiesList');
        localStorage.removeItem('models');
        localStorage.removeItem('plotList');
        localStorage.removeItem('sharedPlotData');
        this.tallyBookService.changeCurrentTallyBook('Tally Book');
        
        this.closeTallyBook();

        if (this.tokenExpirationTimer) {
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogin() {
        //parse converts a strigified object back to a js object literal. 
        const userData: {
            email: string;
            id: string;
            _token: string;
            _tokenExpirationDate: string;
        } = JSON.parse(localStorage.getItem('userData'));        

        if (!userData) {
            return;
        }

        const loadedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));

        if (loadedUser.token) { 
            this.tallyBookService.setTallyBookList(JSON.parse(localStorage.getItem('tallyBookList')));
            this.activitiesService.setActivitiesList(JSON.parse(localStorage.getItem('activitiesList')));
            this.modelService.setModels(JSON.parse(localStorage.getItem('models')));  
            this.plotService.setPlotList(JSON.parse(localStorage.getItem('plotList')));
            this.plotDataService.setSharedPlotData(JSON.parse(localStorage.getItem('sharedPlotData')));
            this.userSubject.next(loadedUser);
            const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            // this.autoLogout(expirationDuration);
        }
    }

    autoLogout(expirationDuration: number) {
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
        // }, 15000);

    }

    private handleAuthentication(
        email: string, 
        userId: string, 
        token: string, 
        expiresIn: number) {
         //getTime is in milliseconds.  expiresIn is in seconds.  That's why it needs to be multiplied by 1000. 
        const expirationDate = new Date(new Date().getTime() + expiresIn * 1000);
        const user = new User(
            email,
            userId, 
            token, 
            expirationDate
        );
        this.userSubject.next(user);
        // this.autoLogout(expiresIn * 1000);
        
        //stringify converts an object and all it's components to a string. 
        localStorage.setItem('userData', JSON.stringify(user));
        this.dataStorageService.fetchTallyBookList(user.email).subscribe();
        this.dataStorageService.fetchActivitiesList(user.email).subscribe();
        this.dataStorageService.fetchModels(user.email).subscribe();  
    }

    closeTallyBook() {
        this.activitiesService.setDailyActivities([]);        
        this.bhaService.setBHAs([]);
        this.noteService.setNotes([]);  
        this.planService.setPlanHeader([]);         
        this.planService.setPlans([]);
        this.planService.setIntPlans([]); 
        this.surveyService.setSurveyHeader([]);
        this.surveyService.setSurveys([]);    
        this.surveyService.setIntSurveys([]);   
        this.tallyService.setTally([]);
        this.tallyService.setTallyHeader([]);        
    }

    private handleError(errorRes: HttpErrorResponse) {
        let errorMessage = 'An unknown error occurred!';
            if (!errorRes.error || !errorRes.error.error){
                return throwError(errorMessage);
            }
            switch(errorRes.error.error.message) {
                case 'EMAIL_EXISTS':
                    errorMessage = 'This email exists already.';
                    break;
                case 'EMAIL_NOT_FOUND':
                    errorMessage = 'This email does not exist.'
                    break;
                case 'INVALID_PASSWORD':
                    errorMessage = 'This password is not correct.';
                    break;
                    
            }
            return throwError(errorMessage);
    }

    getCurrentUserEmail() {
        const user: User = JSON.parse(localStorage.getItem('userData'));
        const email: string = user.email;
        return email;
    }

    getCurrentUserID() {
        const user: User = JSON.parse(localStorage.getItem('userData'));
        const userID: string = user.id;
        return userID;
    }
}