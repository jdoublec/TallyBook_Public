import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { NotesService } from './notes.service';
import { Note } from './notes.model';
import { ApplicationStateService } from '../shared/application-state.service';
import { MembersService } from '../shared/members.service';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['../shared/scroll-table.component.css']
})
export class NotesComponent implements OnInit, OnDestroy {  
  @ViewChild('scrollNotes', {static: false}) notesElement: ElementRef;
  resizeObservable$: Observable<Event>;
  resizeSub$: Subscription;
  tableHeightSub: Subscription;
  notesSub: Subscription;
  memberPermissionsChangedSub: Subscription;
  notes: Note[];
  timeValue: Date;
  dateValue: Date;
  typeValue: string;
  noteValue: string;
  editMode: boolean = false;
  okToAddUpdate: boolean = false;
  newNotesRow: boolean = false;
  edittedIndex: number = -1;
  dateTimeGood: boolean = false;
  readAccessOnly: boolean = true;
  mobileResolution: boolean = false;
  readOnlyAccess: boolean = true;
  tableHeight: number = 0;
  readWriteMobile: number = 420;
  readWriteDesktop: number = 300;
  readOnlyMobile: number = 95; 
  readOnlyDesktop: number = 75;
  
  constructor(private notesService: NotesService,
              private applicationStateService: ApplicationStateService,
              private membersService: MembersService) {}

  ngOnInit() {
    this.mobileResolution = this.applicationStateService.getIsMobileResolution();

    this.readOnlyAccess = this.membersService.getCurrentUserPermissions();
        this.memberPermissionsChangedSub = this.membersService.memberPermissionsChanged
        .subscribe((readOnlyAccess: boolean) => {
            this.readOnlyAccess = readOnlyAccess; 
        });  

    this.notes = this.notesService.getNotes(); 
    this.notesSub = this.notesService.notesChanged
      .subscribe
        (
          (notes: Note[]) => {
            this.notes = notes; 
            }       
        );

    // this.applicationStateService.setCurrentTableHeight(this.readWriteMobile, this.readWriteDesktop, 
    //                                                  this.readOnlyMobile, this.readOnlyDesktop);
    this.onViewChanged();
    this.tableHeightSub = this.applicationStateService.currentTableHeightChanged
    .subscribe((height: number) => {
    this.tableHeight = height});

    this.resizeObservable$ = fromEvent(window, 'resize');
    this.resizeSub$ = this.resizeObservable$.subscribe(evt => {
    this.onViewChanged();
    })
  }

  onViewChanged() {
    this.applicationStateService.setCurrentTableHeight(this.readWriteMobile, this.readWriteDesktop, 
                                                     this.readOnlyMobile, this.readOnlyDesktop);
    this.tableHeight = this.applicationStateService.getCurrentTableHeight();
  }

  scrollNotesToBottom(scroll: boolean = false) {
    try {
      if ((this.newNotesRow) || (scroll)) {
        this.notesElement.nativeElement.scrollTo({left: 0 , top: this.notesElement.nativeElement.scrollHeight, behavior: 'smooth'});
        this.newNotesRow = false;
      }
    } catch (err) {
      console.log(err + ' Tally Scroll did not work!');
    }
  }

  onEnterKeyPressed(notesEnter: boolean) {
    if (notesEnter) {
      if (this.okToAddUpdate) {
        this.onAddUpdateNote();
      }
    }
  }

  onAddUpdateNote() {
    if (this.editMode) {
      this.notesService.updateNote(this.edittedIndex, this.timeValue, this.dateValue, this.typeValue, this.noteValue);      
    } else {
      this.newNotesRow = true;
      this.notesService.addNote(this.timeValue, this.dateValue,  this.typeValue, this.noteValue);
    }

    this.onClearInput();
  }

  onDeleteNote() {
    this.notesService.removeNote(this.edittedIndex);
  }  

  // onClear() {

  //   this.onClearInput();
  // }

  onClearInput() {
    this.dateTimeGood = false;
    this.edittedIndex = -1;
    this.editMode = false;
    this.okToAddUpdate = false;
    this.timeValue = null;
    this.dateValue = null;
    this.typeValue = null;
    this.noteValue = null;
    //this.note = new Note(null, null, '', '');   
    //this.notes = this.notesService.getNotes(); 
  }

  onInputValueChanged() {
    if (this.dateTimeGood && this.typeValue && this.noteValue) {
      this.okToAddUpdate = true;
    } else {
      this.okToAddUpdate = false;
    }
  }

  onEditNote(index: number) {
    if (!this.editMode) {
      this.edittedIndex = index;
      this.editMode = true;
      this.timeValue = this.notes[this.edittedIndex].time;
      this.dateValue = this.notes[this.edittedIndex].date;
      this.typeValue = this.notes[this.edittedIndex].type;
      this.noteValue = this.notes[this.edittedIndex].note;
      //this.note = this.notesService.getNote(this.edittedIndex);
    } else if (this.readAccessOnly) {
      this.edittedIndex = index;
      this.noteValue = this.notes[this.edittedIndex].note;
    }
  }

  onDateTimeChanged() {
    if (this.dateValue && this.timeValue) {
      if (this.notes.length > 0) {
        if (!this.notesService.doesNoteTimeExist(this.timeValue, this.dateValue, this.edittedIndex)) { 
          this.dateTimeGood = true;
        } else {
          this.dateTimeGood = false;
        }         
      } else {          
          this.dateTimeGood = true;
      }
    }
    else {
      this.dateTimeGood = false;
    }
    this.onInputValueChanged();
  }

  ngOnDestroy() {
    this.resizeSub$.unsubscribe();
    this.tableHeightSub.unsubscribe();
    this.memberPermissionsChangedSub.unsubscribe();
    this.notesSub.unsubscribe();
  }

}
