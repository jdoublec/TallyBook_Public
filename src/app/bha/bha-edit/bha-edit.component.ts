import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, Params, NavigationEnd } from '@angular/router';
import { BHAService } from '../bha.service';
import { BHA, Inventory } from '../bha.model';
import { ModelsService } from 'src/app/shared/models.service';
import { Subscription } from 'rxjs';
import { Model } from 'src/app/shared/models.model';

@Component({
  selector: 'app-bha-edit',
  templateUrl: './bha-edit.component.html',
  styleUrls: ['./bha-edit.component.css']
})
export class BHAEditComponent implements OnInit, OnDestroy {
  id: number;
  bha: BHA;
  newBHA: boolean = false;
  bhaValid: boolean = false;
  editBHAMode: boolean = false;
  bhaName: string;
  bhaSection: string;
  bhaStartDate: Date;
  bhaEndDate: Date;
  bhaStartDepth: number;
  bhaEndDepth: number;
  bhaOffset: number;

  itemIndex: number;
  itemName: string;
  itemSN: string;
  itemModel: string;
  itemID: number;
  itemOD: number;
  itemLength: number;
  itemSpecSheetPath: string;
  editItemMode: boolean = false;
  okToUpdateAddItem = false;

  modelSub: Subscription;
  models: Model[];
  

  constructor(private route: ActivatedRoute,
              private router: Router,
              private bhaService: BHAService,
              private modelsService: ModelsService) { }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.id = +params['id'];
        this.editBHAMode = params['id'] != null;
        this.bha = this.bhaService.getBHA(this.id);
        
        if (params['id'] != null) {
          this.bhaName = this.bha.name;
          this.bhaOffset = this.bha.offset;
          this.bhaStartDepth = this.bha.startDepth;
          this.bhaEndDepth = this.bha.endDepth;
          this.bhaSection = this.bha.section;
          this.bhaStartDate = this.bha.startDate;
          this.bhaEndDate = this.bha.endDate;
        } else {
          this.newBHA = true;
        }
      }
    )

    this.models = this.modelsService.getModels();
    this.modelSub = this.modelsService.modelsChanged
         .subscribe
        (
          (models: Model[]) => {
          this.models = models; 
            }       
        );
  }

  onSave() {
    if (this.editBHAMode) {
      this.bhaService.updateBHA(this.id, this.bhaName, this.bhaOffset, this.bhaStartDepth, 
                                this.bhaEndDepth, this.bhaSection, this.bhaStartDate, this.bhaEndDate);      
        this.editBHAMode = false;
        this.bhaValid = false;
    } else {
      this.bhaService.addBHA(this.bhaName, this.bhaOffset, this.bhaStartDepth, this.bhaEndDepth, 
                             this.bhaSection, this.bhaStartDate, this.bhaEndDate, this.itemName, 
                             this.itemSN,  this.itemModel, this.itemID, this.itemOD, this.itemLength, this.itemSpecSheetPath)         
        this.router.navigate(['/bha/' + (this.bhaService.getBHAs().length - 1) + '/edit'], {relativeTo: this.route});
        this.editBHAMode = false;
        this.editItemMode = false;
        this.bhaValid = false;
        this.newBHA = false;
    }

    
  }

  onCancel() {
    this.editBHAMode = false;
    this.bhaValid = false;
    this.newBHA = false;
    this.bha = this.bhaService.getBHA(this.id);
    this.router.navigate(['../'], {relativeTo: this.route})
  }

  onBHAChanged() {
    if (this.bhaName && this.bhaOffset && (this.bhaStartDepth > -1) && (this.bhaEndDepth > -1) && 
        this.bhaSection && this.bhaStartDate && this.bhaEndDate){
      if (this.editBHAMode) {
        this.bhaValid = true;
      } else if (this.newBHA) {
        if (this.itemName && this.itemSN && this.itemModel && (this.itemID > -1) && (this.itemOD > -1) && (this.itemLength > -1)) {
          this.bhaValid = true;
        }
      }
    }
  }

  onStartDateChanged() {
    
  }

  onAddUpdateItem() {
    if (this.editItemMode) {
        this.bhaService.updateItem(this.id, this.itemIndex, this.itemName, this.itemSN, 
                                   this.itemModel, this.itemID, this.itemOD, this.itemLength, this.itemSpecSheetPath);       
          this.onClearItemInput();
    } else {
      this.bhaService.addItem(this.id, this.itemName, this.itemSN, this.itemModel, this.itemID, this.itemOD, this.itemLength, this.itemSpecSheetPath);
      this.onClearItemInput();
    }    
  }

  onEditItem(index: number) {
    this.itemIndex = index;
    this.itemName = this.bha.items[index].name;
    this.itemSN = this.bha.items[index].sn;
    this.itemModel = this.bha.items[index].model;
    this.itemID = this.bha.items[index].id;
    this.itemOD = this.bha.items[index].od;
    this.itemLength = this.bha.items[index].length;
    this.editItemMode = true;
  }

  onItemInputValueChanged() {
    if (this.itemName && this.itemSN && this.itemModel && (this.itemID > -1) && (this.itemOD > -1) && (this.itemLength > -1)) {
      if (!this.newBHA) {
        this.okToUpdateAddItem = true;
      } else {
        this.onBHAChanged();
      }
    } else {
      this.okToUpdateAddItem = false;
    }
  }  

  onModelValueChanged() {
    let modelFound: boolean = false; 
    this.models.map(model => {
      if (model.model === this.itemModel) {
        this.itemName = model.type;
        this.itemID = model.id;
        this.itemOD = model.od;
        this.itemSpecSheetPath = model.specSheetPath;  
        modelFound = true;         
      } else {
        //this.itemSpecSheetPath = '';
        
      }

      if (!modelFound) {
        this.itemSpecSheetPath = '';
      }

    });

    this.onItemInputValueChanged();
  }

  hasSpecSheet(index: number) {
    if (this.bha.items[index].specSheetPath !== '') {
      return true;
    } 
    return false;
  }

  onDeleteItem() {
    this.bhaService.deleteItem(this.id, this.itemIndex);
    this.onClearItemInput();
  }

  onClearItemInput() {
    this.itemIndex = -1;
    this.editItemMode = false;
    this.okToUpdateAddItem = false;
    this.itemName = null;
    this.itemSN = null;
    this.itemModel = null;
    this.itemID = null;
    this.itemOD = null;
    this.itemLength = null;
  }

  getAccumLength(index: number) {
    return this.bhaService.getAccumLength(this.bha, this.id, index);
  }

  ngOnDestroy() {
    this.modelSub.unsubscribe();
  }

}