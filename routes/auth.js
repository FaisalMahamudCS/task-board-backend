const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET } = process.env;

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).send('Invalid Credentials');

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).send('Invalid Credentials');

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
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

module.exports = router;
