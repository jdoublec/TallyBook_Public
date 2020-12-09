import { ActivitiesList } from './activity.model';
import { ModelsComponent } from '../models/models.component';
import { TallyBookList } from '../tally-book/new-tally-book/tally-book.model';

export class UserData {    
    constructor(
    userID: string,
    activitiesList: ActivitiesList, 
    models: ModelsComponent,
    tallyBookList: TallyBookList) {}
}

// // export class UserData {
// export interface UserData {
//     // constructor(
//         [id: string]: UserInfo
//         // ) {}
// }
