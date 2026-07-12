const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'transitops-secret';

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ success: false, errors: ['email and password required'] });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ success: false, errors: ['invalid credentials'] });
  const valid = bcrypt.compareSync(password, user.passwordHash);
  if (!valid) return res.status(401).json({ success: false, errors: ['invalid credentials'] });
  const token = jwt.sign({ id: user.id, email: user.email, roles: user.roles }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ success: true, data: { accessToken: token, user: { id: user.id, name: user.name, email: user.email, roles: user.roles } } });
});

// middleware for protected routes
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ success: false, errors: ['missing authorization'] });
  const parts = auth.split(' ');
  if (parts.length !== 2) return res.status(401).json({ success: false, errors: ['invalid authorization format'] });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ success: false, errors: ['invalid token'] });
  }
}

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT id, name, email, roles FROM users WHERE id = ?').get(req.user.id);
  res.json({ success: true, data: user });
});

module.exports = router;
