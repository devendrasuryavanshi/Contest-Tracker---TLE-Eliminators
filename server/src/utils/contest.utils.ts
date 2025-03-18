import { ContestType } from "../types/contest.types";

interface ApiContestData {
    platform: string;
    contestId: string;
    contestName: string;
    contestStartDate: Date;
    contestEndDate: Date;
    contestDuration: number;
    contestUrl: string;
    [key: string]: any;
}

export const generateContestSchemaDataFromApiData = ( apiData: ApiContestData ): ContestType => {
    const { platform, contestId, contestName, contestStartDate, contestEndDate, contestDuration, contestUrl } = apiData;

    if (!platform || !contestId || !contestName || !contestStartDate || !contestEndDate || !contestDuration || !contestUrl) {
        throw new Error('Missing required fields in API data');
    }

    const contestData: ContestType = {
        platform: platform,
        contestId: contestId,
        contestName: contestName,
        contestStartDate: new Date(contestStartDate),
        contestEndDate: new Date(contestEndDate),
        contestDuration: contestDuration,
        contestUrl: contestUrl,
    };

    return contestData;
};


export const isValidYoutubeUrl = (url: string): boolean => {
    if (!url) return false;

    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/i;
    return youtubeRegex.test(url);
};


export const extractYoutubeVideoId = (url: string): string | null => {
    if (!url) return null;

    if (url.includes('youtu.be')) {
        const match = url.match(/youtu\.be\/([^?&]+)/);
        return match ? match[1] : null;
    }

    const match = url.match(/[?&]v=([^?&]+)/);
    return match ? match[1] : null;
};
