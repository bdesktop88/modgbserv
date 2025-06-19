const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;
const redirectsPath = path.join(__dirname, 'redirects.json');

// Session middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret123',
  resave: false,
  saveUninitialized: true
}));

// Parse form data
app.use(express.urlencoded({ extended: true }));

// Auth middleware
function authMiddleware(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  } else {
    return res.redirect('/login');
  }
}

// Admin login routes
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
  if (
    username === process.env.ADMIN_USER &&
    password === process.env.ADMIN_PASS
  ) {
    req.session.isAdmin = true;
    res.redirect('/admin');
  } else {
    res.send('Invalid credentials');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

// Admin panel
app.get('/admin', authMiddleware, (req, res) => {
  const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf-8'));

  const listItems = Object.entries(redirects).map(([from, to]) => `
    <li>
      <strong>${from}</strong> → ${to}
      <form method="POST" action="/admin/delete" style="display:inline;">
        <input type="hidden" name="path" value="${from}" />
        <button>Delete</button>
      </form>
      <form method="POST" action="/admin/edit" style="display:inline;">
        <input type="hidden" name="original" value="${from}" />
        <input name="from" value="${from}" style="width:100px" />
        <input name="to" value="${to}" style="width:200px" />
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

app.post('/admin/add', authMiddleware, (req, res) => {
  const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf-8'));
  redirects[req.body.from] = req.body.to;
  fs.writeFileSync(redirectsPath, JSON.stringify(redirects, null, 2));
  res.redirect('/admin');
});

app.post('/admin/delete', authMiddleware, (req, res) => {
  const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf-8'));
  delete redirects[req.body.path];
  fs.writeFileSync(redirectsPath, JSON.stringify(redirects, null, 2));
  res.redirect('/admin');
});

app.post('/admin/edit', authMiddleware, (req, res) => {
  const { original, from, to } = req.body;
  const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf-8'));

  if (original !== from) {
    delete redirects[original];
  }

  redirects[from] = to;
  fs.writeFileSync(redirectsPath, JSON.stringify(redirects, null, 2));
  res.redirect('/admin');
});

// Redirect handler
app.get('*', (req, res) => {
  const redirects = JSON.parse(fs.readFileSync(redirectsPath, 'utf-8'));
  const target = redirects[req.path];
  if (target) {
    res.redirect(target);
  } else {
    res.status(404).send('Redirect not found.');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
