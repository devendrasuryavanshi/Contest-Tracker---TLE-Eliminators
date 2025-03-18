import { google } from 'googleapis';
import logger from '../utils/logger';
import { isValidYoutubeUrl, extractYoutubeVideoId } from '../utils/contest.utils';
import ContestManager from './ContestManager';
import dotenv from 'dotenv';
import Contest from '../models/Contest';

dotenv.config();

const contestManager = new ContestManager();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

if (!YOUTUBE_API_KEY) {
    logger.error('YOUTUBE_API_KEY environment variable not set');
}

const youtube = google.youtube({
    version: 'v3',
    auth: YOUTUBE_API_KEY,
});

class ContestSolutionService {
    private async fetchPlaylistItems(playlistId: string): Promise<any[]> {
        try {
            if (!YOUTUBE_API_KEY) {
                logger.error('Cannot fetch playlist items: YOUTUBE_API_KEY not set');
                return [];
            }

            const response = await youtube.playlistItems.list({
                part: ['snippet'],
                playlistId: playlistId,
                maxResults: 50,
            });

            return response.data.items as any[] || [];
        } catch (error) {
            logger.error('Error fetching playlist items:', error);
            return [];
        }
    }

    private normalizeContestName(name: string): string {
        let normalized = name.replace(/\s+/g, ' ').trim();

        normalized = normalized.replace(/Div\s*(\d+)\s*\+\s*(\d+)/g, 'Div. $1 + Div. $2');

        normalized = normalized.replace(/Div\s+(\d+)/g, 'Div. $1');

        if (normalized.includes('Educational') && !normalized.includes('Rated')) {
            normalized = normalized.replace(/(Educational Codeforces Round \d+)/, '$1 (Rated for Div. 2)');
        }

        return normalized;
    }


    async updateSolutionLinks(): Promise<any> {
        try {
            logger.info('Starting YouTube solution links update');

            const leetcodePlaylistId = 'PLcXpkI9A-RZI6FhydNz3JBt_-p_i25Cbr';
            const codeforcesPlaylistId = 'PLcXpkI9A-RZLUfBSNp-YQBCOezZKbDSgB';
            const codechefPlaylistId = 'PLcXpkI9A-RZIZ6lsE0KCcLWeKNoG45fYr';

            // fetch videos from all playlists
            const [leetcodeVideos, codeforcesVideos, codechefVideos] = await Promise.all([
                this.fetchPlaylistItems(leetcodePlaylistId),
                this.fetchPlaylistItems(codeforcesPlaylistId),
                this.fetchPlaylistItems(codechefPlaylistId)
            ]);

            const results = {
                leetcode: await this.processLeetcodeVideos(leetcodeVideos),
                codeforces: await this.processCodeforcesVideos(codeforcesVideos),
                codechef: await this.processCodechefVideos(codechefVideos)
            };

            const totalUpdated = results.leetcode.updated + results.codeforces.updated + results.codechef.updated;
            const totalNotFound = results.leetcode.notFound + results.codeforces.notFound + results.codechef.notFound;

            logger.info(`YouTube solution links update completed: ${totalUpdated} updated, ${totalNotFound} not found`);

            return {
                message: 'YouTube solution links update completed',
                totalUpdated,
                totalNotFound,
                details: results
            };
        } catch (error) {
            logger.error('Error updating YouTube solution links:', error);
            throw error;
        }
    }

    private async processLeetcodeVideos(videos: any[]): Promise<{ updated: number, notFound: number }> {
        let updated = 0;
        let notFound = 0;

        for (const video of videos) {
            try {
                const videoTitle = video.snippet.title;
                const platform = 'leetcode';

                let contestIdMatch = videoTitle.match(/Weekly Contest (\d+)/) || videoTitle.match(/Biweekly Contest (\d+)/);
                let contestId = contestIdMatch ? contestIdMatch[0] : null;

                if (contestId) {
                    const contestNumber = contestIdMatch[1];
                    const contestType = videoTitle.includes("Biweekly") ? "biweekly" : "weekly";
                    const formattedContestId = `${contestType}-contest-${contestNumber}`;

                    const solutionLink = `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`;
                    const contest = await contestManager.getContestById(formattedContestId, platform);

                    if (contest) {
                        contest.solutionUrl = solutionLink;
                        await contestManager.updateContest(contest);
                        logger.info(`Updated solution link for ${platform} ${formattedContestId}: ${solutionLink}`);
                        updated++;
                    } else {
                        logger.warn(`Contest not found for ${platform} ${formattedContestId}`);
                        notFound++;
                    }
                }
            } catch (error) {
                logger.error('Error processing LeetCode video:', error);
            }
        }

        return { updated, notFound };
    }

    private async processCodeforcesVideos(videos: any[]): Promise<{ updated: number, notFound: number }> {
        let updated = 0;
        let notFound = 0;

        for (const video of videos) {
            try {
                const videoTitle = video.snippet.title;
                const platform = 'codeforces';

                const separatorIndex = videoTitle.indexOf('|');
                const baseContestName = separatorIndex !== -1 ? videoTitle.substring(0, separatorIndex).trim() : videoTitle.trim();

                const normalizedContestName = this.normalizeContestName(baseContestName);
                
                logger.debug(`Video title: ${videoTitle}`);
                logger.debug(`Normalized contest name: ${normalizedContestName}`);

                const solutionLink = `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`;
                const contest = await contestManager.getContestByName(normalizedContestName, platform);

                if (contest) {
                    contest.solutionUrl = solutionLink;
                    await contestManager.updateContest(contest);
                    logger.info(`Updated solution link for ${platform} ${contest.contestName}: ${solutionLink}`);
                    updated++;
                } else {
                    logger.warn(`Contest not found for ${platform} ${normalizedContestName}`);
                    notFound++;
                }
            } catch (error) {
                logger.error('Error processing Codeforces video:', error);
            }
        }

        return { updated, notFound };
    }

    private async processCodechefVideos(videos: any[]): Promise<{ updated: number, notFound: number }> {
        let updated = 0;
        let notFound = 0;

        for (const video of videos) {
            try {
                const videoTitle = video.snippet.title;
                const platform = 'codechef';

                const contestIdMatch = videoTitle.match(/Codechef Starters (\d+)/);
                let contestId = contestIdMatch ? contestIdMatch[0] : null;

                if (contestId) {
                    const formattedContestId = `START${contestIdMatch[1]}`;
                    const solutionLink = `https://www.youtube.com/watch?v=${video.snippet.resourceId.videoId}`;
                    const contest = await contestManager.getContestById(formattedContestId, platform);

                    if (contest) {
                        contest.solutionUrl = solutionLink;
                        await contestManager.updateContest(contest);
                        logger.info(`Updated solution link for ${platform} ${formattedContestId}: ${solutionLink}`);
                        updated++;
                    } else {
                        logger.warn(`Contest not found for ${platform} ${formattedContestId}`);
                        notFound++;
                    }
                }
            } catch (error) {
                logger.error('Error processing Codechef video:', error);
            }
        }

        return { updated, notFound };
    }

    async updateSolutionUrl(contestId: string, youtubeUrl: string): Promise<any> {
        try {
            if (!contestId) {
                throw new Error('Contest ID is required');
            }

            if (!youtubeUrl) {
                throw new Error('YouTube URL is required');
            }

            if (!isValidYoutubeUrl(youtubeUrl)) {
                throw new Error('Invalid YouTube URL format');
            }

            const videoId = extractYoutubeVideoId(youtubeUrl);
            if (!videoId) {
                throw new Error('Could not extract YouTube video ID');
            }

            const standardizedUrl = `https://www.youtube.com/watch?v=${videoId}`;

            const contest = await Contest.findByIdAndUpdate(contestId, { solutionUrl: standardizedUrl }, { new: true });

            if (!contest) {
                throw new Error('Contest not found');
            }

            logger.info(`Updated solution URL for contest: ${contest.contestName}`);
            return contest;
        } catch (error) {
            logger.error('Error updating solution URL:', error);
            throw error;
        }
    }

    async getContestsWithoutSolutions(platform?: string, limit: number = 50): Promise<any> {
        try {
            const query: any = { solutionUrl: { $exists: false } };

            if (platform) {
                query.platform = platform.toLowerCase();
            }

            query.contestEndDate = { $lt: new Date() };

            const contests = await contestManager.getAllContests();
            const filteredContests = contests?.filter(contest =>
                !contest.solutionUrl &&
                contest.contestEndDate < new Date() &&
                (!platform || contest.platform === platform.toLowerCase())
            ).slice(0, limit);

            return filteredContests || [];
        } catch (error) {
            logger.error('Error finding contests without solutions:', error);
            throw error;
        }
    }
}

export default new ContestSolutionService();
