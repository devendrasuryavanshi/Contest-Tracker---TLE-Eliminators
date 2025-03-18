import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import contestRoutes from './routes/contestRoutes';
import scheduleContestUpdates from './cron/contestUpdateCron';
import path from 'path';
import logger from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://wesione:7xIi2MI40ckxWRoM@cluster0.fotui.mongodb.net/contest-tracker?retryWrites=true&w=majority&appName=Cluster0';

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'Contest Tracker API is running',
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contests', contestRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
        status: {
            code: 500,
            error: 'Internal server error'
        }
    });
});

mongoose.connect(MONGODB_URI)
    .then(() => {
        logger.info('Connected to MongoDB');

        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);

            // scheduleContestUpdates();
        });
    })
    .catch((error) => {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    });
