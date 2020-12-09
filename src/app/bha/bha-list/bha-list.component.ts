import { Component, OnInit } from '@angular/core';
import { BHA } from 'src/app/bha/bha.model';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { BHAService } from '../bha.service';

@Component({
  selector: 'app-bha-list',
  templateUrl: './bha-list.component.html',
  styleUrls: ['./bha-list.component.css']
})
export class BHAListComponent implements OnInit {
  bhaList: BHA[];
  bhaSub: Subscription;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private bhaService: BHAService) { }

  ngOnInit() {
    this.bhaList = this.bhaService.getBHAs();

    this.bhaSub = this.bhaService.bhaChanged
      .subscribe
        (
          (bha: BHA[]) => {
          this.bhaList = bha; 
            }       
        );

  }

  onNewBHA() {
    this.router.navigate(['new'], {relativeTo: this.route});
  }

}
