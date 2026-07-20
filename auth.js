const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const SECRET = 'secret_key';

// Signup
router.post('/signup', async (req, res) => {
  // Support both `username` and `user_name` from the client
  const { username, user_name, email, password } = req.body;
  const name = username || user_name;

  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    'INSERT INTO users (user_name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword],
    (err, result) => {
      if(err) return res.status(500).json({ error: err.message });
      res.json({ message: 'User created successfully!' });
    }
  );
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
    if(err) return res.status(500).json({ error: err.message });
    if(results.length === 0) return res.status(400).json({ error: 'User not found' });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if(!match) return res.status(400).json({ error: 'Wrong password' });

    const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login successful', token });
  });
});

module.exports = router;
