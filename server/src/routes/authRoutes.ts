import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/me', protect as express.RequestHandler, getCurrentUser as express.RequestHandler);
router.post('/register', register as express.RequestHandler);
router.post('/login', login as express.RequestHandler);
router.post('/logout', logout);

export default router;
