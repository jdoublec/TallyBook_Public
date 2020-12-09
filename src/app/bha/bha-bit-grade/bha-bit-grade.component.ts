import { Component, OnInit } from '@angular/core';
import { BHABitGradeService } from './bha-bit-grade.service';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { BHAService } from '../bha.service';
import { BitGrade } from '../bha.model';

@Component({
  selector: 'app-bha-bit-grade',
  templateUrl: './bha-bit-grade.component.html',
  styleUrls: ['./bha-bit-grade.component.css']
})
export class BHABitGradeComponent implements OnInit {
  id: number;
  bitGrade: BitGrade;
  // bitGradeValid: boolean = false;
  // innerRowsValue: string;
  // outerRowsValue: string;
  // majorDullValue: string;
  // locationValue: string;
  // bearingSealValue: string;
  // gaugeValue: string;
  // otherDullValue: string;
  // reasonPulledValue: string;
  rows: string[] = [];
  chars: string[] = [];
  locations: string[] = [];
  seals: string[] = [];
  gauges: string[] = [];
  reasons: string[] = [];

  constructor(private bhaBitGradeService: BHABitGradeService,
              private bhaService: BHAService,
              private route: ActivatedRoute,
              private router: Router) {}

  ngOnInit() {
    //this.rows = this.bhaBitGradeService.getBitGradeRowData();
    // this.chars = this.bhaBitGradeService.getBitGradeCharacteristicsData();
    // this.locations = this.bhaBitGradeService.getBitGradeLocationData();
    // this.seals = this.bhaBitGradeService.getBitGradeBearingSealData();
    // this.gauges = this.bhaBitGradeService.getBitGradeGaugeData();
    // this.reasons = this.bhaBitGradeService.getBitGradeReasonsData();

    this.rows = this.bhaBitGradeService.Rows;
    this.chars = this.bhaBitGradeService.Characteristics;
    this.locations = this.bhaBitGradeService.Location;
    this.seals = this.bhaBitGradeService.BearingSeal;
    this.gauges = this.bhaBitGradeService.Gauge;
    this.reasons = this.bhaBitGradeService.Reasons;

    this.route.params.subscribe(
      (params: Params) => {
          this.id = +params['id'];
          this.bitGrade = this.bhaService.getBitGrade(this.id); 
         // console.log(this.bitGrade);    
          // this.innerRowsValue = this.bitGrade.innerRows;  
          // this.outerRowsValue = this.bitGrade.outerRows;
          // this.majorDullValue = this.bitGrade.majorDullChars;
          // this.locationValue = this.bitGrade.location;
          // this.bearingSealValue = this.bitGrade.bearingSeal;
          // this.gaugeValue = this.bitGrade.gauge;
          // this.otherDullValue = this.bitGrade.otherDullChars;
          // this.reasonPulledValue = this.bitGrade.reasonPulled;    
      }
  )   
  }

  onInputValueChanged() {
    // console.log(this.innerRowsValue);
    // console.log(this.outerRowsValue);
    // console.log(this.majorDullValue);
    // console.log(this.locationValue);
    // console.log(this.bearingSealValue);
    // console.log(this.gaugeValue);
    // console.log(this.otherDullValue);
    // console.log(this.reasonPulledValue);
    // if (this.innerRowsValue && this.outerRowsValue && this.majorDullValue && this.locationValue &&
    //     this.bearingSealValue && this.gaugeValue && this.otherDullValue && this.reasonPulledValue) {          
    //       this.bitGradeValid = true;
    // } else {
    //   console.log('Valid ' + this.bitGradeValid);
    //   this.bitGradeValid = true;
    // }
    
    
  }

  onSave() {
    this.bhaService.updateBitGrade(this.id, this.bitGrade); //, this.innerRowsValue, this.outerRowsValue, this.majorDullValue, this.locationValue, this.bearingSealValue, this.gaugeValue, this.otherDullValue, this.reasonPulledValue);
    this.router.navigate(['../'], {relativeTo: this.route});
  }

  onCancel() {
    this.router.navigate(['../'], {relativeTo: this.route});
  }
}
