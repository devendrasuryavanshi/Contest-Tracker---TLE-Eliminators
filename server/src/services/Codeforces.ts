import axios from "axios";
import { PLATFORM_URLS, PLATFORMS } from "./PlatformsData";
import ContestManager from "./ContestManager";
import { generateContestSchemaDataFromApiData } from "../utils/contest.utils";
import { ContestType } from "../types/contest.types";
import logger from "../utils/logger";

const contestManager = new ContestManager();

interface CodeforcesContestApiResponse {
    id: number;
    name: string;
    type: string;
    phase: string;
    startTimeSeconds: number;
    durationSeconds: number;
}

export default class CodeforcesServices {
    async getCodeforcesContests(): Promise<ContestType[]> {
        try {
            logger.info('Fetching Codeforces contests...');
            const response = await axios.get(PLATFORM_URLS.CODEFORCES, {
                timeout: 10000, // 10s
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Contest-Tracker-App'
                }
            });

            if (response.status === 200 && response.data.status === "OK") {
                const data = response.data.result;
                logger.info(`Retrieved ${data.length} Codeforces contests`);

                const contestData = data.map((contest: CodeforcesContestApiResponse) =>
                    this.convertCodeforcesContestToSchemaData(contest)
                );

                return contestData;
            } else {
                throw new Error(`Failed to fetch contests from Codeforces API: ${response.status} - ${response.data.status}`);
            }
        } catch (error: any) {
            logger.error('Error fetching Codeforces contests:', error);
            throw new Error(`Failed to fetch Codeforces contests: ${error.message}`);
        }
    }

    private convertCodeforcesContestToSchemaData(
        contest: CodeforcesContestApiResponse
    ): ContestType {
        try {
            const startTime = new Date(contest.startTimeSeconds * 1000);
            const duration = contest.durationSeconds;
            const endTime = new Date(startTime.getTime() + duration * 1000);

            return generateContestSchemaDataFromApiData({
                platform: PLATFORMS.CODEFORCES,
                contestId: `${contest.type}${contest.id}`,
                contestName: contest.name,
                contestStartDate: startTime,
                contestEndDate: endTime,
                contestDuration: duration,
                contestUrl: `https://codeforces.com/contest/${contest.id}`,
            });
        } catch (error) {
            logger.error('Error converting Codeforces contest to schema data:', error);
            throw error;
        }
    }

    async saveCodeforcesContests(): Promise<any> {
        try {
            const contests = await this.getCodeforcesContests();

            if (contests.length === 0) {
                logger.warn('No Codeforces contests found to save');
                return { message: 'No Codeforces contests found to save', count: 0 };
            }

            const savedContests = await Promise.all(
                contests.map(async (contest) => {
                    try {
                        return await contestManager.updateContest(contest);
                    } catch (error) {
                        logger.error(`Error saving Codeforces contest ${contest.contestId}:`, error);
                        return null;
                    }
                })
            );

            const successCount = savedContests.filter(Boolean).length;
            logger.info(`Successfully saved/updated ${successCount} Codeforces contests`);

            return {
                message: `Successfully saved/updated ${successCount} Codeforces contests`,
                count: successCount
            };
        } catch (error) {
            logger.error('Error saving Codeforces contests:', error);
            throw error;
        }
    }
}
