import axios from "axios";
import { PLATFORM_URLS, PLATFORMS } from "./PlatformsData";
import ContestManager from "./ContestManager";
import { generateContestSchemaDataFromApiData } from "../utils/contest.utils";
import { ContestType } from "../types/contest.types";
import logger from "../utils/logger";

const contestManager = new ContestManager();

interface CodechefContestApiResponse {
    contest_code: string;
    contest_name: string;
    contest_start_date: string;
    contest_end_date: string;
    contest_duration: string;
}

export default class CodechefServices {
    async getCodechefContests(): Promise<ContestType[]> {
        try {
            logger.info('Fetching Codechef contests...');
            const response = await axios.get(PLATFORM_URLS.CODECHEF, {
                timeout: 10000, // 10s
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'Contest-Tracker-App'
                }
            });

            if (response.status === 200 && response.data.status === "success") {
                const pastContests = response.data.past_contests || [];
                const futureContests = response.data.future_contests || [];
                const presentContests = response.data.present_contests || [];

                const allContests = [...pastContests, ...futureContests, ...presentContests];
                logger.info(`Retrieved ${allContests.length} Codechef contests`);

                const contestData = allContests.map((contest: CodechefContestApiResponse) =>
                    this.convertCodechefContestToSchemaData(contest)
                );

                return contestData;
            } else {
                throw new Error(`Failed to fetch contests from Codechef API: ${response.status} - ${response.data.status}`);
            }
        } catch (error: any) {
            logger.error('Error fetching Codechef contests:', error);
            throw new Error(`Failed to fetch Codechef contests: ${error.message}`);
        }
    }

    private convertCodechefContestToSchemaData( contest: CodechefContestApiResponse ): ContestType {
        try {
            const startTime = new Date(contest.contest_start_date);
            const endTime = new Date(contest.contest_end_date);
            const duration = (endTime.getTime() - startTime.getTime()) / 1000;

            return generateContestSchemaDataFromApiData({
                platform: PLATFORMS.CODECHEF,
                contestId: contest.contest_code,
                contestName: contest.contest_name,
                contestStartDate: startTime,
                contestEndDate: endTime,
                contestDuration: duration,
                contestUrl: `https://www.codechef.com/${contest.contest_code}`,
            });
        } catch (error) {
            logger.error('Error converting Codechef contest to schema data:', error);
            throw error;
        }
    }

    async saveCodechefContests(): Promise<any> {
        try {
            const contests = await this.getCodechefContests();

            if (contests.length === 0) {
                logger.warn('No Codechef contests found to save');
                return { message: 'No Codechef contests found to save', count: 0 };
            }

            const savedContests = await Promise.all(
                contests.map(async (contest) => {
                    try {
                        return await contestManager.updateContest(contest);
                    } catch (error) {
                        logger.error(`Error saving Codechef contest ${contest.contestId}:`, error);
                        return null;
                    }
                })
            );

            const successCount = savedContests.filter(Boolean).length;
            logger.info(`Successfully saved/updated ${successCount} Codechef contests`);

            return {
                message: `Successfully saved/updated ${successCount} Codechef contests`,
                count: successCount
            };
        } catch (error) {
            logger.error('Error saving Codechef contests:', error);
            throw error;
        }
    }
}
