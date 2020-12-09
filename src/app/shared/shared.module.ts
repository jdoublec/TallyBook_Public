import { NgModule } from '@angular/core';
import { DropdownDirective } from './dropdown.directive';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerComponent } from './loading-spinner/loading-spinner.component';
import { AlertComponent } from './alert/alert.component';
import { PlaceholderDirective } from './placeHolder/placeholder.directive';
import { MatProgressSpinnerModule } from '@angular/material';
import { FormatDecimalPipe } from './format-decimal.pipe';
import { NoDecimalPipe } from './no-decimal.pipe';

@NgModule({
    declarations: [ 
        AlertComponent,
        DropdownDirective,
        LoadingSpinnerComponent,
        PlaceholderDirective, 
        FormatDecimalPipe,
        NoDecimalPipe,
    ],
    imports: [
        CommonModule,
        MatProgressSpinnerModule
    ],
    exports: [
        AlertComponent,
        CommonModule,
        LoadingSpinnerComponent,
        PlaceholderDirective,
        FormsModule,
        DropdownDirective,
        FormatDecimalPipe,
        NoDecimalPipe,
    ],
    entryComponents: [
        AlertComponent,
    ]
})
export class SharedModule {

}