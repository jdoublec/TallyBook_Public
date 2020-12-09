import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { TargetWindowsService } from './target-windows.service';
import { TargetWindows } from './target-windows.model';

@Component({
  selector: 'app-target-windows',
  templateUrl: './target-windows.component.html',
  styleUrls: ['./target-windows.component.scss']
})
export class TargetWindowsComponent implements OnInit {
  targetWindows: TargetWindows[] = [];
  windowsForm: FormGroup;
  tableRows: FormArray;
  // control: FormArray;
  mode: boolean;
  touchedRows: any;
  regExp = /^[0-9]+[0-9]*$/;
  constructor(private targetWindowsService: TargetWindowsService,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    this.targetWindows = this.targetWindowsService.getTargetWindows();
    this.toggleTheme();
    this.touchedRows = [];
    this.windowsForm = this.fb.group({
      tableRows: this.fb.array([])
    });
    if (this.targetWindows.length > 0) {
      this.initForm();
    } else {
      this.addRow();
    }
  }
  
  ngAfterOnInit() {
    // this.control = this.windowsForm.get('tableRows') as FormArray;
  }

  initForm() {
    const control =  this.windowsForm.get('tableRows') as FormArray;   
    this.targetWindows.forEach(window => {
        control.push(this.fb.group({          
            startDepth: [window['startDepth'], [Validators.required, Validators.pattern(this.regExp)]],
            endDepth: [window['endDepth'], [Validators.required, Validators.pattern(this.regExp)]],
            above: [window['above'], [Validators.required, Validators.pattern(this.regExp)]],
            below: [window['below'], [Validators.required, Validators.pattern(this.regExp)]],
            right: [window['right'], [Validators.required, Validators.pattern(this.regExp)]],
            left: [window['left'], [Validators.required, Validators.pattern(this.regExp)]],
        }))      
    });    
    console.log(this.windowsForm);
  }

  addFormRow(): FormGroup {
    return this.fb.group({
      startDepth: [0, [Validators.required, Validators.pattern(this.regExp)]],
      endDepth: [0, [Validators.required, Validators.pattern(this.regExp)]],
      above: [0, [Validators.required, Validators.pattern(this.regExp)]],
      below: [0, [Validators.required, Validators.pattern(this.regExp)]],
      right: [0, [Validators.required, Validators.pattern(this.regExp)]],
      left: [0, [Validators.required, Validators.pattern(this.regExp)]],
    //   isEditable: [true],
    });
  }

  addRow() {
    const control =  this.windowsForm.get('tableRows') as FormArray;
    control.push(this.addFormRow());
  }

  deleteRow(index: number) {
    const control =  this.windowsForm.get('tableRows') as FormArray;
    control.removeAt(index);
  }

  editRow(group: FormGroup) {
    group.get('isEditable').setValue(true);
  }

  doneRow(group: FormGroup) {
    group.get('isEditable').setValue(false);
  }

  get getFormControls() {
    const control = this.windowsForm.get('tableRows') as FormArray;
    return control;
  }

  onSubmit() {
    const control = this.windowsForm.get('tableRows') as FormArray;    
    const rows = control.controls;    
    
    if (control.touched) {  
        let targetWindows: TargetWindows[] = [];
        for (let i = 0; i < control.length; i++) {            
            const newWindow = new TargetWindows(rows[i].value.startDepth,
                                                rows[i].value.endDepth,
                                                rows[i].value.above,     
                                                rows[i].value.below,     
                                                rows[i].value.right,     
                                                rows[i].value.left,     
                                            );
            

            targetWindows.push(newWindow);
        }
        this.targetWindowsService.setTargetWindows(targetWindows);
    }
    this.targetWindowsService.onHideTargetWindows();
  }

  toggleTheme() {
    this.mode = !this.mode;
  }
}