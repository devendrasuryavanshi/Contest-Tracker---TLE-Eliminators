import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import User, { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d'; // 7 days

const generateToken = (user: IUser) => {
    return jwt.sign(
        {
            id: user._id,
            userId: user.userId,
            email: user.email
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const userId = uuidv4();

        const user = new User({
            userId,
            email,
            password,
        });

        await user.save();

        const token = generateToken(user);

        res.status(201).json({
            success: true,
            token,
            user: {
                userId: user.userId,
                email: user.email,
            },
        });
    } catch {
        res.status(500).json({ message: 'Server error during registration' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user);

        res.status(200).json({
            success: true,
            token,
            user: {
                userId: user.userId,
                email: user.email,
            },
        });
    } catch {
        res.status(500).json({ message: 'Server error during login' });
    }
};

export const getCurrentUser = async (req: Request & { user?: any }, res: Response) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(401).json({ message: 'Not authenticated' });
        }

        res.status(200).json({
            success: true,
            user: {
                userId: user.userId,
                email: user.email,
            },
        });
    } catch {
        res.status(500).json({ message: 'Server error' });
    }
};
export const logout = async (req: Request, res: Response) => {
    res.status(200).json({ success: true, message: 'Logged out successfully' });
};
