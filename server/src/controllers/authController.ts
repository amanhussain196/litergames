import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import { getMemoryMode } from '../config/db';

// Mock Store for Memory Mode
let mockUsers: any[] = [];

export const login = async (req: Request, res: Response) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }

        // Diagnostic Log
        console.log(`Login attempt: ${username}. Mongo ReadyState: ${mongoose.connection.readyState}. MemoryMode: ${getMemoryMode()}`);

        // --- Memory Mode Fallback ---
        if (getMemoryMode() || mongoose.connection.readyState !== 1) {
            console.log('Using Memory Mode');
            let mUser = mockUsers.find(u => u.username === username);
            if (!mUser) {
                mUser = {
                    _id: 'mock_' + Math.random().toString(36).substr(2, 9),
                    username,
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
                    isGuest: true,
                    friends: [],
                    createdAt: new Date()
                };
                mockUsers.push(mUser);
            }
            return res.status(200).json(mUser);
        }
        // ----------------------------

        // Check if user exists
        let user = await User.findOne({ username });

        if (user) {
            return res.json(user);
        }

        // Create new Guest User
        const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

        user = await User.create({
            username,
            avatar,
            isGuest: true
        });

        res.status(201).json(user);
    } catch (error: any) {
        console.error('Login Error:', error);
        // Return the actual error to the client for debugging
        res.status(500).json({ message: 'Server Error', error: error.toString(), stack: error.stack });
    }
};

export const getMe = async (req: Request, res: Response) => {
    try {
        if (getMemoryMode() || mongoose.connection.readyState !== 1) {
            const user = mockUsers.find(u => u._id === req.params.id);
            return user ? res.json(user) : res.status(404).json({ message: 'User not found' });
        }

        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: 'Server Error', error: error.toString() });
    }
}
