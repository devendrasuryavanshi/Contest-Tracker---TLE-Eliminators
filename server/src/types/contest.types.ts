export interface ContestType {
    platform: string;
    contestId: string;
    contestName: string;
    contestStartDate: Date;
    contestEndDate: Date;
    contestDuration: number;
    contestUrl: string;
    solutionUrl?: string;
    bookmarks?: string[];
    isBookmarked?: boolean;
}
