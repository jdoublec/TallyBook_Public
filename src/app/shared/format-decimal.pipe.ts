import { Pipe, PipeTransform } from '@angular/core';

//pure: false forces the pipe to update when the data changes.  
//It is true by default.  Setting it to false can lead to performance issues. 
@Pipe({
  name: 'formatDecimal',
})
export class FormatDecimalPipe implements PipeTransform {
  transform(value: any): any {
    // return value.toString().substring(0, 4) + '-' + value.toString().substring(4, 6) + '-' + value.toString().substring(6, 8); 
    return value ? value.toFixed(2) : '0.00';
  }

}