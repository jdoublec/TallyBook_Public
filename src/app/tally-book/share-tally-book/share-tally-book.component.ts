import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataStorageService } from 'src/app/shared/data-storage.service';
import { TallyBookService } from '../new-tally-book/tally-book.service';
import { MembersService, Members } from 'src/app/shared/members.service';
import { AuthService } from 'src/app/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-share-tally-book',
  templateUrl: './share-tally-book.component.html',
})
export class ShareTallyBookComponent implements OnInit, OnDestroy {
  membersChangedSub = new Subscription();
  members: Members;
  currentUserEmail: string;
  currentTallyBookName: string;
  userEmail: string = '';
  isAlreadySharedWithMember: boolean = false;
  validUserEmail: boolean = false;
  emailQualifier = /\S+@\S+\.\S+/;
  readAccess: boolean = true;


  constructor(private authService: AuthService,
              private tallyBookService: TallyBookService, 
              private dataStorageService: DataStorageService,
              private membersService: MembersService) { } 

  ngOnInit() {
    this.currentTallyBookName = this.tallyBookService.getCurrentTallyBookName();
    this.currentUserEmail = this.authService.getCurrentUserEmail();

    this.members = this.membersService.getMembers();
    this.membersChangedSub = this.membersService.membersChanged
      .subscribe(
        (members: Members) => {
          this.members = members;
        }
      );
  }

  isUserAlreadyMember() {
    if ((this.currentTallyBookName !== 'Tally Book') && (this.userEmail !== this.currentUserEmail)) {
      this.isAlreadySharedWithMember = this.membersService.isUserAlreadyMember(this.userEmail);

      this.validUserEmail = this.emailQualifier.test(this.userEmail);
    }
  }

  onShareUnshareTallyBook() {  
    if (this.isAlreadySharedWithMember) {
      this.dataStorageService.unshareTallyBook(this.userEmail, this.currentTallyBookName);
      this.onClearInput();
    } else {
        this.dataStorageService.getUserIDtoShare(this.userEmail).subscribe(userID => {
          this.dataStorageService.shareTallyBook(userID, this.userEmail, this.currentTallyBookName, this.readAccess).subscribe();
          this.onClearInput();
      },
      error => {
        console.log('Issue retrieving userID. ' + error);
        this.onClearInput();
      });
    }    
  }

  onSelectCurrentMember(member: string, access: boolean) {
    this.userEmail = member;
    this.readAccess = access;
    this.isAlreadySharedWithMember = true;
    this.validUserEmail = true;
  }

  onClearInput() {
    this.userEmail = '';
    this.isAlreadySharedWithMember = false;
    this.validUserEmail = false;
  }

  ngOnDestroy() {
    this.membersChangedSub.unsubscribe();
  }
}
