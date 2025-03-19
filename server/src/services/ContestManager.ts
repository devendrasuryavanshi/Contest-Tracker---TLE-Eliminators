import mongoose from "mongoose";
import Contest from "../models/Contest";
import User from "../models/User";
import { ContestType } from "../types/contest.types";
import logger from "../utils/logger";

export default class ContestManager {
    async updateContest(contestData: ContestType): Promise<any> {
        try {
            const standardizedData = {
                ...contestData,
                contestStartDate: new Date(contestData.contestStartDate.toISOString()),
                contestEndDate: new Date(contestData.contestEndDate.toISOString())
            };

            const existingContest = await Contest.findOne({
                contestId: contestData.contestId,
                platform: contestData.platform
            });

            if (existingContest) {
                existingContest.contestName = standardizedData.contestName;
                existingContest.contestStartDate = standardizedData.contestStartDate;
                existingContest.contestEndDate = standardizedData.contestEndDate;
                existingContest.contestDuration = standardizedData.contestDuration;
                existingContest.contestUrl = standardizedData.contestUrl;
                if (standardizedData.solutionUrl) existingContest.solutionUrl = standardizedData.solutionUrl;
                await existingContest.save();
                return existingContest;
            } else {
                const newContest = new Contest(standardizedData);
                await newContest.save();
                return newContest;
            }
        } catch (error) {
            logger.error('Error updating/creating contest:', error);
            throw error;
        }
    }

    async getContestById(contestId: string, platform: string): Promise<any | null> {
        try {
            const contest = await Contest.findOne({
                contestId: contestId,
                platform: platform.toLowerCase()
            });
            return contest;
        } catch (error) {
            logger.error('Error getting contest by ID:', error);
            throw error;
        }
    }

    async getContestByName(contestName: string, platform: string): Promise<any | null> {
        try {
            let contest = await Contest.findOne({
                contestName: contestName,
                platform: platform.toLowerCase()
            });

            if (!contest) {
                contest = await Contest.findOne({
                    contestName: { $regex: new RegExp('^' + contestName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i') },
                    platform: platform.toLowerCase()
                });
            }

            if (!contest) {
                contest = await Contest.findOne({
                    contestName: { $regex: new RegExp(contestName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i') },
                    platform: platform.toLowerCase()
                });
            }

            if (!contest) {
                const allContests = await Contest.find({ platform: platform.toLowerCase() });
                const normalizedSearchTerm = contestName.toLowerCase();

                contest = allContests.find(c => {
                    const normalizedContestName = c.contestName.toLowerCase();
                    return normalizedContestName.includes(normalizedSearchTerm) ||
                        normalizedSearchTerm.includes(normalizedContestName);
                }) || null;
            }

            return contest;
        } catch (error) {
            logger.error('Error getting contest by name:', error);
            throw error;
        }
    }

    async getAllContests(startDate?: string, endDate?: string, userId?: string): Promise<ContestType[]> {
        try {
            let query: any = {};

            if (startDate && endDate) {
                query = {
                    $or: [
                        {
                            contestStartDate: {
                                $gte: new Date(startDate),
                                $lte: new Date(endDate),
                            },
                        },
                        {
                            contestEndDate: {
                                $gte: new Date(startDate),
                                $lte: new Date(endDate),
                            },
                        },
                        {
                            contestStartDate: { $lte: new Date(startDate) },
                            contestEndDate: { $gte: new Date(endDate) },
                        }
                    ]
                };
            }

            const contests = await Contest.find(query)
                .sort({ contestStartDate: 1 })
                .lean()
                .exec();

            return contests.map(contest => {
                const { bookmarks, ...contestWithoutBookmarks } = contest;

                if (userId && bookmarks && Array.isArray(bookmarks)) {
                    contestWithoutBookmarks.isBookmarked = bookmarks.some(
                        bookmarkId => bookmarkId.toString() === userId
                    );
                } else {
                    contestWithoutBookmarks.isBookmarked = false;
                }

                return contestWithoutBookmarks;
            });
        } catch (error) {
            logger.error('Error getting all contests:', error);
            throw error;
        }
    }


    async getUpcomingContests(userId?: string): Promise<ContestType[]> {
        try {
            const now = new Date();
            const contests = await Contest.find({
                contestStartDate: { $gte: now }
            })
                .sort({ contestStartDate: 1 })
                .limit(50)
                .lean()
                .exec();

            return contests.map(contest => {
                const { bookmarks, ...contestWithoutBookmarks } = contest;

                if (userId && bookmarks && Array.isArray(bookmarks)) {
                    contestWithoutBookmarks.isBookmarked = bookmarks.some(
                        bookmarkId => bookmarkId.toString() === userId
                    );
                } else {
                    contestWithoutBookmarks.isBookmarked = false;
                }

                return contestWithoutBookmarks;
            });
        } catch (error) {
            logger.error('Error getting upcoming contests:', error);
            throw error;
        }
    }

    async bookmarkContest(contestId: string, userId: string, isBookmarked: boolean): Promise<any> {
        try {
            const user = await User.findOne({ _id: userId });
            if (!user) {
                throw new Error('User not found');
            }

            const userObjectId = new mongoose.Types.ObjectId(userId);

            const updateOperation = isBookmarked
                ? { $addToSet: { bookmarks: userObjectId } }
                : { $pull: { bookmarks: userObjectId } };

            const contest = await Contest.findOneAndUpdate(
                { _id: contestId },
                updateOperation,
                { new: true }
            );

            if (!contest) {
                throw new Error('Contest not found');
            }

            const result = contest.toObject();
            result.isBookmarked = isBookmarked;

            return result;
        } catch (error) {
            logger.error('Error bookmarking contest:', error);
            throw error;
        }
    }

    async getBookmarkedContests(userId: string): Promise<ContestType[]> {
        try {
            const user = await User.findOne({ _id: userId });
            if (!user) {
                throw new Error('User not found');
            }

            const userObjectId = new mongoose.Types.ObjectId(userId);

            const contests = await Contest.find({
                bookmarks: { $in: [userObjectId] }
            })
                .sort({ contestStartDate: 1 })
                .lean()
                .exec();

            return contests.map(contest => {
                const { bookmarks, ...contestWithoutBookmarks } = contest;

                contestWithoutBookmarks.isBookmarked = true;

                return contestWithoutBookmarks;
            });
        } catch (error) {
            logger.error('Error getting bookmarked contests:', error);
            throw error;
        }
    }



    async deleteContest(contestId: string, platform: string): Promise<void> {
        try {
            await Contest.deleteOne({
                contestId: contestId,
                platform: platform.toLowerCase()
            });
        } catch (error) {
            logger.error('Error deleting contest:', error);
            throw error;
        }
    }

    async deleteAllContests(): Promise<string> {
        try {
            await Contest.deleteMany({});
            return "All contests deleted successfully";
        } catch (error) {
            logger.error('Error deleting all contests:', error);
            throw error;
        }
    }
}
