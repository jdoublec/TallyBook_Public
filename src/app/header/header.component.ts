import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataStorageService } from '../shared/data-storage.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { TallyBookService } from '../tally-book/new-tally-book/tally-book.service';
import { TallyBookList } from '../tally-book/new-tally-book/tally-book.model';
import { User } from '../auth/user.model';
import { MembersService, Members } from '../shared/members.service';
import { ApplicationStateService } from '../shared/application-state.service';
import { PlotsService } from '../plots/plots.service';
import { PlotDataService } from '../plots/plot-data.service';
import { FetchPlotDataService } from '../plots/fetch-plot-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  adminStatusChangedSub: Subscription;  
  userSub: Subscription;
  currentTallyBookNameSub: Subscription;
  membersChangedSub: Subscription;
  memberPermissionsChangedSub: Subscription;
  // sharedPlotDataUpdatedSub: Subscription;
  tallyBookListSub: Subscription;
  isAuthenticated: boolean = false;
  isNewTallyBook: boolean = false;  
  isAdmin: boolean = false;
  readOnlyAccess: boolean = true;
  user: User;  
  members: Members;
  tallyBookList: TallyBookList;
  tallyBookListArray: TallyBookList[] = [];
  currentTallyBookName: string;
  mobileResolution: boolean = false;
  innerHeight: any;
  isLoadingOrSaving: boolean = false;
  isGood: boolean = false;
  // sharedPlotDataUpdated: boolean = false;
  

  constructor(private dataStorageService: DataStorageService,
              private tallyBookService: TallyBookService,
              private plotsService: PlotsService,
              private plotDataService: PlotDataService,
              private fetchPlotDataService: FetchPlotDataService,
              private membersService: MembersService,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private applicationStateService: ApplicationStateService) {}

  ngOnInit() {

    this.innerHeight = window.innerHeight;

    this.mobileResolution = this.applicationStateService.getIsMobileResolution();

    this.userSub = this.authService.userSubject
      .subscribe(user => {
          this.user = user;
          this.isAuthenticated = !!user;
    });      

    this.tallyBookList = this.tallyBookService.getTallyBookList();
    this.tallyBookListSub = this.tallyBookService.tallyBookListChanged
      .subscribe(
        (tallyBookList: TallyBookList[]) => {
          this.tallyBookList = tallyBookList;
          this.tallyBookListArray = Object.keys(tallyBookList).map(tbNames => {
              return tbNames;
            });
          }
    );

    this.currentTallyBookName = this.tallyBookService.getCurrentTallyBookName();
    this.currentTallyBookNameSub = this.tallyBookService.currentTallyBookChanged
      .subscribe(
        (currentTallyBookName => {
          this.currentTallyBookName = currentTallyBookName;
        })
      );

    // this.sharedPlotDataUpdated = this.plotDataService.getSharedPlotDataUpdated();
    // this.sharedPlotDataUpdatedSub = this.plotDataService.sharedPlotDataUpdatedChanged
    //     .subscribe(
    //         (sharedPlotDataUpdated: boolean) => {
    //           this.sharedPlotDataUpdated = sharedPlotDataUpdated;
    //         }
    //     )

    this.members = this.membersService.getMembers();
    this.membersChangedSub = this.membersService.membersChanged
      .subscribe(
        (members: Members) => {
          this.members = members;
          this.onMembersChanged();          
    });

    this.isAdmin = this.membersService.isCurrentUserAdmin();
    this.adminStatusChangedSub = this.membersService.adminStatusChanged
      .subscribe((admin: boolean) => this.isAdmin = admin);

    this.readOnlyAccess = this.membersService.getCurrentUserPermissions();
    this.memberPermissionsChangedSub = this.membersService.memberPermissionsChanged
       .subscribe((readOnlyAccess: boolean) => this.readOnlyAccess = readOnlyAccess);
  }

  onDeleteTallyBook() {
    this.tallyBookService.deleteTallyBook();   
    this.authService.closeTallyBook(); 
  }

  onSaveTallyBook() {
    this.isLoadingOrSaving = true;
    if (this.isNewTallyBook == this.isNewTallyBook) {
      this.dataStorageService.storeTallyBookMembers(this.currentTallyBookName);
      this.isNewTallyBook = false;
    }
    
    this.onSaveModels();
    this.dataStorageService.storeTallyBookList(this.user.email);
    this.dataStorageService.storeTallyBook(this.currentTallyBookName)
      .subscribe(response => {
        if (response) {
          this.isLoadingOrSaving = false;
        }
    })
  }

  // convertDailyActivities() {
  //   this.dataStorageService.storeDailyActivities(this.currentTallyBookName)
  //     .subscribe(response => {
  //       console.log(response);
  //     });
  // }

  onFetchTallyBook(name: string) {
    this.isNewTallyBook = false;
    this.isLoadingOrSaving = true;    
    this.authService.closeTallyBook();
    this.tallyBookService.changeCurrentTallyBook(name);
    this.dataStorageService.fetchTallyBook(this.currentTallyBookName).subscribe(response => {
      if (response) {     
        this.plotDataService.setSharedPlotData([]);        
        this.fetchPlotDataService.updateSharedPlotData(this.plotsService.createPlotList());
        // this.plotDataService.addCurrentTallyBookToSharedPlotData(this.currentTallyBookName);
      }
    });    
    this.dataStorageService.fetchTallyBookMembers(this.currentTallyBookName).subscribe((members: Members[]) => {
        this.members = members;
        this.onMembersChanged();
        this.applicationStateService.setCurrentTableHeight(280, 219, 75, 75);        
        this.isLoadingOrSaving = false; 
      });

    const members = this.membersService.getMembers();
    
    this.router.navigate(['/tally'], {relativeTo: this.route});
  }

  onUpdatePlotData() {
    this.fetchPlotDataService.updateSharedPlotData(this.plotsService.getPlotList());
  }

  onMembersChanged() {
    this.membersService.setCurrentUserPermisssions(this.user);
  }

  onNewTallyBook() {
    this.authService.closeTallyBook();
    console.log(this.tallyBookList);
    this.isNewTallyBook = true;
    this.router.navigate(["/tallyBook/new"]);
    console.log(this.tallyBookList);
  }

  onShareUnshareTallyBook() {
    this.router.navigate(['/tallyBook/share']);
  }

  onCloseTallyBook() {
    if(confirm('Would you like to save ' + this.currentTallyBookName + ' before closing?')) {
      this.dataStorageService.storeTallyBook(this.currentTallyBookName);
    }
    
    this.onSaveModels();
    this.authService.closeTallyBook();
    this.currentTallyBookName = 'Tally Book';
    
    this.router.navigate(['/models'], {relativeTo: this.route});
  }

  onSaveModels() {
    this.isLoadingOrSaving = true;
    this.dataStorageService.storeActivitiesList(this.user.email);
    this.dataStorageService.storeModels(this.user.email)
      .subscribe(response => {
        if (response) {

          this.isLoadingOrSaving = false;
        }
    });  
  }
  
  onLogout() {
    this.isNewTallyBook = false;
    this.authService.logout();
  }

  ngOnDestroy() {
    this.adminStatusChangedSub.unsubscribe();
    this.userSub.unsubscribe();      
    this.currentTallyBookNameSub.unsubscribe();     
    this.membersChangedSub.unsubscribe();
    this.memberPermissionsChangedSub.unsubscribe();
    // this.sharedPlotDataUpdatedSub.unsubscribe();
    this.tallyBookListSub.unsubscribe();    
  }

  // onTransformUserInfo() {
  //   this.dataStorageService.storeTransformedUser(this.user.email, this.user.id);
  // }

  onTransformTallyBookListInfo() {
    this.dataStorageService.storeTransformedTallyBookList(this.user.email);
  }
}
