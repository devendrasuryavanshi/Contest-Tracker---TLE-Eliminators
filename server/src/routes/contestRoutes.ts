import express from 'express';
import {
  updateAllContests,
  updatePlatformContests,
  getContestsByDateRange,
  getUpcomingContests,
  updateSolutionUrl,
  getContestsWithoutSolutions,
  deleteAllContests,
  updateAllSolutionLinks,
  bookmarkContest,
  getBookmarkedContests
} from '../controllers/contestController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Contest retrieval routes
router.get('/get-contests', protect as express.RequestHandler, getContestsByDateRange as any);
router.get('/get-upcoming-contests', protect as express.RequestHandler, getUpcomingContests as any);
router.get('/get-bookmarked-contests', protect as express.RequestHandler, getBookmarkedContests as any);

// Contest update routes
router.post('/update/all', updateAllContests as any);
router.post('/update/:platform', updatePlatformContests as any);
router.post('/bookmarkContest', protect as express.RequestHandler, bookmarkContest as any)


// Solution management routes
router.get('/solutions/missing', getContestsWithoutSolutions as any);
router.post('/solutions/update', protect as express.RequestHandler, updateSolutionUrl as any);
router.post('/solutions/update-all', updateAllSolutionLinks as any);

// delete - temp turned off
// router.delete('/delete-all',protect as express.RequestHandler, deleteAllContests as any);

export default router;
