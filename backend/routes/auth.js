// backend/routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

// helper: normalize username (trim)
const norm = (s) => (typeof s === 'string' ? s.trim() : s);

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const username = norm(req.body.username);
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : undefined;
    const password = req.body.password;

    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

    const exists = await User.findOne({ username });
    if (exists) return res.status(400).json({ error: 'Username already in use' });

    const user = new User({ username, name, password });
    await user.save();

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user: { id: user._id, username: user.username, name: user.name }, token });
  } catch (err) {
    console.error('Register err', err);
    // duplicate key may still happen rare race — detect and respond
    if (err && err.code === 11000) return res.status(400).json({ error: 'Username already in use' });
    res.status(500).json({ error: 'Server error' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const username = norm(req.body.username);
    const password = req.body.password;

    if (!username || !password) return res.status(400).json({ error: 'Missing fields' });

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ user: { id: user._id, username: user.username, name: user.name }, token });
  } catch (err) {
    console.error('Login err', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
