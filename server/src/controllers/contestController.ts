import { Request, Response } from 'express';
import ContestService from '../services/Contest';
import ContestSolutionService from '../services/ContestSolutionService';
import ContestManager from '../services/ContestManager';
import logger from '../utils/logger';
import User from '../models/User';

const contestManager = new ContestManager();

export const updateAllContests = async (req: Request, res: Response) => {
    try {
        const result = await ContestService.updateAllContests();

        return res.status(200).json({
            status: {
                code: 200,
                message: 'All contests updated successfully'
            },
            data: result
        });
    } catch (error) {
        logger.error('Error updating all contests:', error);
        return res.status(500).json({
            status: {
                code: 500,
                error: 'Failed to update contests'
            }
        });
    }
};

export const updateAllSolutionLinks = async (req: Request, res: Response) => {
    try {
        const result = await ContestSolutionService.updateSolutionLinks();
        return res.status(200).json({
            status: {
                code: 200,
                message: 'Solution links updated successfully'
            },
            data: result
        });
    } catch (error) {
        logger.error('Error updating solution links:', error);
        return res.status(500).json({
            status: {
                code: 500,
                error: 'Failed to update solution links'
            }
        });
    }
};

export const updatePlatformContests = async (req: Request, res: Response) => {
    try {
        const { platform } = req.params;
        let result;

        switch (platform.toLowerCase()) {
            case 'leetcode':
                result = await ContestService.updateLeetcodeContests();
                break;
            case 'codechef':
                result = await ContestService.updateCodechefContests();
                break;
            case 'codeforces':
                result = await ContestService.updateCodeforcesContests();
                break;
            default:
                return res.status(400).json({
                    status: {
                        code: 400,
                        error: 'Invalid platform. Supported platforms: leetcode, codechef, codeforces'
                    }
                });
        }

        return res.status(200).json({
            status: {
                code: 200,
                message: `${platform} contests updated successfully`
            },
            data: result
        });
    } catch (error) {
        logger.error(`Error updating ${req.params.platform} contests:`, error);
        return res.status(500).json({
            status: {
                code: 500,
                error: `Failed to update ${req.params.platform} contests`
            }
        });
    }
};

export const getContestsByDateRange = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user?.id;

        const contests = await contestManager.getAllContests(startDate as string, endDate as string, userId as string);

        return res.status(200).json({
            status: {
                code: 200,
                message: 'Contests retrieved successfully'
            },
            data: contests
        });
    } catch (error) {
        logger.error('Error fetching contests by date range:', error);
        return res.status(500).json({
            status: {
                code: 500,
                error: 'Failed to fetch contests'
            }
        });
    }
};

export const getUpcomingContests = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const contests = await contestManager.getUpcomingContests(userId as string);

        return res.status(200).json({
            status: {
                code: 200,
                message: 'Upcoming contests retrieved successfully'
            },
            data: contests
        });
    } catch (error) {
        logger.error('Error fetching upcoming contests:', error);
        return res.status(500).json({
            status: {
                code: 500,
                error: 'Failed to fetch upcoming contests'
            }
        });
    }
};

export const updateSolutionUrl = async (req: Request, res: Response) => {
    try {
        const { contestId, youtubeUrl } = req.body;
        const userEmail = req.user?.email;

        if (!contestId || !youtubeUrl) {
            return res.status(400).json({
                status: {
                    code: 400,
                    error: 'Contest ID and YouTube URL are required'
                }
            });
        }

        // permission to update solution url
        if (userEmail !== "doraemon@gmail.com") {
            return res.status(403).json({
                status: {
                    code: 403,
                    error: 'You do not have permission to update solution URLs'
                }
            });
        }

        const result = await ContestSolutionService.updateSolutionUrl(contestId, youtubeUrl);

        return res.status(200).json({
            status: {
                code: 200,
                message: 'Solution URL updated successfully'
            },
            data: result
        });
    } catch (error: any) {
        logger.error('Error updating solution URL:', error);
        return res.status(400).json({
            status: {
                code: 400,
                error: error.message || 'Failed to update solution URL'
            }
        });
    }
};


export const getContestsWithoutSolutions = async (req: Request, res: Response) => {
    try {
        const { platform, limit } = req.query;

        const contests = await ContestSolutionService.getContestsWithoutSolutions(
            platform as string | undefined,
            limit ? parseInt(limit as string) : 50
        );

        return res.status(200).json({
            status: {
                code: 200,
                message: 'Contests without solutions retrieved successfully'
            },
            data: contests
        });
    } catch (error) {
        logger.error('Error fetching contests without solutions:', error);
        return res.status(500).json({
            status: {
                code: 500,
                error: 'Failed to fetch contests without solutions'
            }
        });
    }
};


export const bookmarkContest = async (req: Request, res: Response) => {
    try {
        const { contestId, isBookmarked } = req.body;

        const userId = req.user?._id;

        if (!contestId || !userId) {
            return res.status(400).json({
                status: {
                    code: 400,
                    error: 'Contest ID is required and you must be logged in'
                }
            });
        }

        const result = await contestManager.bookmarkContest(contestId, userId.toString(), isBookmarked);

        return res.status(200).json({
            status: {
                code: 200,
                message: isBookmarked ? 'Contest bookmarked successfully' : 'Bookmark removed successfully'
            },
            data: result
        });
    } catch (error) {
        logger.error('Error bookmarking contest:', error);
        return res.status(500).json({
            status: {
                code: 500,
                error: 'Failed to update bookmark'
            }
        });
    }
};

export const getBookmarkedContests = async (req: Request, res: Response) => {
    try {
        const userId = req.user?._id;
        if (!userId) {
            return res.status(400).json({
                status: {
                    code: 400,
                    error: 'You must be logged in'
                }
            });
        }
        const contests = await contestManager.getBookmarkedContests(userId);

        return res.status(200).json({
            status: {
                code: 200,
                message: 'Bookmarked contests retrieved successfully'
            },
            data: contests
        });
    } catch (error) {

    }
}


export const deleteAllContests = async (req: Request, res: Response) => {
    try {
        const result = await contestManager.deleteAllContests();

        return res.status(200).json({
            status: {
                code: 200,
                message: 'All contests deleted successfully'
            },
            data: result
        });
    } catch (error) {
        logger.error('Error deleting all contests:', error);
        return res.status(500).json({
            status: {
                code: 500,
                error: 'Failed to delete all contests'
            }
        });
    }
};
