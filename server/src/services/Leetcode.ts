import { PLATFORM_URLS, PLATFORMS } from "./PlatformsData";
import ContestManager from "./ContestManager";
import { generateContestSchemaDataFromApiData } from "../utils/contest.utils";
import { ContestType } from "../types/contest.types";
import logger from "../utils/logger";
import axios from "axios";

const contestManager = new ContestManager();

interface LeetcodeContestApiResponse {
    title: string;
    titleSlug: string;
    startTime: number;
    originStartTime: number;
    cardImg: string | null;
    sponsors: any[];
}

export default class LeetcodeServices {
    async getLeetcodePastContests(pageNo = 1): Promise<ContestType[]> {
        try {
            const query = `
            {
              pastContests(pageNo: ${pageNo}, numPerPage: 30) {
                pageNum
                currentPage
                totalNum
                numPerPage
                data {
                  title
                  titleSlug
                  startTime
                  originStartTime
                  cardImg
                  sponsors {
                    name
                    logo
                  }
                }
              }
            }
            `;

            const response = await axios.post(PLATFORM_URLS.LEETCODE, { query }, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.status !== 200) {
                throw new Error(`Failed to fetch contests from Leetcode API: ${response.status}`);
            }

            const data = await response.data;

            if (data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
            }

            const contestData: ContestType[] = data.data.pastContests.data.map((contest: any) =>
                this.convertLeetcodeContestToSchemaData(contest)
            );

            return contestData;
        } catch (error) {
            logger.error('Error fetching LeetCode past contests:', error);
            throw error;
        }
    }

    async getAllLeetcodePastContests(maxPages = 10): Promise<ContestType[]> {
        try {
            logger.info(`Fetching all LeetCode past contests (up to ${maxPages} pages)...`);

            let allContests: ContestType[] = [];
            let currentPage = 1;
            let hasMorePages = true;

            while (currentPage <= maxPages && hasMorePages) {
                try {
                    const pageContests = await this.getLeetcodePastContests(currentPage);

                    if (pageContests.length === 0) {
                        hasMorePages = false;
                    } else {
                        allContests = [...allContests, ...pageContests];
                        logger.info(`Fetched page ${currentPage}, total contests so far: ${allContests.length}`);
                        currentPage++;

                        await new Promise(resolve => setTimeout(resolve, 500));
                    }
                } catch (error) {
                    logger.error(`Error fetching page ${currentPage}:`, error);
                    currentPage++;
                }
            }

            logger.info(`Completed fetching all LeetCode past contests. Total: ${allContests.length}`);
            return allContests;
        } catch (error) {
            logger.error('Error fetching all LeetCode past contests:', error);
            throw error;
        }
    }

    async getLeetcodeFutureContests(): Promise<ContestType[]> {
        try {
            const query = `
            {
              upcomingContests {
                title
                titleSlug
                startTime
                originStartTime
                cardImg
                sponsors {
                  name
                  logo
                }
              }
            }`;

            const response = await axios.post(PLATFORM_URLS.LEETCODE, {query}, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.status !== 200) {
                throw new Error(`Failed to fetch contests from Leetcode API: ${response.status}`);
            }

            const data = await response.data;

            if (data.errors) {
                throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
            }

            const contestData: ContestType[] = data.data.upcomingContests.map((contest: any) =>
                this.convertLeetcodeContestToSchemaData(contest)
            );

            return contestData;
        } catch (error) {
            logger.error('Error fetching LeetCode future contests:', error);
            throw error;
        }
    }

    private convertLeetcodeContestToSchemaData(contest: LeetcodeContestApiResponse): ContestType {
        try {
            const startTime = new Date(contest.startTime * 1000);
            const endTime = new Date(startTime.getTime() + 1.5 * 60 * 60 * 1000);
            const duration = (endTime.getTime() - startTime.getTime()) / 1000;

            return generateContestSchemaDataFromApiData({
                platform: PLATFORMS.LEETCODE,
                contestId: contest.titleSlug,
                contestName: contest.title,
                contestStartDate: startTime,
                contestEndDate: endTime,
                contestDuration: duration,
                contestUrl: `https://leetcode.com/contest/${contest.titleSlug}`,
            });
        } catch (error) {
            logger.error('Error converting Leetcode contest to schema data:', error);
            throw error;
        }
    }

    async saveLeetcodeContests(): Promise<any> {
        try {
            logger.info('Fetching LeetCode contests...');

            const futureContests = await this.getLeetcodeFutureContests();
            const pastContests = await this.getAllLeetcodePastContests(10);

            const allContests = [...futureContests, ...pastContests];

            if (allContests.length === 0) {
                logger.warn('No LeetCode contests found to save');
                return { message: 'No LeetCode contests found to save', count: 0 };
            }

            const savedContests = await Promise.all(
                allContests.map(async (contest) => {
                    try {
                        return await contestManager.updateContest(contest);
                    } catch (error) {
                        logger.error(`Error saving LeetCode contest ${contest.contestId}:`, error);
                        return null;
                    }
                })
            );

            const successCount = savedContests.filter(Boolean).length;
            logger.info(`Successfully saved/updated ${successCount} LeetCode contests`);

            return {
                message: `Successfully saved/updated ${successCount} LeetCode contests`,
                count: successCount
            };
        } catch (error) {
            logger.error('Error saving LeetCode contests:', error);
            throw error;
        }
    }
}
