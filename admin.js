// admin.js
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('./db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_key';

// Middleware to protect admin routes
function verifyAdminToken(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin') throw new Error('Not admin');
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Invalid token' });
    }
}

// View all redirects
router.get('/redirects', verifyAdminToken, async (req, res) => {
    try {
        const redirects = await db.getAllRedirects(); // You’ll need to implement this
        res.json(redirects);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching redirects' });
    }
});

// Update a redirect
router.put('/redirects/:key', verifyAdminToken, async (req, res) => {
    const { key } = req.params;
    const { destination } = req.body;
    try {
        await db.updateRedirect(key, destination); // You’ll need to implement this
        res.json({ message: 'Redirect updated' });
    } catch (err) {
        res.status(500).json({ message: 'Update failed' });
    }
});

// Delete a redirect
router.delete('/redirects/:key', verifyAdminToken, async (req, res) => {
    const { key } = req.params;
    try {
        await db.deleteRedirect(key); // You’ll need to implement this
        res.json({ message: 'Redirect deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Delete failed' });
    }
});

module.exports = router;
