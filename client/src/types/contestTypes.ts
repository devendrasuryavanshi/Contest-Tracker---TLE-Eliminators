export interface ContestSchema {
  _id: string;
  contestName: string;
  platform: string;
  contestId: string;
  contestStartDate: Date;
  contestEndDate: Date;
  contestDuration: number;
  contestUrl: string;
  isBookmarked?: boolean;
  solutionUrl?: string;
}
