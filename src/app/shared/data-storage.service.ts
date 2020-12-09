import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

import { ActivitiesService } from '../activities/activities.service';
import { ActivitiesList } from './activity.model';
import { TallyService } from '../tally/tally.service';
import { BHAService } from '../bha/bha.service';
import { ModelsService } from './models.service';
import { Model } from './models.model';
import { NotesService } from '../notes/notes.service';
import { TallyBook, TallyBookList } from '../tally-book/new-tally-book/tally-book.model';
import { TallyBookService } from '../tally-book/new-tally-book/tally-book.service';
import { MembersService, Members } from './members.service';
import { UserData } from './user-data.model';
import { SurveysService } from '../surveys/surveys.service';
import { PlansService } from '../plans/plans.service';
import { Surveys, SurveyHeader } from '../surveys/surveys.model';
import { Plans, PlanHeader } from '../plans/plans.model';
import { PlotDataService } from '../plots/plot-data.service';
import { TargetWindowsService } from '../plots/target-windows/target-windows.service';

@Injectable ({ providedIn: 'root'})
export class DataStorageService {
    // private userID: string;

    constructor(private http: HttpClient,
                private membersService: MembersService,
                private tallyBookService: TallyBookService,
                private bhaService: BHAService,
                private tallyService: TallyService, 
                private surveysService: SurveysService, 
                private targetWindowsService: TargetWindowsService,
                private plansService: PlansService,
                private plotDataService: PlotDataService,
                private activitiesService: ActivitiesService,                             
                private notesService: NotesService,
                private modelsService: ModelsService,
                ) {}

    storeNewUser(email: string, userID: string) {
        const formattedEmail = email.split('.').join(',');
        const newUser: UserData = {
                userID: userID            
        }

        this.http.put('https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '.json',
                        newUser)
                        .subscribe(response => {
                            // console.log(response);
                        });         
    }    

    storeTransformedTallyBookList(email: string) {
        // const formattedEmail = email.split('.').join(',');

        // let tallyBookListOld = this.tallyBookService.getTallyBookList();    
        
        // // tallyBookList.splice(0, 1);

        // // const tallyBookListObject = tallyBookList.reduce((obj, item) => {
        // //     obj[item.name] = {"createDate": item.createDate};
        // //     return obj
        // // }, {})   

        

        // let tallyBookListTemp: TallyBookListTemp = {};
        // let created = false;
        // tallyBookListOld.forEach(book => {
        //     if (created) {
        //         tallyBookListTemp[book.name] = ({['createDate']: book.createDate}); 
        //     } else {
        //         created = true;
        //         tallyBookListTemp[book.name] = ({['createDate']: book.createDate}); 
        //         // tallyBookListTemp = {[book.name]: {['createDate']: book.createDate}};            
        //     }
        // })

        // console.log(tallyBookListOld);
        // console.log(tallyBookListTemp);
        // this.http.put(
        //     'https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '/TallyBookList.json',
        //         tallyBookListTemp)
        //         .subscribe(response => {
        //             console.log(response);
        //         });           
    }

    unshareTallyBook(email: string, currentTallyBookName: string) {
        this.membersService.removeMember(email);
        
        this.removeFromTallyBookList(email, currentTallyBookName).subscribe();
        
        this.storeTallyBookMembers(currentTallyBookName);
    }

    private removeFromTallyBookList(email: string, currentTallyBookName: string) {
        const formattedEmail = email.split('.').join(',');
        return this.http
            .get<TallyBookList>(
                'https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '/TallyBookList.json'
        )
        .pipe(    
            map(tallyBookList => {
                if (tallyBookList) {
                    return tallyBookList;
                } else {
                    return [];
                }
            }),
            tap(tallyBookList => {
                delete tallyBookList[currentTallyBookName];

                this.http.put(
                    'https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '/TallyBookList.json',
                        tallyBookList)
                        .subscribe(response => {
                            console.log(response);
                        });  
            })
        );     
    }

    shareTallyBook(userID: string,
                               email: string, 
                               tallyBookName: string,                                
                               readAccess: boolean) {

        const formattedEmail = email.split('.').join(',');
        return this.http.get<TallyBookList[]>(
            'https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '/TallyBookList.json')
        .pipe(                        
            map(tallyBookList => {
                if (tallyBookList) {
                    return tallyBookList;
                } else {
                    return '';
                }
            }),
            tap((tallyBookList: TallyBookList) => {
                if (tallyBookList) {
                    tallyBookList[tallyBookName] = {['createDate']: new Date()};
                } else {
                    tallyBookList = {[tallyBookName]: {['createDate']: new Date()}};
                }
                const formattedEmail = email.split('.').join(',');    
                    
                this.http.put(
                    'https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '/TallyBookList.json',
                        tallyBookList)
                        .subscribe(response => {
                            console.log(response);
                        }); 

                this.membersService.addMember(readAccess, userID, email);

                let members = this.membersService.getMembers();

                this.http.put(
                    'https://tallybook-5d807.firebaseio.com/Tally Books/' + tallyBookName + '/members.json',
                        members) 
                        .subscribe(response => {
                            // console.log(response);
                        });   
                })        
            );    
    }

    getUserIDtoShare(email: string) {
        const formattedEmail = email.split('.').join(',');
        return this.http.get<string>('https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '/userID.json')
        .pipe(    
            map(userID => {
                if (userID) {
                    return userID;
                } else {
                    return '';
                }
            }),
        );
    }

    storeActivitiesList(email: string) {
        const formattedEmail = email.split('.').join(',');
        const activitiesList = this.activitiesService.getActivitiesList();
        this.http.put(
            'https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '/ActivitiesList.json',
                activitiesList)
                .subscribe(response => {
                    console.log(response);
                });                                            
    }

    fetchActivitiesList(email: string) {
        const formattedEmail = email.split('.').join(',');
        return this.http
            .get<ActivitiesList[]>(
                'https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '/ActivitiesList.json'
        )
        .pipe(    
            map(activitiesList => {
                if (activitiesList) {
                    return activitiesList.map(activitiesList => {
                        return {
                            ...activitiesList,
                        };
                    });
                } else {
                    return [];
                }
            }),
            tap(activitiesList => {
                this.activitiesService.setActivitiesList(activitiesList);
            })
        );     
    }

    storeModels(email: string) {
        const formattedEmail = email.split('.').join(',');
        const models = this.modelsService.getModels();
        return this.http.put(
            'https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '/Models.json',
                models)
                .pipe(
                    map(response => {
                        return response;
                    })

                );                                       
    }

    fetchModels(email: string) {
        const formattedEmail = email.split('.').join(',');
        return this.http
            .get<Model[]>(
                'https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '/Models.json'
        )
        .pipe(    
            map(models => {
                if (models) {
                    return models.map(models => {
                        return {
                            ...models
                        };
                    });
                } else {
                    return [];
                }
            }),
            tap(models => {  
                    models.forEach(model => {
                        this.modelsService.addModel(model);
                    }) 
            })
        );       
    }

    storeTallyBookList(email: string) {
        const formattedEmail = email.split('.').join(',');
        const tallyBookList = this.tallyBookService.getTallyBookList();
        this.http.put(
            'https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '/TallyBookList.json',
                tallyBookList)
                .subscribe(response => {
                    console.log(response);
                });                                            
    }

    fetchTallyBookList(email: string) {
        const formattedEmail = email.split('.').join(',');
        return this.http
            .get<TallyBookList[]>(
                'https://tallybook-5d807.firebaseio.com/users/' + formattedEmail + '/TallyBookList.json'
        )
        .pipe(    
            map(tallyBookList => {
                if (tallyBookList) {
                    return tallyBookList;                    
                } else {
                    return [];
                }
            }),
            tap(tallyBookList => {
                this.tallyBookService.setTallyBookList(tallyBookList);                
            })
        );     
    }

    storeTallyBookMembers(currentTallyBookName: string) {
        if (currentTallyBookName !== 'Tally Book') {
            const members = this.membersService.getMembers();
            this.http.put(
                'https://tallybook-5d807.firebaseio.com/Tally Books/' + currentTallyBookName + '/members.json',
                    members) 
                    .subscribe(response => {
                        // console.log(response);
                    });   
        }                                         
    }

    fetchTallyBookMembers(currentTallyBookName: string) {
        if (currentTallyBookName !== 'Tally Book') {            
            return this.http
            .get<Members[]>(
                'https://tallybook-5d807.firebaseio.com/Tally Books/' + currentTallyBookName + '/members.json'
            )
            .pipe(    
                map(members => {
                    if (members) {
                        return members;
                    } else {
                        return [];
                    }
                }),
                tap(members => {
                    this.membersService.setMembers(members);
                })
            );
        }
    }

    storeTallyBook(currentTallyBookName: string) {
        if (currentTallyBookName !== 'Tally Book') {
            
            const tallyBook: TallyBook = {            
                bhas: this.bhaService.getBHAs(),
                tallyHeader: this.tallyService.getTallyHeader(),                      
                tally: this.tallyService.getTally(),
                surveyHeader: this.surveysService.getSurveyHeader(),
                surveys: this.surveysService.getSurveys(),
                targetWindows: this.targetWindowsService.getTargetWindows(),
                planHeader: this.plansService.getPlanHeader(),
                plans: this.plansService.getPlans(),
                dailyActivities: this.activitiesService.getDailyActivities(),
                notes: this.notesService.getNotes(), 
            }
            return this.http.put(
                'https://tallybook-5d807.firebaseio.com/Tally Books/' + currentTallyBookName + '/Tally Book.json',
                    tallyBook) 
                    .pipe(
                        map(response => {
                            return response;
                        })
                    );  
                    }                                         
    }

    // storeDailyActivities(currentTallyBookName: string) {
    //     console.log(currentTallyBookName)
    //     console.log(this.activitiesService.getTempDailyActivities());
    //     if (currentTallyBookName !== 'Tally Book') {
            
    //         const tallyBook: TempTallyBook = {            
    //             bhas: this.bhaService.getBHAs(),
    //             tallyHeader: this.tallyService.getTallyHeader(),                      
    //             tally: this.tallyService.getTally(),
    //             surveyHeader: this.surveysService.getSurveyHeader(),
    //             surveys: this.surveysService.getSurveys(),
    //             planHeader: this.plansService.getPlanHeader(),
    //             plans: this.plansService.getPlans(),
    //             dailyActivities: this.activitiesService.getTempDailyActivities(),
    //             notes: this.notesService.getNotes(), 
    //         }

    //         console.log(tallyBook);
    //         return this.http.put(
    //             'https://tallybook-5d807.firebaseio.com/Tally Books/' + currentTallyBookName + '/Tally Book.json',
    //                 tallyBook) 
    //                 .pipe(
    //                     map(response => {
    //                         return response;
    //                     })
    //                 );  
    //         }                                 
    // }

    fetchTallyBook(currentTallyBookName: string) {
        if (currentTallyBookName !== 'Tally Book') {            
            return this.http            
                .get<TallyBook>(             
                    'https://tallybook-5d807.firebaseio.com/Tally Books/' + currentTallyBookName + '/Tally Book.json',
            )
            .pipe(  
                map(tallyBook => {
                    if (tallyBook) {
                            return {
                                ...tallyBook, 
                                bhas: tallyBook.bhas ? tallyBook.bhas : [],
                                tallyHeader: tallyBook.tallyHeader ? tallyBook.tallyHeader: {},
                                tally: tallyBook.tally ? tallyBook.tally : [],
                                surveyHeader: tallyBook.surveyHeader ? tallyBook.surveyHeader : {},
                                surveys: tallyBook.surveys ? tallyBook.surveys : [],
                                targetWindows: tallyBook.targetWindows ? tallyBook.targetWindows : [],
                                planHeader: tallyBook.planHeader ? tallyBook.planHeader : {},
                                plans: tallyBook.plans ? tallyBook.plans : [],
                                dailyActivities: tallyBook.dailyActivities ? tallyBook.dailyActivities : [],
                                notes: tallyBook.notes ? tallyBook.notes : [],
                            };
                    } else {
                        return [];
                    }
                }),
                tap(tallyBook => {
                        this.bhaService.setBHAs(tallyBook['bhas']); 
                        this.tallyService.setTallyHeader(tallyBook['tallyHeader']); 
                        this.tallyService.setTally(tallyBook['tally']);  
                        this.surveysService.setSurveyHeader(tallyBook['surveyHeader']);                       
                        this.surveysService.setSurveys(tallyBook['surveys']);
                        this.targetWindowsService.setTargetWindows(tallyBook['targetWindows']);
                        this.plansService.setPlanHeader(tallyBook['planHeader']);                        
                        this.plansService.setPlans(tallyBook['plans']);
                        this.activitiesService.setDailyActivities(tallyBook['dailyActivities']);
                        this.notesService.setNotes(tallyBook['notes']);

                        // this.surveysService.updateOrientationToPlan();
                })
            );
        }
    }

    fetchSurveyHeaderPlotData(tallyBookName: string) {
        if (tallyBookName !== 'Tally Book') {            
            return this.http            
                .get<Surveys[]>(             
                    'https://tallybook-5d807.firebaseio.com/Tally Books/' + tallyBookName + '/Tally Book/surveyHeader.json',
                )          
                .pipe(  
                    map((surveyHeader: SurveyHeader) => {
                        if (surveyHeader) {
                                return surveyHeader;
                                // return {
                                //     ...surveyHeader, 
                                //     surveyHeader: surveyHeader ? surveyHeader : {}, 
                                // };
                        } else {
                            return {};
                        }
                    }),
                    tap(surveyHeader => {        
                        // this.plotDataService.addSurveyToSharedPlotData(tallyBookName, surveyHeader['surveyHeader']);
                        this.fetchSurveyPlotData(tallyBookName, surveyHeader).subscribe();
                    })
                );            
        }
    }

    fetchSurveyPlotData(tallyBookName: string, surveyHeader: SurveyHeader) {
        if (tallyBookName !== 'Tally Book') {            
            return this.http            
                .get<Surveys[]>(             
                    'https://tallybook-5d807.firebaseio.com/Tally Books/' + tallyBookName + '/Tally Book/surveys.json',
                )          
                .pipe(  
                    map((surveys: Surveys[]) => {
                        if (surveys) {
                                return {
                                    surveys
                                };
                        } else {
                            return [];
                        }
                    }),
                    tap(surveys => {        
                        this.plotDataService.addSurveysToSharedPlotData(tallyBookName, surveys['surveys'], surveyHeader);
                    })
                );            
        }
    }

    fetchPlanHeaderPlotData(tallyBookName: string) {
        if (tallyBookName !== 'Tally Book') {            
            return this.http            
                .get<PlanHeader>(             
                    'https://tallybook-5d807.firebaseio.com/Tally Books/' + tallyBookName + '/Tally Book/planHeader.json',
                )
                .pipe(  
                    map((planHeader: PlanHeader) => {
                        if (planHeader) {
                            return planHeader;
                            // return {
                            //     ...planHeader, 
                            //     planHeader: planHeader ? planHeader : {},
                            // };                        
                        } else {
                            return {};
                        }
                    }),
                    tap(planHeader => {
                        // this.plotDataService.addPlanToSharedPlotData(tallyBookName, plan['plan']);
                        this.fetchPlanPlotData(tallyBookName, planHeader).subscribe();
                    })
                );            
        }
    }

    fetchPlanPlotData(tallyBookName: string, planHeader: PlanHeader) {
        if (tallyBookName !== 'Tally Book') {            
            return this.http            
                .get<Plans[]>(             
                    'https://tallybook-5d807.firebaseio.com/Tally Books/' + tallyBookName + '/Tally Book/plans.json',
                )
                .pipe(  
                    map((plans: Plans[]) => {
                        if (plans) {
                            return {
                                plans
                            };                        
                        } else {
                            console.log("Crap");
                            return [];
                        }
                    }),
                    tap(plans => {
                        this.plotDataService.addPlansToSharedPlotData(tallyBookName, plans['plans'], planHeader);
                    })
                );            
        }
    }

    fetchAllTallyBookNames() {        
        return this.http            
            .get<string[]>(             
                'https://tallybook-5d807.firebaseio.com/Tally Books.json?shallow=true',
        )
        .pipe(  
            map(tallyBook => {
                if (tallyBook) {
                    return tallyBook;                                          
                } else {
                    return [];
                }
            }),
        );            
    }    
}