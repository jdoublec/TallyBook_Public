import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Model } from 'src/app/shared/models.model';
import { ModelsService } from 'src/app/shared/models.service';
import { Subscription, Observable, fromEvent } from 'rxjs';
import { ApplicationStateService } from '../shared/application-state.service';
import { MembersService } from '../shared/members.service';

@Component({
  selector: 'app-models',
  templateUrl: './models.component.html',
  styleUrls: ['./models.component.css']
})
export class ModelsComponent implements OnInit, OnDestroy {
  @ViewChild('scrollModels', {static: false}) modelsElement: ElementRef;
  resizeObservable$: Observable<Event>;
  resizeSub$: Subscription;
  tableHeightSub: Subscription;
  memberPermissionsChangedSub: Subscription;
  modelsSub: Subscription;
  models: Model[];
  model: Model = new Model('', '', '', null, null, '');
  showSpecSheet: boolean = false;
  editMode: boolean = false;
  okToUpdateAdd: boolean = false;
  newModelsRow: boolean = false;
  edittedIndex: number = -1;
  mobileResolution: boolean = false;
  readOnlyAccess: boolean = true;
  tableHeight: number = 0;
  readWriteMobile: number = 420;
  readWriteDesktop: number = 380;
  readOnlyMobile: number = 420; 
  readOnlyDesktop: number = 380;

  constructor(private modelsService: ModelsService,
              private applicationStateService: ApplicationStateService,
              private membersService: MembersService) {}

  ngOnInit() {
    this.mobileResolution = this.applicationStateService.getIsMobileResolution();

    // this.readOnlyAccess = this.membersService.getCurrentUserPermissions();
    //     this.memberPermissionsChangedSub = this.membersService.memberPermissionsChanged
    //     .subscribe((readOnlyAccess: boolean) => {
    //         this.readOnlyAccess = readOnlyAccess; 
    //     });  

    this.models = this.modelsService.getModels();  
    this.modelsSub = this.modelsService.modelsChanged
      .subscribe
        (
          (models: Model[]) => {
            this.models = models; 
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
    });
  }

  onViewChanged() {
    this.applicationStateService.setCurrentTableHeight(this.readWriteMobile, this.readWriteDesktop, 
                                                     this.readOnlyMobile, this.readOnlyDesktop);
    this.tableHeight = this.applicationStateService.getCurrentTableHeight();
  }

  scrollModelsToBottom(scroll: boolean = false) {
    try {
      if ((this.newModelsRow) || (scroll)) {
        this.modelsElement.nativeElement.scrollTo({left: 0 , top: this.modelsElement.nativeElement.scrollHeight, behavior: 'smooth'});
        this.newModelsRow = false;
      }
    } catch (err) {
      console.log(err + ' Models Scroll did not work!');
    }
  }

  onAddUpdateModel() {
    if (this.editMode) {
      this.modelsService.updateModel(this.edittedIndex, this.model);      
    } else {
      this.newModelsRow = true;
      this.modelsService.addModel(this.model);
    }

    this.onClearInput();
  }

  onDeleteModel() {
    this.modelsService.removeModel(this.edittedIndex);
  }

  onInputValueChanged() {
    if (this.model.type && this.model.model && this.model.man && this.model.id && this.model.od && this.model.specSheetPath) {
      this.okToUpdateAdd = true;
    }
  }

  onEditModel(index: number) {
    this.edittedIndex = index;
    this.editMode = true;
    this.model = this.modelsService.getModel(this.edittedIndex);
  }

  onClearInput() {
    // this.typeValue = null;
    // this.modelValue = null;
    // this.modelValue = null;
    // this.manufacturerValue = null;
    // this.idValue = null;
    // this.odValue = null;
    // this.specSheetPathValue = null;
    this.edittedIndex = -1;
    this.showSpecSheet = false;
    this.editMode = false;
    this.okToUpdateAdd = false;
    this.model = new Model('', '', '', null, null, '');
  }


  onShowSpecSheetChecked() {
    //console.log(this.showSpecSheet);
  }

  ngOnDestroy() {
    this.modelsSub.unsubscribe();
  }
}
