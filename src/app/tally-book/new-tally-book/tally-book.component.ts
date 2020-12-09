import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TallyBookList } from './tally-book.model';
import { TallyBookService } from './tally-book.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BHAService } from '../../bha/bha.service';
import { TallyService } from '../../tally/tally.service';
import { ActivitiesService } from '../../activities/activities.service';
import { NotesService } from '../../notes/notes.service';
import { DataStorageService } from 'src/app/shared/data-storage.service';
import { MembersService, Members } from 'src/app/shared/members.service';
import { AuthService } from 'src/app/auth/auth.service';
import { SurveysService } from 'src/app/surveys/surveys.service';
import { SurveyHeader } from 'src/app/surveys/surveys.model';
import { TallyHeader } from 'src/app/shared/tally.model';
import { PlanHeader } from 'src/app/plans/plans.model';
import { PlansService } from 'src/app/plans/plans.service';
import { ConstantPool } from '@angular/compiler';

@Component({
  selector: 'app-tally-book',
  templateUrl: './tally-book.component.html',
  styleUrls: ['./tally-book.component.css']
})
export class TallyBookComponent implements OnInit, OnDestroy {
  tallyBookListSub: Subscription;
  tallyBookList: TallyBookList;
  newTallyBookName: string = '';
  validTallyBookName: boolean = false;
  isNewTallyBook: boolean = false;  
  allTallyBookNames: string[];
  tallyHeader: TallyHeader;
  surveyHeader: SurveyHeader;
  planHeader: PlanHeader;
  plotWell: boolean = false;

  constructor(private route: ActivatedRoute,
              private tallyBookService: TallyBookService,
              private router: Router,
              private bhaService: BHAService,
              private tallyService: TallyService,
              private surveysService: SurveysService,
              private plansService: PlansService,
              private activitiesService: ActivitiesService,
              private notesService: NotesService,
              private dataStorageService: DataStorageService,
              private membersService: MembersService,
              private authService: AuthService) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        if (params['state'] === 'new') {
          this.isNewTallyBook = true;
        } else {
          this.isNewTallyBook = false;
        }
      }
    );

    this.tallyBookList = this.tallyBookService.getTallyBookList();
    
    this.tallyBookListSub = this.tallyBookService.tallyBookListChanged
      .subscribe(
        (tallyBookList: TallyBookList[]) => {
          this.tallyBookList = tallyBookList;
          }
    );    

    this.dataStorageService.fetchAllTallyBookNames()
      .subscribe(
        (names: string[]) => {
          this.allTallyBookNames = names;
    });

    if (!this.isNewTallyBook) {
      //this.oldTallyBookName = this.tallyBookService.getOldTallyBookName();
      this.newTallyBookName = this.tallyBookService.getCurrentTallyBookName();
    }
  }

  doesTallyBookNameExist() {  
    if (this.newTallyBookName !== 'Tally Book') {
      this.validTallyBookName = !Object.keys(this.allTallyBookNames).some(key => key === this.newTallyBookName);
    } else {
      this.validTallyBookName = false;
    }
    
  }

  onCreateChangeTallyBookName() {
    this.tallyBookService.addUpdateTallyBookList(this.newTallyBookName, this.isNewTallyBook);

    if (this.isNewTallyBook) {
      this.bhaService.setBHAs([]);  
      this.tallyService.setTally([]);               
      this.surveysService.setSurveys([]);
      this.activitiesService.setDailyActivities([]);
      this.notesService.setNotes([]);       

      this.tallyService.setOffset(0); 
      this.tallyService.setStartingValue(0); 

      this.surveyHeader = {vsDirection: 0};  
      this.surveyHeader['northing'] = 0; 
      this.surveyHeader['easting'] = 0;   
      this.surveyHeader['elevation'] = 0; 
      this.surveysService.setSurveyHeader(this.surveyHeader);

      this.planHeader = {vsDirection: 0};  
      this.planHeader['northing'] = 0; 
      this.planHeader['easting'] = 0;   
      this.planHeader['elevation'] = 0; 
      this.plansService.setPlanHeader(this.planHeader);

      let members: Members = {};

      members['admin'] = this.authService.getCurrentUserID();
      this.membersService.setMembers(members);
    } 

    this.router.navigate(['/tally']);
  }

  ngOnDestroy() {
    this.tallyBookListSub.unsubscribe();
  }
}
