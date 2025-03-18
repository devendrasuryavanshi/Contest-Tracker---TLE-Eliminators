import LeetcodeServices from './Leetcode';
import CodechefServices from './Codechef';
import CodeforcesServices from './Codeforces';
import logger from '../utils/logger';

class ContestService {
    private leetcodeService: LeetcodeServices;
    private codechefService: CodechefServices;
    private codeforcesService: CodeforcesServices;

    constructor() {
        this.leetcodeService = new LeetcodeServices();
        this.codechefService = new CodechefServices();
        this.codeforcesService = new CodeforcesServices();
    }

    async updateAllContests() {
        try {
            logger.info('Starting update of all contests...');
            const startTime = Date.now();

            const [leetcodeResult, codechefResult, codeforcesResult] = await Promise.allSettled([
                this.leetcodeService.saveLeetcodeContests(),
                this.codechefService.saveCodechefContests(),
                this.codeforcesService.saveCodeforcesContests()
            ]);

            const results = {
                leetcode: leetcodeResult.status === 'fulfilled' ? leetcodeResult.value : { error: 'Failed to update LeetCode contests' },
                codechef: codechefResult.status === 'fulfilled' ? codechefResult.value : { error: 'Failed to update CodeChef contests' },
                codeforces: codeforcesResult.status === 'fulfilled' ? codeforcesResult.value : { error: 'Failed to update Codeforces contests' }
            };

            const totalCount =
                (results.leetcode.count || 0) +
                (results.codechef.count || 0) +
                (results.codeforces.count || 0);

            const executionTime = (Date.now() - startTime) / 1000;
            logger.info(`All contests updated successfully in ${executionTime.toFixed(2)} seconds. Total contests: ${totalCount}`);

            return {
                message: 'All contests updated successfully',
                executionTime: `${executionTime.toFixed(2)} seconds`,
                totalContestsUpdated: totalCount,
                platformResults: results
            };
        } catch (error) {
            logger.error('Error updating all contests:', error);
            throw error;
        }
    }

    async updateLeetcodeContests() {
        try {
            logger.info('Starting update of LeetCode contests...');
            const result = await this.leetcodeService.saveLeetcodeContests();
            logger.info('LeetCode contests updated successfully');
            return result;
        } catch (error) {
            logger.error('Error updating LeetCode contests:', error);
            throw error;
        }
    }

    async updateCodechefContests() {
        try {
            logger.info('Starting update of CodeChef contests...');
            const result = await this.codechefService.saveCodechefContests();
            logger.info('CodeChef contests updated successfully');
            return result;
        } catch (error) {
            logger.error('Error updating CodeChef contests:', error);
            throw error;
        }
    }

    async updateCodeforcesContests() {
        try {
            logger.info('Starting update of Codeforces contests...');
            const result = await this.codeforcesService.saveCodeforcesContests();
            logger.info('Codeforces contests updated successfully');
            return result;
        } catch (error) {
            logger.error('Error updating Codeforces contests:', error);
            throw error;
        }
    }
}

export default new ContestService();
