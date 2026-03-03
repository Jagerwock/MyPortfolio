const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const SUBMISSIONS_FILE = path.join(__dirname, 'submissions.json');

const rateMap = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 5;

app.use(cors({ origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:8080', 'http://localhost:8080'] }));
app.use(express.json());

if (!fs.existsSync(SUBMISSIONS_FILE)) {
  fs.writeFileSync(SUBMISSIONS_FILE, '[]', 'utf8');
}

function cleanExpired(ip) {
  const now = Date.now();
  const record = rateMap.get(ip);
  if (!record) return;
  record.hits = record.hits.filter((t) => now - t < WINDOW_MS);
  if (!record.hits.length) rateMap.delete(ip);
}

function rateLimit(req, res, next) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  cleanExpired(ip);
  const current = rateMap.get(ip) || { hits: [] };
  current.hits.push(Date.now());
  rateMap.set(ip, current);
  if (current.hits.length > LIMIT) {
    return res.status(429).json({ success: false, error: 'Too many requests. Please wait before trying again.' });
  }
  next();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

app.post('/api/contact', rateLimit, (req, res) => {
  const { name, email, message, website = '' } = req.body || {};

  if (website && website.trim() !== '') {
    return res.status(400).json({ success: false, error: 'Spam detected.' });
  }

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ success: false, error: 'Please provide your name.' });
  }
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ success: false, error: 'Please provide a valid email.' });
  }
  if (!message || message.trim().length < 10) {
    return res.status(400).json({ success: false, error: 'Message should be at least 10 characters.' });
  }

  const entry = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    message: message.trim(),
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown',
    createdAt: new Date().toISOString()
  };

  try {
    const existing = JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
    existing.push(entry);
    fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(existing, null, 2));
    return res.json({ success: true, message: 'Message received successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Unable to save your message right now.' });
  }
});

app.listen(PORT, () => {
  console.log(`Contact API running on http://localhost:${PORT}`);
});