import cron from 'node-cron';
import logger from '../utils/logger';
import ContestService from '../services/Contest';
import ContestSolutionService from '../services/ContestSolutionService';

const scheduleContestUpdates = () => {
    logger.info('Setting up cron jobs');

    // Contest updates - Run every day at 00:00, 06:00, 12:00, and 18:00
    cron.schedule('0 0,6,12,18 * * *', async () => {
        logger.info('Running scheduled contest update');
        try {
            await ContestService.updateAllContests();
            logger.info('Scheduled contest update completed successfully');
        } catch (error) {
            logger.error('Error in scheduled contest update:', error);
        }
    });

    // YouTube solution links update - midnight
    cron.schedule('0 0 * * *', async () => {
        logger.info('Running scheduled YouTube solution links update');
        try {
            await ContestSolutionService.updateSolutionLinks();
            logger.info('Scheduled YouTube solution links update completed successfully');
        } catch (error) {
            logger.error('Error in scheduled YouTube solution links update:', error);
        }
    });

    // Run initial updates
    setTimeout(async () => {
        logger.info('Running initial contest update on server start');
        try {
            await ContestService.updateAllContests();
            logger.info('Initial contest update completed successfully');
        } catch (error) {
            logger.error('Error in initial contest update:', error);
        }

        // YouTube solution update
        setTimeout(async () => {
            logger.info('Running initial YouTube solution links update on server start');
            try {
                await ContestSolutionService.updateSolutionLinks();
                logger.info('Initial YouTube solution links update completed successfully');
            } catch (error) {
                logger.error('Error in initial YouTube solution links update:', error);
            }
        }, 5 * 60 * 1000); // 5m
    }, 5000); // 5s
};

export default scheduleContestUpdates;
