// import { authenticate } from "../middleware/authenticate";

import express from 'express';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/authenticate.js';

const router = express.Router();


import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const { JWT_SECRET } = process.env;

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    console.log(user)
    if (!user) return res.status(401).send('Invalid Credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Invalid Credentials');

    const token = jwt.sign({ id: user._id, role: user.role,username:user.username }, JWT_SECRET, { expiresIn: '1h' });
    console.log("token",token)
    res.json({ token });
});

// Admin Signup
router.post('/signup', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

export default router;
