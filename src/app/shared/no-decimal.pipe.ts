import { Pipe, PipeTransform } from '@angular/core';

//pure: false forces the pipe to update when the data changes.  
//It is true by default.  Setting it to false can lead to performance issues. 
@Pipe({
  name: 'noDecimal',
})
export class NoDecimalPipe implements PipeTransform {
  transform(value: any): any {    

    return value ? value.toFixed(0) : 0;  

  }

}