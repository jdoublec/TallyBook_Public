import { Component, OnInit, Input } from '@angular/core';
import { BHA } from 'src/app/bha/bha.model';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-bha-item',
  templateUrl: './bha-item.component.html',
  styleUrls: ['./bha-item.component.css']
})
export class BHAItemComponent implements OnInit {
  @Input() bha: BHA;
  @Input() index: number;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
  }

}
