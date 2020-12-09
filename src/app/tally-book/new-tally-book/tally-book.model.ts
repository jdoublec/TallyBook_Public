import { DailyActivity } from '../../shared/activity.model';
import { BHA } from '../../bha/bha.model';
import { Tally, TallyHeader } from '../../shared/tally.model';
import { Note } from '../../notes/notes.model';
import { SurveyHeader, Surveys, IntSurveys } from 'src/app/surveys/surveys.model';
import { PlanHeader, Plans, IntPlans } from 'src/app/plans/plans.model';
import { TargetWindows } from 'src/app/plots/target-windows/target-windows.model';

export class TallyBookTemp {
    constructor(
        public bhas: BHA[],
        public tallyHeader: TallyHeader,
        public tally: Tally[],
        public dailyActivities: DailyActivity[],
        public notes: Note[],
    ) {}
}

export class TallyBook {
    constructor(
        public bhas: BHA[],
        public tallyHeader: TallyHeader,
        public tally: Tally[],
        public surveyHeader: SurveyHeader,
        public surveys: Surveys[],
        public targetWindows: TargetWindows[],
        public planHeader: PlanHeader,
        public plans: Plans[],
        public dailyActivities: DailyActivity[],
        public notes: Note[],
    ) {}
}

export class SharedPlotData {
    constructor (
        public name: string,
        public type: string,
        public surveyHeader?: SurveyHeader,
        public surveys?: IntSurveys[],
        public planHeader?: PlanHeader,
        public plans?: IntPlans[], 
    ) {}
}

export class TallyBookList {
    constructor(
        createDate: Date, 
        plotSurveys?: {tallyBook: string}, 
        plotPlan?: {tallyBook: string} ,
    ) {}
}

export class PlotList {
    constructor(
      public name: string,
      public plotSurvey: boolean,
      public plotPlan: boolean,
    ) {}
  }